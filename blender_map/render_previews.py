import bpy

# Map snapshot
blend_map_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.blend"
bpy.ops.wm.open_mainfile(filepath=blend_map_path)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

cam_data = bpy.data.cameras.new(name="PreviewCam")
cam_obj = bpy.data.objects.new("PreviewCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj
cam_obj.location = (0, -12, 6)
cam_obj.rotation_euler = (1.35, 0, 0)

bpy.context.scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\web-runner\assets\blender_map_render.png"
bpy.ops.render.render(write_still=True)

# Characters snapshot
blend_chars_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_Letal_Nunez_Models.blend"
bpy.ops.wm.open_mainfile(filepath=blend_chars_path)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.image_settings.file_format = 'PNG'

cam_c_data = bpy.data.cameras.new(name="CharCam")
cam_c_obj = bpy.data.objects.new("CharCam", cam_c_data)
bpy.context.scene.collection.objects.link(cam_c_obj)
bpy.context.scene.camera = cam_c_obj
cam_c_obj.location = (0, -4.5, 1.3)
cam_c_obj.rotation_euler = (1.57, 0, 0)

bpy.context.scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\web-runner\assets\blender_djs_render.png"
bpy.ops.render.render(write_still=True)

print("=== BLENDER WORKBENCH RENDERS SAVED ===")
