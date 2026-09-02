# Pipeline de Assets (Asset Pipeline)

## Tipos de Assets (Asset Types)
- Modelos 3D, Texturas, Audio, UI, VFX.

## Convenciones de Nomenclatura (Naming Conventions)
- Formato general: `tipo_categoria_nombre_variante`
- Ejemplos: 
  - `char_dj_fresar_idle` (Personaje)
  - `tex_env_concrete_diffuse` (Textura)
  - `ui_btn_play_active` (Interfaz)

## Especificaciones de Texturas (Texture Specs)
- **Resolución Máxima**: 1024x1024 para props y entorno, 2048x2048 para personajes principales.
- **Compresión**: ASTC (estándar para móviles modernos iOS/Android).
- **Atlas Guidelines**: Empaquetar sprites de UI y texturas de props menores en atlas para reducir drásticamente los draw calls.

## Especificaciones de Audio (Audio Specs)
- **Música**: Formato OGG, frecuencia 44.1kHz (comprimido para streaming, optimizado en memoria).
- **SFX**: Formato WAV (Descompresión rápida o streaming en carga según duración).
- **Stems**: Si la música es dinámica, los stems deben estar sincronizados y exportados al mismo BPM y longitud.

## Especificaciones de Modelos 3D (3D Model Specs)
- **Polygon Budgets**:
  - Personajes: 5,000 - 10,000 tris.
  - Entorno (por segmento/chunk): 2,000 - 5,000 tris.
- Evitar jerarquías profundas en los rigs. Optimizar los pesos de vértices (máximo 4 huesos por vértice).

## Configuración de Importación (Import Settings)
- **Modelos**: Deshabilitar "Read/Write Enabled" si no es necesario en runtime, desmarcar "Import Cameras" e "Import Lights". Usar "Optimize Mesh".
- **Texturas**: Activar "Generate Mip Maps" (excepto para UI), usar filtrado trilinear cuando sea necesario.

## Organización de Carpetas (Folder Organization)
Estructura dentro de `Assets/_Project/`:
- `/Art/`
  - `/3D/`
  - `/2D/`
  - `/Materials/`
- `/Audio/`
  - `/Music/`
  - `/SFX/`
- `/Prefabs/`
  - `/Characters/`
  - `/Environment/`
  - `/UI/`

## Guidelines de Assets Temporales (Placeholder Assets)
- Usar primitivas de Unity para blockouts tempranos.
- Nombrar los placeholders con el sufijo `_temp` (ej. `char_dj_temp`).

## Cómo Añadir Assets Específicos de DJ
- Crear una carpeta aislada para cada artista: `Assets/_Project/DJs/[NombreDelDJ]/`.
- Contener todo (modelos, audios, texturas, prefab de personaje, ScriptableObjects de configuración) en esta carpeta para facilitar la modularidad.

## Checklist de Optimización antes del Commit
- [ ] Texturas comprimidas a formato ASTC.
- [ ] Conteo de polígonos validado según el presupuesto.
- [ ] Múltiples materiales combinados o reducidos cuando es posible.
- [ ] Audio con la configuración de compresión correcta aplicada.

## Futuro (Future)
- **Addressables Packaging Strategy**: Implementación de Addressables para el empaquetado de contenido modular. Permitirá a los jugadores descargar assets de nuevos DJs u obstáculos dinámicamente, reduciendo el tamaño inicial (APK/AAB) de la aplicación y permitiendo actualizaciones Over-The-Air (OTA).
