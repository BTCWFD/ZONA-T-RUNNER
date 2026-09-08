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

# Vincular todos los objetos también a la colección de la escena
for o in bpy.data.objects:
    if o.name not in scene.collection.objects:
        scene.collection.objects.link(o)

# Colocar cámara con encuadre amplio centrado
cam = scene.camera
cam.location = (0, -7.5, 1.4)
cam.rotation_euler = (math.radians(82), 0, 0)

scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars_Lineup.png"
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print("=== RENDER COMPLETE WITH SCENE COLLECTION LINKED ===")
