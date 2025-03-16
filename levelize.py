import json
import os
from collections import defaultdict

verilog_file = 'c1355.v'
json_filename = os.path.splitext(verilog_file)[0] + '.json'

# خواندن فایل JSON
with open(json_filename, 'r') as json_file:
    metadata = json.load(json_file)

def levelize_gates(metadata):
    level_counts = 0
    levels = {}
    levelized_gates = 0
    next_level_inputs = metadata['inputs'].copy()
    gates = metadata['gates']

    while levelized_gates < len(gates):
        temp_next_lvl_output = {}
        levels[level_counts] = []
        
        for gate in gates:
            if 'levelized' in gate and gate['levelized']:
                continue
            
            if all(inp in next_level_inputs for inp in gate['inputs']):
                levels[level_counts].append(gate)
                temp_next_lvl_output[gate['output']] = True
                gate['levelized'] = True
                levelized_gates += 1
        
        if not levels[level_counts]:
            del levels[level_counts]  # حذف سطح خالی در صورت نیاز
            break
        
        level_counts += 1
        next_level_inputs = temp_next_lvl_output
    
    return {"levelCount": level_counts, "levels": levels}

# اجرای سطح‌بندی
topology_data = levelize_gates(metadata)
metadata.update(topology_data)

# ذخیره‌ی خروجی جدید در JSON
output_json_filename = os.path.splitext(verilog_file)[0] + '_leveled.json'
with open(output_json_filename, 'w') as json_file:
    json.dump(metadata, json_file, indent=4)

print(f"Leveled metadata written to {output_json_filename}")