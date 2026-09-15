"""
ZONA T RUNNER — Generador de personajes DJ jugables (Blender headless / bpy)

Construye los 4 DJs documentados en docs/LORE_PERSONAJES_DJS.md como corredores
estilizados, a la escala real del juego y con la misma convencion de anclaje que
el kit de pista, para que entren directo en la escena sin reescalar.

Convencion:
  - Origen en los PIES, en (0, 0, 0). Z = 0 es el suelo jugable.
  - Altura 1.80 m. El personaje mira hacia +Y (la direccion de carrera).
  - Ancho maximo 0.95 m: cabe holgado en un carril de 2.4 m.
  - Pose de zancada, no T-pose: el prototipo web no tiene esqueleto todavia y
    asi se lee la silueta correcta desde el primer frame.

Cada DJ lleva un elemento de silueta unico — lo que el jugador reconoce a 60 km/h
y de espaldas, que es como se ve al personaje el 100% de la partida.

Uso:  python3 build_dj_characters.py <directorio_de_salida>
"""
import json
import math
import os
import sys

import bpy  # debe importarse antes que bmesh
import bmesh

OUT_DIR = sys.argv[-1]
os.makedirs(OUT_DIR, exist_ok=True)

HEIGHT = 1.80


def hex_to_lin(h):
    """Hex sRGB -> lineal, que es lo que espera Blender en Base Color."""
    h = h.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)


def mat(name, color, roughness=0.5, metallic=0.0, emission=None, strength=1.0):
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    if b:
        b.inputs["Base Color"].default_value = (*color, 1.0)
        b.inputs["Roughness"].default_value = roughness
        b.inputs["Metallic"].default_value = metallic
        if emission is not None:
            key = "Emission Color" if "Emission Color" in b.inputs else "Emission"
            b.inputs[key].default_value = (*emission, 1.0)
            if "Emission Strength" in b.inputs:
                b.inputs["Emission Strength"].default_value = strength
    return m


def box(name, size, loc, material, col, rot=None, parent=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.bevel(bm, geom=list(bm.verts) + list(bm.edges), offset=0.06,
                    segments=1, affect="EDGES")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.scale = size
    ob.location = loc
    if rot:
        ob.rotation_euler = rot
    me.materials.append(material)
    col.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


def cyl(name, radius, depth, loc, material, col, verts=10, rot=None, parent=None):
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
    col.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


def sphere(name, radius, loc, material, col, parent=None, scale=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=8, radius=radius)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    if scale:
        ob.scale = scale
    me.materials.append(material)
    col.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


# --- Definicion de los 4 DJs (docs/LORE_PERSONAJES_DJS.md) -------------------
DJS = [
    {
        "id": "dj_letal", "name": "LETAL", "accent": "#cc00ff",
        "secondary": "#00d9c0",   # turquesa del ojo turco / nazar (IG)
        "outfit": (0.012, 0.012, 0.016), "outfit_rough": 0.12,   # latex all-black
        "outfit_metal": 0.25,
        "skin": "#e8b89a", "female": True, "hair_streak": True,   # mechon rojo
        "signature": "violin",
        "note": "Latex negro, violin neon violeta, ojo turco, mechon rojo (IG @letal._).",
    },
    {
        "id": "dj_nunez", "name": "NUNEZ", "accent": "#ff5500",
        "outfit": (0.030, 0.028, 0.032), "outfit_rough": 0.85,   # hoodie oversize
        "outfit_metal": 0.0,
        "skin": "#c98d63", "female": False,
        "signature": "flame_foot",
        "note": "Hoodie oversize oscuro, aura de fuego ambar, pisada derecha en llamas.",
    },
    {
        "id": "dj_tatan", "name": "TATAN", "accent": "#00ff88",
        "outfit": (0.022, 0.024, 0.026), "outfit_rough": 0.45,   # chaqueta tactica mate
        "outfit_metal": 0.15,
        "skin": "#c98d63", "female": False,
        "signature": "circuits",
        "note": "Chaqueta tactica negra mate con circuitos bioluminiscentes verdes.",
    },
    {
        "id": "dj_fresar", "name": "FRESAR", "accent": "#ff0055",
        "secondary": "#00e5ff",   # cian del tatuaje de circuito (concept art)
        "outfit": (0.028, 0.026, 0.030), "outfit_rough": 0.55,   # chaleco tactico
        "outfit_metal": 0.20,
        "skin": "#d9a077", "female": False, "strawberry": True,   # 🍓 Divino Fruto (IG)
        "signature": "visor",
        "note": "Visor LED carmesi, chaleco tactico, emblema de fresa (IG @fresar).",
    },
]


def build_dj(cfg):
    name = cfg["id"]
    col = bpy.data.collections.new(f"CHAR_{cfg['name']}")
    bpy.context.scene.collection.children.link(col)

    root = bpy.data.objects.new(f"{name}_root", None)
    col.objects.link(root)

    accent_lin = hex_to_lin(cfg["accent"])
    M_OUT = mat(f"M_{name}_Outfit", cfg["outfit"],
                roughness=cfg["outfit_rough"], metallic=cfg["outfit_metal"])
    M_SKIN = mat(f"M_{name}_Skin", hex_to_lin(cfg["skin"]), roughness=0.65)
    M_ACC = mat(f"M_{name}_Accent", accent_lin, roughness=0.2,
                emission=accent_lin, strength=6.0)
    M_GEAR = mat(f"M_{name}_Gear", (0.02, 0.02, 0.025), roughness=0.35, metallic=0.7)
    sec_lin = hex_to_lin(cfg["secondary"]) if cfg.get("secondary") else accent_lin
    M_SEC = mat(f"M_{name}_Secondary", sec_lin, roughness=0.15,
                emission=sec_lin, strength=6.0)
    M_HAIR_RED = mat(f"M_{name}_HairRed", (0.35, 0.02, 0.03), roughness=0.3)

    fem = cfg["female"]
    sh_w = 0.40 if fem else 0.46          # ancho de hombros
    hip_w = 0.36 if fem else 0.34

    # --- Torso: dos bloques para marcar la caja toracica y la cintura --------
    box(f"{name}_Chest", (sh_w, 0.26, 0.42), (0, 0, 1.30), M_OUT, col, parent=root)
    box(f"{name}_Waist", (hip_w * 0.86, 0.22, 0.26), (0, 0, 1.00), M_OUT, col, parent=root)
    box(f"{name}_Hips", (hip_w, 0.24, 0.20), (0, 0, 0.86), M_OUT, col, parent=root)
    # Banda de acento en el pecho: el color del DJ, visible de espaldas.
    box(f"{name}_ChestStripe", (sh_w * 0.55, 0.28, 0.05), (0, 0, 1.36), M_ACC, col, parent=root)

    # --- Cabeza y audifonos --------------------------------------------------
    cyl(f"{name}_Neck", 0.055, 0.10, (0, 0, 1.56), M_SKIN, col, verts=8, parent=root)
    sphere(f"{name}_Head", 0.115, (0, 0.01, 1.68), M_SKIN, col,
           parent=root, scale=(0.92, 1.05, 1.10))
    # Audifonos de monitoreo: rasgo comun a los cuatro, los identifica como DJs.
    for s in (-1, 1):
        cyl(f"{name}_Ear{s}", 0.062, 0.05, (s * 0.115, 0.01, 1.70), M_GEAR, col,
            verts=10, rot=(0, math.radians(90), 0), parent=root)
        cyl(f"{name}_EarRing{s}", 0.045, 0.055, (s * 0.128, 0.01, 1.70), M_ACC, col,
            verts=10, rot=(0, math.radians(90), 0), parent=root)
    box(f"{name}_Headband", (0.25, 0.05, 0.035), (0, 0.01, 1.79), M_GEAR, col, parent=root)

    if fem:
        # Melena suelta larga: silueta femenina legible en contraluz.
        box(f"{name}_Hair", (0.24, 0.22, 0.22), (0, -0.04, 1.71), M_OUT, col, parent=root)
        cyl(f"{name}_HairFall", 0.10, 0.46, (0, -0.13, 1.42), M_OUT, col, verts=8,
            rot=(math.radians(12), 0, 0), parent=root)
        if cfg.get("hair_streak"):
            # Mechon rojo caracteristico de Letal (IG).
            cyl(f"{name}_RedStreak", 0.028, 0.44, (0.11, -0.11, 1.42), M_HAIR_RED, col,
                verts=6, rot=(math.radians(12), 0, 0), parent=root)

    # --- Brazos en zancada: derecho adelante, izquierdo atras ---------------
    # brazo = (lado, angulo_hombro, angulo_codo)
    for side, up_rot, fore_rot in ((-1, -50, -75), (1, 40, -60)):
        sx = side * (sh_w / 2 + 0.07)
        cyl(f"{name}_UpperArm{side}", 0.055, 0.30, (sx, 0.06 * -side, 1.30), M_OUT, col,
            verts=8, rot=(math.radians(up_rot), 0, 0), parent=root)
        fy = 0.20 * math.sin(math.radians(up_rot)) * -1
        cyl(f"{name}_Forearm{side}", 0.048, 0.28, (sx, fy - 0.02, 1.10), M_SKIN, col,
            verts=8, rot=(math.radians(fore_rot), 0, 0), parent=root)
        sphere(f"{name}_Fist{side}", 0.055, (sx, fy - 0.14, 1.02), M_SKIN, col, parent=root)

    # --- Piernas en zancada: izquierda adelante, derecha atras --------------
    for side, thigh_rot, shin_rot, foot_y, foot_z in ((-1, 38, -30, 0.30, 0.06),
                                                      (1, -32, -55, -0.30, 0.22)):
        lx = side * 0.11
        cyl(f"{name}_Thigh{side}", 0.078, 0.44, (lx, foot_y * 0.42, 0.62), M_OUT, col,
            verts=8, rot=(math.radians(thigh_rot), 0, 0), parent=root)
        cyl(f"{name}_Shin{side}", 0.062, 0.42, (lx, foot_y * 0.78, 0.28), M_OUT, col,
            verts=8, rot=(math.radians(shin_rot), 0, 0), parent=root)
        box(f"{name}_Shoe{side}", (0.13, 0.29, 0.10), (lx, foot_y, foot_z),
            M_GEAR, col, parent=root)
        box(f"{name}_ShoeSole{side}", (0.135, 0.30, 0.03), (lx, foot_y, foot_z - 0.05),
            M_ACC, col, parent=root)

    # --- Elemento de silueta unico por DJ -----------------------------------
    sig = cfg["signature"]
    if sig == "violin":
        # Violin electrico en la mano adelantada: la silueta de LETAL.
        M_VIOLIN = mat(f"M_{name}_Violin", accent_lin, roughness=0.15,
                       emission=accent_lin, strength=9.0)
        box(f"{name}_ViolinBody", (0.11, 0.34, 0.05), (0.30, 0.14, 1.06),
            M_VIOLIN, col, rot=(0, 0, math.radians(-18)), parent=root)
        box(f"{name}_ViolinNeck", (0.035, 0.26, 0.035), (0.36, 0.42, 1.10),
            M_VIOLIN, col, rot=(0, 0, math.radians(-18)), parent=root)
        cyl(f"{name}_ViolinBow", 0.012, 0.62, (0.14, 0.16, 1.14), M_ACC, col,
            verts=6, rot=(math.radians(90), 0, math.radians(24)), parent=root)
        # Ojo turco (nazar) colgando del cuello — motivo de marca (IG).
        sphere(f"{name}_Nazar", 0.05, (0, 0.11, 1.30), M_SEC, col, parent=root,
               scale=(1.0, 0.35, 1.0))
    elif sig == "flame_foot":
        # Pisada derecha en llamas: la habilidad 1-2-3-4 Stomp hecha silueta.
        M_FLAME = mat(f"M_{name}_Flame", (1.0, 0.35, 0.02), roughness=0.1,
                      emission=(1.0, 0.30, 0.0), strength=14.0)
        for i, (r, z) in enumerate([(0.26, 0.03), (0.19, 0.16), (0.11, 0.30)]):
            cyl(f"{name}_Flame{i}", r, 0.06, (0.11, -0.30, z), M_FLAME, col,
                verts=10, parent=root)
        # Cadena de toro dorado al cuello.
        M_GOLD = mat(f"M_{name}_Gold", (0.75, 0.55, 0.08), roughness=0.15, metallic=1.0)
        cyl(f"{name}_Chain", 0.13, 0.02, (0, 0.10, 1.46), M_GOLD, col,
            verts=14, rot=(math.radians(78), 0, 0), parent=root)
        box(f"{name}_BullPendant", (0.09, 0.03, 0.09), (0, 0.13, 1.33), M_GOLD, col, parent=root)
    elif sig == "circuits":
        # Circuitos bioluminiscentes que laten al compas.
        for i, z in enumerate((1.42, 1.30, 1.18)):
            box(f"{name}_Circuit{i}", (sh_w * 0.92, 0.28, 0.022), (0, 0, z), M_ACC, col, parent=root)
        for s in (-1, 1):
            box(f"{name}_CircuitArm{s}", (0.03, 0.24, 0.03),
                (s * (sh_w / 2 + 0.07), 0.02, 1.34), M_ACC, col, parent=root)
        # Solapa tactica de la chaqueta.
        box(f"{name}_Collar", (sh_w * 0.8, 0.30, 0.09), (0, 0, 1.50), M_OUT, col, parent=root)
    elif sig == "visor":
        # Visor ciberpunk con display LED: lee el BPM en tiempo real.
        box(f"{name}_Visor", (0.235, 0.10, 0.075), (0, 0.09, 1.70), M_ACC, col, parent=root)
        box(f"{name}_VisorFrame", (0.25, 0.06, 0.10), (0, 0.07, 1.70), M_GEAR, col, parent=root)
        # Arneses del chaleco tactico.
        for s in (-1, 1):
            box(f"{name}_Harness{s}", (0.06, 0.28, 0.40), (s * 0.13, 0, 1.30),
                M_GEAR, col, parent=root)
        box(f"{name}_HarnessBuckle", (0.10, 0.29, 0.08), (0, 0, 1.16), M_ACC, col, parent=root)
        # Tatuaje de circuito cian en el antebrazo (concept art).
        box(f"{name}_CircuitArm", (0.05, 0.20, 0.05), (sh_w / 2 + 0.07, 0.0, 1.10),
            M_SEC, col, parent=root)
        # Emblema de fresa en el pecho — "Divino Fruto" (IG @fresar).
        if cfg.get("strawberry"):
            M_BERRY = mat(f"M_{name}_Berry", (0.7, 0.02, 0.08), roughness=0.3,
                          emission=(0.9, 0.05, 0.12), strength=3.0)
            M_LEAF = mat(f"M_{name}_Leaf", (0.05, 0.5, 0.1), roughness=0.4,
                         emission=(0.1, 0.9, 0.2), strength=2.0)
            sphere(f"{name}_Berry", 0.07, (0, 0.14, 1.40), M_BERRY, col, parent=root,
                   scale=(1.0, 0.6, 1.15))
            box(f"{name}_BerryLeaf", (0.10, 0.02, 0.05), (0, 0.15, 1.48), M_LEAF, col, parent=root)

    return col


def export(col, basename):
    bpy.ops.object.select_all(action="DESELECT")
    for ob in col.objects:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = next(iter(col.objects), None)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT_DIR, basename + ".glb"),
                              export_format="GLB", use_selection=True, export_apply=True)
    bpy.ops.export_scene.fbx(filepath=os.path.join(OUT_DIR, basename + ".fbx"),
                             use_selection=True, apply_unit_scale=True,
                             object_types={"MESH", "EMPTY"}, mesh_smooth_type="FACE")


def tri_count(col):
    return sum(sum(max(len(p.vertices) - 2, 0) for p in ob.data.polygons)
               for ob in col.objects if ob.type == "MESH")


bpy.ops.wm.read_factory_settings(use_empty=True)

entries = []
for cfg in DJS:
    col = build_dj(cfg)
    base = f"CHAR_{cfg['name']}"
    export(col, base)
    tris = tri_count(col)
    entries.append({
        "id": cfg["id"], "name": cfg["name"],
        "glb": f"track_kit/{base}.glb", "fbx": f"track_kit/{base}.fbx",
        "triangles": tris, "accentColor": cfg["accent"],
        "signature": cfg["signature"], "note": cfg["note"],
    })
    print(f"  {cfg['name']:8s} {tris:5d} tris  ({cfg['signature']})")

manifest = {
    "$comment": "Personajes DJ jugables. Generado por blender_map/build_dj_characters.py.",
    "version": "1.0.0",
    "generator": f"Blender {bpy.app.version_string} (bpy headless)",
    "convention": {
        "originAt": "pies",
        "heightMeters": HEIGHT,
        "facing": "+Y",
        "maxWidthMeters": 0.95,
        "pose": "zancada de carrera (sin esqueleto todavia)",
    },
    "characters": entries,
    "totalTriangles": sum(e["triangles"] for e in entries),
}
with open(os.path.join(OUT_DIR, "characters_manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT_DIR, "ZonaT_DJ_Characters.blend"))
print(f"\nTOTAL: {manifest['totalTriangles']} triangulos en {len(entries)} personajes")
