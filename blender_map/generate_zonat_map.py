import bpy
import math

bpy.ops.wm.read_factory_settings(use_empty=True)

map_col = bpy.data.collections.new("ZonaT_Playable_Map")
bpy.context.scene.collection.children.link(map_col)

def create_mat(name, color, roughness=0.5, metallic=0.0, emission=None, emission_strength=1.0):
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

mat_asphalt = create_mat("M_WetAsphalt", (0.02, 0.03, 0.04), roughness=0.15, metallic=0.6)
mat_yellow_line = create_mat("M_YellowLine", (1.0, 0.75, 0.0), roughness=0.3, emission=(1.0, 0.7, 0.0), emission_strength=1.5)
mat_cyan_neon = create_mat("M_CyanNeon", (0.0, 0.9, 1.0), roughness=0.1, emission=(0.0, 0.95, 1.0), emission_strength=6.0)
mat_sidewalk = create_mat("M_Sidewalk", (0.1, 0.12, 0.15), roughness=0.7)
mat_bollard = create_mat("M_Bollard", (0.05, 0.06, 0.08), roughness=0.3, metallic=0.85)
mat_brick = create_mat("M_BogotaBrick", (0.45, 0.18, 0.1), roughness=0.8)
mat_octava_neon = create_mat("M_OctavaCyan", (0.0, 1.0, 0.9), emission=(0.0, 1.0, 0.9), emission_strength=8.0)
mat_andres_neon = create_mat("M_AndresOrange", (1.0, 0.35, 0.0), emission=(1.0, 0.35, 0.0), emission_strength=8.0)
mat_metal_truss = create_mat("M_LatticeTruss", (0.08, 0.09, 0.11), roughness=0.3, metallic=0.9)
mat_led_screen = create_mat("M_BaumLEDScreen", (0.8, 0.0, 0.6), emission=(0.9, 0.0, 0.7), emission_strength=5.0)

seg_length = 80.0
street_width = 10.4
sidewalk_width = 4.8

bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0, seg_length / 2.0, 0))
road = bpy.context.active_object
road.name = "Road_Asphalt"
road.scale = (street_width, seg_length, 1.0)
road.data.materials.append(mat_asphalt)
map_col.objects.link(road)
bpy.context.scene.collection.objects.unlink(road)

for offset_x in [-0.18, 0.18]:
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(offset_x, seg_length / 2.0, 0.015))
    line = bpy.context.active_object
    line.name = f"Line_Yellow_{offset_x}"
    line.scale = (0.14, seg_length, 1.0)
    line.data.materials.append(mat_yellow_line)
    map_col.objects.link(line)
    bpy.context.scene.collection.objects.unlink(line)

for offset_x in [-street_width / 2.0 + 0.12, street_width / 2.0 - 0.12]:
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(offset_x, seg_length / 2.0, 0.02))
    strip = bpy.context.active_object
    strip.name = f"Neon_Curb_Strip_{offset_x}"
    strip.scale = (0.24, seg_length, 1.0)
    strip.data.materials.append(mat_cyan_neon)
    map_col.objects.link(strip)
    bpy.context.scene.collection.objects.unlink(strip)

for side in [-1, 1]:
    sw_x = side * (street_width / 2.0 + sidewalk_width / 2.0)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sw_x, seg_length / 2.0, 0.12))
    sw = bpy.context.active_object
    sw.name = f"Sidewalk_{'Left' if side < 0 else 'Right'}"
    sw.scale = (sidewalk_width, seg_length, 0.24)
    sw.data.materials.append(mat_sidewalk)
    map_col.objects.link(sw)
    bpy.context.scene.collection.objects.unlink(sw)

    bollard_x = side * (street_width / 2.0 + 0.5)
    for b_y in range(4, int(seg_length), 6):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.85, location=(bollard_x, b_y, 0.45))
        bollard = bpy.context.active_object
        bollard.name = f"Bollard_{side}_{b_y}"
        bollard.data.materials.append(mat_bollard)
        map_col.objects.link(bollard)
        bpy.context.scene.collection.objects.unlink(bollard)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-(street_width/2.0 + sidewalk_width + 4.0), 20.0, 10.0))
oct_bldg = bpy.context.active_object
oct_bldg.name = "Building_Club_Octava"
oct_bldg.scale = (8.0, 38.0, 20.0)
oct_bldg.data.materials.append(mat_brick)
map_col.objects.link(oct_bldg)
bpy.context.scene.collection.objects.unlink(oct_bldg)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-(street_width/2.0 + 2.0), 20.0, 4.2))
oct_sign = bpy.context.active_object
oct_sign.name = "Sign_Club_Octava"
oct_sign.scale = (0.6, 12.0, 2.2)
oct_sign.data.materials.append(mat_octava_neon)
map_col.objects.link(oct_sign)
bpy.context.scene.collection.objects.unlink(oct_sign)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-(street_width/2.0 + sidewalk_width + 4.0), 60.0, 11.0))
andres_bldg = bpy.context.active_object
andres_bldg.name = "Building_Andres_DC"
andres_bldg.scale = (8.0, 38.0, 22.0)
andres_bldg.data.materials.append(mat_brick)
map_col.objects.link(andres_bldg)
bpy.context.scene.collection.objects.unlink(andres_bldg)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-(street_width/2.0 + 2.0), 60.0, 4.5))
andres_sign = bpy.context.active_object
andres_sign.name = "Sign_Andres_DC"
andres_sign.scale = (0.6, 14.0, 2.4)
andres_sign.data.materials.append(mat_andres_neon)
map_col.objects.link(andres_sign)
bpy.context.scene.collection.objects.unlink(andres_sign)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=((street_width/2.0 + sidewalk_width + 4.0), seg_length/2.0, 12.0))
r_bldg = bpy.context.active_object
r_bldg.name = "Building_Commercial_Right"
r_bldg.scale = (8.0, seg_length - 2.0, 24.0)
r_bldg.data.materials.append(mat_brick)
map_col.objects.link(r_bldg)
bpy.context.scene.collection.objects.unlink(r_bldg)

gantry_y = 35.0
for g_side in [-1, 1]:
    px = g_side * (street_width / 2.0 + 0.8)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(px, gantry_y, 4.8))
    pylon = bpy.context.active_object
    pylon.name = f"Gantry_Pylon_{g_side}"
    pylon.scale = (0.6, 0.6, 9.6)
    pylon.data.materials.append(mat_metal_truss)
    map_col.objects.link(pylon)
    bpy.context.scene.collection.objects.unlink(pylon)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, gantry_y, 9.2))
crossbeam = bpy.context.active_object
crossbeam.name = "Gantry_Crossbeam"
crossbeam.scale = (street_width + 3.0, 0.8, 0.8)
crossbeam.data.materials.append(mat_metal_truss)
map_col.objects.link(crossbeam)
bpy.context.scene.collection.objects.unlink(crossbeam)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, gantry_y, 7.0))
screen = bpy.context.active_object
screen.name = "Gantry_LED_Screen_Baum"
screen.scale = (street_width - 1.0, 0.4, 3.8)
screen.data.materials.append(mat_led_screen)
map_col.objects.link(screen)
bpy.context.scene.collection.objects.unlink(screen)

output_blend = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.blend"
output_fbx = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.fbx"
output_glb = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\blender_map\ZonaT_Bogota_Map.glb"

bpy.ops.wm.save_as_mainfile(filepath=output_blend)
bpy.ops.export_scene.fbx(filepath=output_fbx, use_selection=False)
bpy.ops.export_scene.gltf(filepath=output_glb, export_format='GLB')

print("=== MAP GENERATED AND EXPORTED SUCCESSFULLY ===")
