
#  -----------------v8
from pyverilog.vparser.parser import parse
import pyverilog.vparser.ast as vast
import json
import os

ast, directives = parse([verilog_file])

def extract_gates(node, gates):
    if isinstance(node, vast.InstanceList):
        gate_type = node.module.lower()
        for inst in node.instances:
            gate_name = inst.name
            port_conns = inst.portlist
            output = port_conns[0].argname.name
            inputs = [conn.argname.name for conn in port_conns[1:]]

            gates.append({
                'name': gate_name,
                'type': gate_type,
                'inputs': inputs,
                'output': output
            })

    for child in node.children():
        extract_gates(child, gates)

def extract_outputs(node):
    outputs = []
    if isinstance(node, vast.Output):
        outputs.append(node.name)
    for child in node.children():
        outputs += extract_outputs(child)
    return outputs

def extract_inputs(node):
    inputs = {}
    if isinstance(node, vast.Input):
        inputs[node.name] = True
    for child in node.children():
        inputs.update(extract_inputs(child))
    return inputs

def extract_module_name(node):
    if isinstance(node, vast.ModuleDef):
        return node.name
    for child in node.children():
        result = extract_module_name(child)
        if result:
            return result
    return None

gates = []
extract_gates(ast, gates)
outputs = extract_outputs(ast)
inputs = extract_inputs(ast)
module_name = extract_module_name(ast)

metadata = {
    'gates': gates,
    'inputs': inputs,
    'outputs': outputs,
    'moduleName': module_name
}

json_filename = os.path.splitext(verilog_file)[0] + '.json'
with open(json_filename, 'w') as json_file:
    json.dump(metadata, json_file, indent=4)

print(f"Metadata written to {json_filename}")


