import bpy
blend_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)
for o in bpy.data.objects:
    if o.type == 'MESH':
        print(f"Name={o.name:22} | X={o.location.x:6.2f} | Y={o.location.y:6.2f} | Z={o.location.z:6.2f}")
