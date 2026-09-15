# ZONA T RUNNER — Test Log

Registro de verificación del Sprint 0, ítem 1 (verificación cero-hipótesis).

## 2026-09-10 — Verificación remota parcial (Claude, sandbox cloud)

**Método:** El canal de shell remoto sobre el PC del usuario (device_bash) falló por
un problema de montaje (virtiofs) en esta sesión — no se pudo ejecutar `node server.js`
ni abrir Unity directamente en la máquina real. Como sustituto parcial, se copiaron
`server.js`, `web-runner/index.html`, `web-runner/game.js`, `web-runner/three.min.js`,
`data/djs/roster.json` y `data/djs/dj_schema.json` a un sandbox cloud, se corrió
`node server.js` ahí y se cargó la página con Chromium headless (Playwright).

**No sustituye** la prueba real pedida por el plan (Chrome desktop del usuario, Safari
iOS, Chrome Android, táctil/teclado/mando) ni la compilación de Unity ni el clon limpio
con git-lfs — esas siguen pendientes.

**Resultado — hipótesis "la build está rota tras el refactor a roster.json": REFUTADA.**
- `node --check` pasa limpio en `server.js` y `web-runner/game.js`.
- `data/djs/roster.json` es JSON válido, 11 DJs.
- La página carga (`<title>ZONA T RUNNER — Bogotá Electronic Runner</title>`), el fetch
  a `/data/djs/roster.json` resuelve con 200 y el log `[ZonaT] Roster cargado desde
  /data/djs/roster.json (11 DJs)` aparece en consola; `DJS.length === 11` en runtime.
- Cero excepciones JS no capturadas, cero requests de red fallidos a nivel de conexión.
- Los únicos 404 registrados (logo, avatares, vallas) son artefactos del entorno de
  prueba (esos assets no se copiaron al sandbox) — no reflejan el repo real, donde esos
  archivos sí existen.

**Hallazgo nuevo — gap contra la mitigación de riesgo del propio plan:**
El plan de 90 días declara como mitigación "Roster embebido como fallback duro en
game.js y modo demo 100% offline con service worker". `game.js` sí tiene el código para
CONSUMIR un roster embebido (`window.__ZONAT_ROSTER__`), pero nada en `index.html` lo
DEFINE, y no hay service worker en `web-runner/`. Hoy, si el juego se muestra sin red
(el escenario exacto de un club), el fetch a `/data/djs/roster.json` falla y no hay
fallback — contradice la mitigación escrita para el riesgo de CREDIBILIDAD OPERATIVA.

**Pendiente (no se pudo verificar desde aquí):**
- Chrome desktop / Safari iOS / Chrome Android reales, con input táctil/teclado/mando.
- Unity: compilación hasta cero errores.
- Clon limpio en carpeta nueva + verificación de que git-lfs baja los `.glb`/`.fbx`.
- Commit y push de todo a remoto.

## 2026-09-10 — Fix del gap de roster embebido / offline (Claude)

Se cerró el hallazgo de arriba con tres piezas, probadas en el sandbox cloud (Chromium
headless vía Playwright) antes de subirlas al repo real:

- **`web-runner/sw.js`** (nuevo) — service worker que cachea el app shell (html, js,
  three.min.js, avatares, vallas, logo) `cache-first`, y `/data/djs/roster.json`
  `network-first` con fallback a cache. Cubre el caso "hubo servidor al menos una vez y
  la red se cae a mitad de set". Registrado desde `web-runner/index.html`.
  Probado: con `server.js` corriendo, `navigator.serviceWorker.getRegistrations()`
  devuelve `activated` tras la primera carga.
- **`tools/build_offline_demo.js`** (nuevo) — genera `web-runner/offline/` (gitignored,
  artefacto derivado): copia `game.js`, `three.min.js` y los assets referenciados, e
  inyecta `window.__ZONAT_ROSTER__` con el contenido actual de `data/djs/roster.json`
  justo antes de `<script src="game.js">`. Cubre el caso "sin servidor y sin red en
  absoluto". `game.js` ya sabía consumir `__ZONAT_ROSTER__`; lo que faltaba era quién lo
  definiera — ahora es este script, regenerable, sin tocar el `index.html` de desarrollo
  (que sigue haciendo fetch en caliente a `data/`, fuente única de verdad).
  Probado: cargando `web-runner/offline/index.html` sin servidor, aparece
  `[ZonaT] Roster embebido (11 DJs)` en consola y `DJS.length === 11`, sin excepciones.
- **`tools/serve_offline.js`** (nuevo) — hallazgo durante la prueba: Chrome bloquea por
  CORS la carga de texturas WebGL cuando `web-runner/offline/index.html` se abre como
  `file://` directo (las vallas/billboards no cargan), aunque el archivo exista — es una
  restricción real de Chromium, no un bug de los assets. Este server minimo (sin
  dependencias, sin red) sirve `web-runner/offline/` por `http://127.0.0.1:8090/`, que sí
  es un origen válido para WebGL. Probado: mismo resultado (`Roster embebido`, 11 DJs,
  cero errores) y sin el error CORS de las vallas.

**Uso para la demo real en club sin red:** `node tools/build_offline_demo.js` (regenerar
cada vez que cambie `roster.json`) y luego `node tools/serve_offline.js`, abrir
`http://127.0.0.1:8090/` en el navegador del mismo equipo. Cero dependencia de wifi,
router o `data/`.

**Sigue pendiente:** confirmar el flujo completo en un dispositivo real (Android/iOS) y
en condiciones de red real cortada a mitad de sesión, no solo en el sandbox.
