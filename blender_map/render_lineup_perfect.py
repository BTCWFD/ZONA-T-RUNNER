import bpy
import math

blend_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.image_settings.file_format = 'PNG'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'MATERIAL'
scene.display.shading.show_shadows = True

# Reposicionar para que estén juntos en el centro: X = -3.6, -1.2, 1.2, 3.6
letal_r = bpy.data.objects.get("DJ_LETAL_Root")
if letal_r: letal_r.location = (-3.6, 0, 0)

nunez_r = bpy.data.objects.get("DJ_NUNEZ_Root")
if nunez_r: nunez_r.location = (-1.2, 0, 0)

tatan_r = bpy.data.objects.get("DJ_TATAN_Root")
if tatan_r: tatan_r.location = (1.2, 0, 0)

fresar_r = bpy.data.objects.get("DJ_FRESAR_Root")
if fresar_r: fresar_r.location = (3.6, 0, 0)

# Suelo oscuro
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -0.05))
floor = bpy.context.active_object
floor.scale = (12.0, 4.0, 0.1)

# Cámara centrada y ajustada con FOV
cam = scene.camera
if not cam:
    cam_data = bpy.data.cameras.new(name="MainCam")
    cam = bpy.data.objects.new("MainCam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam

cam.location = (0, -7.5, 1.5)
cam.rotation_euler = (math.radians(85), 0, 0)

scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars_Lineup.png"
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.fbx(filepath=r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.fbx", use_selection=False)
bpy.ops.export_scene.gltf(filepath=r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.glb", export_format='GLB')
print("=== PERFECT 4 DJS LINEUP RE-EXPORTED AND RENDERED ===")
