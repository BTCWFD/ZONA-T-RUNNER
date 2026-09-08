import bpy
import math

bpy.ops.wm.read_factory_settings(use_empty=True)
char_col = bpy.data.collections.new("Characters_Letal_Nunez")
bpy.context.scene.collection.children.link(char_col)

def create_mat(name, color, roughness=0.4, metallic=0.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*color, 1.0)
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        if emission:
            if 'Emission Color' in bsdf.inputs:
                bsdf.inputs['Emission Color'].default_value = (*emission, 1.0)
                bsdf.inputs['Emission Strength'].default_value = emission_strength
            elif 'Emission' in bsdf.inputs:
                bsdf.inputs['Emission'].default_value = (*emission, 1.0)
                if 'Emission Strength' in bsdf.inputs:
                    bsdf.inputs['Emission Strength'].default_value = emission_strength
    return mat

mat_latex = create_mat("M_Letal_Latex", (0.02, 0.02, 0.03), roughness=0.1, metallic=0.9)
mat_skin_female = create_mat("M_Letal_Skin", (0.85, 0.65, 0.55), roughness=0.6)
mat_hair_black = create_mat("M_Hair_Black", (0.01, 0.01, 0.01), roughness=0.7)
mat_violet_neon = create_mat("M_Violin_NeonViolet", (0.5, 0.0, 1.0), emission=(0.7, 0.0, 1.0), emission_strength=8.0)

mat_hoodie_dark = create_mat("M_Nunez_Hoodie", (0.05, 0.05, 0.06), roughness=0.8)
mat_skin_male = create_mat("M_Nunez_Skin", (0.8, 0.6, 0.5), roughness=0.6)
mat_headphones = create_mat("M_Headphones", (0.08, 0.08, 0.08), roughness=0.3, metallic=0.7)
mat_flame_foot = create_mat("M_Nunez_Flame", (1.0, 0.3, 0.0), emission=(1.0, 0.45, 0.0), emission_strength=10.0)

# ==================== 1. DJ LETAL ====================
# Torso & Latex Suit
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-1.8, 0, 1.15))
torso_l = bpy.context.active_object
torso_l.name = "Letal_Torso"
torso_l.scale = (0.42, 0.28, 0.65)
torso_l.data.materials.append(mat_latex)
char_col.objects.link(torso_l)
bpy.context.scene.collection.objects.unlink(torso_l)

# Head & Hair
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(-1.8, 0, 1.65))
head_l = bpy.context.active_object
head_l.name = "Letal_Head"
head_l.data.materials.append(mat_skin_female)
char_col.objects.link(head_l)
bpy.context.scene.collection.objects.unlink(head_l)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-1.8, -0.05, 1.68))
hair_l = bpy.context.active_object
hair_l.name = "Letal_Hair"
hair_l.scale = (0.4, 0.35, 0.45)
hair_l.data.materials.append(mat_hair_black)
char_col.objects.link(hair_l)
bpy.context.scene.collection.objects.unlink(hair_l)

# Legs (Running stride)
for side_x, offset in [(-0.16, 0.25), (0.16, -0.25)]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.09, depth=0.85, location=(-1.8 + side_x, offset, 0.45))
    leg = bpy.context.active_object
    leg.name = f"Letal_Leg_{'L' if side_x < 0 else 'R'}"
    leg.rotation_euler = (math.radians(-15 if offset > 0 else 20), 0, 0)
    leg.data.materials.append(mat_latex)
    char_col.objects.link(leg)
    bpy.context.scene.collection.objects.unlink(leg)

# Electric Neon Violin
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-1.55, 0.25, 1.35))
violin = bpy.context.active_object
violin.name = "Letal_Electric_Violin"
violin.scale = (0.12, 0.55, 0.16)
violin.rotation_euler = (math.radians(25), math.radians(20), math.radians(10))
violin.data.materials.append(mat_violet_neon)
char_col.objects.link(violin)
bpy.context.scene.collection.objects.unlink(violin)


# ==================== 2. DJ NÚÑEZ ====================
# Torso & Hoodie
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(1.8, 0, 1.25))
torso_n = bpy.context.active_object
torso_n.name = "Nunez_Torso"
torso_n.scale = (0.58, 0.36, 0.72)
torso_n.data.materials.append(mat_hoodie_dark)
char_col.objects.link(torso_n)
bpy.context.scene.collection.objects.unlink(torso_n)

# Head & Beard
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(1.8, 0, 1.78))
head_n = bpy.context.active_object
head_n.name = "Nunez_Head"
head_n.data.materials.append(mat_skin_male)
char_col.objects.link(head_n)
bpy.context.scene.collection.objects.unlink(head_n)

# Headphones around neck
bpy.ops.mesh.primitive_torus_add(major_radius=0.26, minor_radius=0.06, location=(1.8, 0, 1.62))
hp_n = bpy.context.active_object
hp_n.name = "Nunez_Headphones"
hp_n.rotation_euler = (math.radians(15), math.radians(10), 0)
hp_n.data.materials.append(mat_headphones)
char_col.objects.link(hp_n)
bpy.context.scene.collection.objects.unlink(hp_n)

# Legs (Heavy Stomp)
for side_x, offset in [(-0.2, 0.3), (0.2, -0.3)]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.9, location=(1.8 + side_x, offset, 0.48))
    leg = bpy.context.active_object
    leg.name = f"Nunez_Leg_{'L' if side_x < 0 else 'R'}"
    leg.rotation_euler = (math.radians(-25 if offset > 0 else 25), 0, 0)
    leg.data.materials.append(mat_hoodie_dark)
    char_col.objects.link(leg)
    bpy.context.scene.collection.objects.unlink(leg)

# Flame Foot Stomp (Right Foot Effect)
bpy.ops.mesh.primitive_cone_add(radius1=0.28, depth=0.45, location=(2.0, 0.38, 0.15))
flame = bpy.context.active_object
flame.name = "Nunez_Right_Foot_Flame"
flame.rotation_euler = (math.radians(180), 0, 0)
flame.data.materials.append(mat_flame_foot)
char_col.objects.link(flame)
bpy.context.scene.collection.objects.unlink(flame)

# Save & Export
blend_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_Letal_Nunez_Models.blend"
fbx_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_Letal_Nunez_Models.fbx"
glb_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\DJs_Letal_Nunez_Models.glb"

bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.fbx(filepath=fbx_path, use_selection=False)
bpy.ops.export_scene.gltf(filepath=glb_path, export_format='GLB')

print("=== DJS MODELS EXPORTED SUCCESSFULLY ===")
