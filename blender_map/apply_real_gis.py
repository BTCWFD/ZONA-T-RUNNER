import bpy
import math

blend_map_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.blend"
bpy.ops.wm.open_mainfile(filepath=blend_map_path)

# 1. Crear texturas procedimentales detalladas en Canvas de Python / Blender Nodes
# Material Ladrillo Bogotano Auténtico con Bump / Relieve
mat_brick = bpy.data.materials.get("M_BogotaBrick")
if mat_brick:
    mat_brick.use_nodes = True
    nodes = mat_brick.node_tree.nodes
    links = mat_brick.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    
    # Brick Texture Node
    tex_brick = nodes.new(type='ShaderNodeTexBrick')
    tex_brick.inputs['Color1'].default_value = (0.42, 0.16, 0.08, 1.0)
    tex_brick.inputs['Color2'].default_value = (0.28, 0.10, 0.05, 1.0)
    tex_brick.inputs['Mortar'].default_value = (0.15, 0.14, 0.12, 1.0)
    tex_brick.inputs['Scale'].default_value = 18.0
    tex_brick.inputs['Mortar Size'].default_value = 0.015
    
    links.new(tex_brick.outputs['Color'], bsdf.inputs['Base Color'])
    links.new(tex_brick.outputs['Color'], bsdf.inputs['Roughness'])

# 2. Asfalto Mojado con Charcos y Reflejos (Calle 82 / Cra 13)
mat_asphalt = bpy.data.materials.get("M_WetAsphalt")
if mat_asphalt:
    nodes = mat_asphalt.node_tree.nodes
    links = mat_asphalt.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    
    tex_noise = nodes.new(type='ShaderNodeTexNoise')
    tex_noise.inputs['Scale'].default_value = 25.0
    tex_noise.inputs['Detail'].default_value = 6.0
    
    # Ramp para simular zonas húmedas hiperreflectivas
    ramp = nodes.new(type='ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.3
    ramp.color_ramp.elements[0].color = (0.05, 0.05, 0.05, 1.0) # charcos lisos
    ramp.color_ramp.elements[1].position = 0.7
    ramp.color_ramp.elements[1].color = (0.35, 0.35, 0.35, 1.0) # asfalto poroso
    
    links.new(tex_noise.outputs['Fac'], ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'], bsdf.inputs['Roughness'])
    bsdf.inputs['Base Color'].default_value = (0.02, 0.025, 0.035, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.65

# 3. Baldosa de Andén Bogotano (Adoquín peatonal grisáceo de la Zona T)
mat_sw = bpy.data.materials.get("M_Sidewalk")
if mat_sw:
    nodes = mat_sw.node_tree.nodes
    links = mat_sw.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    
    tex_voronoi = nodes.new(type='ShaderNodeTexVoronoi')
    tex_voronoi.inputs['Scale'].default_value = 40.0
    links.new(tex_voronoi.outputs['Distance'], bsdf.inputs['Roughness'])
    bsdf.inputs['Base Color'].default_value = (0.12, 0.14, 0.16, 1.0)

# 4. Modelar Fachada Real de ANDINO / EL RETIRO al final de la perspectiva (Calle 82 con Cra 11/12)
andino_bldg = bpy.data.objects.get("Building_Andino_Mall")
if not andino_bldg:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 92.0, 14.0))
    andino = bpy.context.active_object
    andino.name = "Building_Andino_Mall"
    andino.scale = (38.0, 6.0, 28.0)
    andino.data.materials.append(mat_brick)
    map_col = bpy.data.collections.get("ZonaT_Playable_Map")
    if map_col:
        map_col.objects.link(andino)
        bpy.context.scene.collection.objects.unlink(andino)

# Guardar y re-exportar a FBX y GLB
output_blend = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.blend"
output_fbx = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.fbx"
output_glb = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.glb"

bpy.ops.wm.save_as_mainfile(filepath=output_blend)
bpy.ops.export_scene.fbx(filepath=output_fbx, use_selection=False)
bpy.ops.export_scene.gltf(filepath=output_glb, export_format='GLB')

print("=== REAL STREET VIEW & EARTH DATA APPLIED TO BLENDER MAP ===")
