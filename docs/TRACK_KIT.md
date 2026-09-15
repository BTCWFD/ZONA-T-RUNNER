# ZONA T RUNNER — Kit modular de pista

Generado por `blender_map/build_track_kit.py` (Blender 5.0 headless, vía `bpy`).
Salida en `blender_map/track_kit/`: un `.glb` y un `.fbx` por pieza, más
`track_kit_manifest.json` y el `.blend` fuente.

## Por qué un kit y no un mapa

El mapa que existía (`ZonaT_Bogota_Map.blend`) es una calle única de 80 m: sirve
para renders de concepto, pero un endless runner no puede correr sobre un modelo
fijo. Necesita piezas que se instancien y reciclen infinitamente. Este kit es esa
pieza que faltaba entre el arte y el `TrackSpawner`.

## Convención de anclaje

Es la parte crítica: si se rompe, los segmentos dejan de encajar.

- El origen de cada segmento está en `(0, 0, 0)`.
- El segmento crece hacia **+Y** y termina exactamente en `Y = 40`.
- Para encadenar: `siguiente.y = anterior.y + 40`.
- Los tres carriles están en `X = -2.4`, `0`, `+2.4`.
- El suelo jugable está en `Z = 0`. Los andenes están 0,24 m por encima.
- Obstáculos y props tienen su origen **en la base**, así que se posicionan
  directamente sobre el carril sin compensar altura.
- Los tokens se instancian a `Z = 1.1` (altura de pecho del personaje).

Estos valores no están escritos a mano en ningún motor: viven en
`track_kit_manifest.json`, bajo la clave `grid`. Unity y el web-runner los leen
de ahí.

## Piezas

### Segmentos (intercambiables entre sí)

| Pieza | Tris | Para qué sirve |
|---|---|---|
| `SEG_Street` | 636 | Avenida base: calzada mojada, andenes, bolardos, alumbrado. Relleno neutro y respiro entre momentos intensos. |
| `SEG_ClubBlock` | 668 | Manzana de clubes: fachadas de ladrillo bogotano, vitrinas, marquesinas y letreros de neón vertical. |
| `SEG_Gantry` | 296 | Pórtico con mega-valla LED cruzando la avenida. Es el inventario publicitario premium del whitepaper. |
| `SEG_Construction` | 392 | Obra en vía: andamio que obliga a deslizarse, vallas naranja, escombros. |

### Obstáculos

| Pieza | Tris | Interacción |
|---|---|---|
| `OBS_JumpBarrier` | 24 | **Saltar.** Barrera baja de concreto, ocupa 1 carril. |
| `OBS_SlideScaffold` | 104 | **Deslizar.** Paso libre a 2,3 m, ocupa 1 carril. |
| `OBS_SpeakerStack` | 180 | **Cambiar de carril.** Torre de bafles, bloquea el carril completo. |

Cubren exactamente los tres tipos de interacción que define el GDD: *low*, *high*
y *lane-blocking*.

### Props y coleccionables

| Pieza | Tris | Notas |
|---|---|---|
| `PROP_Streetlight` | 52 | Poste con luminaria ámbar. |
| `PROP_Billboard` | 36 | Valla LED lateral. El panel es un material aparte: se le cambia la textura en runtime para rotar anunciantes. |
| `COL_Token` | 60 | Token Zona T. Se instancia en fila sobre un carril. |

**Total: 2.448 triángulos, ~700 KB.**

## Estado: esto es blockout, no arte final

Los conteos están muy por debajo del tier más bajo definido en
[QUALITY_TIERS.md](QUALITY_TIERS.md) (3 k tris por segmento). Es deliberado: el
kit resuelve primero la **geometría jugable** — anchos de carril, alturas de paso,
distancias de reacción, encaje entre piezas — que es lo que hay que validar antes
de invertir en detalle.

El siguiente paso de arte sube el detalle **sin tocar dimensiones ni orígenes**:
bordes biselados, ladrillo con normal map real de Street View, sucio en el asfalto,
carteles con las marcas de los clubes aliados.

## Cómo regenerarlo

```bash
python3 blender_map/build_track_kit.py blender_map/track_kit
```

Requiere `pip install bpy` (Blender como módulo de Python, sin interfaz).
El script es determinista: la misma entrada produce los mismos archivos.

## Pendiente

- [ ] Variantes de cada segmento (A/B/C) para que la repetición no se note.
- [ ] Segmento de cruce / intersección con Transmilenio al fondo.
- [ ] Colliders explícitos como objetos separados, en vez de derivarlos de la malla visual.
- [ ] Piezas de transición para curvas suaves (hoy la pista es recta).
- [ ] LODs por tier de calidad.
