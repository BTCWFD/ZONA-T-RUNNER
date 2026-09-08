import bpy

blend_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

bpy.context.scene.render.engine = 'BLENDER_EEVEE'
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080
bpy.context.scene.render.image_settings.file_format = 'PNG'

# Camera
cam_data = bpy.data.cameras.new(name="LineupCam")
cam_obj = bpy.data.objects.new("LineupCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj
cam_obj.location = (0, -7.5, 1.8)
cam_obj.rotation_euler = (1.45, 0, 0)

# Studio Lights
for lx, ly, lcol, pwr in [(-4, -4, (0.8, 0.2, 1.0), 3000.0), (0, -4, (0.0, 1.0, 1.0), 3000.0), (4, -4, (1.0, 0.4, 0.0), 3000.0)]:
    l_data = bpy.data.lights.new(name=f"StudioLight_{lx}", type='POINT')
    l_data.color = lcol
    l_data.energy = pwr
    l_obj = bpy.data.objects.new(name=f"StudioLight_{lx}", object_data=l_data)
    l_obj.location = (lx, ly, 3.5)
    bpy.context.scene.collection.objects.link(l_obj)

bpy.context.scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars_Lineup.png"
bpy.ops.render.render(write_still=True)
print("=== 4 DJS LINEUP RENDER COMPLETED ===")
