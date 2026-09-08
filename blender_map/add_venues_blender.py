import bpy

blend_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

map_col = bpy.data.collections.get("ZonaT_Playable_Map")

def create_mat(name, color, roughness=0.5, metallic=0.0, emission=None, emission_strength=1.0):
    if name in bpy.data.materials:
        return bpy.data.materials[name]
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

mat_brick = bpy.data.materials.get("M_BogotaBrick")

# Nuevos materiales luminosos para las discotecas y bares
mat_life = create_mat("M_L1FE_CyanPurple", (0.1, 0.0, 0.4), emission=(0.7, 0.0, 1.0), emission_strength=8.0)
mat_chula = create_mat("M_LaChula_HotPink", (0.8, 0.0, 0.3), emission=(1.0, 0.05, 0.4), emission_strength=7.5)
mat_capri = create_mat("M_Capri_GoldNeon", (1.0, 0.8, 0.1), emission=(1.0, 0.85, 0.2), emission_strength=7.0)
mat_malaflor = create_mat("M_Malaflor_Emerald", (0.0, 0.6, 0.4), emission=(0.1, 0.95, 0.6), emission_strength=7.0)
mat_mono = create_mat("M_MonoBandido_Amber", (0.9, 0.5, 0.0), emission=(1.0, 0.55, 0.0), emission_strength=6.5)

street_width = 10.4
sidewalk_width = 4.8
right_x = street_width / 2.0 + sidewalk_width + 4.0
sign_x = street_width / 2.0 + 2.0

# 1. DISCOTECA L1FE (Cra 13 / Cl 84A - Main Life & Bunker)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(right_x, 15.0, 11.0))
b_life = bpy.context.active_object
b_life.name = "Building_L1FE_Club"
b_life.scale = (8.0, 18.0, 22.0)
b_life.data.materials.append(mat_brick)
map_col.objects.link(b_life)
bpy.context.scene.collection.objects.unlink(b_life)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sign_x, 15.0, 5.0))
s_life = bpy.context.active_object
s_life.name = "Sign_L1FE_Bunker"
s_life.scale = (0.5, 9.0, 2.2)
s_life.data.materials.append(mat_life)
map_col.objects.link(s_life)
bpy.context.scene.collection.objects.unlink(s_life)

# 2. LA CHULA (Cra 13 # 82-58)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(right_x, 32.0, 11.0))
b_chula = bpy.context.active_object
b_chula.name = "Building_LaChula"
b_chula.scale = (8.0, 14.0, 22.0)
b_chula.data.materials.append(mat_brick)
map_col.objects.link(b_chula)
bpy.context.scene.collection.objects.unlink(b_chula)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sign_x, 32.0, 4.8))
s_chula = bpy.context.active_object
s_chula.name = "Sign_LaChula"
s_chula.scale = (0.5, 8.0, 2.0)
s_chula.data.materials.append(mat_chula)
map_col.objects.link(s_chula)
bpy.context.scene.collection.objects.unlink(s_chula)

# 3. CAPRI CLUB (Calle 83 # 12A-36 Piso 3)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(right_x, 46.0, 11.0))
b_capri = bpy.context.active_object
b_capri.name = "Building_Capri"
b_capri.scale = (8.0, 12.0, 22.0)
b_capri.data.materials.append(mat_brick)
map_col.objects.link(b_capri)
bpy.context.scene.collection.objects.unlink(b_capri)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sign_x, 46.0, 5.2))
s_capri = bpy.context.active_object
s_capri.name = "Sign_Capri_Club"
s_capri.scale = (0.5, 7.0, 1.8)
s_capri.data.materials.append(mat_capri)
map_col.objects.link(s_capri)
bpy.context.scene.collection.objects.unlink(s_capri)

# 4. MALAFLOR (Calle 83 # 12A-36)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(right_x, 58.0, 10.0))
b_mala = bpy.context.active_object
b_mala.name = "Building_Malaflor"
b_mala.scale = (8.0, 10.0, 20.0)
b_mala.data.materials.append(mat_brick)
map_col.objects.link(b_mala)
bpy.context.scene.collection.objects.unlink(b_mala)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sign_x, 58.0, 4.2))
s_mala = bpy.context.active_object
s_mala.name = "Sign_Malaflor"
s_mala.scale = (0.5, 6.5, 1.6)
s_mala.data.materials.append(mat_malaflor)
map_col.objects.link(s_mala)
bpy.context.scene.collection.objects.unlink(s_mala)

# 5. EL MONO BANDIDO ZONA T (Cra 13 # 83-18)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(right_x, 70.0, 10.0))
b_mono = bpy.context.active_object
b_mono.name = "Building_MonoBandido"
b_mono.scale = (8.0, 12.0, 20.0)
b_mono.data.materials.append(mat_brick)
map_col.objects.link(b_mono)
bpy.context.scene.collection.objects.unlink(b_mono)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sign_x, 70.0, 4.4))
s_mono = bpy.context.active_object
s_mono.name = "Sign_MonoBandido"
s_mono.scale = (0.5, 7.5, 1.8)
s_mono.data.materials.append(mat_mono)
map_col.objects.link(s_mono)
bpy.context.scene.collection.objects.unlink(s_mono)

# Re-exportar FBX y GLB
output_blend = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.blend"
output_fbx = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.fbx"
output_glb = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.glb"

bpy.ops.wm.save_as_mainfile(filepath=output_blend)
bpy.ops.export_scene.fbx(filepath=output_fbx, use_selection=False)
bpy.ops.export_scene.gltf(filepath=output_glb, export_format='GLB')

print("=== ALL VENUES INTEGRATED IN BLENDER MAP SUCCESSFULLY ===")
