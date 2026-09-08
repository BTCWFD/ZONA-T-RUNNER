import bpy
import math

# Crear nuevo archivo para los 4 DJs icónicos
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

djs_collection = bpy.data.collections.new("Bogota_Electronic_DJs")
scene.collection.children.link(djs_collection)

def create_mat(name, color, emit=(0,0,0,1), roughness=0.3, metallic=0.2):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emit
    return mat

mat_latex = create_mat("M_Latex_Black", (0.02, 0.02, 0.03, 1), roughness=0.1, metallic=0.4)
mat_skin = create_mat("M_Skin", (0.8, 0.55, 0.45, 1), roughness=0.7)
mat_hoodie = create_mat("M_Hoodie_Dark", (0.06, 0.06, 0.08, 1), roughness=0.8)
mat_neon_violet = create_mat("M_Neon_Violet", (0.8, 0.1, 1.0, 1), emit=(0.8, 0.1, 1.0, 1))
mat_neon_orange = create_mat("M_Neon_Orange", (1.0, 0.35, 0.0, 1), emit=(1.0, 0.35, 0.0, 1))
mat_neon_cyan = create_mat("M_Neon_Cyan", (0.0, 0.9, 1.0, 1), emit=(0.0, 0.9, 1.0, 1))
mat_neon_red = create_mat("M_Neon_Red", (1.0, 0.05, 0.2, 1), emit=(1.0, 0.05, 0.2, 1))
mat_gold = create_mat("M_Gold_Fire", (1.0, 0.7, 0.1, 1), roughness=0.2, metallic=0.9)

# 1. DJ LETAL (X = -6) — Traje látex, silueta atlética, violín eléctrico violeta
letal_root = bpy.data.objects.new("DJ_LETAL_Root", None)
djs_collection.objects.link(letal_root)
letal_root.location = (-6, 0, 0)

# Torso
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-6, 0, 1.2))
torso_l = bpy.context.active_object
torso_l.name = "Letal_Torso"
torso_l.scale = (0.38, 0.26, 0.65)
torso_l.data.materials.append(mat_latex)
torso_l.parent = letal_root

# Cabeza & Cabello
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(-6, 0, 1.7))
head_l = bpy.context.active_object
head_l.name = "Letal_Head"
head_l.data.materials.append(mat_skin)
head_l.parent = letal_root

# Violín Eléctrico Neón
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-5.75, 0.15, 1.35))
violin_l = bpy.context.active_object
violin_l.name = "Letal_Electric_Violin"
violin_l.scale = (0.12, 0.45, 0.08)
violin_l.rotation_euler = (0.35, 0.2, -0.4)
violin_l.data.materials.append(mat_neon_violet)
violin_l.parent = letal_root

# 2. DJ NÚÑEZ (X = -2) — "El Toro en Llamas" Hoodie oversize, audífonos, llama pie derecho
nunez_root = bpy.data.objects.new("DJ_NUNEZ_Root", None)
djs_collection.objects.link(nunez_root)
nunez_root.location = (-2, 0, 0)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-2, 0, 1.25))
torso_n = bpy.context.active_object
torso_n.name = "Nunez_Torso"
torso_n.scale = (0.52, 0.36, 0.72)
torso_n.data.materials.append(mat_hoodie)
torso_n.parent = nunez_root

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(-2, 0, 1.8))
head_n = bpy.context.active_object
head_n.name = "Nunez_Head"
head_n.data.materials.append(mat_skin)
head_n.parent = nunez_root

# Fuego 1-2-3-4 pie derecho
bpy.ops.mesh.primitive_cone_add(radius1=0.25, depth=0.45, location=(-1.8, 0, 0.22))
flame_n = bpy.context.active_object
flame_n.name = "Nunez_Flame_Stomp"
flame_n.data.materials.append(mat_neon_orange)
flame_n.parent = nunez_root

# 3. DJ TATÁN / CALVIN PARRA (X = 2) — Chaqueta técnica, circuitos cian/verde, audífonos Octava
tatan_root = bpy.data.objects.new("DJ_TATAN_Root", None)
djs_collection.objects.link(tatan_root)
tatan_root.location = (2, 0, 0)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(2, 0, 1.25))
torso_t = bpy.context.active_object
torso_t.name = "Tatan_Torso"
torso_t.scale = (0.48, 0.32, 0.7)
torso_t.data.materials.append(mat_latex)
torso_t.parent = tatan_root

# Banda circuito cian
bpy.ops.mesh.primitive_cylinder_add(radius=0.26, depth=0.12, location=(2, 0, 1.3))
circ_t = bpy.context.active_object
circ_t.name = "Tatan_Circuit_Chest"
circ_t.data.materials.append(mat_neon_cyan)
circ_t.parent = tatan_root

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(2, 0, 1.8))
head_t = bpy.context.active_object
head_t.name = "Tatan_Head"
head_t.data.materials.append(mat_skin)
head_t.parent = tatan_root

# 4. DJ FRESAR (X = 6) — Visor audio-reactivo carmesí, chaleco industrial Octava
fresar_root = bpy.data.objects.new("DJ_FRESAR_Root", None)
djs_collection.objects.link(fresar_root)
fresar_root.location = (6, 0, 0)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(6, 0, 1.25))
torso_f = bpy.context.active_object
torso_f.name = "Fresar_Torso"
torso_f.scale = (0.5, 0.34, 0.7)
torso_f.data.materials.append(mat_hoodie)
torso_f.parent = fresar_root

# Visor Carmesí LED
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(6, 0.15, 1.82))
visor_f = bpy.context.active_object
visor_f.name = "Fresar_LED_Visor"
visor_f.scale = (0.28, 0.12, 0.08)
visor_f.data.materials.append(mat_neon_red)
visor_f.parent = fresar_root

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(6, 0, 1.8))
head_f = bpy.context.active_object
head_f.name = "Fresar_Head"
head_f.data.materials.append(mat_skin)
head_f.parent = fresar_root

# Desvincular objetos de la colección por defecto y dejar en Bogota_Electronic_DJs
for obj in [torso_l, head_l, violin_l, torso_n, head_n, flame_n, torso_t, circ_t, head_t, torso_f, visor_f, head_f]:
    djs_collection.objects.link(obj)
    if obj.name in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.unlink(obj)

# Exportar a FBX y GLB
blend_out = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.blend"
fbx_out = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.fbx"
glb_out = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_4_AllStars.glb"

bpy.ops.wm.save_as_mainfile(filepath=blend_out)
bpy.ops.export_scene.fbx(filepath=fbx_out, use_selection=False)
bpy.ops.export_scene.gltf(filepath=glb_out, export_format='GLB')

print("=== ALL 4 DJS GENERATED AND EXPORTED IN BLENDER 5.2 ===")
