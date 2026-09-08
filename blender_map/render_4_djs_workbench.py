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

# Ground pedestal
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -0.1))
ped = bpy.context.active_object
ped.name = "Pedestal"
ped.scale = (16.0, 4.0, 0.2)

# Ensure Camera
for o in bpy.data.objects:
    if "Cam" in o.name:
        bpy.data.objects.remove(o, do_unlink=True)

cam_data = bpy.data.cameras.new(name="LineupCam")
cam_obj = bpy.data.objects.new("LineupCam", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj
cam_obj.location = (0, -6.5, 1.6)
cam_obj.rotation_euler = (math.radians(82), 0, 0)

scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars_Lineup.png"
bpy.ops.render.render(write_still=True)
print("=== 4 DJS LINEUP WORKBENCH RENDER FINISHED ===")
