

# # -----------------------v1
# from pyverilog.vparser.parser import parse
# import pyverilog.vparser.ast as vast

# # مسیر فایل verilog
# verilog_file = 'c17.v'

# # پارس کردن فایل verilog
# ast, directives = parse([verilog_file])

# # چاپ کردن ساختار AST
# ast.show()

# -------------------------v2 

# from pyverilog.vparser.parser import parse
# import pyverilog.vparser.ast as vast

# # verilog_file = 'example.v'
# verilog_file = 'c17.v'
# ast, directives = parse([verilog_file])

# # تابع برای استخراج اطلاعات ماژول
# def extract_modules(node):
#     modules = []
#     if isinstance(node, vast.ModuleDef):
#         ports = {'inputs': [], 'outputs': []}
#         for item in node.portlist.ports:
#             if isinstance(item.first, vast.Input):
#                 ports['inputs'].append(item.first.name)
#             elif isinstance(item.first, vast.Output):
#                 ports['outputs'].append(item.first.name)
#         modules.append({'name': node.name, 'ports': ports})
#     for child in node.children():
#         modules.extend(extract_modules(child))
#     return modules

# modules_info = extract_modules(ast)

# # چاپ اطلاعات استخراج شده
# for module in modules_info:
#     print("Module Name:", module['name'])
#     print("Inputs:", module['ports']['inputs'])
#     print("Outputs:", module['ports']['outputs'])

# ----==================v3
# from pyverilog.vpaپrser.parser import parse
# import pyverilog.vparser.ast as vast
# import json

# verilog_file = 'c17.v'
# ast, directives = parse([verilog_file])

# # recursive function to extract gate info
# def extract_gates(node, gates):
#     if isinstance(node, vast.InstanceList):
#         gate_type = node.module.lower()
#         for inst in node.instances:
#             gate_name = inst.name
#             connections = {conn.portname: conn.argname.name for conn in inst.portlist}

#             output = connections.get('Y', list(connections.values())[0])
#             inputs = [conn for port, conn in connections.items() if conn != output]

#             gates.append({
#                 'name': gate_name,
#                 'type': gate_type,
#                 'inputs': inputs,
#                 'output': output
#             })

#     for child in node.children():
#         extract_gates(child, gates)

# # collect gate info
# gates = []
# extract_gates(ast, gates)

# # output the gates array in JavaScript format
# print("const gates =", json.dumps(gates, indent=4), ";")

# ----------------v4
# با فرض این ک تو توصیف گیت همیشه تو لیست ارگیومنت اولین خروجیه
# from pyverilog.vparser.parser import parse
# import pyverilog.vparser.ast as vast
# import json

# verilog_file = 'c17.v'
# ast, directives = parse([verilog_file])

# def extract_gates(node, gates):
#     if isinstance(node, vast.InstanceList):
#         gate_type = node.module.lower()
#         for inst in node.instances:
#             gate_name = inst.name
#             # پورت اول خروجی، بقیه ورودی‌ها
#             port_conns = inst.portlist
#             output = port_conns[0].argname.name
#             inputs = [conn.argname.name for conn in port_conns[1:]]

#             gates.append({
#                 'name': gate_name,
#                 'type': gate_type,
#                 'inputs': inputs,
#                 'output': output
#             })

#     for child in node.children():
#         extract_gates(child, gates)

# gates = []
# extract_gates(ast, gates)

# # نمایش نتیجه در فرمت JavaScript
# print("const gates =", json.dumps(gates, indent=4), ";")


#  -------------------v5
# from pyverilog.vparser.parser import parse
# import pyverilog.vparser.ast as vast
# import json

# verilog_file = 'c499.v'
# ast, directives = parse([verilog_file])

# def extract_gates(node, gates):
#     if isinstance(node, vast.InstanceList):
#         gate_type = node.module.lower()
#         for inst in node.instances:
#             gate_name = inst.name
#             port_conns = inst.portlist
#             output = port_conns[0].argname.name
#             inputs = [conn.argname.name for conn in port_conns[1:]]

#             gates.append({
#                 'name': gate_name,
#                 'type': gate_type,
#                 'inputs': inputs,
#                 'output': output
#             })

#     for child in node.children():
#         extract_gates(child, gates)

# def extract_outputs(node):
#     outputs = []
#     if isinstance(node, vast.Output):
#         outputs.append(node.name)
#     for child in node.children():
#         outputs += extract_outputs(child)
#     return outputs

# def extract_module_name(node):
#     if isinstance(node, vast.ModuleDef):
#         return node.name
#     for child in node.children():
#         result = extract_module_name(child)
#         if result:
#             return result
#     return None

# gates = []
# extract_gates(ast, gates)
# outputs = extract_outputs(ast)
# module_name = extract_module_name(ast)

# metadata = {
#     'gates': gates,
#     'outputs': outputs,
#     'moduleName': module_name
# }

# # نمایش نتیجه در فرمت JavaScript
# print("const metadata =", json.dumps(metadata, indent=4), ";")


#  ------------- v6
# from pyverilog.vparser.parser import parse
# import pyverilog.vparser.ast as vast
# import json
# import os

# verilog_file = 'c7552.v'
# ast, directives = parse([verilog_file])

# def extract_gates(node, gates):
#     if isinstance(node, vast.InstanceList):
#         gate_type = node.module.lower()
#         for inst in node.instances:
#             gate_name = inst.name
#             port_conns = inst.portlist
#             output = port_conns[0].argname.name
#             inputs = [conn.argname.name for conn in port_conns[1:]]

#             gates.append({
#                 'name': gate_name,
#                 'type': gate_type,
#                 'inputs': inputs,
#                 'output': output
#             })

#     for child in node.children():
#         extract_gates(child, gates)

# def extract_outputs(node):
#     outputs = []
#     if isinstance(node, vast.Output):
#         outputs.append(node.name)
#     for child in node.children():
#         outputs += extract_outputs(child)
#     return outputs

# def extract_module_name(node):
#     if isinstance(node, vast.ModuleDef):
#         return node.name
#     for child in node.children():
#         result = extract_module_name(child)
#         if result:
#             return result
#     return None

# gates = []
# extract_gates(ast, gates)
# outputs = extract_outputs(ast)
# module_name = extract_module_name(ast)

# metadata = {
#     'gates': gates,
#     'outputs': outputs,
#     'moduleName': module_name
# }

# json_filename = os.path.splitext(verilog_file)[0] + '.json'
# with open(json_filename, 'w') as json_file:
#     json.dump(metadata, json_file, indent=4)

# print(f"Metadata written to {json_filename}")

# -------------------v7
# from pyverilog.vparser.parser import parse
# import pyverilog.vparser.ast as vast
# import json
# import os

# verilog_file = 'c880.v'
# ast, directives = parse([verilog_file])

# def extract_gates(node, gates):
#     if isinstance(node, vast.InstanceList):
#         gate_type = node.module.lower()
#         for inst in node.instances:
#             gate_name = inst.name
#             port_conns = inst.portlist
#             output = port_conns[0].argname.name
#             inputs = [conn.argname.name for conn in port_conns[1:]]

#             gates.append({
#                 'name': gate_name,
#                 'type': gate_type,
#                 'inputs': inputs,
#                 'output': output
#             })

#     for child in node.children():
#         extract_gates(child, gates)

# def extract_outputs(node):
#     outputs = []
#     if isinstance(node, vast.Output):
#         outputs.append(node.name)
#     for child in node.children():
#         outputs += extract_outputs(child)
#     return outputs

# def extract_inputs(node):
#     inputs = []
#     if isinstance(node, vast.Input):
#         inputs.append(node.name)
#     for child in node.children():
#         inputs += extract_inputs(child)
#     return inputs

# def extract_module_name(node):
#     if isinstance(node, vast.ModuleDef):
#         return node.name
#     for child in node.children():
#         result = extract_module_name(child)
#         if result:
#             return result
#     return None

# gates = []
# extract_gates(ast, gates)
# outputs = extract_outputs(ast)
# inputs = extract_inputs(ast)
# module_name = extract_module_name(ast)

# metadata = {
#     'gates': gates,
#     'inputs': inputs,
#     'outputs': outputs,
#     'moduleName': module_name
# }

# json_filename = os.path.splitext(verilog_file)[0] + '.json'
# with open(json_filename, 'w') as json_file:
#     json.dump(metadata, json_file, indent=4)

# print(f"Metadata written to {json_filename}")

#  -----------------v8
from pyverilog.vparser.parser import parse
import pyverilog.vparser.ast as vast
import json
import os

verilog_file = 'c7552.v'
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


