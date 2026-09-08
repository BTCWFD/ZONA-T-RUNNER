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
mat_raton = create_mat("M_RatonClub_NeonRedYellow", (0.8, 0.05, 0.0), emission=(1.0, 0.1, 0.1), emission_strength=8.5)

street_width = 10.4
sidewalk_width = 4.8
left_x = -(street_width / 2.0 + sidewalk_width + 4.0)
sign_x = -(street_width / 2.0 + 2.0)

# Agregamos RATON CLUB al corredor de la Zona T (y: 88.0)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(left_x, 88.0, 11.0))
b_raton = bpy.context.active_object
b_raton.name = "Building_Raton_Club"
b_raton.scale = (8.0, 12.0, 22.0)
b_raton.data.materials.append(mat_brick)
map_col.objects.link(b_raton)
bpy.context.scene.collection.objects.unlink(b_raton)

# Letrero Neón RATON CLUB (Rojo y Amarillo vibrante)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sign_x, 88.0, 5.0))
s_raton = bpy.context.active_object
s_raton.name = "Sign_Raton_Club"
s_raton.scale = (0.5, 9.0, 2.0)
s_raton.data.materials.append(mat_raton)
map_col.objects.link(s_raton)
bpy.context.scene.collection.objects.unlink(s_raton)

output_blend = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.blend"
output_fbx = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.fbx"
output_glb = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.glb"

bpy.ops.wm.save_as_mainfile(filepath=output_blend)
bpy.ops.export_scene.fbx(filepath=output_fbx, use_selection=False)
bpy.ops.export_scene.gltf(filepath=output_glb, export_format='GLB')

print("=== RATON CLUB INTEGRATED SUCCESSFULLY ===")
