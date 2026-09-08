import bpy
blend_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)
for o in bpy.data.objects:
    if o.type == 'MESH':
        print(f"{o.name} -> hide_render={o.hide_render}, hide_viewport={o.hide_viewport}")
