# ZONA T RUNNER — Tiers de calidad

> Este documento resuelve una contradicción que estaba abierta en el proyecto: el
> objetivo declarado es "un juego AAA", pero el GDD fija restricciones de móvil de
> gama media (APK < 60 MB, low-poly HD, Snapdragon 600). Las dos cosas no caben en
> un mismo presupuesto de assets.

## 1. Qué significa "AAA" aquí

Conviene decirlo sin rodeos: *AAA* en la industria describe un presupuesto y un
tamaño de equipo — cientos de personas, decenas de millones de dólares, años de
producción. Con un equipo de 1–2 desarrolladores eso no es alcanzable, y perseguir
esa definición literal es la forma más rápida de no terminar el juego.

Lo que sí es alcanzable, y es lo que el GDD ya describe bien en su sección de
dirección de arte, es **calidad de acabado percibida como premium**: que el juego
se sienta como un videoclip interactivo de música electrónica y no como un juego
móvil barato. Eso no se gana con polígonos, se gana con:

- **Coherencia cromática.** Negros profundos, asfalto mojado y un único color de
  acento por DJ. Un neón bien reflejado impresiona más que mil triángulos.
- **Game feel.** Respuesta del input por debajo de 100 ms, screen shake al ritmo,
  animaciones con anticipación y recuperación.
- **Sincronía audiovisual.** Que las luces, láseres y obstáculos pulsen con el
  bombo es el rasgo que ningún competidor del género tiene.
- **Pulido de UI.** Tipografía, transiciones y jerarquía visual consistentes.

**Regla del proyecto:** "AAA" se persigue como *estándar de acabado y dirección de
arte*, no como presupuesto de assets. La restricción de rendimiento manda siempre.

## 2. Los tres tiers

| | **Mobile Low** | **Mobile High** | **PC High** |
|---|---|---|---|
| Dispositivo de referencia | Snapdragon 6xx, 3 GB RAM | Snapdragon 8xx, iPhone 12+ | GTX 1050 / iGPU moderna |
| Resolución | 720p (escala 0.7) | Nativa hasta 1080p | 1080p – 1440p |
| FPS objetivo | 60 | 60 | 60–144 |
| Draw calls / frame | < 60 | < 120 | < 400 |
| Triángulos en pantalla | < 60 k | < 150 k | < 800 k |
| RAM en runtime | < 300 MB | < 500 MB | < 2 GB |
| Texturas hero | 1024² | 2048² | 2048² |
| Texturas de entorno | 512², atlas | 1024², atlas | 2048² |
| Sombras | Baked / blob | 1 cascada dinámica | 2–3 cascadas |
| Post-procesado | Solo tonemapping | Bloom + tonemapping | Bloom, SSAO, motion blur, reflejos SSR |
| Reflejos en asfalto | Textura falsa (matcap) | Planar reflection a 1/4 res | SSR |
| Partículas simultáneas | < 200 | < 600 | < 3000 |
| Lluvia | Plano con scroll de textura | Partículas GPU | Partículas GPU + salpicaduras |

## 3. Presupuestos de assets

| Asset | Mobile Low | Mobile High | PC High |
|---|---|---|---|
| DJ jugable (hero) | 12 k tris | 20 k tris | 45 k tris |
| Segmento de pista | 3 k tris | 6 k tris | 15 k tris |
| Obstáculo | 300 tris | 600 tris | 1.5 k tris |
| Prop de calle | 150 tris | 400 tris | 1 k tris |
| Fachada de club | 1 k tris | 2.5 k tris | 6 k tris |

> **Estado actual del kit modular:** las piezas de `blender_map/track_kit/` suman
> 2.448 triángulos entre las 10. Están muy por debajo incluso del tier bajo, es
> decir, son *blockout*: geometría correcta para validar la jugabilidad y el
> encaje, sin el detalle final. El siguiente paso de arte es subirlas al
> presupuesto de Mobile Low sin cambiar sus dimensiones ni sus puntos de anclaje.

## 4. Tamaño de build

| Plataforma | Objetivo | Estrategia |
|---|---|---|
| Android (base APK/AAB) | < 60 MB | Solo 2 DJs y 1 mundo empaquetados |
| Android (contenido adicional) | Bajo demanda | Addressables: cada DJ es un bundle descargable |
| iOS | < 100 MB | Mismo esquema; respeta el límite de descarga por datos móviles |
| PC | Sin límite práctico | Todo el contenido empaquetado, texturas del tier alto |

El límite de 60 MB del GDD se mantiene **solo para el APK base**. No limita el
juego completo: los DJs adicionales se descargan desde el primer arranque, que es
justamente para lo que la arquitectura content-driven ya está preparada.

## 5. Cómo se selecciona el tier

1. En el primer arranque se detecta el dispositivo (modelo GPU, RAM, `SystemInfo`).
2. Se asigna un tier por defecto desde una tabla remota (`ConfigSystem`), de modo
   que un dispositivo mal clasificado se corrige sin publicar una actualización.
3. El jugador puede subir o bajar el tier a mano en Opciones.
4. **Degradación automática:** si el FPS medio cae por debajo de 50 durante más de
   10 segundos, se baja un escalón y se registra un evento de analytics. Nunca
   sube solo — un cambio de calidad a mitad de partida es peor que un tier bajo.

## 6. Lo que NO se degrada nunca

Estos elementos se mantienen idénticos en los tres tiers, porque son la identidad
del juego y no el adorno:

- La sincronía de luces y obstáculos con el BPM.
- El color de acento del DJ y su presencia en pantalla.
- La respuesta y los tiempos del input.
- Las capas de audio (stems). El audio no se degrada: es gameplay, no decorado.
