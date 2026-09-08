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

# Desemparentar manteniendo transformación mundial y centrar
for o in bpy.data.objects:
    if o.type == 'MESH' and o.parent:
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw

# Ahora centrar los 4 personajes: Letal=-3.0, Nuñez=-1.0, Tatan=+1.0, Fresar=+3.0
# Diferencias respecto a su origen actual
# Letal estaba en -6 -> mover +3.0
# Nuñez estaba en -2 -> mover +1.0
# Tatan estaba en +2 -> mover -1.0
# Fresar estaba en +6 -> mover -3.0
for o in bpy.data.objects:
    if o.name.startswith("Letal"):
        o.location.x += 3.0
    elif o.name.startswith("Nunez"):
        o.location.x += 1.0
    elif o.name.startswith("Tatan"):
        o.location.x -= 1.0
    elif o.name.startswith("Fresar"):
        o.location.x -= 3.0

# Eliminar Empties y el cubo pedestal
for o in bpy.data.objects:
    if o.type == 'EMPTY' or o.name == 'Cube':
        bpy.data.objects.remove(o, do_unlink=True)

# Crear tarima de neón
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.05))
stage = bpy.context.active_object
stage.name = "Stage_Pedestal"
stage.scale = (9.0, 3.0, 0.1)

# Cámara mirando a los 4 DJs de frente
cam = scene.camera
cam.location = (0, -4.5, 1.4)
cam.rotation_euler = (math.radians(82), 0, 0)

scene.render.filepath = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars_Lineup.png"
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.fbx(filepath=r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.fbx", use_selection=False)
bpy.ops.export_scene.gltf(filepath=r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.glb", export_format='GLB')
print("=== FIXED DJ HIERARCHY AND PERFECT RENDER COMPLETED ===")
