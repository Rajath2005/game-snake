<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Version-1.0.0-orange.svg?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-38B2AC.svg?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</div>

<h1 align="center">🐍 The Serpent Kingdom</h1>

<div align="center">
  <p><strong>An epic roguelite survival game built with React, Vite, and Tailwind CSS.</strong></p>
  <p>
    <a href="README.md">English</a>
    ·
    <a href="README.zh-CN.md">简体中文</a>
    ·
    <a href="#-getting-started">Quick Start</a>
    ·
    <a href="#-contributing">Contribute</a>
  </p>
</div>

<div align="center">
  <i>"Reclaim your throne. Devour the souls. Ascend."</i>
</div>

---

## 📖 Overview

**The Serpent Kingdom** is a browser-based, action-packed roguelite game inspired by classic snake mechanics but elevated to modern standards. Play as the Ancient Abyssal Serpent, consume souls to grow, unlock eldritch abilities, and conquer Dimensional Bosses to reclaim your throne! 

Navigate treacherous realms, collect rare relics, upgrade your skill tree, and rise on the global leaderboards in this highly replayable survival experience. We've open-sourced this project to allow the community to build new biomes, enemies, and skills!

## 📸 Screenshots

<details>
<summary>Click to view screenshots of the game</summary>

| Main Dashboard | Gameplay / Combat | Skill Tree |
| :---: | :---: | :---: |
| <img src="https://placehold.co/600x400/1e1e2e/a6e3a1?text=Main+Dashboard" alt="Main Dashboard" width="300"/> | <img src="https://placehold.co/600x400/1e1e2e/f38ba8?text=Boss+Fight" alt="Boss Fight" width="300"/> | <img src="https://placehold.co/600x400/1e1e2e/89b4fa?text=Skill+Tree" alt="Skill Tree" width="300"/> |

</details>

---

## ✨ Features

### 🎮 Dynamic Action Gameplay
- **Silky Smooth Engine:** A heavily optimized 2D canvas-based engine running at 60+ FPS.
- **Responsive Controls:** Play anywhere. Supports desktop (WASD, Arrow Keys, Mouse follow) and mobile (Virtual Joystick/Touch).
- **Tactical Combat:** Bite enemies with your head or perform a "Whip" attack by curling your long tail around them!

### 🐉 Deep Roguelite Progression
- **Skill Tree:** Unlock powerful active abilities like *Cyclone*, *Divine Shield*, and *Slow Time*.
- **Talents:** Invest your gold into permanent passive upgrades to start stronger each run.
- **Relics & Artifacts:** Customize your build with gameplay-altering items found in the Vault.
- **Serpent Forms:** Change your visual appearance and gain unique elemental boosts (e.g., *Obsidian*, *Void*, *Infernal*).

### 👹 Epic Content
- **Boss Fights:** Survive until your score peaks and face off against formidable Boss Guardians with unique attack patterns (bullet hell mechanics!).
- **Multiple Biomes:** Explore distinct environments, from *The Abyss* and *Haunted Forest* to the *Frozen Kingdom* and *Volcanic Ruins*.
- **Achievements & Quests:** Complete daily missions and lifetime achievements to earn massive rewards.

### 🎓 Immersive Onboarding
- **UI Tour:** A cinematic, interactive UI tour explaining the progression systems.
- **Gameplay Tutorial:** A step-by-step interactive match that teaches movement, combat, abilities, and boss encounters.

---

## 🛠️ Tech Stack

This project leverages modern web technologies to deliver a high-performance gaming experience in the browser:

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Game Engine**: Custom HTML5 `<canvas>` API rendering
- **State Management**: React Hooks + Context / LocalStorage for persistent saves
- **Icons**: [Google Material Symbols](https://fonts.google.com/icons)
- **Deployment**: Optimized for standard static hosting (Vercel, Netlify, Cloud Run, GitHub Pages)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or newer) and `npm` installed.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/serpent-kingdom.git
   cd serpent-kingdom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The game will be available at `http://localhost:3000`.

### Building for Production

To create a production-ready, minified build:

```bash
npm run build
```
The compiled static files will be located in the `dist` directory, ready to be served by any static web server.

---

## 📁 Project Structure

```text
serpent-kingdom/
├── src/
│   ├── components/      # React components (Dashboard, Modals, Canvas)
│   │   ├── GameCanvas.tsx       # Core game engine and rendering loop
│   │   ├── MainDashboard.tsx    # Out-of-game progression UI
│   │   ├── UITourOverlay.tsx    # Interactive onboarding tour
│   │   └── ...
│   ├── lib/             # Utilities and Managers
│   │   ├── audio.ts             # Audio manager for BGM and SFX
│   │   └── ...
│   ├── App.tsx          # Main application entry point and state router
│   ├── index.css        # Tailwind CSS imports and global styles
│   ├── main.tsx         # React DOM renderer
│   └── types.ts         # TypeScript interfaces and game data definitions
├── public/              # Static assets (images, audio files)
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite build configuration
└── tailwind.config.js   # Tailwind theme definitions
```

---

## 🕹️ How to Play

1. **Movement**: Use `W`, `A`, `S`, `D`, `Arrow Keys`, or move your `Mouse` to steer. On mobile, touch and drag to use the virtual joystick.
2. **Collect Souls**: Devour glowing souls to grow your tail and earn score/gold.
    - 🟢 *Green*: Common (Score/Gold)
    - 🟡 *Gold*: Rare (High Gold)
    - 🔴 *Red*: Cursed (Bonus XP)
3. **Avoid Attacks**: Dodge enemy projectiles. Your head is vulnerable, but your body can withstand hits!
4. **Combat**: Defeat normal enemies by biting them or wrapping your body around them. This summons the Realm Boss sooner.
5. **Survive & Ascend**: Use your unlocked abilities (Dash, Shield, Cyclone), defeat the Realm Boss, and extract with your loot!

---

## 🤝 Contributing

We welcome contributions from the open-source community! Whether you are fixing a bug, adding a new Biome, creating a new Boss, or improving the documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally.
3. **Create a new branch** for your feature or bugfix (`git checkout -b feature/amazing-new-boss`).
4. **Make your changes** and test thoroughly.
5. **Commit your changes** with descriptive commit messages (`git commit -m 'Add amazing new Volcanic Boss'`).
6. **Push to the branch** (`git push origin feature/amazing-new-boss`).
7. **Open a Pull Request** against the `main` branch of this repository.

### Development Guidelines
- Please adhere to the existing code style (React functional components, Tailwind for styling).
- When adding new game entities (Enemies, Powerups), update `src/types.ts` and ensure the rendering logic in `GameCanvas.tsx` handles them efficiently.

---

## 🗺️ Roadmap

- [ ] **Multiplayer Leaderboards:** Integrate a real backend (e.g., Firebase) for global high scores.
- [ ] **Controller Support:** Add Gamepad API support for console controllers.
- [ ] **New Biomes:** Add *The Celestial Realm* and *The Sunken City*.
- [ ] **Modding API:** Expose hooks for the community to easily add custom Serpent Forms.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE) - see the LICENSE file for details. You are free to use, modify, and distribute this software.

---

## 🙏 Acknowledgements

- Inspired by classic snake and modern roguelite survival games.
- Icons provided by [Google Material Symbols](https://fonts.google.com/icons).
- UI inspiration from premium mobile and web titles.

<div align="center">
  <p>Crafted with ❤️ by the Serpent Kingdom Team</p>
</div>
