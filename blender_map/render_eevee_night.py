import bpy

blend_map_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.blend"
bpy.ops.wm.open_mainfile(filepath=blend_map_path)

# Ensure night sky world
world = bpy.data.worlds.new("CyberpunkWorld")
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs['Color'].default_value = (0.02, 0.03, 0.06, 1.0)
    bg.inputs['Strength'].default_value = 0.5
bpy.context.scene.world = world

# Render with EEVEE to show emissions and materials
bpy.context.scene.render.engine = 'BLENDER_EEVEE'
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080
bpy.context.scene.render.image_settings.file_format = 'PNG'

# Remove existing PreviewCam or StreetCam
for o in bpy.data.objects:
    if "Cam" in o.name:
        bpy.data.objects.remove(o, do_unlink=True)

# Add Camera angled showing Octava, Baum Gantry, L1FE, La Chula
cam_data = bpy.data.cameras.new(name="EEVEECam")
cam_obj = bpy.data.objects.new("EEVEECam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

# Camera in street looking towards the Baum Gantry and neon signs
cam_obj.location = (0, 8, 3.2)
cam_obj.rotation_euler = (1.48, 0, 0)

# Add key PointLights for night atmosphere
for lx, ly, lcol in [(-6, 20, (0.0, 1.0, 0.9)), (6, 20, (0.9, 0.0, 1.0)), (0, 35, (1.0, 0.0, 0.7)), (-6, 50, (1.0, 0.4, 0.0))]:
    l_data = bpy.data.lights.new(name=f"NightLight_{ly}", type='POINT')
    l_data.color = lcol
    l_data.energy = 2500.0
    l_data.shadow_soft_size = 1.0
    l_obj = bpy.data.objects.new(name=f"NightLight_{ly}", object_data=l_data)
    l_obj.location = (lx, ly, 6.0)
    bpy.context.scene.collection.objects.link(l_obj)

# 1. Perspective View
bpy.context.scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Night_Perspective.png"
bpy.ops.render.render(write_still=True)

# 2. Bird's Eye View showing street lights
cam_obj.location = (0, 35, 38)
cam_obj.rotation_euler = (0.75, 0, 0)
bpy.context.scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Night_Aerial.png"
bpy.ops.render.render(write_still=True)

print("=== EEVEE NIGHT RENDERS FINISHED ===")
