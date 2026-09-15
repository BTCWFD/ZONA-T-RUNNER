"""Lineup de los 4 DJs para revision visual."""
import math, os, sys
import bpy

KIT, OUT = sys.argv[-2], sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=os.path.join(KIT, "ZonaT_DJ_Characters.blend"))
scene = bpy.context.scene

# Separa los personajes en fila; nacen todos en el origen.
ORDER = ["CHAR_LETAL", "CHAR_NUNEZ", "CHAR_TATAN", "CHAR_FRESAR"]
for i, cname in enumerate(ORDER):
    col = bpy.data.collections.get(cname)
    if not col:
        continue
    dx = (i - 1.5) * 1.35
    for ob in col.objects:
        if ob.parent is None:
            ob.location.x += dx

# Suelo reflectante tipo asfalto mojado.
me = bpy.data.meshes.new("Floor")
me.from_pydata([(-20, -20, 0), (20, -20, 0), (20, 20, 0), (-20, 20, 0)], [], [(0, 1, 2, 3)])
floor = bpy.data.objects.new("Floor", me)
m = bpy.data.materials.new("M_Floor"); m.use_nodes = True
b = m.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0.01, 0.012, 0.018, 1)
b.inputs["Roughness"].default_value = 0.14
b.inputs["Metallic"].default_value = 0.6
me.materials.append(m)
scene.collection.objects.link(floor)

w = bpy.data.worlds.new("W"); scene.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.010, 0.012, 0.028, 1)
w.node_tree.nodes["Background"].inputs[1].default_value = 0.5

# Key fria + rim calido: separa las siluetas del fondo negro.
for nm, loc, rot, energy, color, size in [
    ("Key", (-4.5, -5.0, 4.2), (math.radians(62), 0, math.radians(-40)), 600, (0.6, 0.75, 1.0), 4.0),
    ("Rim", (5.0, 4.5, 3.6), (math.radians(105), 0, math.radians(150)), 900, (1.0, 0.25, 0.6), 4.0),
    ("Fill", (0, -6.0, 1.6), (math.radians(80), 0, 0), 180, (0.4, 0.9, 1.0), 5.0),
]:
    la = bpy.data.lights.new(nm, type="AREA"); la.energy = energy; la.color = color; la.size = size
    ob = bpy.data.objects.new(nm, la); ob.location = loc; ob.rotation_euler = rot
    scene.collection.objects.link(ob)

scene.render.engine = "CYCLES"; scene.cycles.device = "CPU"
scene.cycles.samples = 40; scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = 1280, 720
scene.view_settings.look = "AgX - Medium High Contrast"

cd = bpy.data.cameras.new("Cam"); cam = bpy.data.objects.new("Cam", cd)
scene.collection.objects.link(cam); scene.camera = cam
cd.lens = 55
cam.location = (0.6, -6.4, 1.35)
cam.rotation_euler = (math.radians(87), 0, math.radians(6))
scene.render.filepath = os.path.join(OUT, "DJs_Lineup_v2.png")
bpy.ops.render.render(write_still=True)
print("render:", scene.render.filepath)
