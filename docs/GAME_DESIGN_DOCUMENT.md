# ZONA T RUNNER - Game Design Document (GDD)

## 1. Game Overview
**Título:** ZONA T RUNNER
**Género:** Endless Runner Musical / Arcade
**Plataforma:** Móvil (iOS & Android)
**Motor Gráfico:** Unity 6 LTS (URP)

### Elevator Pitch
"Subway Surfers meets la cultura electrónica de Bogotá". Una experiencia arcade frenética donde juegas como los DJs más influyentes de la escena nocturna bogotana, recorriendo sus propios mundos musicales en una ciudad oscura, vibrante y llena de neón.

### Target Audience
- Jóvenes de 16 a 35 años.
- Fans de la música electrónica (Techno, House, Tech-House, etc.).
- Asistentes a la vida nocturna de Bogotá y la cultura de clubes.
- Jugadores de *mobile gamers* que buscan experiencias rápidas, adictivas y con alta calidad audiovisual.

---

## 2. Core Gameplay

### Mecánicas Principales (Endless Runner)
- **Auto-run:** El personaje avanza automáticamente hacia adelante.
- **3 Lanes:** El track está dividido en tres carriles.
- **Controles (Swipe):**
  - **Swipe Left / Right:** *Lane switching* para esquivar obstáculos laterales.
  - **Swipe Up:** *Jump* para saltar obstáculos bajos.
  - **Swipe Down:** *Slide* para deslizarse por debajo de obstáculos altos.

### Obstáculos
- **Static:** Barreras de concreto, andamios, vallas publicitarias, equipos de sonido, láseres fijos.
- **Moving:** Vehículos, trenes/transmilenio, luces móviles, masas de gente (*crowds*).
- **Tipos de Interacción:**
  - *Low Obstacles:* Requieren *Jump* (ej. barreras de tráfico).
  - *High Obstacles:* Requieren *Slide* (ej. andamios bajos, láseres a la altura del pecho).
  - *Lane-blocking:* Bloquean completamente el carril, requieren *Lane switching*.

### Collectibles
- **Coins:** Monedas del juego (tokens) distribuidas a lo largo del track para *scoring* y economía del juego.
- **Power-ups:**
  - **Magnet:** Atrae todas las *coins* cercanas durante un tiempo limitado.
  - **Multiplier:** Multiplica temporalmente los puntos obtenidos.
  - **Shield:** Protege al jugador de un (1) golpe.
  - **Speed Boost (Drop):** Acelera el juego, hace al jugador invencible y activa el *Drop* musical de la pista actual.

### Scoring & Difficulty
- **Scoring:** Basado en la distancia recorrida + *coins* recolectadas + combos por esquivas perfectas y recolección continua.
- **Difficulty Curve:** Incremento progresivo de la velocidad del *auto-run*, mayor densidad de obstáculos, patrones (*patterns*) más complejos y menor tiempo de reacción.
- **Game Feel:** Rápido, altamente musical, inmersivo, adictivo, con sensación de velocidad urbana nocturna.

---

## 3. DJ System

El diferencial principal de *ZONA T RUNNER*. Cada DJ no es solo un *skin*, es un **paquete de experiencia completo** que transforma el juego.

### Arquitectura de Datos (DJ Data Structure)
El sistema está diseñado para escalar hasta 500+ DJs utilizando JSON y ScriptableObjects.
```json
{
  "id": "dj_001",
  "name": "Nombre del DJ",
  "bio": "Descripción y background en la escena.",
  "characterPrefab": "ruta/al/modelo3D",
  "worldTheme": "Techno_Industrial_Bogota",
  "music": {
    "baseStem": "base.wav",
    "synthStem": "synth.wav",
    "dropStem": "drop.wav",
    "bpm": 130
  },
  "obstaclesList": ["speaker_stack", "laser_grid"],
  "rewards": ["skin_alt", "powerup_upgrade"],
  "events": ["club_anniversary"],
  "promotions": {
    "brand": "Cerveza Local",
    "url": "https://link-a-promo.com"
  },
  "socialLinks": {
    "instagram": "@dj_ig",
    "soundcloud": "soundcloud.com/dj"
  }
}
```

### Impacto en el Gameplay
Seleccionar un DJ cambia:
- **Visuales del Mundo:** Texturas, iluminación, post-procesamiento.
- **Música:** Pistas exclusivas del DJ.
- **Obstáculos y Enemigos:** Adaptados a su estilo (ej. DJ de Techno Industrial tendrá entornos de fábricas abandonadas y láseres oscuros).
- **Publicidad/Native Ads:** Promociones específicas del DJ o sus patrocinadores.

### 5 Placeholder DJ Concepts
1. **DJ ALFA (Techno Industrial):** Mundo oscuro, bodegas abandonadas de Puente Aranda, luces estroboscópicas blancas, BPM rápido (135+).
2. **DJ BETA (Tech-House):** Entornos tipo *rooftop* en la Zona T, neones magenta y cian, ritmo groovero (125 BPM).
3. **DJ GAMMA (Melodic Techno):** Lluvia constante, calles de La Candelaria de noche, atmósferas envolventes, luces azules profundas.
4. **DJ DELTA (Hard Techno):** Túneles de Transmilenio subterráneos, rojo sangre, flashes rápidos, obstáculos agresivos, BPM extremo (140+).
5. **DJ EPSILON (House/Disco):** Club clásico, bolas de espejos, texturas de vinilo, confeti, calles iluminadas de Chapinero, ritmos alegres (120 BPM).

---

## 4. World Design

### Bogotá como Universo
- Estética nocturna y urbana: asfalto mojado, concreto, neón, graffiti artístico, arquitectura local.
- **NO es la Bogotá turística** (no Monserrate genérico). Es la Bogotá *underground*, sofisticada, contemporánea y de cultura de club.
- Clima dinámico o específico por DJ (niebla, lluvia, noche despejada).

### Track Segment System
- Generación procedural (*procedural generation*) de la pista mediante *prefabs* (segmentos de track).
- Cada segmento tiene variaciones de obstáculos, coleccionables y *props* ambientales.
- Se conectan fluidamente para crear una carrera infinita sin interrupciones.

### Storytelling Ambiental & Native Ads
- Las paredes, pantallas digitales, vallas y *flyers* en el suelo cuentan historias de la escena.
- **Native Advertising:** Integración orgánica de marcas (ej. marquesinas de paraderos, *billboards* interactivos) que no interrumpen el flujo del juego, generando valor comercial sin dañar la inmersión.

---

## 5. Audio Design

La música es un **pilar de gameplay**, no solo fondo.

### Sistema Dinámico de Música (Stems)
- La música está dividida en *stems* (capas): **Drums, Bass, Synth, FX/Vocals**.
- **Activación dinámica:** El jugador empieza solo con Drums & Bass. A medida que aumenta su combo y velocidad, se añaden capas de Synth.
- Al coger el Power-Up de *Speed Boost*, se activa el **Drop** de la canción con todos los *stems*.

### BPM Synchronization
- Generación de mundo y animaciones atadas al BPM del DJ actual.
- Luces, láseres, y movimiento de obstáculos pulsan al ritmo del bombo.

### SFX (Sound Effects)
- *Coins*, *Jumps*, *Slides*, *Hits*, e interfaz de usuario (UI) diseñados con síntesis electrónica para que no desentonen con la pista musical. (Ej. agarrar una moneda suena como un acorde de sintetizador menor).

---

## 6. UI/UX Flow

El objetivo es llegar del logo al gameplay en **menos de 30 segundos**.

### Flujo Principal
1. **Logo / Splash Screen:** Rápido, estético.
2. **Start Screen:** *Tap to Start* con animación rítmica.
3. **DJ Select:** Carrusel fluido. Muestra:
   - Preview del personaje 3D.
   - Preview del mundo (fondo dinámico).
   - Preview de audio (arranca la canción).
   - Bio del DJ y redes sociales.
4. **Core Loop (Run):** La partida.
5. **Game Over Screen:**
   - Puntaje obtenido vs *Best Score*.
   - Monedas recolectadas.
   - Botones rápidos: *Retry*, *DJ Select*, *Home*.

### HUD (Head-Up Display) in-game
- Minimalista. No intrusivo.
- Score actual.
- Contador de *Coins*.
- Medidor de Combo / Multiplicador.
- Nombre del DJ (esquina).

### Aesthetic UI
- Cultura de club elegante: tipografías limpias (Sans-Serif gruesas e itálicas), alto contraste, botones con glow sutil, transparencia tipo *glassmorphism* oscura.

---

## 7. Progression System

- **Scores:** Tabla de clasificación (*Leaderboards*) local y (futuro) global por DJ.
- **Economía:** Acumulación de *Total Coins* en el perfil del jugador.
- **Unlockables:** Desbloqueo de *skins* de DJs, versiones VIP de los mundos, *upgrades* de Power-ups.
- *(Future)* **Daily Challenges:** Misiones como "Recoge 500 monedas en el track de DJ BETA".
- *(Future)* **Seasons:** Temporadas temáticas basadas en festivales reales de Bogotá (ej. BAUM, Radikal Styles).

---

## 8. Monetization Design (Arquitectura a futuro)
*Nota: Para el MVP la monetización no es la prioridad, pero la arquitectura debe soportarla.*

- **Ad Placements:**
  - *Rewarded Video:* Ver anuncio para un "Revive" (continuar la carrera una vez).
  - *Interstitial Ads:* Opcional, post-carrera (mantener baja frecuencia para no frustrar).
- **In-App Purchases (IAP):**
  - Paquetes de *Coins*.
  - Compra de *DJ Packs* (DJs internacionales o exclusivos).
  - *Skins* premium.
- **Premium Features:** Modelo *Ad-Free* (remover anuncios intersticiales).
- **Event-Based (B2B/B2C):** Venta de tiquetes para eventos reales desde el juego, códigos de descuento para patrocinadores, *product placement* en vallas del juego.

---

## 9. Art Direction

- **Keywords:** Bogotá, nocturno, electrónico, *underground*, futurista sin ser sci-fi, urbano, neón, concreto, cultura de club.
- **Paleta de Color:** Negros profundos, grises de asfalto, contrastados con colores eléctricos saturados (azules, magentas, cianes). Cada DJ aporta un color de acento.
- **Estilo Visual:** Realismo estilizado / Low-Poly HD. Modelos eficientes pero con *shaders* avanzados (PBR, reflejos en asfalto húmedo, *bloom* para neones).
- **Evitar:** *Cyberpunk* genérico asiático. Estética infantil o de juego móvil barato. El *feel* debe ser premium, como un videoclip interactivo de música electrónica.

---

## 10. Technical Constraints

El juego debe correr de manera óptima para el mercado latinoamericano sin sacrificar estilo.

- **Performance Target:** 60 FPS estables en Android gama media (*mid-range*, ej. Snapdragon 600 series o superior) y iPhones desde el iPhone X.
- **Build Size:** APK base < 60MB. Los DJs adicionales pueden descargarse dinámicamente (*AssetBundles* o *Addressables*) si es necesario en el futuro.
- **Memory Budget:** < 300MB RAM en uso de *runtime*.
- **Object Pooling:** Obligatorio para *track segments*, *obstacles*, *coins* y partículas. Las instanciaciones (`Instantiate`/`Destroy`) están prohibidas durante el *Gameplay*.
- **Garbage Collection (GC):** Zero GC Allocation durante el ciclo de vida del *Run*. Todo debe estar pre-asignado.
- **Engine:** Unity 6 LTS con Universal Render Pipeline (URP) optimizado para *Mobile*.
