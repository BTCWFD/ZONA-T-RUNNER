# Guía de Contribución (Contributing Guidelines)

## Configuración del Entorno (Environment Setup)
- Clona el repositorio y asegúrate de tener instalados los SDKs objetivo (iOS/Android).
- Editor recomendado: Visual Studio, JetBrains Rider o VS Code configurado para Unity.

## Requisitos de Unity
- **Engine**: Unity 6 LTS.
- **Render Pipeline**: URP (Universal Render Pipeline).

## Guía de Estilos de Código (Code Style Guide)
- **Convenciones C#**: PascalCase para Clases y Métodos, camelCase para variables locales, `_camelCase` para variables privadas.
- **Namespaces**: Todos los scripts deben usar el namespace `ZonaTRunner.[Modulo]`.

## Flujo de Trabajo Git (Git Workflow)
- Ramas principales: `main` (producción/entregables), `develop` (integración continua).
- Ramas efímeras: `feature/*`, `hotfix/*`, `bugfix/*`.

## Convención de Nombres de Ramas (Branch Naming)
- Formato: `tipo/descripcion-corta` (ej. `feature/dj-fresar-assets`, `bugfix/menu-overlap`).

## Formato de Mensajes de Commit (Commit Messages)
- Obligatorio usar **Conventional Commits**:
  - `feat: añade integración con backend para analíticas`
  - `fix: resuelve colisión errónea en el nivel underground`
  - `docs: actualiza readme con nuevas instrucciones de build`

## Proceso de Pull Request (PR Process)
- Todo PR debe apuntar a la rama `develop`.
- Incluir una descripción detallada, capturas de pantalla o videos (si hay cambios visuales), y vincular la tarea o issue correspondiente.

## Guías de Revisión de Código (Code Review)
- Verificar el cumplimiento de la arquitectura orientada a datos (JSON/ScriptableObjects).
- Prevenir problemas de rendimiento y asegurar mejores prácticas para desarrollo móvil.

## Requisitos de Testing
- Implementar pruebas unitarias (Unit Tests) para la lógica core (sistemas de puntuación, generación procedural, estados de juego).

## Requisitos de Documentación
- Actualizar los comentarios XML (XML summaries) de clases y métodos públicos importantes.
- Mantener los documentos Markdown actualizados ante cambios estructurales.

## Convenciones de Nombres de Assets (Asset Naming Conventions)
- Usar formato `snake_case`.
- Incluir prefijos según el tipo (referirse a ASSET_PIPELINE.md).

## Reglas de Estructura de Carpetas (Folder Structure Rules)
- Los archivos del proyecto deben residir en `Assets/_Project/`.
- Archivos generados de terceros deben mantenerse aislados y no interferir con la estructura base.
