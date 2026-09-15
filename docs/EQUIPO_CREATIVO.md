# ZONA T RUNNER — Equipo experto (roles orquestados)

Equipo de desarrollo de videojuegos definido y memorizado para este proyecto.
Cada rol existe como un **agente invocable** en `.claude/agents/` del repo: puedes
llamarlo por su nombre para que Claude actúe con esa especialidad y su contexto ya
cargado. Claude coordina entre ellos como líder de estudio.

| Rol | Agente | Para qué lo llamas |
|---|---|---|
| 🎬 Director creativo | `creative-director` | Visión, coherencia estética, marca, resolver AAA vs. restricciones |
| 🎮 Diseñador de juego | `game-designer` | Core loop, balance, sistema de DJs, economía, Play-to-Party |
| ⚙️ Director técnico | `technical-director` | Unity/URP, rendimiento, pooling, content-driven, input multiplataforma |
| 🏙️ Artista de entornos | `environment-artist` | Mapa Zona T, kit modular, Blender, clubes, exportación |
| 🕺 Artista de personajes | `character-artist` | Avatares de los DJs, estilización, silueta, modelado |
| 🎨 Technical artist | `tech-artist` | Shaders, VFX de neón, PBR, bloom reactivo al BPM |
| 🎧 Director de audio | `audio-director` | Stems, sync al BPM, SFX, Drop/Fever |
| 📱 Diseñador UX/UI | `uxui-designer` | Pantallas, HUD, flujo, glassmorphism, accesibilidad |
| 📈 Productor / BD | `producer-bd` | Roadmap, monetización, alianzas, pitch a Anthropic |
| ✅ QA lead | `qa-lead` | Planes de prueba, rendimiento en dispositivos, verificación |

## Cómo se orquesta

- **Claude actúa como líder del estudio (game director / EP):** recibe la petición,
  decide qué especialistas intervienen y en qué orden, y sintetiza el resultado.
- Cada agente ya conoce el proyecto: consulta los `docs/` relevantes y respeta la
  fuente única de verdad (`data/djs/roster.json`, el kit en `blender_map/track_kit/`).
- Para invocar un rol explícitamente, pídelo por su nombre
  ("que el technical-director revise el TrackSpawner", "que el character-artist suba
  el detalle de Letal a tier Mobile").
- Cadenas típicas:
  - **Nuevo DJ:** game-designer (habilidad + balance) → character-artist (avatar) →
    audio-director (stems/BPM) → uxui-designer (card de selección) → qa-lead.
  - **Nueva zona de pista:** environment-artist (kit) → tech-artist (materiales PBR)
    → technical-director (integración/pooling) → qa-lead (rendimiento).
  - **Pitch:** producer-bd (narrativa/números) → creative-director (visión) →
    uxui-designer (demo pulida).

## Nota sobre "orquestación multi-agente automática"

Estos roles son personas de trabajo (agentes con contexto), no un enjambre que
gasta tokens en cada tarea. Claude los usa selectivamente. Si en algún momento
quieres una corrida multi-agente real y paralela (varios expertos trabajando a la
vez sobre una entrega grande), pídelo explícitamente y se lanza un *workflow*.

## Derechos de imagen (memorizado)

Los 4 DJs (Letal, Núñez, Fresar, Tatán/Calvin Parra) son colaboradores reales y el
proyecto cuenta con su consentimiento para usar su parecido; por eso el repo es
privado. El parecido foto-real está habilitado para el material de marketing. Los
avatares in-game son estilizados por presupuesto técnico de móvil, no por derechos.
