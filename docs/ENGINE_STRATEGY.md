# ZONA T RUNNER — Estrategia de motores: web-runner vs Unity

> El repo tiene dos implementaciones del juego avanzando en paralelo. Este
> documento fija qué papel cumple cada una para que dejen de competir.

## Decisión

**El web-runner (Three.js) es el escaparate. Unity es el producto.**

| | `web-runner/` (Three.js) | `ZonaTRunner/` (Unity 6 LTS) |
|---|---|---|
| **Rol** | Demo jugable, vertical slice comercial | Producto para tiendas |
| **Audiencia** | DJs, clubes, marcas, inversionistas, prensa | Jugadores finales |
| **Canal** | Link en el navegador, QR en el club, iPad en gaming station | Google Play, App Store, build de PC |
| **Se entrega** | Hoy, en cada reunión comercial | En el lanzamiento |
| **Optimiza para** | Impacto visual inmediato, cero fricción de instalación | Retención, monetización, rendimiento |
| **Estado** | ~2.300 líneas, jugable | ~730 líneas, andamiaje |

### Por qué así

El modelo de negocio del [whitepaper](WHITEPAPER_V1.md) es B2B antes que B2C: sin
clubes y DJs firmados, el juego no tiene contenido ni recompensas reales que
entregar. Lo que cierra esos acuerdos es enseñar algo jugable **en la reunión**,
sin pedirle a nadie que instale un APK. Eso es exactamente lo que el web-runner ya
hace y lo que Unity no hará durante meses.

Al mismo tiempo, el web-runner no puede ser el producto final: no hay ficha en las
tiendas, ni IAP nativo, ni notificaciones push, ni el rendimiento sostenido que
exige una sesión larga en un teléfono de gama media.

## Qué se comparte y qué no

**Se comparte (fuente única de verdad, sin duplicar):**

- **Roster de DJs** → `data/djs/roster.json`, validado contra `data/djs/dj_schema.json`.
  Ni `game.js` ni Unity definen DJs; ambos leen ese archivo.
- **Arte 3D** → `blender_map/`. Cada pieza se exporta a `.glb` (web) y `.fbx` (Unity)
  desde el mismo `.blend`, con la misma rejilla de carriles
  (ver [TRACK_KIT.md](TRACK_KIT.md)).
- **Balance de juego** → velocidades, curva de dificultad, valores de power-ups y
  duraciones viven en JSON, no en constantes de código.
- **Catálogo de venues y promociones** → `data/` y `docs/CATALOGO_CLUBES_BOGOTA_50.md`.

**No se comparte (cada motor lo resuelve a su manera):**

- Código de render, shaders y post-procesado.
- Sistema de input (Gamepad API vs New Input System).
- Audio: el web-runner sintetiza los stems en tiempo real con Web Audio API;
  Unity reproducirá stems grabados de los DJs reales.
- Persistencia: `localStorage` vs `PlayerPrefs` / cloud save.

## Regla operativa

> Cualquier cambio de **contenido** (un DJ, un club, una promo, un valor de balance)
> se hace en `data/`. Cualquier cambio de **motor** se hace en su propio árbol.
> Si un cambio de contenido obliga a tocar código en los dos motores, el dato
> estaba mal modelado.

## Riesgo asumido

Mantener dos implementaciones cuesta tiempo. Se acepta mientras el web-runner siga
generando acuerdos comerciales. **Criterio de corte:** cuando Unity alcance
paridad de gameplay con el web-runner, este se congela como demo y deja de recibir
features nuevas — solo actualizaciones de contenido desde `data/`.
