"""
ZONA T RUNNER — Generador del kit modular de pista (Blender headless / bpy)

Produce segmentos de pista intercambiables de 40 m que encajan por sus extremos,
mas los props y obstaculos que los pueblan. Todo comparte la misma rejilla de
3 carriles, asi que cualquier segmento puede seguir a cualquier otro.

Convencion de anclaje (CRITICA — la respeta TrackSpawner en Unity y el web-runner):
  - El origen de cada segmento esta en (0, 0, 0).
  - El segmento crece hacia +Y y termina en Y = SEG_LEN.
  - Para encadenar: siguiente.position.y = anterior.position.y + SEG_LEN.
  - Los 3 carriles estan en X = -LANE_W, 0, +LANE_W.
  - El suelo jugable esta en Z = 0.

Uso:  python3 build_track_kit.py <directorio_de_salida>
"""
import json
import math
import os
import sys

import bpy  # debe importarse antes que bmesh
import bmesh

# --- Rejilla del juego -------------------------------------------------------
LANE_W = 2.4          # separacion entre carriles
LANES = (-LANE_W, 0.0, LANE_W)
SEG_LEN = 40.0        # unidad de encaje
STREET_W = 10.4       # ancho de calzada (coincide con el mapa existente)
SIDEWALK_W = 4.8
SIDEWALK_H = 0.24

OUT_DIR = sys.argv[-1]
os.makedirs(OUT_DIR, exist_ok=True)


# --- Utilidades --------------------------------------------------------------
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, roughness=0.5, metallic=0.0, emission=None, strength=1.0):
    """Material Principled reutilizable. `emission` en lineal 0..1."""
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if emission is not None:
            key = "Emission Color" if "Emission Color" in bsdf.inputs else "Emission"
            bsdf.inputs[key].default_value = (*emission, 1.0)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = strength
    return m


def box(name, size, loc, material, collection, rot=None):
    """Crea una caja por datos (sin bpy.ops) — rapido y sin depender del contexto."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.scale = size
    ob.location = loc
    if rot:
        ob.rotation_euler = rot
    me.materials.append(material)
    collection.objects.link(ob)
    return ob


def cyl(name, radius, depth, loc, material, collection, verts=12, rot=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts,
                          radius1=radius, radius2=radius, depth=depth)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    if rot:
        ob.rotation_euler = rot
    me.materials.append(material)
    collection.objects.link(ob)
    return ob


def new_collection(name):
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col


def export(collection, basename):
    """Exporta una coleccion a .glb (web/Unity) y .fbx (Unity)."""
    bpy.ops.object.select_all(action="DESELECT")
    for ob in collection.objects:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = next(iter(collection.objects), None)

    glb = os.path.join(OUT_DIR, basename + ".glb")
    bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB",
                              use_selection=True, export_apply=True)
    fbx = os.path.join(OUT_DIR, basename + ".fbx")
    bpy.ops.export_scene.fbx(filepath=fbx, use_selection=True,
                             apply_unit_scale=True, bake_space_transform=False,
                             object_types={"MESH"}, mesh_smooth_type="FACE")
    return glb, fbx


def tri_count(collection):
    total = 0
    for ob in collection.objects:
        if ob.type == "MESH":
            total += sum(max(len(p.vertices) - 2, 0) for p in ob.data.polygons)
    return total


# --- Paleta ------------------------------------------------------------------
reset_scene()

M_ASPHALT = mat("M_WetAsphalt", (0.02, 0.03, 0.04), roughness=0.15, metallic=0.6)
M_LINE = mat("M_YellowLine", (1.0, 0.75, 0.0), roughness=0.3, emission=(1.0, 0.7, 0.0), strength=1.5)
M_SIDEWALK = mat("M_Sidewalk", (0.10, 0.12, 0.15), roughness=0.7)
M_CURB_NEON = mat("M_CurbNeon", (0.0, 0.9, 1.0), roughness=0.1, emission=(0.0, 0.95, 1.0), strength=6.0)
M_BRICK = mat("M_BogotaBrick", (0.45, 0.18, 0.10), roughness=0.85)
M_CONCRETE = mat("M_Concrete", (0.16, 0.16, 0.17), roughness=0.8)
M_METAL = mat("M_DarkMetal", (0.08, 0.09, 0.11), roughness=0.3, metallic=0.9)
M_GLASS = mat("M_ClubGlass", (0.02, 0.02, 0.05), roughness=0.05, metallic=0.4)
M_LED = mat("M_LEDScreen", (0.9, 0.0, 0.7), emission=(0.9, 0.0, 0.7), strength=5.0)
M_NEON_CYAN = mat("M_NeonCyan", (0.0, 1.0, 0.9), emission=(0.0, 1.0, 0.9), strength=8.0)
M_NEON_MAGENTA = mat("M_NeonMagenta", (1.0, 0.0, 0.5), emission=(1.0, 0.0, 0.5), strength=8.0)
M_NEON_AMBER = mat("M_NeonAmber", (1.0, 0.45, 0.0), emission=(1.0, 0.45, 0.0), strength=8.0)
M_HAZARD = mat("M_Hazard", (0.95, 0.55, 0.0), roughness=0.5, emission=(0.9, 0.4, 0.0), strength=1.2)
M_TOKEN = mat("M_Token", (1.0, 0.82, 0.1), roughness=0.2, metallic=0.9, emission=(1.0, 0.75, 0.0), strength=3.0)
M_SPEAKER = mat("M_Speaker", (0.03, 0.03, 0.035), roughness=0.6)

MID = SEG_LEN / 2.0
manifest_parts = []


def road_base(col, prefix):
    """Calzada + lineas + andenes + bordillo neon. Base comun de todo segmento."""
    box(f"{prefix}_Road", (STREET_W, SEG_LEN, 0.06), (0, MID, -0.03), M_ASPHALT, col)
    for x in (-0.18, 0.18):
        box(f"{prefix}_CenterLine{x}", (0.14, SEG_LEN, 0.02), (x, MID, 0.012), M_LINE, col)
    for side in (-1, 1):
        # Bordillo luminoso: guia visual del limite jugable.
        box(f"{prefix}_CurbNeon{side}", (0.24, SEG_LEN, 0.03),
            (side * (STREET_W / 2 - 0.12), MID, 0.02), M_CURB_NEON, col)
        # Anden elevado.
        box(f"{prefix}_Sidewalk{side}", (SIDEWALK_W, SEG_LEN, SIDEWALK_H),
            (side * (STREET_W / 2 + SIDEWALK_W / 2), MID, SIDEWALK_H / 2), M_SIDEWALK, col)


def streetlights(col, prefix, spacing=13.0):
    """Postes con brazo y luminaria, alternando lados."""
    side = -1
    y = 5.0
    i = 0
    while y < SEG_LEN:
        x = side * (STREET_W / 2 + 1.2)
        cyl(f"{prefix}_Pole{i}", 0.10, 7.0, (x, y, 3.5), M_METAL, col, verts=8)
        box(f"{prefix}_Arm{i}", (1.8, 0.12, 0.12), (x - side * 0.9, y, 6.9), M_METAL, col)
        box(f"{prefix}_Lamp{i}", (0.7, 0.3, 0.12), (x - side * 1.7, y, 6.8), M_NEON_AMBER, col)
        side *= -1
        y += spacing
        i += 1


# --- 1. SEG_Street: avenida base --------------------------------------------
col = new_collection("SEG_Street")
road_base(col, "Street")
streetlights(col, "Street")
for i, y in enumerate([x * 4.0 for x in range(1, int(SEG_LEN / 4))]):
    for side in (-1, 1):
        cyl(f"Street_Bollard{side}_{i}", 0.11, 0.9,
            (side * (STREET_W / 2 + 0.5), y, 0.45 + SIDEWALK_H), M_METAL, col, verts=6)
# Rejillas de alcantarillado: detalle de asfalto bogotano.
for i, y in enumerate([9.0, 24.0, 35.0]):
    box(f"Street_Grate{i}", (0.9, 0.55, 0.02), (-STREET_W / 2 + 0.9, y, 0.012), M_METAL, col)
manifest_parts.append(("SEG_Street", col, "segment",
                       "Avenida base: calzada mojada, andenes, bolardos y alumbrado. Relleno neutro."))

# --- 2. SEG_ClubBlock: fachadas de club -------------------------------------
col = new_collection("SEG_ClubBlock")
road_base(col, "Club")
streetlights(col, "Club", spacing=19.0)
CLUB_NEONS = [M_NEON_CYAN, M_NEON_MAGENTA, M_NEON_AMBER, M_NEON_CYAN]
for side in (-1, 1):
    base_x = side * (STREET_W / 2 + SIDEWALK_W + 3.0)
    for i in range(4):
        y = 5.0 + i * 10.0
        h = 9.0 + (i % 3) * 3.0
        # Cuerpo del edificio en ladrillo bogotano.
        box(f"Club_Bldg{side}_{i}", (6.0, 8.0, h), (base_x, y, h / 2), M_BRICK, col)
        # Vitrina / fachada acristalada a nivel de calle.
        box(f"Club_Front{side}_{i}", (0.25, 7.2, 3.4),
            (base_x - side * 3.0, y, 1.9), M_GLASS, col)
        # Marquesina volada sobre el anden.
        box(f"Club_Canopy{side}_{i}", (2.6, 7.2, 0.22),
            (base_x - side * 4.3, y, 4.1), M_METAL, col)
        # Letrero de neon vertical: lo que el jugador lee a 60 km/h.
        box(f"Club_Sign{side}_{i}", (0.18, 1.1, 4.2),
            (base_x - side * 3.2, y - 2.6, 6.4), CLUB_NEONS[i], col)
        # Banda de neon bajo la marquesina.
        box(f"Club_NeonStrip{side}_{i}", (2.4, 7.0, 0.10),
            (base_x - side * 4.3, y, 3.95), CLUB_NEONS[i], col)
manifest_parts.append(("SEG_ClubBlock", col, "segment",
                       "Manzana de clubes: fachadas de ladrillo, vitrinas, marquesinas y letreros de neon."))

# --- 3. SEG_Gantry: portico con mega-valla LED ------------------------------
col = new_collection("SEG_Gantry")
road_base(col, "Gantry")
GY = 18.0
span = STREET_W + SIDEWALK_W * 2
for side in (-1, 1):
    x = side * (span / 2)
    box(f"Gantry_Leg{side}", (0.7, 0.7, 9.0), (x, GY, 4.5), M_METAL, col)
    box(f"Gantry_Foot{side}", (1.4, 1.4, 0.4), (x, GY, 0.2), M_CONCRETE, col)
box("Gantry_Beam", (span + 1.4, 1.0, 0.8), (0, GY, 9.4), M_METAL, col)
# Pantalla LED: el inventario publicitario premium del juego.
box("Gantry_LEDScreen", (span - 1.0, 0.30, 3.2), (0, GY - 0.3, 7.3), M_LED, col)
box("Gantry_ScreenFrame", (span - 0.6, 0.45, 3.5), (0, GY, 7.3), M_METAL, col)
# Cruces de arriostramiento.
for side in (-1, 1):
    box(f"Gantry_Brace{side}", (2.6, 0.25, 0.25), (side * (span / 2 - 1.3), GY, 8.4),
        M_METAL, col, rot=(0, math.radians(28) * side, 0))
streetlights(col, "Gantry", spacing=25.0)
manifest_parts.append(("SEG_Gantry", col, "segment",
                       "Portico con mega-valla LED cruzando la avenida. Espacio publicitario principal."))

# --- 4. SEG_Construction: obra en via ---------------------------------------
col = new_collection("SEG_Construction")
road_base(col, "Work")
streetlights(col, "Work", spacing=21.0)
# Andamio que cruza sobre 2 carriles: obliga a deslizarse.
box("Work_ScaffoldDeck", (STREET_W - 1.0, 1.6, 0.25), (0, 14.0, 2.55), M_METAL, col)
for x in (-STREET_W / 2 + 0.8, STREET_W / 2 - 0.8):
    for dy in (-0.6, 0.6):
        cyl(f"Work_ScaffoldLeg{x}_{dy}", 0.09, 2.6, (x, 14.0 + dy, 1.3), M_METAL, col, verts=6)
# Vallas de obra a lo largo del anden.
for i in range(6):
    box(f"Work_Fence{i}", (0.10, 2.2, 1.15),
        (-STREET_W / 2 + 0.4, 4.0 + i * 5.5, 0.6), M_HAZARD, col)
# Monton de escombros y cono.
box("Work_Rubble", (2.0, 2.0, 0.5), (STREET_W / 2 - 1.6, 27.0, 0.25), M_CONCRETE, col)
cyl("Work_Cone", 0.32, 0.8, (STREET_W / 2 - 1.6, 24.0, 0.4), M_HAZARD, col, verts=8)
manifest_parts.append(("SEG_Construction", col, "segment",
                       "Obra en via: andamio para deslizarse, vallas naranja y escombros."))

# --- 5. Obstaculos (props sueltos, origen en su base) ------------------------
col = new_collection("OBS_JumpBarrier")
box("JumpBarrier_Body", (2.0, 0.45, 0.85), (0, 0, 0.425), M_CONCRETE, col)
box("JumpBarrier_Stripe", (2.02, 0.47, 0.18), (0, 0, 0.62), M_HAZARD, col)
manifest_parts.append(("OBS_JumpBarrier", col, "obstacle",
                       "Barrera baja de concreto. Interaccion: SALTAR. Ocupa 1 carril."))

col = new_collection("OBS_SlideScaffold")
box("SlideScaffold_Deck", (2.3, 1.2, 0.22), (0, 0, 2.4), M_METAL, col)
for x in (-1.0, 1.0):
    for y in (-0.5, 0.5):
        cyl(f"SlideScaffold_Leg{x}_{y}", 0.08, 2.4, (x, y, 1.2), M_METAL, col, verts=6)
box("SlideScaffold_Tape", (2.32, 0.06, 0.14), (0, -0.6, 2.2), M_HAZARD, col)
manifest_parts.append(("OBS_SlideScaffold", col, "obstacle",
                       "Andamio alto con paso libre a 2.3 m. Interaccion: DESLIZAR. Ocupa 1 carril."))

col = new_collection("OBS_SpeakerStack")
for i in range(3):
    box(f"SpeakerStack_Cab{i}", (1.9, 1.1, 0.95), (0, 0, 0.475 + i * 0.98), M_SPEAKER, col)
    cyl(f"SpeakerStack_Cone{i}", 0.36, 0.10, (0, -0.56, 0.475 + i * 0.98),
        M_METAL, col, verts=12, rot=(math.radians(90), 0, 0))
box("SpeakerStack_Led", (1.7, 0.08, 0.06), (0, -0.58, 2.95), M_NEON_MAGENTA, col)
manifest_parts.append(("OBS_SpeakerStack", col, "obstacle",
                       "Torre de bafles Funktion-One. Bloquea el carril: obliga a cambiar de carril."))

# --- 6. Props y coleccionables ----------------------------------------------
col = new_collection("PROP_Streetlight")
cyl("Streetlight_Pole", 0.10, 7.0, (0, 0, 3.5), M_METAL, col, verts=8)
box("Streetlight_Arm", (1.8, 0.12, 0.12), (0.9, 0, 6.9), M_METAL, col)
box("Streetlight_Lamp", (0.7, 0.3, 0.12), (1.7, 0, 6.8), M_NEON_AMBER, col)
manifest_parts.append(("PROP_Streetlight", col, "prop", "Poste de alumbrado con luminaria ambar."))

col = new_collection("PROP_Billboard")
box("Billboard_Post", (0.35, 0.35, 4.0), (0, 0, 2.0), M_METAL, col)
box("Billboard_Panel", (4.2, 0.25, 2.4), (0, 0, 5.2), M_LED, col)
box("Billboard_Frame", (4.5, 0.35, 2.7), (0, 0.06, 5.2), M_METAL, col)
manifest_parts.append(("PROP_Billboard", col, "prop",
                       "Valla LED lateral. Inventario publicitario secundario (texture swap en runtime)."))

col = new_collection("COL_Token")
cyl("Token", 0.42, 0.10, (0, 0, 0), M_TOKEN, col, verts=16, rot=(math.radians(90), 0, 0))
manifest_parts.append(("COL_Token", col, "collectible",
                       "Token Zona T. Se instancia en fila sobre un carril, a 1.1 m del suelo."))

# --- Export ------------------------------------------------------------------
entries = []
for name, collection, kind, desc in manifest_parts:
    glb, fbx = export(collection, name)
    entries.append({
        "name": name,
        "kind": kind,
        "description": desc,
        "glb": f"track_kit/{name}.glb",
        "fbx": f"track_kit/{name}.fbx",
        "triangles": tri_count(collection),
        "objects": len(collection.objects),
    })
    print(f"  {name:22s} {tri_count(collection):6d} tris  {len(collection.objects):3d} objetos")

manifest = {
    "$comment": "Kit modular de pista de ZONA T RUNNER. Generado por blender_map/build_track_kit.py.",
    "version": "1.0.0",
    "generator": f"Blender {bpy.app.version_string} (bpy headless)",
    "grid": {
        "laneWidth": LANE_W,
        "lanes": list(LANES),
        "segmentLength": SEG_LEN,
        "streetWidth": STREET_W,
        "sidewalkWidth": SIDEWALK_W,
        "groundZ": 0.0,
        "tokenHeight": 1.1,
    },
    "anchoring": (
        "Cada segmento tiene su origen en (0,0,0) y crece hacia +Y hasta segmentLength. "
        "Para encadenar: siguiente.y = anterior.y + segmentLength. Los obstaculos y "
        "coleccionables se instancian con su origen en la base, sobre uno de los tres carriles."
    ),
    "parts": entries,
    "totalTriangles": sum(e["triangles"] for e in entries),
}
with open(os.path.join(OUT_DIR, "track_kit_manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT_DIR, "ZonaT_TrackKit.blend"))
print(f"\nTOTAL: {manifest['totalTriangles']} triangulos en {len(entries)} piezas")
print("Salida:", OUT_DIR)
