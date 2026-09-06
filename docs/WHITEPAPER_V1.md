# 📄 ZONA T RUNNER — WHITEPAPER v1.0
### Bogotá Electronic Music Runner & Phygital Entertainment Platform
*Fecha: Septiembre 2026 | Bogotá D.C., Colombia*

---

## 1. RESUMEN EJECUTIVO

**ZONA T RUNNER** es el primer videojuego móvil de formato *Endless Runner 3D* y plataforma *Phygital* (Físico + Digital) diseñado alrededor de la cultura y la industria de la música electrónica nocturna de Bogotá.

El juego convierte el acto de jugar en un canal de fidelización y venta directa para la vida nocturna: los jugadores corren por avenidas emblemáticas de la ciudad (Zona T, Calle 85, Chapinero, Parque 93) encarnando a DJs reales de la escena, mientras compiten por **recompensas canjeables en la vida real** (descuentos en taquilla, accesos VIP, cócteles de bienvenida y preventas exclusivas en clubes aliados como Octava, Bling Bling, Baum, Kaputt y Vlak).

---

## 2. EL PROBLEMA & LA OPORTUNIDAD

### El Problema en la Industria Nocturna:
1. **Publicidad Efímera e Ignorada:** Los promotores y clubes gastan miles de dólares en anuncios tradicionales de redes sociales y afiches que los jóvenes deslizan en segundos sin generar vínculo emocional.
2. **Falta de Gamificación en la Escena Musical:** Los DJs y colectivos dependen de canales saturados para comunicar sus fechas y lanzamientos.
3. **Desconexión entre Fan y Club:** No existe un puente interactivo diario entre la semana y la noche de fiesta del fin de semana.

### La Oportunidad:
* **Mercado Objetivo:** Jóvenes de 18 a 35 años, consumidores activos de música electrónica (Techno, House, Tech-House, Melodic) y asistentes regulares a clubes y festivales (Baum Festival, Tatacoa, Estéreo Picnic).
* **Mecánica Probada:** El género *Endless Runner* cuenta con miles de millones de descargas a nivel global por su accesibilidad y capacidad de retención inmediata.

---

## 3. ECOSYSTEM & MECÁNICAS PHY-GITAL ("PLAY-TO-PARTY")

El núcleo del modelo de negocio es el concepto **Play-to-Party (Jugar para Rumbear)**:

```
[ Jugador en Mobile / Web ]
           │
           ▼ (Compite al ritmo de su DJ favorito)
[ Recolección de Tokens Zona T & Puntos ]
           │
           ▼ (Alcanza récord o meta de distancia)
[ Desbloqueo de Beneficio Comercial Real ]
           │
     ┌─────┴────────────────────────┐
     ▼                              ▼
[ Código Promocional / QR ]    [ Pase VIP / Preventa ]
     │                              │
     └──────────────┬───────────────┘
                    ▼
[ Canje en Puerta del Club Aliado (Octava, Baum, Bling Bling) ]
```

### Casos de Uso Reales:
* **DJ NUÑEZ ("El Toro en Llamas"):** Al superar los 3.000 metros corriendo su set de Tech House, el jugador desbloquea el código `TORO15` (15% OFF en preventa para su fecha en Baum Club).
* **DJ LETAL:** Carrera con violín eléctrico que desbloquea un pase 2x1 en la puerta de Club Bling Bling.
* **DJ TATAN:** Residencia oficial Club Octava con cortesías en barra al obtener puntuación récord.

---

## 4. ARQUITECTURA TÉCNICA

* **Prototipo WebGL / Three.js:** Despliegue inmediato en navegadores y WebViews móviles con renderizado 3D acelerado por hardware, telemetría en tiempo real y audio por Web Audio API.
* **Motor Nativo (Unity 6 LTS - URP):** Compilaciones nativas de alta fidelidad para Android (Google Play / APK) e iOS (App Store), con shaders PBR avanzados de látex y neón, iluminación de discoteca en tiempo real y post-procesado URP.
* **Sistema Escalable de DJs:** Cada artista cuenta con su propio perfil de datos (`DJProfileData`), parámetros de tempo (BPM), paleta cromática de neón, clips de animación y módulo promocional.

---

## 5. MODELO DE INGRESOS Y MONETIZACIÓN

1. **Patrocinios Nativos In-Game (Vallas & Banners):**
   - Vallas publicitarias 3D a los costados de la pista de carrera arrendadas a marcas de licores, bebidas energéticas, moda urbana y productoras de eventos.
2. **Comisión por Venta de Boletería (Ticketing Affiliate):**
   - Integración con plataformas de venta de entradas; comisión porcentual por cada entrada vendida mediante códigos originados en el juego.
3. **Pases de Temporada / Season Pass ("Clubber Pass"):**
   - Microtransacciones para desbloquear skins exclusivos, estelas de fuego personalizadas, efectos de sonido y pistas exclusivas de los DJs.
4. **Revenue Share con los DJs:**
   - Un porcentaje de las ventas de merchandise y pases asociados al avatar de cada DJ se distribuye directamente al artista, convirtiendo el juego en una fuente de ingresos para el talento local.

---

## 6. ROADMAP DE DESARROLLO

* **Fase 1 (Completada):** Prototipo funcional Web, motor Unity 6 configurado, branding oficial, físicas inspiradas en EXXO Runner, primeros avatares (DJ LETAL y DJ NUÑEZ).
* **Fase 2 (En Progreso):** Completar el roster oficial de 11 DJs, habilidades activas por personaje ("Drop Ultimate"), telemetría HUD y preview de audio.
* **Fase 3:** Sistema de tabla de clasificación global (Leaderboard Bogotá), inventario de cupones ("Club Vault") y obstáculos urbanos locales (vallas de policía, bafles Funktion-One).
* **Fase 4:** Publicación en Google Play Store (APK Android) y alianzas comerciales directas con los primeros 3 clubes de la Zona T y Chapinero.
