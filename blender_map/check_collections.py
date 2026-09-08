import bpy
blend_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)
for col in bpy.data.collections:
    print(f"Col: {col.name}")
    for o in col.objects:
        print(f"  - {o.name}")
for layer in bpy.context.view_layer.layer_collection.children:
    print(f"LayerCol: {layer.name} | exclude={layer.exclude} | hide_viewport={layer.hide_viewport}")
