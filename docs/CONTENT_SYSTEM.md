# ZONA T RUNNER - Content System Document

## 1. Content-Driven Philosophy
En *ZONA T RUNNER*, todo el contenido (DJs, mundos, obstáculos, eventos) está impulsado por datos. Esto permite que el equipo de diseño y contenido añada nuevas experiencias sin necesidad de alterar el código fuente.

## 2. JSON Schema Design
Los esquemas JSON son la fuente de verdad.
- **DJ Profiles:** Nombre, biografía, redes sociales, track principal.
- **Worlds:** Temática, colores neon, tipos de texturas (concreto, underground).
- **Obstacles:** Velocidad, hitboxes, patrones.
- **Promotions & Events:** Fechas de inicio/fin, enlaces, assets promocionales.

## 3. ScriptableObject Architecture
El `ContentSystem` mapea los archivos JSON parseados a instancias de `ScriptableObject` en tiempo de ejecución. Esto permite usar el Inspector de Unity para debuggear, manteniendo el JSON como fuente primaria durante la fase de authoring.

## 4. Content Pipeline
El ciclo de vida del contenido:
1. **Author JSON:** El equipo crea/edita el JSON.
2. **Validate:** Scripts de validación en el editor aseguran la integridad del esquema.
3. **Import:** Unity AssetPostprocessor convierte JSON a datos legibles.
4. **ScriptableObject:** Generación o actualización de assets en el editor.
5. **Runtime:** El juego consume estos `ScriptableObjects`.

## 5. Adding a New DJ
> [!TIP]
> **Paso a paso para añadir un DJ:**
> 1. Crear el archivo `<dj_id>.json` en la carpeta `Data/DJs`.
> 2. Añadir los assets (modelo 3D, texturas, pistas de audio stem) en la carpeta correspondiente.
> 3. Referenciar los GUIDs o nombres de assets en el JSON.
> 4. Ejecutar el validador en el menú de Unity (`ZonaT > Content > Validate`).
> 5. Probar en la escena `DJSelect`.

## 6. Adding a New World
1. Crear el archivo de configuración del mundo en JSON.
2. Añadir los prefabs de segmentos y obstáculos temáticos.
3. Actualizar la paleta de colores y parámetros de post-procesado (URP Volume Profiles).

## 7. Scalability
> [!NOTE]
> Diseñado para 5 DJs, pero **arquitectado para 500**.
El uso extensivo de Data-Driven Design significa que la memoria se escala dinámicamente. Solo el DJ activo y su mundo asociado se cargan en memoria en la escena `Gameplay`, garantizando que el RAM se mantenga < 300MB independientemente del número total de DJs.

## 8. Future: Remote Content
En la FASE 3, el sistema transicionará hacia **Addressables** y un **CDN**. El `ContentSystem` está diseñado con interfaces asíncronas para que descargar un nuevo DJ desde un servidor remoto requiera cambios mínimos en el código del juego.

## 9. Example Configurations

### Full DJ Profile JSON
```json
{
  "djId": "dj_bela",
  "displayName": "Bela",
  "genre": "Techno",
  "themeColor": "#FF00FF",
  "assets": {
    "model": "char_bela_v1",
    "musicStems": ["bass_01", "drum_01", "synth_01", "vox_01"]
  }
}
```

### World Config JSON
```json
{
  "worldId": "world_underground_club",
  "ambientLight": "#111122",
  "fogColor": "#000000",
  "fogDensity": 0.05,
  "segments": [
    "seg_straight_neon",
    "seg_corner_speakers",
    "seg_bridge_concrete"
  ],
  "obstacleSets": ["obs_barriers", "obs_lasers"]
}
```
