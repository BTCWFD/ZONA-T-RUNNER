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

# Reposicionar:
# Letal: X = -3.0
# Núñez: X = -1.0
# Tatán: X = +1.0
# Fresar: X = +3.0
for o in bpy.data.objects:
    if o.name.startswith("Letal"):
        o.location.x = -3.0 + (0.25 if "Violin" in o.name else 0)
    elif o.name.startswith("Nunez"):
        o.location.x = -1.0 + (0.2 if "Flame" in o.name else 0)
    elif o.name.startswith("Tatan"):
        o.location.x = 1.0
    elif o.name.startswith("Fresar"):
        o.location.x = 3.0 + (0.15 if "Visor" in o.name else 0)

stage = bpy.data.objects.get("Stage_Pedestal")
if stage:
    stage.scale = (10.0, 3.5, 0.1)

cam = scene.camera
cam.location = (0, -6.8, 1.45)
cam.rotation_euler = (math.radians(85), 0, 0)

scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars_Lineup.png"
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.fbx(filepath=r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.fbx", use_selection=False)
bpy.ops.export_scene.gltf(filepath=r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.glb", export_format='GLB')
print("=== 4 DJS LINEUP FULLY FRAMED ===")
