import json, os

###################################

with open('state_inits_to_names.json', 'r') as f:
    inits_dict = json.load(f)

state_to_epi_type = {
                    'AZ': 'Heroin/RX',
                    'OR': 'Heroin/RX',
                    'WA': 'Heroin/RX',
                    'MA': 'Fentanyl',
                    'NC': 'Fentanyl',
                    'RI': 'Fentanyl',
                    'CA': 'RX',
                    'ID': 'RX',
                    'OK': 'RX',
                    'IA': 'Fentanyl/RX',
                    'SC': 'Fentanyl/RX',
                    'IL': 'Fentanyl/heroin'
                    }

def pt_list_to_dict(pt_list):
    return {
        'kits' : pt_list[0],
        'lc' : pt_list[1],
        'm' : pt_list[2],
        'uc' : pt_list[3],
    }


def list_pts_to_dicts(l):
    return [pt_list_to_dict(pt_list) for pt_list in l]


##############################

multiregion_dir = '/home/declan/Documents/code/nida-naloxone-needs/output/MultiRegion_08-05-2020_11-43-05'
reg_info_fname = os.path.join(multiregion_dir, 'regions_info.json')

with open(reg_info_fname, 'r') as f:
    reg_info_dict = json.load(f)


all_states_dict = {}

for region in reg_info_dict['region_list']:

    reg_dir = os.path.join(multiregion_dir, region)
    data_dir = os.path.join(reg_dir, 'data')
    cf_data_dir = os.path.join(data_dir, 'counterfactual_data')

    region_dict = {}

    data_summary_fname = os.path.join(data_dir, f'{region}_data_summary.json')
    if not os.path.exists(data_summary_fname):
        continue
    with open(data_summary_fname, 'r') as f:
        reg_summary_dict = json.load(f)

    region_dict['data_overview'] = reg_summary_dict

    cf_retrieve_dict = [
        'deaths_averted_curve',
        'deaths_averted_RX_curve',
        'deaths_averted_standing_order_curve',
        'pNX_vary_THN',
        'pNX_vary_RX',
        'pNX_vary_standing_order',
    ]

    for t in cf_retrieve_dict:

        cf_fname = os.path.join(cf_data_dir, f'{region}_{t}.json')
        if not os.path.exists(cf_fname):
            continue
        with open(cf_fname, 'r') as f:
            cf_dict = json.load(f)

        cf_dict['cf_vs_kits_dist'] = list_pts_to_dicts(cf_dict['cf_vs_kits_dist'])

        region_dict[t] = cf_dict

    if region in state_to_epi_type.keys():
        region_dict['epidemic_type'] = state_to_epi_type[region]
    else:
        region_dict['epidemic_type'] = 'Unknown'


    region_fullname = inits_dict[region]
    all_states_dict[region_fullname] = region_dict


with open('model_states.json', 'w+') as f:
    json.dump(all_states_dict, f, indent=4)
