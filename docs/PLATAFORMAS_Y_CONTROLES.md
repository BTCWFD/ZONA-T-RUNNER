# ZONA T RUNNER — Plataformas y Controles

> Decisión de alcance. Hasta ahora toda la documentación asumía solo móvil; este
> documento incorpora PC como plataforma de primera clase y fija el esquema de
> control por dispositivo.

## 1. Matriz de plataformas

| Plataforma | Build | Entrada primaria | Prioridad | Estado |
|---|---|---|---|---|
| **Web (desktop + móvil)** | Three.js / WebGL2 | Teclado, mando, swipe | P0 — canal de entrada y demo comercial | Funcional |
| **Android** | Unity 6 LTS · IL2CPP · ARM64 | Swipe táctil | P0 — mercado principal | En desarrollo |
| **iOS** | Unity 6 LTS · IL2CPP | Swipe táctil | P1 — tras validar Android | Pendiente |
| **PC (Windows)** | Unity 6 LTS · IL2CPP x64 | Teclado + mando | P1 — arcade en club, streaming, prensa | Build inicial existe |

**Por qué PC importa aquí y no es un capricho:** el go-to-market del whitepaper
depende de *gaming stations* en clubes aliados (sección 8). Una estación de club
es un PC o un iPad con un mando, no un teléfono que se pasa de mano en mano. PC
también es lo que permite que un DJ juegue en cabina y que la prensa y los
streamers cubran el juego. Es un canal de marketing, no una plataforma de venta.

**Consecuencia:** PC no busca ingresos por sí solo. No lleva IAP ni anuncios; es
la build de exhibición, torneo y prensa.

## 2. Esquema de control

### Táctil (Android / iOS / web móvil)

| Acción | Gesto | Umbral |
|---|---|---|
| Cambiar carril | Swipe ← / → | 25 px |
| Saltar | Swipe ↑ | 25 px |
| Deslizar | Swipe ↓ | 25 px |
| Pausa | Botón HUD | — |

### Teclado (PC / web desktop)

| Acción | Teclas |
|---|---|
| Izquierda / Derecha | `←` `→` · `A` `D` |
| Saltar | `↑` · `W` · `Espacio` |
| Deslizar | `↓` · `S` |
| Pausa | `Esc` · `P` |
| Empezar / Reintentar | `Enter` · `Espacio` · `R` |

Flechas y espacio llaman a `preventDefault()` para que el navegador no haga
scroll de la página durante la partida. `e.repeat` se ignora: mantener una tecla
no dispara cambios de carril en cascada.

### Mando (PC / web con Gamepad API)

| Acción | Botón (layout estándar) |
|---|---|
| Izquierda / Derecha | D-pad ←/→ · stick izquierdo (zona muerta 0.55) |
| Saltar | D-pad ↑ · **A / Cross** · stick ↑ |
| Deslizar | D-pad ↓ · **B / Circle** · stick ↓ |
| Pausa | **Start** · **Select** |

La Gamepad API del navegador no emite eventos de botón, así que el mando se
sondea una vez por frame en el loop de render y se compara con el estado del
frame anterior: solo dispara en el flanco de subida. Sin eso, un botón mantenido
lanzaría una acción por frame.

## 3. Objetivos de rendimiento por plataforma

| Plataforma | Resolución | FPS objetivo | Presupuesto de frame |
|---|---|---|---|
| Android gama media (Snapdragon 6xx) | 1280×720 escalado | 60 | 16,6 ms |
| Android gama alta / iPhone 12+ | Nativa hasta 1080p | 60 | 16,6 ms |
| PC (GTX 1050 / integrada moderna) | 1920×1080 | 60–144 | 16,6 ms / 6,9 ms |
| Web desktop | 1920×1080 | 60 | 16,6 ms |

El techo de calidad por plataforma está en [QUALITY_TIERS.md](QUALITY_TIERS.md).

## 4. Lo que falta para cerrar PC

- [ ] Remapeo de teclas en el menú de opciones (accesibilidad).
- [ ] Iconografía de botones contextual (Xbox / PlayStation / teclado) en los tutoriales.
- [ ] Soporte de ultrawide (21:9): el HUD se ancla a los bordes, la cámara mantiene FOV vertical.
- [ ] Unity: acciones equivalentes en el New Input System (`Move`, `Jump`, `Slide`, `Pause`)
      con bindings para Keyboard, Gamepad y Touchscreen sobre el mismo `InputAction`.
- [ ] Pausa automática al perder el foco de la ventana (PC).
