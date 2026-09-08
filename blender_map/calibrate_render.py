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

# Mover a posiciones exactas en X:
# Letal: -4.2
# Nuñez: -1.4
# Tatán: +1.4
# Fresar: +4.2
for o in bpy.data.objects:
    if o.name.startswith("Letal"):
        o.location.x = -4.2 + (o.location.x - (-6.6))
    elif o.name.startswith("Nunez"):
        o.location.x = -1.4 + (o.location.x - (-2.2))
    elif o.name.startswith("Tatan"):
        o.location.x = 1.4 + (o.location.x - (2.2))
    elif o.name.startswith("Fresar"):
        o.location.x = 4.2 + (o.location.x - (6.6))

# Tarima
stage = bpy.data.objects.get("Stage_Pedestal")
if stage:
    stage.scale = (12.0, 4.0, 0.1)

# Cámara a 8 metros de distancia
cam = scene.camera
cam.location = (0, -8.0, 1.6)
cam.rotation_euler = (math.radians(85), 0, 0)

scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars_Lineup.png"
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.fbx(filepath=r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.fbx", use_selection=False)
bpy.ops.export_scene.gltf(filepath=r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.glb", export_format='GLB')
print("=== CALIBRATED 4 DJS LINEUP SAVED AND RENDERED ===")
