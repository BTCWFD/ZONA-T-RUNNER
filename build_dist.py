#!/usr/bin/env python3
"""
ZONA T RUNNER — build de distribución

Genera desde las fuentes del repo dos entregables que NO dependen de internet
ni de un servidor (una demo en un club no se puede caer por falta de señal):

  builds/dist/                  carpeta para servir (node server.js o cualquier host)
  builds/ZONAT-RUNNER-vX.Y.html archivo ÚNICO, se abre con doble clic y se pasa al teléfono

Ambos incrustan el roster de data/djs/roster.json y Three.js. El archivo único
además lleva las imágenes como data: URI, por eso funciona con file:// donde el
navegador bloquea texturas locales en WebGL.

Uso:
    python3 build_dist.py            # desde la raíz del repo o desde web-runner/
Requiere Pillow solo si quieres re-optimizar imágenes (--optimize).
"""
import argparse
import base64
import json
import mimetypes
import os
import shutil
import sys

VERSION = "0.1.0"

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = HERE if os.path.isdir(os.path.join(HERE, "web-runner")) else os.path.dirname(HERE)
WEB = os.path.join(ROOT, "web-runner")
ROSTER = os.path.join(ROOT, "data", "djs", "roster.json")
BUILDS = os.path.join(ROOT, "builds")
DIST = os.path.join(BUILDS, "dist")
SINGLE = os.path.join(BUILDS, f"ZONAT-RUNNER-v{VERSION}.html")

# Solo lo que el juego realmente carga. Los .glb no se usan (no hay GLTFLoader).
ASSETS = [
    "assets/billboards/valla_andino.jpg",
    "assets/billboards/valla_andresdc.jpg",
    "assets/billboards/valla_baum.jpg",
    "assets/billboards/valla_octava.jpg",
    "assets/billboards/valla_redbull.jpg",
    "assets/billboards/valla_zonat_pass.jpg",
    "assets/avatars/dj_fresar.jpg",
    "assets/avatars/dj_letal.jpg",
    "assets/avatars/dj_nunez.jpg",
    "assets/avatars/dj_tatan.jpg",
    "molecular_avatar.jpg",
    "tatan_avatar.jpg",
    "zara_avatar.jpg",
    "nunez_avatar.jpg",
    "logo.jpg",
    "logo_transparent.png",
]

# Los avatares se muestran en tarjetas de ~150px y pesaban ~1MB cada uno.
OPTIMIZE = {"assets/avatars/": (320, 82), "assets/billboards/": (512, 80),
            "logo": (512, 82), "_avatar": (320, 82)}


def read(path, mode="r"):
    kw = {} if "b" in mode else {"encoding": "utf-8"}
    with open(path, mode, **kw) as f:
        return f.read()


def optimize_images(outdir):
    """Reduce las imágenes a la resolución en la que realmente se ven."""
    try:
        from PIL import Image
    except ImportError:
        print("  (Pillow no instalado — se usan las imágenes originales)")
        return {}
    made = {}
    for rel in ASSETS:
        src = os.path.join(WEB, rel)
        if not os.path.exists(src):
            continue
        rule = next((v for k, v in OPTIMIZE.items() if k in rel), None)
        if not rule:
            continue
        maxw, q = rule
        dst = os.path.join(outdir, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im = Image.open(src)
        if im.width > maxw:
            im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
        if rel.lower().endswith(".png"):
            im.save(dst, "PNG", optimize=True)
        else:
            im.convert("RGB").save(dst, "JPEG", quality=q, optimize=True, progressive=True)
        made[rel] = dst
    return made


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--optimize", action="store_true", default=True,
                    help="reduce las imágenes (por defecto sí)")
    ap.add_argument("--no-optimize", dest="optimize", action="store_false")
    args = ap.parse_args()

    for p in (WEB, ROSTER):
        if not os.path.exists(p):
            sys.exit(f"No se encontró {p} — corre el script desde el repo.")

    shutil.rmtree(DIST, ignore_errors=True)
    os.makedirs(DIST, exist_ok=True)
    tmp_opt = os.path.join(BUILDS, ".opt")
    shutil.rmtree(tmp_opt, ignore_errors=True)
    os.makedirs(tmp_opt, exist_ok=True)

    optimized = optimize_images(tmp_opt) if args.optimize else {}

    def asset_path(rel):
        return optimized.get(rel, os.path.join(WEB, rel))

    roster = json.loads(read(ROSTER))
    n = len(roster["djs"])
    compact = json.dumps(roster, ensure_ascii=False, separators=(",", ":"))

    # ---- carpeta dist/ ----
    open(os.path.join(DIST, "roster.data.js"), "w", encoding="utf-8").write(
        "/* Generado por build_dist.py desde data/djs/roster.json — NO editar. */\n"
        f"window.__ZONAT_ROSTER__ = {compact};\n")
    for f in ("three.min.js", "game.js"):
        shutil.copy(os.path.join(WEB, f), os.path.join(DIST, f))
    for rel in ASSETS:
        src = asset_path(rel)
        if not os.path.exists(src):
            continue
        dst = os.path.join(DIST, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy(src, dst)

    html = read(os.path.join(WEB, "index.html"))
    assert '<script src="game.js"></script>' in html, "index.html cambió de forma"
    open(os.path.join(DIST, "index.html"), "w", encoding="utf-8").write(
        html.replace('<script src="game.js"></script>',
                     '<script src="roster.data.js"></script>\n    <script src="game.js"></script>'))

    # ---- archivo único ----
    def data_uri(path):
        mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
        return f"data:{mime};base64," + base64.b64encode(read(path, "rb")).decode("ascii")

    uris = {rel: data_uri(asset_path(rel)) for rel in ASSETS
            if os.path.exists(asset_path(rel))}

    game_js, roster_single = read(os.path.join(WEB, "game.js")), compact
    for rel, uri in uris.items():
        game_js = game_js.replace(f'"{rel}"', f'"{uri}"')
        roster_single = roster_single.replace(f'"{rel}"', f'"{uri}"')

    single = html.replace('<script src="three.min.js"></script>',
                          "<script>" + read(os.path.join(WEB, "three.min.js")) + "</script>")
    single = single.replace('<script src="game.js"></script>',
                            f"<script>window.__ZONAT_ROSTER__={roster_single};</script>\n"
                            "<script>" + game_js + "</script>")
    for rel, uri in uris.items():                     # refs sueltas en HTML y CSS
        single = single.replace(f'"{rel}"', f'"{uri}"').replace(f"'{rel}'", f"'{uri}'")

    os.makedirs(BUILDS, exist_ok=True)
    open(SINGLE, "w", encoding="utf-8").write(single)
    shutil.rmtree(tmp_opt, ignore_errors=True)

    dist_mb = sum(os.path.getsize(os.path.join(dp, f))
                  for dp, _, fs in os.walk(DIST) for f in fs) / 1024 / 1024
    print(f"v{VERSION} — {n} DJs embebidos")
    print(f"  builds/dist/                      {dist_mb:.2f} MB")
    print(f"  {os.path.basename(SINGLE):33s} {os.path.getsize(SINGLE)/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
