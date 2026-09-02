# 🌃 ZONA T RUNNER
> *La escena electrónica de Bogotá en tus manos.*

![Unity Version](https://img.shields.io/badge/Unity-6%20LTS-black?logo=unity)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey)
![Status](https://img.shields.io/badge/Status-FASE%200%3A%20Pre--Production-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📖 Overview
**Zona T Runner** es un endless runner para dispositivos móviles que fusiona la vibrante escena de música electrónica de Bogotá con una experiencia de juego dinámica y adictiva. No es un clon de juegos existentes; cuenta con una identidad propia urbana, nocturna y *underground*. Cada DJ real jugable introduce un universo único con su propia música, estética visual, obstáculos y eventos.

## 🎯 Vision
Construir más que un juego: una plataforma que conecta ecosistemas:
**DJs → Managers → Clubs → Events → Brands → Fans**

## ⚙️ Tech Stack
- **Engine**: Unity 6 LTS
- **Language**: C#
- **Render Pipeline**: URP (Universal Render Pipeline)
- **Backend/Build**: IL2CPP
- **Architecture**: Data-driven, Content-driven (JSON + ScriptableObjects) diseñada para escalar de 5 a 500+ DJs.

## 🗂️ Project Structure
```text
ZONAT-RUNNER/
├── data/                               # DJ Configs, JSON data, Content definitions
├── design/                             # UI/UX, Game Design Docs, References
├── docs/                               # Technical documentation & Guidelines
└── ZonaTRunner/                        # Main Unity Project Directory
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

### Installation
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

**Current Status**: `FASE 0 - Pre-Production`

## 🏗️ Architecture Overview
El juego está construido sobre una arquitectura escalable, basada en eventos y altamente modular compuesta por **16 sistemas principales** (Audio, Runner, Input, Progression, etc.). El diseño se centra en la separación de responsabilidades, *dependency injection* y un flujo de datos (Content-Driven) para facilitar la integración de nuevo contenido sin refactorización masiva de código.

## 📚 Documentation
Para más detalles técnicos, arquitectónicos y guías, revisa los documentos en la carpeta `docs/`:
- [Game Design Document (GDD)](docs/GDD.md)
- [Technical Architecture](docs/ARCHITECTURE.md)
- [Coding Guidelines](docs/CODING_GUIDELINES.md)
- [Content Creation Guide](docs/CONTENT_GUIDE.md)

## 🤝 Contributing
Para detalles sobre flujos de trabajo, control de versiones, naming conventions de ramas y PRs, por favor lee el documento [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License
Este proyecto está licenciado bajo la licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
