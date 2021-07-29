import json, os
import numpy as np



non_model_json = "non_model_states.json"
model_json = "model_states.json"

with open(non_model_json, 'r') as f:
    non_model_dict = json.load(f)

with open(model_json, 'r') as f:
    model_dict = json.load(f)

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


combined_dict = {k:v for k,v in combined_dict.items() if k not in drop_states}


with open('all_states.json', 'w+') as f:
    json.dump(combined_dict, f, indent=4)
