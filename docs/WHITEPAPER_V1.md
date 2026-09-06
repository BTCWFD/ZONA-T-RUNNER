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

---

## 7. IN-GAME ADVERTISING FRAMEWORK (PUBLICIDAD NATIVA)

ZONA T RUNNER ofrece un ecosistema publicitario no intrusivo y altamente inmersivo. En lugar de banners molestos o videos obligatorios, la publicidad hace parte de la arquitectura del entorno cyberpunk.

### Espacios Publicitarios Disponibles:
1. **Mega-Vallas Elevadas (Gantries):** Pantallas LED 3D gigantes que cruzan la avenida de lado a lado. Ideales para anunciar grandes festivales (ej. Baum Festival, Tatacoa) y Main Sponsors (ej. marcas de licores).
2. **Fachadas de Clubes y Vitrinas:** Texturas dinámicas en los laterales de la calle. Permiten a los clubes aliados mostrar su cartelera del fin de semana (ej. Club Octava, Andrés D.C., Kaputt).
3. **Product Placement (Power-Ups):** Las marcas de bebidas energéticas o licores pueden patrocinar ítems del juego. Por ejemplo, en lugar del escudo estándar, recoger un "Energy Drink X" otorga invulnerabilidad temporal.
4. **Banners Interactivos (UI):** Avisos integrados en el HUD al finalizar una carrera ("Set Terminado") que entregan recompensas directas y llevan al usuario a la compra.

Este modelo genera altos niveles de recordación de marca (Brand Recall) y una altísima tasa de clics (CTR) comparada con la publicidad web estándar, al sentirse como recompensas ganadas por el usuario.

---

## 8. GO-TO-MARKET STRATEGY (ESTRATEGIA DE LANZAMIENTO)

La captación de usuarios se basará en la integración directa con la vida nocturna física de Bogotá, creando un bucle viral (Viral Loop) orgánico.

### Tácticas Clave:
* **"Gaming Stations" en Clubes (BTL):** Instalación de iPads o máquinas arcade en las zonas VIP de clubes aliados. Quien logre el "High Score" de la noche, se lleva una botella gratis. 
* **Códigos QR Dinámicos:** Proyección de códigos QR gigantes en las pantallas LED de los clubes durante los sets de los DJs (Nuñez, Letal, Tatán, etc.) invitando al público a descargar el juego para obtener beneficios para la siguiente fiesta.
* **Torneos "Road to Festival":** Competiciones semanales donde los mejores corredores ganan entradas VIP para los principales festivales de electrónica de la ciudad.
* **Apoyo de Influencers y DJs:** Los 11 DJs del juego actuarán como micro-influencers, promoviendo el juego en sus redes sociales, ya que tienen un incentivo financiero directo (Revenue Share) por las ventas in-game generadas por su avatar.

---

## 9. FICHA TÉCNICA DE DJs Y TOKENS (TOKENOMICS BASE)

ZONA T RUNNER utiliza un sistema económico híbrido diseñado para mantener la retención diaria y facilitar transacciones sin fricción.

### "Tokens Zona T" (Moneda Soft In-Game):
* **Obtención:** Recolectando monedas de oro virtuales durante la carrera.
* **Uso:** Desbloqueo de atuendos alternativos (Skins), mejoras temporales (más tiempo de imán, mayor duración del escudo) y tickets de reintento.

### Pases VIP (Moneda Premium / IAP):
* Comprados con dinero real (FIAT) a través de las tiendas de aplicaciones.
* Usados para desbloquear DJs legendarios, efectos visuales premium (estelas de neón personalizadas) y pases de batalla estacionales (Clubber Pass).

### Roster Oficial y Atributos:
Cada DJ tiene un arquetipo basado en su estilo de música y personalidad real:
* **DJ Nuñez ("El Toro en Llamas"):** 
  * *Género:* Tech House.
  * *Habilidad Pasiva:* 1-2-3-4 Stomp (Rompe obstáculos menores al caer tras un salto en el 4to beat).
* **DJ Letal:** 
  * *Género:* Techno.
  * *Habilidad Pasiva:* Violín Neón (Mayor radio de atracción de tokens).
* **DJ Tatán:** 
  * *Género:* Progressive House.
  * *Habilidad Pasiva:* Resistencia (Mayor escudo inicial).
* **DJ Molecular & DJ Sthep (Próximos lanzamientos)**

