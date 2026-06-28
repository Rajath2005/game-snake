<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Version-1.0.0-orange.svg?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-38B2AC.svg?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</div>

<h1 align="center">
  <img src="public/favicon.svg" width="32" height="32" style="vertical-align: middle; margin-right: 12px; border-radius: 8px;" alt="Logo" />
  The Serpent Kingdom
</h1>

<div align="center">
  <p><strong>An epic, browser-based roguelite survival game built with React, Vite, and HTML5 Canvas.</strong></p>
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

**The Serpent Kingdom** is a highly polished, action-packed roguelite game inspired by classic snake mechanics, elevated to modern survival-action standards. You play as the Ancient Abyssal Serpent. Navigate treacherous realms, consume glowing souls to grow your body, unlock eldritch abilities, and conquer Dimensional Bosses to reclaim your lost throne! 

We've open-sourced this project to allow the community to build new biomes, enemies, and skills!

## 📸 In-Game Screenshots

<details open>
<summary><b>Click to toggle screenshots</b></summary>
<br/>

| **Camp Dashboard (Progression UI)** | **Intense Boss Battles** | **Deep Skill Trees** |
| :---: | :---: | :---: |
| <img src="https://placehold.co/600x400/0f172a/4ade80?text=Camp+Dashboard%0A%0AStats,+Artifacts,+Skins" alt="Camp Dashboard" /> | <img src="https://placehold.co/600x400/0f172a/f87171?text=Boss+Encounters%0A%0ABullet+Hell+%26+Dodging" alt="Boss Encounters" /> | <img src="https://placehold.co/600x400/0f172a/3b82f6?text=Skill+Trees%0A%0AChrono+Shift,+Ragnarok" alt="Skill Trees" /> |

*(Note: Screenshots are representative of the in-game UI. Run the project locally to see the stunning 60FPS particle effects and animations!)*
</details>

---

## ✨ Features & Game Systems

### 🎮 Dynamic Action Gameplay
- **Silky Smooth Engine:** A heavily optimized 2D canvas-based engine running at 60+ FPS with hundreds of active entities, particles, and projectiles.
- **Responsive Controls:** Play anywhere. Supports desktop (WASD, Arrow Keys, Mouse-follow) and mobile (Virtual Joystick and Touch controls).
- **Tactical Combat:** Bite enemies with your head or perform a "Whip" attack by curling your long tail around them!

### 🐉 Deep Roguelite Progression
- **Skill Tree:** Unlock powerful active abilities during your run, including *Fang Poison*, *Body Armor*, *Spark Magic*, *Chrono Shift*, *Blood Feast*, *Void Magnet*, *Ragnarok*, and *Serpent Tempest*.
- **Talents:** Invest your gold into permanent passive upgrades (*Max Health*, *Speed*, *Magnet Range*, *Soul Multiplier*) to start stronger each run.
- **Relics & Artifacts:** Customize your build with gameplay-altering items found in the Vault, such as the *Hourglass*, *Soul Urn*, *Crown of Greed*, *Phoenix Ash*, and the *Vampiric Skull*.
- **Serpent Skins (Forms):** Change your visual appearance and gain unique elemental boosts. Unlock forms like *Sovereign Obsidian*, *Jade Basilisk*, *Crimson Dread*, and *Shadow Hydra*.

### 👹 Epic Content
- **Boss Fights:** Survive the escalating waves and face off against formidable Boss Guardians with unique bullet-hell attack patterns.
- **Multiple Biomes:** Explore distinct environments with unique aesthetics: *The Abyss*, *Haunted Forest*, *Frozen Kingdom*, and *Volcanic Ruins*.
- **Achievements & Quests:** Complete daily missions and lifetime achievements to earn Gold, Souls, and rare Crystals. Features dynamic titles like *Soul Reaper* and *Eldritch Demigod*.

### 🎓 Immersive Onboarding
- **Cinematic UI Tour:** A cinematic, interactive interface tour explaining all progression systems to new players.
- **Gameplay Tutorial:** A step-by-step interactive match that teaches movement, combat, using abilities, and Boss encounters.

---

## 🛠️ Tech Stack

This project leverages modern Web technologies to deliver a high-performance gaming experience in the browser:

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Game Engine**: Custom HTML5 `<canvas>` rendering loop (Zero external game engine dependencies)
- **State Management**: React Hooks + Context + Persistent LocalStorage for game saves
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
│   ├── components/      # React components (UI panels, Modals, Canvas)
│   │   ├── GameCanvas.tsx       # Core game engine and rendering loop
│   │   ├── MainDashboard.tsx    # Out-of-game progression & Camp UI
│   │   ├── UITourOverlay.tsx    # Interactive onboarding tour
│   │   └── ...
│   ├── lib/             # Utilities and Managers
│   │   ├── audio.ts             # Audio manager for BGM and SFX
│   │   └── ...
│   ├── App.tsx          # Main application entry point and state router
│   ├── index.css        # Tailwind CSS imports and global styles
│   ├── main.tsx         # React DOM renderer
│   └── types.ts         # TypeScript interfaces and game data definitions
├── public/              # Static assets (images, audio files, favicon)
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite build configuration
└── tailwind.config.js   # Tailwind theme definitions
```

---

## 🕹️ How to Play

1. **Movement**: Use `W`, `A`, `S`, `D`, `Arrow Keys`, or move your `Mouse` to steer. On mobile, touch and drag anywhere to use the virtual joystick.
2. **Collect Souls**: Devour glowing souls dropped by enemies to grow your tail and earn score/gold.
    - 🟢 *Green*: Common (Score/Gold)
    - 🟡 *Gold*: Rare (High Gold)
    - 🔴 *Red*: Cursed (Bonus XP)
3. **Avoid Attacks**: Dodge enemy projectiles. Your head is vulnerable, but your body can withstand hits!
4. **Combat**: Defeat normal enemies by biting them or wrapping your body around them to crush them. This summons the Realm Boss sooner.
5. **Survive & Ascend**: Use your unlocked abilities, defeat the Realm Boss, and extract with your loot to upgrade your Serpent at the Camp!

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

- [ ] **Multiplayer Leaderboards:** Integrate a backend (e.g., Firebase) for global high scores.
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
