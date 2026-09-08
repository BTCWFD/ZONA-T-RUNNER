import bpy

blend_map_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.blend"
bpy.ops.wm.open_mainfile(filepath=blend_map_path)

bpy.context.scene.render.engine = 'BLENDER_EEVEE'
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080
bpy.context.scene.render.image_settings.file_format = 'PNG'

# World setup
world = bpy.data.worlds.new("CyberpunkNightWorld")
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs['Color'].default_value = (0.015, 0.02, 0.04, 1.0)
    bg.inputs['Strength'].default_value = 0.4
bpy.context.scene.world = world

# Remove existing Cam
for o in bpy.data.objects:
    if "Cam" in o.name:
        bpy.data.objects.remove(o, do_unlink=True)

cam_data = bpy.data.cameras.new(name="StreetViewCam")
cam_obj = bpy.data.objects.new("StreetViewCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj
cam_obj.location = (0, 10, 3.2)
cam_obj.rotation_euler = (1.46, 0, 0)

# Add Street Lights reflecting on the wet asphalt
for lx, ly, lcol, pwr in [(-5.5, 25, (0.0, 1.0, 0.9), 3500.0), (5.5, 30, (1.0, 0.5, 0.0), 3500.0), (0, 45, (1.0, 0.0, 0.6), 4000.0), (-5.5, 65, (0.7, 0.0, 1.0), 3500.0)]:
    l_data = bpy.data.lights.new(name=f"StreetLight_{ly}", type='POINT')
    l_data.color = lcol
    l_data.energy = pwr
    l_data.shadow_soft_size = 1.2
    l_obj = bpy.data.objects.new(name=f"StreetLight_{ly}", object_data=l_data)
    l_obj.location = (lx, ly, 5.5)
    bpy.context.scene.collection.objects.link(l_obj)

bpy.context.scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Real_Street_View_Render.png"
bpy.ops.render.render(write_still=True)
print("=== REAL STREET VIEW RENDER COMPLETE ===")
