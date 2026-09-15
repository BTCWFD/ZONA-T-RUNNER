"""
Render de marketing (offline, Cycles) — los 4 DJs sobre la calle mojada de Zona T.
Key art para pitch/stores/redes. NO es el look en tiempo real del juego.
"""
import math, os, sys
import bpy

CHARS = sys.argv[-2]
OUT = sys.argv[-1]

bpy.ops.wm.open_mainfile(filepath=os.path.join(CHARS, "ZonaT_DJ_Characters.blend"))
scene = bpy.context.scene

ORDER = ["CHAR_LETAL", "CHAR_NUNEZ", "CHAR_TATAN", "CHAR_FRESAR"]
for i, cname in enumerate(ORDER):
    col = bpy.data.collections.get(cname)
    if not col:
        continue
    dx = (i - 1.5) * 1.55
    dz = math.radians(-14 * (i - 1.5))  # leve giro hacia cámara
    for ob in col.objects:
        if ob.parent is None:
            ob.location.x += dx
            ob.rotation_euler.z += dz

# --- Suelo: asfalto mojado muy reflectante -----------------------------------
me = bpy.data.meshes.new("Floor")
me.from_pydata([(-40, -40, 0), (40, -40, 0), (40, 40, 0), (-40, 40, 0)], [], [(0, 1, 2, 3)])
floor = bpy.data.objects.new("Floor", me)
m = bpy.data.materials.new("M_WetFloor"); m.use_nodes = True
b = m.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0.006, 0.008, 0.014, 1)
b.inputs["Roughness"].default_value = 0.08
b.inputs["Metallic"].default_value = 0.7
me.materials.append(m)
scene.collection.objects.link(floor)

# Franjas de neón reflejadas en el piso (emisores planos bajo cámara).
def neon_strip(name, loc, size, color, strength):
    mm = bpy.data.meshes.new(name)
    x, y = size
    mm.from_pydata([(-x, -y, 0), (x, -y, 0), (x, y, 0), (-x, y, 0)], [], [(0, 1, 2, 3)])
    ob = bpy.data.objects.new(name, mm)
    ob.location = loc
    mat = bpy.data.materials.new("M_" + name); mat.use_nodes = True
    nt = mat.node_tree; nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs[0].default_value = (*color, 1)
    em.inputs[1].default_value = strength
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(em.outputs[0], out.inputs[0])
    mm.materials.append(mat)
    scene.collection.objects.link(ob)

# --- Fondo: siluetas de edificios con ventanas de neón ------------------------
def building(name, loc, size, color):
    import bmesh
    mm = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(mm); bm.free()
    ob = bpy.data.objects.new(name, mm); ob.scale = size; ob.location = loc
    mat = bpy.data.materials.new("M_" + name); mat.use_nodes = True
    bb = mat.node_tree.nodes["Principled BSDF"]
    bb.inputs["Base Color"].default_value = (0.02, 0.02, 0.03, 1)
    bb.inputs["Roughness"].default_value = 0.6
    mm.materials.append(mat)
    scene.collection.objects.link(ob)
    # Letrero de neón en la fachada.
    neon_strip(name + "_sign", (loc[0], loc[1] - size[1] / 2 - 0.1, loc[2] + size[2] * 0.2),
               (size[0] * 0.35, 0.05), color, 12.0)

import random
random.seed(7)
NEON = [(0.0, 1.0, 1.0), (1.0, 0.0, 0.5), (0.6, 0.1, 1.0), (1.0, 0.45, 0.0), (0.0, 1.0, 0.5)]
for side in (-1, 1):
    for i in range(4):
        h = random.uniform(9, 18)
        building(f"Bldg_{side}_{i}", (side * random.uniform(7, 12), 8 + i * 9, h / 2),
                  (random.uniform(3, 5), 5, h), random.choice(NEON))

# Charco de reflejo de neón frente a los personajes.
neon_strip("PuddleGlowMagenta", (-3.0, -3.0, 0.02), (2.2, 3.5), (1.0, 0.0, 0.5), 2.5)
neon_strip("PuddleGlowCyan", (3.0, -2.0, 0.02), (2.2, 3.5), (0.0, 0.9, 1.0), 2.5)

# --- Mundo: niebla nocturna azul ---------------------------------------------
w = bpy.data.worlds.new("Night"); scene.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.008, 0.011, 0.026, 1)
w.node_tree.nodes["Background"].inputs[1].default_value = 0.25

# --- Luces: retroiluminación de neón + key suave -----------------------------
for nm, loc, rot, energy, color, size in [
    ("KeyCool", (-5, -7, 5), (math.radians(58), 0, math.radians(-34)), 500, (0.55, 0.7, 1.0), 5.0),
    ("RimMagenta", (6, 6, 4), (math.radians(108), 0, math.radians(148)), 1400, (1.0, 0.1, 0.55), 5.0),
    ("RimCyan", (-6, 7, 4), (math.radians(108), 0, math.radians(-148)), 1200, (0.0, 0.85, 1.0), 5.0),
    ("FillWarm", (0, -7, 2), (math.radians(80), 0, 0), 220, (1.0, 0.6, 0.35), 6.0),
]:
    la = bpy.data.lights.new(nm, type="AREA"); la.energy = energy; la.color = color; la.size = size
    ob = bpy.data.objects.new(nm, la); ob.location = loc; ob.rotation_euler = rot
    scene.collection.objects.link(ob)

# Lluvia: puntos verticales tenues como partículas estáticas (halo).
import bmesh
rain = bpy.data.meshes.new("Rain"); bm = bmesh.new()
random.seed(3)
for _ in range(1400):
    x = random.uniform(-9, 9); y = random.uniform(-4, 16); z = random.uniform(0.2, 9)
    v0 = bm.verts.new((x, y, z)); v1 = bm.verts.new((x, y, z - 0.28))
    bm.edges.new((v0, v1))
bm.to_mesh(rain); bm.free()
robj = bpy.data.objects.new("Rain", rain)
rmat = bpy.data.materials.new("M_Rain"); rmat.use_nodes = True
rnt = rmat.node_tree; rnt.nodes.clear()
rem = rnt.nodes.new("ShaderNodeEmission")
rem.inputs[0].default_value = (0.6, 0.75, 1.0, 1); rem.inputs[1].default_value = 1.5
rout = rnt.nodes.new("ShaderNodeOutputMaterial")
rnt.links.new(rem.outputs[0], rout.inputs[0])
rain.materials.append(rmat)
scene.collection.objects.link(robj)

# --- Cámara y render ----------------------------------------------------------
scene.render.engine = "CYCLES"; scene.cycles.device = "CPU"
scene.cycles.samples = 96; scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = 1600, 900
scene.view_settings.look = "AgX - High Contrast"
# Bloom del neón vía glare en el compositor (API tolerante entre versiones).
try:
    scene.use_nodes = True
    cnt = scene.node_tree
    if cnt is not None:
        for n in list(cnt.nodes):
            cnt.nodes.remove(n)
        rl = cnt.nodes.new("CompositorNodeRLayers")
        glare = cnt.nodes.new("CompositorNodeGlare")
        glare.glare_type = "FOG_GLOW"; glare.quality = "HIGH"; glare.threshold = 0.7
        comp = cnt.nodes.new("CompositorNodeComposite")
        cnt.links.new(rl.outputs[0], glare.inputs[0])
        cnt.links.new(glare.outputs[0], comp.inputs[0])
except Exception as e:
    print("compositor omitido:", e)

cd = bpy.data.cameras.new("Cam"); cam = bpy.data.objects.new("Cam", cd)
scene.collection.objects.link(cam); scene.camera = cam
cd.lens = 40
cam.location = (0.0, -7.6, 1.5)
cam.rotation_euler = (math.radians(86), 0, 0)
scene.render.filepath = os.path.join(OUT, "KEYART_DJs_ZonaT.png")
bpy.ops.render.render(write_still=True)
print("render:", scene.render.filepath)
