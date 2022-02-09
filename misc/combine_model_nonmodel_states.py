import json, os
import pandas as pd
import numpy as np

# load population data for states
states_pop = pd.read_csv("state_population_sizes.csv")

def get_pop(state):
    row = states_pop[states_pop["NAME"] == state]
    return float(row["POPESTIMATE2017"])

non_model_json = "../non_model_states.json"
model_json = "../model_states.json"
updated_non_model_json = "all_states_short_counterfactuals.json"

with open(non_model_json, 'r') as f:
    non_model_dict = json.load(f)

with open(model_json, 'r') as f:
    model_dict = json.load(f)
    
with open(updated_non_model_json, 'r') as f:
    short_dict = json.load(f)
    



for k,v in non_model_dict.items():
    v['model_nonmodel'] = 'nonmodel'

for k,v in model_dict.items():
    v['model_nonmodel'] = 'model'

combined_dict = {**model_dict, **non_model_dict}

drop_states = set([])

for state, state_dict in combined_dict.items():
    


    for k,v in state_dict.items():

        if isinstance(v, dict):
            if 'cf_vs_kits_dist' in v.keys():

                for cf_dict in v['cf_vs_kits_dist']:
                    for cf_v in cf_dict.values():
                        if np.isnan(cf_v) and (state not in drop_states):
                            print('Dropping state: ', state)
                            drop_states.add(state)
    # Add in missing outputs using short counterfactual dict
    if state in short_dict.keys():
        for k,v in short_dict[state].items():
            if k not in state_dict:
                # add missing output dictionary to combined dictionary
                combined_dict[state][k] = v


combined_dict = {k:v for k,v in combined_dict.items() if k not in drop_states}

# add in any missing states from short counterfactuals dict
# also add if nonmodel state
for state, state_dict in short_dict.items():
    if (state not in combined_dict.keys()) or (combined_dict[state]['model_nonmodel'] == 'nonmodel'):
        combined_dict[state] = state_dict
        combined_dict[state]['model_nonmodel'] = 'nonmodel'
   

# fix epidemic type issues
for state, state_dict in combined_dict.items():
    # fix epidemic type key issue
    combined_dict[state]["epidemic_type"] = (combined_dict[state]["epidemic_type"]
                                             .replace("Rx","RX")
                                             .replace("Fentanyl/Heroin","Fentanyl/heroin")
                                             )
    

# change nonmodel outputs to per-capita
for state, state_dict in combined_dict.items():
    

    if(state_dict["model_nonmodel"] == "nonmodel"):
        pop = get_pop(state)
        
        for k,v in state_dict.items():
    
            if isinstance(v, dict) and ("deaths_averted_" in k):
                if 'cf_vs_kits_dist' in v.keys():
    
                    for i, cf_dict in enumerate(v['cf_vs_kits_dist']):
                        for stat,cf_v in cf_dict.items():
                                v['cf_vs_kits_dist'][i][stat] = pop * cf_v / 100000
                                
            # change kits per capita to total kits
            elif isinstance(v, dict) and ("pNX_" in k):
                if 'cf_vs_kits_dist' in v.keys():
    
                    for i, cf_dict in enumerate(v['cf_vs_kits_dist']):
                        for stat,cf_v in cf_dict.items():
                            if stat == 'kits':
                                v['cf_vs_kits_dist'][i][stat] = pop * cf_v / 100000


with open('../all_states.json', 'w+') as f:
    json.dump(combined_dict, f, indent=4)
