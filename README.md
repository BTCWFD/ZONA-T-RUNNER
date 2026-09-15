# 🌃 ZONA T RUNNER
> *La escena electrónica de Bogotá en tus manos.*

![Unity Version](https://img.shields.io/badge/Unity-6%20LTS-black?logo=unity)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20PC%20%7C%20Web-lightgrey)
![Status](https://img.shields.io/badge/Status-FASE%202%3A%20Vertical%20Slice-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📖 Overview
**Zona T Runner** es un endless runner para dispositivos móviles que fusiona la vibrante escena de música electrónica de Bogotá con una experiencia de juego dinámica y adictiva. No es un clon de juegos existentes; cuenta con una identidad propia urbana, nocturna y *underground*. Cada DJ real jugable introduce un universo único con su propia música, estética visual, obstáculos y eventos.

## 🎯 Vision
Construir más que un juego: una plataforma que conecta ecosistemas:
**DJs → Managers → Clubs → Events → Brands → Fans**

## ⚙️ Tech Stack

Dos motores con roles distintos — ver [ENGINE_STRATEGY.md](docs/ENGINE_STRATEGY.md):
el prototipo web es el **escaparate comercial**, Unity es el **producto**.

- **Prototipo web**: Three.js / WebGL2 (`web-runner/`) — jugable hoy en el navegador
- **Engine**: Unity 6 LTS
- **Language**: C#
- **Render Pipeline**: URP (Universal Render Pipeline)
- **Backend/Build**: IL2CPP
- **Architecture**: Data-driven, Content-driven (JSON + ScriptableObjects) diseñada para escalar de 5 a 500+ DJs.

## 🗂️ Project Structure
```text
ZONAT-RUNNER/
├── data/                               # FUENTE UNICA DE VERDAD del contenido
│   └── djs/roster.json                 #   Roster de DJs (lo leen Unity Y el web-runner)
├── design/                             # UI/UX, referencias de marca
├── docs/                               # Documentacion tecnica y de diseno
├── blender_map/                        # Arte 3D (Blender headless)
│   ├── build_track_kit.py              #   Genera el kit modular de pista
│   ├── build_dj_characters.py          #   Genera los personajes DJ
│   └── track_kit/                      #   .glb + .fbx + manifest exportados
├── web-runner/                         # Prototipo jugable Three.js (demo comercial)
├── server.js                           # Dev server: sirve web-runner/ y /data/
└── ZonaTRunner/                        # Proyecto Unity (producto)
    └── Assets/
        └── _Project/
            ├── 01_Core/                # Core Managers, Singletons, Bootstrapper
            ├── 02_Features/            # Modular Gameplay Features (Runner, Combat, etc.)
            ├── 03_Data/                # ScriptableObjects, Game Database
            ├── 04_UI/                  # Prefabs, UI Scripts, USS/UXML
            ├── 05_Art/                 # Models, Textures, Materials, Shaders
            ├── 06_Audio/               # Music, SFX, AudioMixers
            └── 07_Scenes/              # Unity Scenes (Bootstrap, MainMenu, Game)
```

## 🚀 Getting Started

### Prerequisites
- [Unity 6 LTS](https://unity.com/releases/editor/qa/lts-releases)
- Git LFS (para el manejo de assets binarios)

### Correr el prototipo web (lo más rápido)
```bash
node server.js          # http://127.0.0.1:8080
```
Controles en PC: `A`/`D` o flechas para carril, `W`/`Espacio` salto, `S` deslizar,
`Esc` pausa. Con mando conectado funciona el D-pad y A/B.

### Installation (Unity)
1. Clona el repositorio:
   ```bash
   git clone https://github.com/your-org/zonat-runner.git
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd ZONAT-RUNNER/ZonaTRunner
   ```
3. Abre el proyecto en **Unity Hub** utilizando la versión Unity 6 LTS.

## 📅 Development Phases
| Fase | Descripción | Estado |
|------|-------------|--------|
| **Fase 0** | Pre-Production & Architecture | 🚧 En Progreso |
| **Fase 1** | Core Prototype | 🕒 Pendiente |
| **Fase 2** | Vertical Slice (1 DJ) | 🕒 Pendiente |
| **Fase 3** | Meta-Game & Progression | 🕒 Pendiente |
| **Fase 4** | Monetization & Analytics | 🕒 Pendiente |
| **Fase 5** | Content Expansion (5 DJs) | 🕒 Pendiente |
| **Fase 6** | Polish & Optimization | 🕒 Pendiente |
| **Fase 7** | Closed Beta / Soft Launch | 🕒 Pendiente |
| **Fase 8** | Release Candidate | 🕒 Pendiente |
| **Fase 9** | Global Launch | 🕒 Pendiente |
| **Fase 10** | LiveOps & Post-Launch | 🕒 Pendiente |

**Estado real**: el prototipo web es jugable con 11 DJs, mapa 3D de la Zona T y kit
modular de pista. Unity tiene el andamiaje de sistemas y las escenas base. Las fases
de la tabla describen el camino del producto Unity, no el del prototipo web.

## 🏗️ Architecture Overview
El juego está construido sobre una arquitectura escalable, basada en eventos y altamente modular compuesta por **16 sistemas principales** (Audio, Runner, Input, Progression, etc.). El diseño se centra en la separación de responsabilidades, *dependency injection* y un flujo de datos (Content-Driven) para facilitar la integración de nuevo contenido sin refactorización masiva de código.

## 📚 Documentation
Para más detalles técnicos, arquitectónicos y guías, revisa los documentos en la carpeta `docs/`:
- [Game Design Document (GDD)](docs/GDD.md)
- [Technical Architecture](docs/ARCHITECTURE.md)
- [Coding Guidelines](docs/CODING_GUIDELINES.md)
- [Content Creation Guide](docs/CONTENT_GUIDE.md)

**Decisiones de proyecto:**
- [Estrategia de motores: web-runner vs Unity](docs/ENGINE_STRATEGY.md)
- [Plataformas y controles (móvil, PC, mando)](docs/PLATAFORMAS_Y_CONTROLES.md)
- [Tiers de calidad: qué significa "AAA" aquí](docs/QUALITY_TIERS.md)
- [Kit modular de pista](docs/TRACK_KIT.md)
- [Whitepaper v1.0 — modelo Play-to-Party](docs/WHITEPAPER_V1.md)

## 🤝 Contributing
Para detalles sobre flujos de trabajo, control de versiones, naming conventions de ramas y PRs, por favor lee el documento [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License
Este proyecto está licenciado bajo la licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
