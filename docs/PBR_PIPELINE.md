# ZONA T RUNNER — Pipeline de arte in-game premium (PBR, tiempo real)

Cómo el juego se ve de alta gama corriendo a 60 FPS en móvil y PC, sin foto-realismo
de estudio. Esta es la pista *in-game* (real-time); los renders foto-realistas de
marketing son otra cosa y viven en `ART_DIRECTION_DJS.md` + `blender_map/`.

## La idea en una frase
El look premium de este juego NO viene de polígonos ni de foto-realismo: viene de
**asfalto mojado que refleja neón + emisión bien controlada + bloom + un color de
acento por DJ**. Eso corre en un Snapdragon 600.

## 1. Materiales
`ZonaTMaterialLibrary.cs` (menú *ZonaT/Arte/Construir materiales URP premium*)
crea toda la biblioteca con un solo shader **URP/Lit** por material:

- **Asfalto mojado** — metallic 0.55, smoothness 0.9. El reflejo es lo que vende
  la escena; sin él, todo se ve plano y barato.
- **Ladrillo / concreto / anden** — mate, sin brillo, para contrastar con el neón.
- **Metal oscuro / vidrio** — para estructuras y fachadas de club.
- **Neón** (cian, magenta, violeta, ámbar, verde) — base oscura + `_EmissionColor`
  en lineal × intensidad. NO son luces: son caras emisivas. El brillo lo pone el
  Bloom, no un cálculo de iluminación por píxel.

Los nombres de material coinciden con los del kit de Blender
(`blender_map/track_kit/`), así que el mapeo al importar los `.fbx` es 1:1.

## 2. Post-procesado (donde nace el "premium")
En URP el post-procesado va en un **Volume global**. Configuración objetivo:

| Efecto | Mobile Low | Mobile High | PC High |
|---|---|---|---|
| **Bloom** | ✅ threshold 0.9, intensity 0.8 | ✅ intensity 1.1 | ✅ intensity 1.3 |
| **Tonemapping** | ACES | ACES | ACES |
| **Color Adjustments** | ✅ (contraste +10) | ✅ | ✅ |
| Vignette | ❌ | ✅ suave | ✅ |
| Depth of Field | ❌ | ❌ | ✅ (solo menú/foto) |
| Motion Blur | ❌ | ❌ | ✅ leve |

Bloom + tonemapping ACES son obligatorios en los tres tiers: son el 80% del look
por el 5% del costo.

## 3. Reflejos del asfalto por tier
- **Mobile Low:** un `Reflection Probe` horneado por segmento (o una cubemap
  falsa). Cero costo en runtime.
- **Mobile High:** Screen Space Reflections desactivado; probe + smoothness alto.
- **PC High:** SSR activado en el Renderer Feature de URP.

El asfalto nunca deja de reflejar: cambia *cómo* se calcula el reflejo, no si existe.

## 4. Iluminación
- **1 luz direccional** (la "luna"/cielo) en los tres tiers, sombra suave.
- El resto de la luz es **emisión de neón + probes**, no luces reales.
  Regla dura: **cero luces dinámicas puntuales durante el gameplay** (mata el
  rendimiento móvil). Un club que "ilumina" la calle es una cara emisiva grande.
- Láseres y luces de club que pulsan al BPM = geometría emisiva animada por shader,
  no `Light` components.

## 5. Iluminación reactiva al BPM
El acento del DJ y la intensidad de la emisión se modulan con el beat:
- `BeatSynchronizer` (ya existe) expone el pulso por `AudioSettings.dspTime`.
- Un `MaterialPropertyBlock` sube/baja `_EmissionColor` en las caras de neón al
  ritmo del bombo. Un solo `MaterialPropertyBlock` compartido → sin nuevas draw
  calls, sin instanciar materiales.

## 6. Presupuesto (recordatorio, ver QUALITY_TIERS.md)
- Draw calls: <60 / <120 / <400.
- El neón emisivo NO cuenta como luz: es batching estático.
- Object pooling ya garantiza 0 GC allocation por frame (ver TrackSpawner.cs).

## Checklist de integración
- [ ] Ejecutar *ZonaT/Arte/Construir materiales URP premium*.
- [ ] Asignar los materiales a los prefabs importados de `track_kit/`.
- [ ] Crear el Volume global con Bloom + Tonemapping ACES.
- [ ] Un Reflection Probe por tipo de segmento (horneado).
- [ ] Conectar `BeatSynchronizer` → emisión del neón vía MaterialPropertyBlock.
- [ ] Perfilar en un Android gama media real y ajustar el tier por defecto.
