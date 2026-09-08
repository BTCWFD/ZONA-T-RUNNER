import bpy
blend_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)
for o in bpy.data.objects:
    print(f"OBJ: {o.name} | Type: {o.type} | Loc: {o.location} | Parent: {o.parent.name if o.parent else 'None'}")
