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

# Posicionar cámara a 10 unidades de distancia en Y negativo mirando hacia el origen (+Y)
for o in bpy.data.objects:
    if "Cam" in o.name:
        bpy.data.objects.remove(o, do_unlink=True)

cam_data = bpy.data.cameras.new(name="LineupCamFixed")
cam_obj = bpy.data.objects.new("LineupCamFixed", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

# Los DJs están entre X=-6 y X=+6, Z=0 a 1.8. Colocar cámara en Y=-11, Z=1.3, inclinada hacia arriba
cam_obj.location = (0, -11.0, 1.4)
cam_obj.rotation_euler = (math.radians(88), 0, 0)

scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars_Lineup.png"
bpy.ops.render.render(write_still=True)
print("=== RENDERED FIXED LINEUP ===")
