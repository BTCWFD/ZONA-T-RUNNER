import bpy
blend_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)
cam = bpy.context.scene.camera
print(f"Cam: loc={cam.location} rot={cam.rotation_euler}")
for o in bpy.data.objects:
    if o.type == 'MESH':
        print(f"{o.name}: loc={o.location} scale={o.scale}")
