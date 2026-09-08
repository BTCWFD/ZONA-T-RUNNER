import re

html_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\web-runner\showcase.html"
with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('src="assets/blender_map_render.png"', 'src="assets/ZonaT_Real_Street_View_Render.png"')

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Showcase updated with real GIS Street View render.")
