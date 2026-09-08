import bpy
import math

blend_map_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.blend"
bpy.ops.wm.open_mainfile(filepath=blend_map_path)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.image_settings.file_format = 'PNG'

# Set Workbench display to material colors & shadows for high quality render
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'MATERIAL'
scene.display.shading.show_shadows = True

# 1. Perspective Street Runner View
cam_data = bpy.data.cameras.new(name="StreetCam")
cam_obj = bpy.data.objects.new("StreetCam", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

# Camera located in the center of the asphalt looking down the avenue
cam_obj.location = (0, 6, 2.8)
cam_obj.rotation_euler = (math.radians(82), 0, 0)

scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Street_View.png"
bpy.ops.render.render(write_still=True)

# 2. Bird's Eye Aerial View (showing the whole street layout and clubs)
cam_obj.location = (0, 40, 48)
cam_obj.rotation_euler = (math.radians(35), 0, 0)
scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Aerial_View.png"
bpy.ops.render.render(write_still=True)

# 3. 3/4 Diagonal Isometric View showing Octava, Baum, L1FE, etc.
cam_obj.location = (-22, 20, 16)
cam_obj.rotation_euler = (math.radians(65), 0, math.radians(-50))
scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Diagonal_View.png"
bpy.ops.render.render(write_still=True)

print("=== ALL 3 BLENDER MAP VIEWS RENDERED SUCCESSFULLY ===")
