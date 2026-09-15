"""Encadena los segmentos del kit y renderiza previews nocturnas para revision visual."""
import math
import os
import sys

import bpy

KIT = sys.argv[-2]
OUT = sys.argv[-1]
SEG_LEN = 40.0

bpy.ops.wm.open_mainfile(filepath=os.path.join(KIT, "ZonaT_TrackKit.blend"))

SEGMENTS = ["SEG_Street", "SEG_ClubBlock", "SEG_Gantry", "SEG_Construction", "SEG_Street"]
OBSTACLES = ["OBS_JumpBarrier", "OBS_SlideScaffold", "OBS_SpeakerStack"]
LANES = (-2.4, 0.0, 2.4)

scene = bpy.context.scene

# Oculta los prefabs originales; se instancian copias colocadas en la pista.
for col in bpy.data.collections:
    for ob in col.objects:
        ob.hide_render = True

placed = bpy.data.collections.new("Preview_Track")
scene.collection.children.link(placed)


def clone(col_name, offset):
    src = bpy.data.collections.get(col_name)
    if not src:
        return
    for ob in src.objects:
        cp = ob.copy()
        cp.data = ob.data
        cp.hide_render = False
        cp.location = (ob.location.x + offset[0],
                       ob.location.y + offset[1],
                       ob.location.z + offset[2])
        placed.objects.link(cp)


# Cadena de segmentos: demuestra que los extremos encajan sin costura.
for i, name in enumerate(SEGMENTS):
    clone(name, (0.0, i * SEG_LEN, 0.0))

# Obstaculos repartidos por carril para leer la jugabilidad.
layout = [
    ("OBS_JumpBarrier", LANES[0], 22.0), ("OBS_JumpBarrier", LANES[2], 30.0),
    ("OBS_SlideScaffold", LANES[1], 52.0), ("OBS_SpeakerStack", LANES[2], 68.0),
    ("OBS_JumpBarrier", LANES[1], 96.0), ("OBS_SlideScaffold", LANES[0], 128.0),
    ("OBS_SpeakerStack", LANES[1], 146.0), ("OBS_JumpBarrier", LANES[2], 172.0),
]
for name, x, y in layout:
    clone(name, (x, y, 0.0))

# Fila de tokens sobre el carril central.
for i in range(14):
    clone("COL_Token", (LANES[1], 38.0 + i * 2.0, 1.1))

# --- Iluminacion nocturna ---------------------------------------------------
world = bpy.data.worlds.new("NightWorld")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.008, 0.010, 0.022, 1.0)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.35

key = bpy.data.lights.new("KeyMoon", type="SUN")
key.energy = 0.6
key.color = (0.45, 0.55, 1.0)
key_ob = bpy.data.objects.new("KeyMoon", key)
key_ob.rotation_euler = (math.radians(52), 0, math.radians(35))
scene.collection.objects.link(key_ob)

for i, (lx, ly, col) in enumerate([(-9, 60, (0.0, 1.0, 0.95)),
                                   (9, 100, (1.0, 0.1, 0.6)),
                                   (-9, 145, (1.0, 0.5, 0.05))]):
    la = bpy.data.lights.new(f"Neon{i}", type="AREA")
    la.energy = 900
    la.size = 7.0
    la.color = col
    ob = bpy.data.objects.new(f"Neon{i}", la)
    ob.location = (lx, ly, 6.5)
    ob.rotation_euler = (math.radians(65), 0, math.radians(90 if lx < 0 else -90))
    scene.collection.objects.link(ob)

# --- Render ------------------------------------------------------------------
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.film_transparent = False
scene.view_settings.look = "AgX - Medium High Contrast"

cam_data = bpy.data.cameras.new("PreviewCam")
cam = bpy.data.objects.new("PreviewCam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

VIEWS = [
    # (nombre, posicion, rotacion, lente) — la primera imita la camara de juego.
    ("TrackKit_GameCam", (0.0, -8.0, 4.6), (math.radians(80), 0, 0), 32),
    ("TrackKit_Aerial", (26.0, 40.0, 52.0), (math.radians(52), 0, math.radians(58)), 35),
]
for name, loc, rot, lens in VIEWS:
    cam.location = loc
    cam.rotation_euler = rot
    cam_data.lens = lens
    scene.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
    print("render:", scene.render.filepath)
