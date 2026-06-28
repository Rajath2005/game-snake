"""
GitHub Issue Auto-Creator for Rajath2005/game-snake
=====================================================
Creates 40+ beginner-friendly and advanced issues across all categories.

Usage:
    pip install requests
    python create_issues.py

You will be prompted for your GitHub Personal Access Token.
Token needs: repo scope (classic token) or issues:write (fine-grained token)
"""

import requests
import time
import sys
import getpass

# ─── CONFIG ────────────────────────────────────────────────────────────────────
REPO_OWNER = "Rajath2005"
REPO_NAME  = "game-snake"
BASE_URL   = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"

# Delay between API calls (seconds) — keeps you under GitHub's rate limit
API_DELAY  = 1.5
# ────────────────────────────────────────────────────────────────────────────────


# ─── LABEL DEFINITIONS ─────────────────────────────────────────────────────────
# Format: (name, color_hex, description)
LABELS = [
    # Difficulty
    ("good first issue",    "7057ff", "Perfect for first-time contributors"),
    ("beginner-friendly",   "d4c5f9", "Simple tasks ideal for beginners"),
    ("intermediate",        "e4e669", "Requires some familiarity with the codebase"),
    ("advanced",            "b60205", "Complex task for experienced contributors"),

    # Type
    ("bug",                 "d73a4a", "Something isn't working correctly"),
    ("enhancement",         "a2eeef", "New feature or improvement to existing feature"),
    ("documentation",       "0075ca", "Improvements or additions to documentation"),
    ("performance",         "f9d0c4", "Speed, memory, or rendering optimizations"),
    ("refactor",            "fef2c0", "Code cleanup without changing behavior"),
    ("UI/UX",               "c5def5", "User interface and experience improvements"),
    ("testing",             "bfd4f2", "Adding or improving tests"),
    ("security",            "e4e669", "Security-related improvements"),
    ("accessibility",       "0e8a16", "Making the game more accessible to all players"),

    # Domain
    ("gameplay",            "ff6b6b", "Core game mechanics and loop"),
    ("audio",               "ffdd59", "Sound effects and background music"),
    ("visual-effects",      "c2e0c6", "Particles, animations, and visual polish"),
    ("boss-fight",          "700000", "Boss encounter logic and design"),
    ("enemy-AI",            "5319e7", "Enemy behavior and pathfinding"),
    ("progression",         "006b75", "Skill tree, talents, prestige, XP systems"),
    ("mobile",              "fbca04", "Touch controls and mobile experience"),
    ("biome",               "1d76db", "Game environments and world design"),
    ("save-system",         "e99695", "LocalStorage and game state persistence"),
    ("multiplayer",         "b4a8ff", "Ghost replay and leaderboard features"),

    # Status
    ("help wanted",         "008672", "Extra attention needed — open to all"),
    ("up-for-grabs",        "0052cc", "Ready to be picked up by a contributor"),
    ("needs-discussion",    "e4e669", "Requires community input before implementation"),
    ("hacktoberfest",       "ff6900", "Valid Hacktoberfest contribution"),
]
# ────────────────────────────────────────────────────────────────────────────────


# ─── ISSUE DEFINITIONS ─────────────────────────────────────────────────────────
# Format: (title, body, labels_list)
ISSUES = [

    # ══════════════════════════════════════════════════════════════
    #  BEGINNER — DOCUMENTATION (5 issues)
    # ══════════════════════════════════════════════════════════════

    (
        "📝 Add real screenshots to README.md",
        """## Description
The README currently uses placeholder images from `placehold.co`. Real screenshots make the project look professional and attract more contributors and players.

## What needs to be done
- Visit the live demo at https://game-snake-modern.vercel.app
- Take 3 screenshots: the Camp Dashboard, an active gameplay moment, and the Skill Tree tab
- Replace the three placeholder `<img>` tags in `README.md` with the real screenshots
- Upload the images to an `Assets/screenshots/` folder in the repo

## Skills needed
- Basic Git (fork, clone, commit, push, pull request)
- No coding required!

## Resources
- [How to take a screenshot](https://support.microsoft.com/en-us/windows/use-snipping-tool-to-capture-screenshots)
- [How to upload files to GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

## Acceptance criteria
- [ ] Three real, high-quality screenshots added to `Assets/screenshots/`
- [ ] README.md updated to reference the new images
- [ ] Screenshots are at least 1200×700px
""",
        ["good first issue", "beginner-friendly", "documentation", "up-for-grabs", "hacktoberfest"]
    ),

    (
        "📝 Add a GIF demo to README.md showing gameplay",
        """## Description
A short animated GIF of the serpent moving, consuming souls, and fighting enemies is the single best way to hook visitors on the GitHub page.

## What needs to be done
- Record a 10–15 second gameplay clip
- Convert it to a GIF using a tool like [LICEcap](https://www.cockos.com/licecap/) or [ScreenToGif](https://www.screentogif.com/)
- Add the GIF near the top of README.md, right below the overview section

## Skills needed
- No coding required
- Basic Git workflow

## Acceptance criteria
- [ ] GIF is under 5MB
- [ ] GIF shows meaningful gameplay (movement + soul collection)
- [ ] Placed in `Assets/` folder and linked from README
""",
        ["good first issue", "beginner-friendly", "documentation", "up-for-grabs"]
    ),

    (
        "📝 Write a CONTRIBUTING.md guide",
        """## Description
There is no `CONTRIBUTING.md` file in this repo. New contributors don't know how to set up the project, code style rules, or how to submit a pull request properly.

## What needs to be done
Create `CONTRIBUTING.md` at the root of the repo covering:
1. Prerequisites (Node.js v18+, npm)
2. Fork → Clone → `npm install` → `npm run dev` steps
3. Branch naming convention (e.g. `feature/your-feature-name`)
4. Commit message format (e.g. `✨ Add: description`)
5. How to open a pull request
6. Code style notes (React functional components, Tailwind)

## Skills needed
- Markdown writing
- Basic understanding of the project setup

## Resources
- [Example CONTRIBUTING.md](https://github.com/nayafia/contributing-template)

## Acceptance criteria
- [ ] `CONTRIBUTING.md` file created at repo root
- [ ] Covers all 6 sections listed above
- [ ] Links back to this file from README.md
""",
        ["good first issue", "beginner-friendly", "documentation", "up-for-grabs", "hacktoberfest"]
    ),

    (
        "📝 Add JSDoc comments to all exported functions in types.ts",
        """## Description
`src/types.ts` defines all game data (Biomes, Talents, Skins, etc.) but has no comments explaining what each interface field means. New contributors and AI tools like Copilot struggle without this context.

## What needs to be done
Add a JSDoc comment above each exported `interface` and `const` array in `src/types.ts`. For example:

```typescript
/** Represents a game world environment with unique visuals and gameplay mechanics */
export interface Biome {
  /** Unique enum key used to identify this biome throughout the codebase */
  type: BiomeType;
  ...
}
```

## Skills needed
- Basic TypeScript knowledge
- Understanding of JSDoc syntax

## Acceptance criteria
- [ ] All exported interfaces have a JSDoc comment
- [ ] All interface fields have inline comments
- [ ] `npm run lint` passes with no errors
""",
        ["good first issue", "beginner-friendly", "documentation", "refactor"]
    ),

    (
        "📝 Create a CODE_OF_CONDUCT.md file",
        """## Description
This project welcomes contributors of all experience levels but has no Code of Conduct. Adding one makes the community feel safer and more welcoming, which is required to be listed on up-for-grabs.net.

## What needs to be done
- Copy the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) template
- Fill in the contact email placeholder with a project maintainer email
- Save as `CODE_OF_CONDUCT.md` at the repo root
- Add a link to it from README.md

## Skills needed
- No coding required

## Acceptance criteria
- [ ] `CODE_OF_CONDUCT.md` exists at repo root
- [ ] Contact email is filled in
- [ ] README links to it
""",
        ["good first issue", "beginner-friendly", "documentation", "up-for-grabs", "hacktoberfest"]
    ),

    # ══════════════════════════════════════════════════════════════
    #  BEGINNER — BUG FIXES (5 issues)
    # ══════════════════════════════════════════════════════════════

    (
        "🐛 README Quick Start instructions reference wrong clone URL",
        """## Description
The README `Getting Started` section says:
```bash
git clone https://github.com/yourusername/serpent-kingdom.git
```
This should reference the actual repo URL: `https://github.com/Rajath2005/game-snake.git`

## Steps to reproduce
1. Open README.md
2. Scroll to the "Installation" section
3. See `yourusername/serpent-kingdom` placeholder

## Fix
Replace the placeholder URL with the real repo URL in both the English and Chinese READMEs.

## Files to change
- `README.md` (line ~130)
- `README.zh-CN.md` (corresponding section)

## Skills needed
- Basic text editing
- Git workflow

## Acceptance criteria
- [ ] Both READMEs have the correct clone URL
""",
        ["good first issue", "beginner-friendly", "bug", "documentation", "up-for-grabs"]
    ),

    (
        "🐛 Game Over screen shows stale score of 0 on first run",
        """## Description
When a player dies for the very first time in a session, the Game Over screen briefly shows `Score: 000000` before updating to the real score. This is because `activeRunScore` state in `App.tsx` initializes to `0` and React batches the update.

## Steps to reproduce
1. Start the game fresh
2. Die immediately
3. Observe the Game Over screen showing `000000` for a split second

## Expected behavior
The real final score should appear immediately.

## Suggested fix
In `App.tsx`, set `activeRunScore` before `setShowGameOver(true)` and wrap in a `setTimeout(0)` or use `useLayoutEffect` to force synchronous update.

## Files to change
- `src/App.tsx` — `handleGameOver` function

## Skills needed
- Basic React hooks understanding

## Acceptance criteria
- [ ] Score displays correctly on first run Game Over screen
- [ ] No regression on subsequent runs
""",
        ["bug", "beginner-friendly", "good first issue", "gameplay", "up-for-grabs"]
    ),

    (
        "🐛 Mobile portrait mode warning overlaps game UI on landscape tablets",
        """## Description
The portrait mode warning in `GameCanvas.tsx` uses `portrait:flex` Tailwind class, which triggers on tablet devices held in portrait orientation even when the game is still playable. The breakpoint logic doesn't account for large-screen tablets.

## Steps to reproduce
1. Open the game on an iPad in portrait mode
2. The warning overlay appears even though the screen is wide enough

## Fix
Add a minimum width check alongside the portrait check: only show the warning if the screen is `portrait` AND `max-width: 600px`.

## Files to change
- `src/components/GameCanvas.tsx` — the portrait warning div class

## Skills needed
- Basic Tailwind CSS knowledge
- CSS media query understanding

## Acceptance criteria
- [ ] Warning does not appear on tablets with width > 600px in portrait
- [ ] Warning still appears on phones in portrait mode
""",
        ["bug", "beginner-friendly", "mobile", "UI/UX", "good first issue"]
    ),

    (
        "🐛 Daily challenge 'CLAIM' button doesn't disable after claiming",
        """## Description
After clicking the daily challenge claim button in the Quests tab, the button stays active and appears clickable. While the logic prevents double-claiming, the visual feedback is misleading.

## Steps to reproduce
1. Go to Missions tab
2. Claim the daily crystal reward
3. Notice the button still appears green and pressable

## Fix
In `MainDashboard.tsx`, the `dailyChallengeClaimed` state is checked correctly but the button animation class `animate-bounce` isn't removed after claiming. Add conditional rendering to replace the button with a "CLAIMED ✓" indicator.

## Files to change
- `src/components/MainDashboard.tsx`

## Skills needed
- Basic React conditional rendering

## Acceptance criteria
- [ ] Button shows "CLAIMED ✓" after claiming
- [ ] Button is visually disabled (no bounce animation)
- [ ] Refresh still shows correct state from localStorage
""",
        ["bug", "beginner-friendly", "UI/UX", "good first issue", "up-for-grabs"]
    ),

    (
        "🐛 Settings sliders don't update audio in real time on first load",
        """## Description
When the Settings screen opens for the first time in a session, moving the Master Volume slider doesn't produce immediate audio feedback. The `AudioManager.updateSettings()` is called but the `AudioContext` hasn't been initialized yet because no user interaction triggered `init()`.

## Steps to reproduce
1. Hard refresh the page
2. Immediately open Settings (don't click anything else)
3. Move the Master Volume slider — no audio feedback

## Fix
Call `AudioManager.resumeContext()` at the start of `SettingsScreen` component's `useEffect` or when the component mounts.

## Files to change
- `src/components/SettingsScreen.tsx`

## Skills needed
- React useEffect basics
- Web Audio API awareness (no deep knowledge needed)

## Acceptance criteria
- [ ] Audio responds to slider changes immediately when Settings opens
""",
        ["bug", "intermediate", "audio", "up-for-grabs"]
    ),

    # ══════════════════════════════════════════════════════════════
    #  BEGINNER — UI / UX (4 issues)
    # ══════════════════════════════════════════════════════════════

    (
        "✨ Add a keyboard shortcut legend to the How To Play tab",
        """## Description
The Help tab explains controls in prose but there's no visual keyboard shortcut reference card. New players frequently miss that `Q`, `E`, `Shift`, and `Space` trigger abilities.

## What needs to be done
Add a styled shortcut reference grid at the bottom of the Help tab in `MainDashboard.tsx`. Each shortcut should show a styled `<kbd>` element next to its action.

Example layout:
```
[SPACE] → Dash       [Q] → Cyclone
[E]     → Shield     [SHIFT] → Slow Time
[WASD]  → Steer      [P] → Pause
```

## Skills needed
- React JSX
- Basic Tailwind CSS

## Acceptance criteria
- [ ] Shortcut grid added to Help tab
- [ ] Uses `<kbd>` HTML element with styled appearance
- [ ] Mobile note included ("Use HUD buttons on mobile")
""",
        ["good first issue", "beginner-friendly", "UI/UX", "documentation", "up-for-grabs", "hacktoberfest"]
    ),

    (
        "✨ Add a loading progress percentage to the Loading Screen",
        """## Description
The loading bar in `LoadingScreen.tsx` shows a visual fill but the percentage number isn't always readable against the background. Also, when loading completes (100%), there's no success indication before transitioning.

## What needs to be done
1. Ensure the percentage text has a drop shadow for readability at all fill levels
2. When `progress === 100`, briefly show "ENTERING THE ABYSS..." text with a fade animation before `onFinishedLoading()` is called

## Files to change
- `src/components/LoadingScreen.tsx`

## Skills needed
- React state/useEffect basics
- CSS animation (Tailwind classes)

## Acceptance criteria
- [ ] Percentage is always readable
- [ ] Completion text appears for ~500ms before transition
""",
        ["good first issue", "beginner-friendly", "UI/UX", "visual-effects"]
    ),

    (
        "✨ Show total playtime on the Game Over screen",
        """## Description
Players have no way to know how long their run lasted. Adding a run timer makes the Game Over screen more informative and gives players a goal to beat.

## What needs to be done
1. Start a timer when gameplay begins in `App.tsx`
2. Stop it when `handleGameOver` is called
3. Pass the formatted duration (e.g. `2m 34s`) to `GameOver.tsx`
4. Display it alongside Score and XP Earned

## Files to change
- `src/App.tsx`
- `src/components/GameOver.tsx`

## Skills needed
- React useState / useRef
- Date/time arithmetic in JavaScript

## Acceptance criteria
- [ ] Run duration shown on Game Over screen
- [ ] Timer resets correctly on retry
- [ ] Format: `Xm Ys` (e.g. `3m 12s`)
""",
        ["good first issue", "beginner-friendly", "gameplay", "UI/UX", "up-for-grabs"]
    ),

    (
        "✨ Add tooltips to ability buttons in the Game HUD",
        """## Description
The four circular ability buttons (Dash, Slow, Shield, Cyclone) in the HUD have `title` attributes but these don't render on mobile and are hard to discover on desktop.

## What needs to be done
Add small floating tooltip labels that appear on hover (desktop) and on long-press (mobile) showing:
- Ability name
- Hotkey
- Brief description (1 line)

## Files to change
- `src/components/GameHUD.tsx`

## Skills needed
- React event handlers (onMouseEnter, onMouseLeave, onTouchStart)
- Tailwind CSS positioning

## Acceptance criteria
- [ ] Tooltips appear on hover for all 4 ability buttons
- [ ] Tooltips don't block gameplay area
- [ ] Tooltips are styled consistently with the dark fantasy theme
""",
        ["beginner-friendly", "UI/UX", "mobile", "good first issue"]
    ),

    # ══════════════════════════════════════════════════════════════
    #  INTERMEDIATE — GAMEPLAY FEATURES (8 issues)
    # ══════════════════════════════════════════════════════════════

    (
        "✨ Implement a Run History tracker showing last 10 runs",
        """## Description
Players have no way to review past runs. A Chronicle/History tab showing the last 10 runs with key stats creates engagement and replay motivation.

## What needs to be done
1. In `App.tsx`, after each run ends, append a run summary object to a `runHistory` array in `saveState`
2. Each entry should include: biome, score, duration, enemies killed, boss defeated (bool), timestamp
3. Add a "Chronicle" section to the existing Quests tab or create a new tab
4. Render the history as a scrollable list with a mini stat summary per run

## Data shape (add to GameSaveState in types.ts):
```typescript
runHistory: Array<{
  biome: string;
  score: number;
  duration: number; // seconds
  enemiesKilled: number;
  bossDefeated: boolean;
  timestamp: string; // ISO date
}>;
```

## Files to change
- `src/types.ts`
- `src/App.tsx`
- `src/components/MainDashboard.tsx`

## Acceptance criteria
- [ ] Last 10 runs stored in localStorage
- [ ] History renders correctly with proper formatting
- [ ] Oldest entry removed when 11th run completes (sliding window)
""",
        ["enhancement", "intermediate", "gameplay", "progression", "save-system", "up-for-grabs"]
    ),

    (
        "✨ Add a Boons & Curses system at the start of each run",
        """## Description
Before a run starts, present the player with 3 randomly rolled Boons (positive modifiers) and 1 mandatory Curse. This is the core mechanic in Hades and Dead Cells and dramatically increases run variety.

## Example Boons
- "Gilded Souls: All souls yield +50% gold coins"
- "Swift Coils: +0.8 base movement speed"
- "Iron Hide: Start with 20 bonus max HP"

## Example Curses
- "Frenzy: All enemies move 30% faster"
- "Glass Scales: You take 50% more damage"
- "Soul Drought: 30% fewer souls spawn"

## What needs to be done
1. Create `src/data/boons.ts` and `src/data/curses.ts` with 8+ entries each
2. Add a `RunModifierScreen` component shown between Camp and Gameplay
3. Randomize 3 boons + 1 curse per run
4. Apply the selected modifiers as parameters passed into `GameCanvas`

## Files to create/change
- `src/data/boons.ts` (new)
- `src/data/curses.ts` (new)
- `src/components/RunModifierScreen.tsx` (new)
- `src/App.tsx`
- `src/components/GameCanvas.tsx`

## Acceptance criteria
- [ ] Screen appears before every run
- [ ] Boons and curse are randomized (no duplicates)
- [ ] Modifiers visibly affect gameplay
- [ ] Can be skipped with "Enter Without Boons" button
""",
        ["enhancement", "intermediate", "gameplay", "UI/UX", "help wanted"]
    ),

    (
        "✨ Add a Pause Menu with 'Abandon Run' option",
        """## Description
The current pause screen only has "Resume Journey" and "Flee to Camp" buttons. A proper pause menu should also show: current run stats, active modifiers, and a clear "Abandon Run" confirmation flow.

## What needs to be done
Expand the pause overlay in `App.tsx` to include:
1. Run duration so far
2. Current score
3. Souls collected this run
4. Enemies killed this run
5. "Abandon Run" button with a confirmation dialog before returning to camp

## Files to change
- `src/App.tsx` (pause overlay section)
- `src/components/GameCanvas.tsx` (expose live stats via ref or event)

## Acceptance criteria
- [ ] Pause menu shows all 4 live stats
- [ ] "Abandon Run" requires confirmation click
- [ ] Stats update correctly on unpause
""",
        ["enhancement", "intermediate", "gameplay", "UI/UX", "up-for-grabs"]
    ),

    (
        "✨ Add Gamepad / Controller support via Gamepad API",
        """## Description
Many players prefer using a controller. The Web Gamepad API is widely supported and would let players use a PS4/PS5/Xbox controller to play.

## Control mapping
- Left stick → serpent steering (with dead zone)
- Right bumper (R1/RB) → Dash
- Left bumper (L1/LB) → Slow Time
- Triangle/Y → Shield
- Square/X → Cyclone
- Start/Options → Pause

## What needs to be done
1. Add gamepad polling in a `useEffect` in `GameCanvas.tsx` using `navigator.getGamepads()`
2. Map axis values to `stateRef.current.headingAngle` with a configurable dead zone (default 0.15)
3. Map button presses to `onActivateAbility` calls
4. Add a "Controller Connected" toast notification in `GameHUD.tsx`

## Resources
- [MDN Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API)

## Acceptance criteria
- [ ] Left stick steers the serpent
- [ ] All 4 ability buttons mapped
- [ ] Dead zone prevents drift
- [ ] Connection/disconnection is detected and shown to user
""",
        ["enhancement", "intermediate", "gameplay", "mobile", "help wanted"]
    ),

    (
        "✨ Add an in-run Mutation Event system (soul milestone rewards)",
        """## Description
Every 15 souls consumed, trigger a "Mutation Event" — pause the game and offer 3 random gameplay mutations to pick from. This creates emergent runs that feel different every time.

## Example Mutations
- "Spore Trail: Leave poison puddles when moving fast"
- "Ricochet Fangs: Projectiles bounce off your body"
- "Gravity Well: Souls teleport to you within 200px"
- "Ghost Scales: Temporary 2-second invulnerability after taking damage"

## What needs to be done
1. Create `src/data/mutations.ts` with 12+ mutation definitions
2. In `GameCanvas.tsx`, track `soulsCollected` and trigger mutation offer at multiples of 15
3. Pause the game loop, render a mutation picker overlay over the canvas
4. Apply the chosen mutation as a runtime modifier on game state

## Files to create/change
- `src/data/mutations.ts` (new)
- `src/components/MutationPickerOverlay.tsx` (new)
- `src/components/GameCanvas.tsx`

## Acceptance criteria
- [ ] Mutation picker appears every 15 souls
- [ ] 3 random mutations shown (no duplicates in one run)
- [ ] Chosen mutation visibly affects gameplay
- [ ] Max 5 mutations can be stacked per run
""",
        ["enhancement", "advanced", "gameplay", "help wanted"]
    ),

    (
        "✨ Implement environmental hazards for each biome",
        """## Description
Currently biomes are only cosmetic — they look different but play identically. Making each biome mechanically distinct is the highest-impact gameplay change possible.

## Proposed hazards per biome
| Biome | Hazard |
|-------|--------|
| Frozen Kingdom | Ice patches slow turning radius by 40% for 2s |
| Volcanic Ruins | Lava streams spawn randomly, deal 5 HP/sec |
| Poison Swamp | Fog zone moves across arena; enemies in it gain +20% speed |
| Haunted Forest | Static tree obstacles force path changes |

## What needs to be done
1. Add a `hazards: HazardZone[]` array to `stateRef` in `GameCanvas.tsx`
2. Implement a `spawnHazard()` function per biome type
3. Render hazard zones on canvas (colored translucent rectangles/circles)
4. Apply mechanical effects on serpent head collision

## Acceptance criteria
- [ ] Each biome has at least 1 unique environmental hazard
- [ ] Hazards are visually distinct and readable
- [ ] Hazards spawn/despawn dynamically during a run
""",
        ["enhancement", "advanced", "gameplay", "biome", "visual-effects", "help wanted"]
    ),

    (
        "✨ Add a cinematic slow-motion death replay",
        """## Description
When the player dies, record the last 5 seconds of game state and replay it at 0.15× speed with a desaturating color filter, then fade into the Game Over screen. This is the most viral-shareable feature possible — it's in Celeste, Cuphead, and Hades.

## What needs to be done
1. In `GameCanvas.tsx`, maintain a circular buffer of the last 300 frames of game state (serpent position, enemy positions, projectile positions)
2. On player death, switch to "replay mode" — render from the buffer at 15% speed
3. Apply a grayscale CSS filter that intensifies over the replay duration
4. After replay completes, call `onGameOver`

## Technical notes
- Buffer should store minimal data: head position, heading angle, 5 nearest enemies, active projectiles only
- Use `ctx.filter = 'grayscale(X%)'` for the desaturation effect

## Acceptance criteria
- [ ] Death triggers 5-second replay at 0.15× speed
- [ ] Replay shows the killing blow clearly
- [ ] Grayscale filter intensifies during replay
- [ ] Smooth transition to Game Over screen after replay
""",
        ["enhancement", "advanced", "gameplay", "visual-effects", "help wanted"]
    ),

    (
        "✨ Add combo chain visual escalation effects",
        """## Description
The combo multiplier exists but the visual feedback is minimal (just a number on screen). High combos should feel like a power fantasy escalation.

## What needs to be done
| Combo | Effect |
|-------|--------|
| ×3 | Serpent body crackles with combo color electricity |
| ×5 | Attack radius visibly expands with aura pulse ring |
| ×7 | Screen border glows with combo color |
| ×10 | "SOVEREIGN MODE" tear-across text, 8s invulnerability, 3× score multiplier |

## Files to change
- `src/components/GameCanvas.tsx` (rendering + game logic)
- `src/components/GameHUD.tsx` (combo display upgrade)

## Acceptance criteria
- [ ] Each combo threshold has a distinct visual effect
- [ ] SOVEREIGN MODE at ×10 grants temporary buffs
- [ ] Combo resets correctly after 3 seconds of no collection
- [ ] Effects don't cause frame rate drops (check particle pool usage)
""",
        ["enhancement", "intermediate", "visual-effects", "gameplay", "UI/UX", "up-for-grabs"]
    ),

    # ══════════════════════════════════════════════════════════════
    #  INTERMEDIATE — AUDIO (3 issues)
    # ══════════════════════════════════════════════════════════════

    (
        "✨ Add unique background music themes per biome",
        """## Description
The `AudioManager` has a `setBiomeAmbience()` function that changes ambient layers, but the BGM sequencer plays the same chord progression regardless of biome. Each biome should have a distinct musical feel.

## Proposed themes
| Biome | Musical Style |
|-------|--------------|
| Frozen Kingdom | Sparse, high-register, slow arpeggio in D minor |
| Volcanic Ruins | Heavy, distorted, fast-paced in A Phrygian |
| Haunted Forest | Diminished chords, tritone intervals, chromatic tension |
| The Abyss | Current ambient style (baseline) |

## Files to change
- `src/lib/audio.ts` — `playSequencerStep()` and `setBiomeAmbience()`

## Acceptance criteria
- [ ] BGM chord progression changes based on active biome
- [ ] Transition between biomes crossfades smoothly (no audio pop)
- [ ] Boss music remains the same across biomes
""",
        ["enhancement", "intermediate", "audio", "biome", "up-for-grabs"]
    ),

    (
        "✨ Add positional audio — enemy sounds louder when close to serpent",
        """## Description
All sound effects play at the same volume regardless of distance. Using the Web Audio API's `PannerNode`, sounds from nearby enemies should be louder and spatially positioned.

## What needs to be done
1. Add a helper `createSpatialSource(x, y, listenerX, listenerY)` in `audio.ts`
2. Calculate a volume coefficient based on distance: `vol = Math.max(0, 1 - dist/500)`
3. Apply to: boss projectile fire sounds, knight charge sounds, necromancer summon sounds

## Resources
- [MDN PannerNode](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode)

## Acceptance criteria
- [ ] Enemy sounds attenuate with distance from serpent head
- [ ] Max distance (500px) results in silence
- [ ] No performance impact (check in browser profiler)
""",
        ["enhancement", "intermediate", "audio", "performance"]
    ),

    (
        "✨ Add a mute all / toggle music separately from SFX in HUD",
        """## Description
During gameplay there's no way to quickly mute without opening the Settings screen. A small speaker icon in the HUD that toggles between mute/unmute would be very helpful, especially for players in public spaces.

## What needs to be done
1. Add a mute toggle button to `GameHUD.tsx` (top-right area, near the Pause button)
2. Clicking it calls `AudioManager.updateSettings({ masterVolume: 0 })` or restores the previous volume
3. Store mute state in a `useRef` so it persists without going through localStorage

## Acceptance criteria
- [ ] Mute button visible in HUD during gameplay
- [ ] Toggle works instantly
- [ ] Unmuting restores previous volume level
- [ ] Icon changes between 🔊 and 🔇
""",
        ["good first issue", "beginner-friendly", "audio", "UI/UX", "up-for-grabs", "hacktoberfest"]
    ),

    # ══════════════════════════════════════════════════════════════
    #  INTERMEDIATE — PERFORMANCE & REFACTOR (5 issues)
    # ══════════════════════════════════════════════════════════════

    (
        "⚡ Extract GameCanvas game logic into a separate useGameLoop hook",
        """## Description
`GameCanvas.tsx` is currently ~1,400 lines combining physics, AI, rendering, audio triggers, and input into one massive `useEffect`. This makes it impossible to unit test and very hard for new contributors to navigate.

## What needs to be done
Extract the following into separate hooks/modules:
1. `src/hooks/useGameLoop.ts` — RAF scheduling, delta time, pause logic
2. `src/hooks/useInputManager.ts` — keyboard, mouse, touch state
3. `src/game/enemyAI.ts` — all enemy movement and state machine logic
4. `src/game/renderer.ts` — all `ctx.drawXxx()` calls

`GameCanvas.tsx` then becomes a thin coordinator that wires these together.

## Why this matters
- Enables unit testing of enemy AI without rendering
- Makes Copilot suggestions much more accurate (smaller context window per file)
- Opens the codebase to contributors who can't parse 1400-line files

## Acceptance criteria
- [ ] `GameCanvas.tsx` is under 300 lines after extraction
- [ ] All extracted modules are TypeScript typed
- [ ] Game behavior is identical before and after refactor
- [ ] `npm run lint` passes
""",
        ["refactor", "advanced", "performance", "help wanted"]
    ),

    (
        "⚡ Reduce unnecessary re-renders in MainDashboard using React.memo",
        """## Description
`MainDashboard.tsx` re-renders completely whenever any `saveState` field changes — even tiny changes like `dailyChallengeClaimed` trigger a full re-render of all tabs including the skin shop image grid.

## What needs to be done
1. Wrap each tab's component with `React.memo()`
2. Extract the Biomes tab, Shop tab, Skills tab, Quests tab into separate files in `src/components/tabs/`
3. Use `useMemo` for expensive computations (talent cost calculations, owned checks)
4. Profile before and after using React DevTools to confirm improvement

## Acceptance criteria
- [ ] Each tab component wrapped in `React.memo`
- [ ] React DevTools shows reduced re-render count on unrelated state changes
- [ ] No visual regression
""",
        ["performance", "refactor", "intermediate", "up-for-grabs"]
    ),

    (
        "⚡ Add FPS counter overlay (debug mode) to GameCanvas",
        """## Description
There's no way to measure actual runtime FPS during gameplay. A debug overlay that shows FPS (toggled with `F3` or a config flag) would help contributors catch performance regressions.

## What needs to be done
1. Track frame time delta in the game loop
2. Calculate rolling average FPS over 60 frames
3. Render it as text in the top-left corner when `?debug=true` is in the URL
4. Color code: green (>50fps), yellow (30–50fps), red (<30fps)

## Acceptance criteria
- [ ] FPS counter appears when `?debug=true` in URL
- [ ] Color coding works correctly
- [ ] Counter doesn't affect game performance itself
- [ ] Normal play (no debug flag) shows nothing
""",
        ["enhancement", "intermediate", "performance", "up-for-grabs"]
    ),

    (
        "⚡ Lazy-load the MainDashboard tabs to reduce initial render time",
        """## Description
All 10 dashboard tabs render on mount even when only the Biomes tab is visible. This adds ~200ms to initial camp screen load.

## What needs to be done
Use React's `lazy()` + `Suspense` to code-split each tab into its own chunk:
```tsx
const SkillsTab = React.lazy(() => import('./tabs/SkillsTab'));
```
Wrap the tab content area in `<Suspense fallback={<TabSkeleton />}>`.

## Acceptance criteria
- [ ] Each tab is a separate lazy-loaded chunk
- [ ] Loading skeleton shown while tab chunk loads
- [ ] Initial bundle size reduced (verify with `npm run build` output)
- [ ] No tab switching jank
""",
        ["performance", "refactor", "intermediate"]
    ),

    (
        "⚡ Implement object pooling for FloatingText and GlowingRing arrays",
        """## Description
`floatingTexts` and `glowingRings` arrays in the game loop grow and shrink every frame using filter/push, which generates garbage for the GC. This causes micro-stutters on mobile at high soul collection rates.

The particle system already uses a pool (`particles` array with `active` flag). Apply the same pattern to these two arrays.

## What needs to be done
1. Pre-allocate `floatingTexts` as a pool of 50 objects with an `active` flag
2. Pre-allocate `glowingRings` as a pool of 30 objects
3. Replace all `s.floatingTexts.push(...)` calls with a `spawnFloatingText()` helper
4. Replace compaction filter with in-place index-based loop (like the soul compaction already does)

## Acceptance criteria
- [ ] No `Array.filter()` or unbounded `push()` in the game hot loop
- [ ] Frame time variance reduced on mobile (test with Chrome DevTools Performance tab)
""",
        ["performance", "advanced", "gameplay", "help wanted"]
    ),

    # ══════════════════════════════════════════════════════════════
    #  ADVANCED — NEW FEATURES (8 issues)
    # ══════════════════════════════════════════════════════════════

    (
        "✨ Implement Firebase Realtime Database for global leaderboard",
        """## Description
The leaderboard button currently shows a placeholder alert. Implement a real global leaderboard using Firebase Realtime Database.

## What needs to be done
1. Set up a Firebase project (free Spark plan works)
2. Install `firebase` npm package
3. On run end, if score > 0, write `{ username, score, biome, timestamp }` to `/leaderboard/{uid}`
4. In the MainDashboard, add a Leaderboard tab that reads top 20 scores
5. Show: rank, username (from localStorage nickname or "Anonymous"), score, biome

## Security
- Use Firebase security rules to allow write-own, read-all
- Rate-limit writes to 1 per 60 seconds per session

## Acceptance criteria
- [ ] Scores appear on leaderboard within 5 seconds of run end
- [ ] Top 20 scores shown, sorted by score descending
- [ ] Works without requiring user login
- [ ] Fails gracefully when offline (shows "Offline" state)
""",
        ["enhancement", "advanced", "multiplayer", "progression", "help wanted"]
    ),

    (
        "✨ Add ghost replay system using Firebase — compete against top run",
        """## Description
After implementing the leaderboard, add a ghost replay feature: the top scorer's serpent path is replayed as a semi-transparent ghost alongside the current player.

## What needs to be done
1. When a run starts, fetch the #1 leaderboard entry's path data from Firebase
2. The path data is a series of `{x, y, angle, timestamp}` snapshots recorded every 3 frames
3. During gameplay, interpolate and render the ghost serpent using the stored path
4. Ghost is rendered at 30% opacity with a white/silver color tint

## Data format (stored in Firebase `/ghosts/{uid}`)
```json
{
  "biome": "Abyss",
  "score": 142000,
  "frames": [{"x": 1200, "y": 900, "angle": 0.5}, ...]
}
```

## Acceptance criteria
- [ ] Ghost appears at the same biome as the current run
- [ ] Ghost path is visually distinct (silver/translucent)
- [ ] Ghost disappears when player dies or exits
- [ ] Max 500 frames stored per ghost (to limit Firebase read size)
""",
        ["enhancement", "advanced", "multiplayer", "visual-effects", "help wanted"]
    ),

    (
        "✨ Build a Procedural Boss Generator — unique boss every run",
        """## Description
The current boss is hardcoded with 3 phases and fixed attack patterns. Build a `BossGenerator` that creates a unique boss each run by combining from a pool of components.

## Component pools
**Body type:** Teleporter, Charger, Circler, Stationary  
**Attack patterns:** 8-way spread, aimed triple, rotating ring, homing orbs  
**Phase triggers:** HP thresholds (70%, 40%) or time-based  
**Summon type:** Skeleton wave, Wolf pack, Archer volley  

## What needs to be done
1. Create `src/game/bossGenerator.ts`
2. Seed the generator with `runNumber + biomeType` for deterministic results
3. Generate a `BossConfig` object with body type, 2 attack patterns, 2 phase transitions
4. Modify `spawnBoss()` in `GameCanvas.tsx` to use the config
5. Show the generated boss's "name" (combine adjective + noun from pool) in the boss bar

## Acceptance criteria
- [ ] Boss composition is different every run
- [ ] Same seed always produces same boss (deterministic)
- [ ] All attack patterns are functional and balanced
- [ ] Boss name displayed in health bar
""",
        ["enhancement", "advanced", "boss-fight", "gameplay", "help wanted"]
    ),

    (
        "✨ Add Gemini AI adaptive difficulty governor",
        """## Description
Use the Gemini API (already in package.json as `@google/genai`) to dynamically adjust game difficulty based on player performance history.

## How it works
After each run, call Gemini with a summary prompt:
```
Player stats: avg score 8000, dies within 60s, combo never exceeds x3, 
enemies killed: 5 per run. Suggest difficulty parameters as JSON.
```
Gemini responds with:
```json
{
  "enemySpeedMultiplier": 0.85,
  "soulSpawnRate": 1.2,
  "bossSpawnThreshold": 20000
}
```
Apply these as config overrides for the next run.

## What needs to be done
1. Create `src/lib/difficultyGovernor.ts`
2. Collect last 5 runs from run history
3. Build Gemini prompt from stats
4. Parse JSON response and save to saveState
5. Apply overrides in `GameCanvas.tsx` where enemy speed and spawn rates are defined

## Acceptance criteria
- [ ] Gemini called once after every 3rd run
- [ ] Difficulty adjusts measurably based on performance
- [ ] Fallback to default values if API call fails
- [ ] Console.log the AI's reasoning in dev mode
""",
        ["enhancement", "advanced", "gameplay", "help wanted"]
    ),

    (
        "✨ Add a 2-player local split-screen mode",
        """## Description
Add an optional 2-player local co-op mode where two serpents share the same arena. Player 1 uses WASD, Player 2 uses arrow keys. Souls are shared. Both must survive.

## Game rules
- Both serpents share a single HP pool (or each has their own — open for discussion)
- If one serpent dies, the run ends for both
- Score multiplier bonus when both players have long combos simultaneously
- Special "Twin Serpent" soul type spawns that can only be collected by a specific player

## What needs to be done
1. Add `gameMode: 'solo' | 'coop'` to GameSaveState
2. Add mode selection to the Portal selection screen
3. In `GameCanvas.tsx`, extend `stateRef` to support a second serpent
4. Render Player 2 serpent in a different skin color (blue instead of gold)
5. Separate input: Player 1 = WASD/mouse, Player 2 = Arrow keys

## Acceptance criteria
- [ ] Mode selectable from Camp before run
- [ ] Two serpents render correctly without z-fighting
- [ ] Both serpents can collect souls and deal damage
- [ ] Game over triggers when either serpent dies
""",
        ["enhancement", "advanced", "gameplay", "multiplayer", "help wanted", "needs-discussion"]
    ),

    (
        "✨ Implement a Dungeon Challenge Mode with daily fixed seed",
        """## Description
Add a "Daily Challenge" mode where all players worldwide get the exact same run seed on a given day (same enemies, same soul spawns, same boss). This creates natural competition and community discussion.

## How seeding works
- Seed = `YYYYMMDD` as an integer
- All RNG calls in the game loop use a seeded pseudo-random function instead of `Math.random()`
- Same seed → same run, every time, for every player

## What needs to be done
1. Implement a seeded PRNG (e.g. mulberry32 or xorshift32) in `src/lib/seededRandom.ts`
2. Replace all `Math.random()` calls in `GameCanvas.tsx` with the seeded version when in challenge mode
3. Add "Daily Challenge" button to the Camp screen
4. After the run, show a shareable "Daily Challenge Result" card

## Acceptance criteria
- [ ] Same date always produces identical run
- [ ] Standard runs are unaffected (still use Math.random())
- [ ] Result card shows score, rank hint, and date
- [ ] Challenge resets at midnight UTC
""",
        ["enhancement", "advanced", "gameplay", "multiplayer", "help wanted"]
    ),

    (
        "✨ Add WebGL particle renderer for 5000+ simultaneous particles",
        """## Description
The current Canvas 2D particle system caps out around 1,500 particles before causing frame drops. A WebGL-based particle renderer would support 10,000+ particles, enabling boss explosions and large-scale visual effects that aren't currently possible.

## Approach
Use `OffscreenCanvas` in a Web Worker running raw WebGL2:
1. Main thread sends particle data as `Float32Array` via `postMessage` (transferable)
2. Worker renders particles as point sprites using a simple GLSL shader
3. Worker `requestAnimationFrame` drives the render loop independently

## What needs to be done
1. Create `src/workers/particleWorker.ts`
2. Write vertex + fragment shaders for point sprite rendering
3. Modify `GameCanvas.tsx` to transfer particle array each frame
4. Test that main thread frame time drops below 2ms for particle rendering

## Resources
- [WebGL point sprites tutorial](https://webglfundamentals.org/webgl/lessons/webgl-points-lines-triangles.html)

## Acceptance criteria
- [ ] 5,000 particles render at 60fps on a mid-range laptop
- [ ] Main thread frame time < 2ms for particle submission
- [ ] Particles appear visually identical to current Canvas 2D implementation
""",
        ["enhancement", "advanced", "performance", "visual-effects", "help wanted"]
    ),

    (
        "✨ Build a Modding API — allow community to add custom Serpent Forms",
        """## Description
The roadmap mentions a Modding API. Implement a JSON-based plugin system where contributors can add new Serpent Forms without touching core source code.

## Plugin format (`public/mods/my-form.json`)
```json
{
  "id": "void_basilisk",
  "name": "Void Basilisk",
  "description": "A form from the between-spaces.",
  "color": "#6b21a8",
  "headColor": "#a855f7",
  "startingLength": 20,
  "speedMultiplier": 1.1,
  "damageMultiplier": 0.9,
  "unlockedAtPrestige": 0,
  "cost": 2000,
  "costType": "Gold"
}
```

## What needs to be done
1. Create a `ModLoader` class in `src/lib/modLoader.ts` that fetches JSON files from `public/mods/`
2. Merge loaded mods into `ALL_FORMS` array at app startup
3. Add a "Community Mods" section in the Forms tab showing mod-sourced forms distinctly
4. Document the plugin format in `docs/modding.md`

## Acceptance criteria
- [ ] Place a JSON file in `public/mods/` → form appears in game
- [ ] Invalid JSON is caught and logged gracefully
- [ ] `docs/modding.md` explains the full format
- [ ] Mod forms are visually tagged as "Community Mod"
""",
        ["enhancement", "advanced", "gameplay", "documentation", "help wanted", "needs-discussion"]
    ),

    # ══════════════════════════════════════════════════════════════
    #  ACCESSIBILITY & MOBILE (4 issues)
    # ══════════════════════════════════════════════════════════════

    (
        "♿ Add colorblind-friendly soul color modes",
        """## Description
The three soul types (green, red/cursed, gold) rely entirely on color to differentiate them. Players with red-green colorblindness cannot distinguish the green and red souls.

## What needs to be done
Add a "Colorblind Mode" toggle in Settings that changes:
- Green souls → Blue circles
- Red/cursed souls → Orange diamonds (shape change + color)
- Gold souls → White stars (shape change + color)

The shape changes ensure accessibility even for those who can't distinguish colors at all.

## Files to change
- `src/types.ts` — add `colorblindMode: boolean` to GameSettings
- `src/components/SettingsScreen.tsx` — add toggle
- `src/lib/audio.ts` — (no change needed)
- `src/components/GameCanvas.tsx` — conditional soul rendering

## Acceptance criteria
- [ ] Colorblind mode toggle in Settings
- [ ] All 3 soul types distinguishable by shape alone
- [ ] Setting persists across sessions
""",
        ["accessibility", "enhancement", "intermediate", "up-for-grabs", "help wanted"]
    ),

    (
        "♿ Add ARIA labels and keyboard navigation to all Camp dashboard tabs",
        """## Description
The dashboard tab buttons in `MainDashboard.tsx` have no `aria-label`, `role`, or keyboard navigation attributes. Screen reader users cannot navigate the camp UI.

## What needs to be done
1. Add `role="tablist"` to the tab navigation container
2. Add `role="tab"` and `aria-selected` to each tab button
3. Add `role="tabpanel"` and `aria-labelledby` to each tab content area
4. Implement keyboard navigation: Left/Right arrows switch tabs, Enter/Space selects
5. Add `aria-live="polite"` to the currency display so screen readers announce changes

## Resources
- [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

## Acceptance criteria
- [ ] All tabs navigable by keyboard alone
- [ ] Screen reader announces active tab correctly
- [ ] Focus indicator visible on all interactive elements
""",
        ["accessibility", "intermediate", "UI/UX", "up-for-grabs"]
    ),

    (
        "📱 Improve virtual joystick — add haptic feedback on direction change",
        """## Description
The virtual joystick works but doesn't provide tactile feedback on mobile. Adding vibration when the joystick crosses the dead zone threshold makes the control feel more physical and responsive.

## What needs to be done
In `GameCanvas.tsx`, `handleTouchMove()`:
1. Track previous joystick direction (8 cardinal + diagonal sectors)
2. When the sector changes, call `navigator.vibrate(8)` (short pulse)
3. On joystick release (`handleTouchEnd`), call `navigator.vibrate(5)`
4. Respect the `settings.hapticFeedback` toggle

## Acceptance criteria
- [ ] Vibration occurs on direction sector change
- [ ] Respects the haptic feedback setting
- [ ] No vibration on devices that don't support it (graceful fallback)
- [ ] Doesn't vibrate more than once per 100ms (debounced)
""",
        ["enhancement", "beginner-friendly", "mobile", "accessibility", "good first issue"]
    ),

    (
        "📱 Add swipe-to-switch-tabs gesture on mobile for the Camp dashboard",
        """## Description
On mobile, switching between the 10 dashboard tabs requires scrolling a horizontal tab bar and tapping. Adding a horizontal swipe gesture on the tab content area would make navigation much faster.

## What needs to be done
In `MainDashboard.tsx`:
1. Track `touchStart` X position on `onTouchStart`
2. On `onTouchEnd`, calculate delta X
3. If `|deltaX| > 50px` and swipe duration < 300ms: switch to next/previous tab
4. Add a brief slide animation (CSS transform) in the tab content

## Acceptance criteria
- [ ] Left swipe → next tab, right swipe → previous tab
- [ ] Swipe works across all 10 tabs (wraps from last to first)
- [ ] Vertical scrolling within a tab is unaffected
- [ ] No accidental tab switches during vertical scroll
""",
        ["enhancement", "intermediate", "mobile", "UI/UX", "up-for-grabs"]
    ),

    # ══════════════════════════════════════════════════════════════
    #  TESTING (3 issues)
    # ══════════════════════════════════════════════════════════════

    (
        "🧪 Set up Vitest and write unit tests for src/types.ts constants",
        """## Description
There are no tests in this project. Setting up a basic test framework and testing the static data in `types.ts` is the safest starting point — no DOM or canvas required.

## What needs to be done
1. Install Vitest: `npm install -D vitest`
2. Add `"test": "vitest"` to package.json scripts
3. Create `src/__tests__/types.test.ts`
4. Write tests for:
   - `BIOMES` array has 5 entries and all have valid `unlockedAtSouls` values
   - `INITIAL_TALENTS` all have `maxLevel > 0` and `baseCost > 0`
   - `INITIAL_SAVE_STATE` has correct default values
   - `ALL_SKINS` has at least one skin with `cost === 0` (the default)

## Resources
- [Vitest docs](https://vitest.dev/guide/)

## Acceptance criteria
- [ ] `npm test` runs and passes all tests
- [ ] At least 10 test cases covering types.ts
- [ ] CI workflow added (`.github/workflows/test.yml`) that runs tests on every PR
""",
        ["testing", "beginner-friendly", "good first issue", "up-for-grabs", "hacktoberfest"]
    ),

    (
        "🧪 Write unit tests for AudioManager in src/lib/audio.ts",
        """## Description
The `AudioManager` class has no tests. Its public methods (`playClick`, `playMagic`, `setBgmState`, etc.) should be testable with a mocked `AudioContext`.

## What needs to be done
1. Create `src/__tests__/audio.test.ts`
2. Mock `window.AudioContext` with a Jest/Vitest manual mock
3. Test that:
   - `AudioManager.init()` creates a gain node hierarchy
   - `updateSettings({ masterVolume: 50 })` sets gain to 0.5
   - `setBgmState('boss')` changes `bgmState` correctly
   - `dispose()` closes the context without throwing

## Acceptance criteria
- [ ] Tests pass without a real browser (jsdom or happy-dom environment)
- [ ] AudioContext is mocked, not real
- [ ] At least 8 test cases
""",
        ["testing", "intermediate", "audio", "up-for-grabs"]
    ),

    (
        "🧪 Add end-to-end smoke test using Playwright",
        """## Description
Add a Playwright E2E test that verifies the game launches, the loading screen completes, and the camp dashboard renders — catching any build-breaking regressions automatically.

## What needs to be done
1. Install Playwright: `npm install -D @playwright/test`
2. Create `tests/smoke.spec.ts`:
   - Navigate to `http://localhost:3000`
   - Wait for loading bar to reach 100%
   - Assert Camp dashboard tab buttons are visible
   - Assert gold/souls/crystals currency display is visible
3. Add to GitHub Actions CI

## Acceptance criteria
- [ ] `npx playwright test` passes on a fresh `npm run dev` server
- [ ] Test runs in CI on every PR
- [ ] Test completes in under 30 seconds
""",
        ["testing", "intermediate", "help wanted"]
    ),

    # ══════════════════════════════════════════════════════════════
    #  SECURITY (2 issues)
    # ══════════════════════════════════════════════════════════════

    (
        "🔒 Validate and sanitize all saveState data loaded from localStorage",
        """## Description
`App.tsx` loads save data from localStorage and merges it with `INITIAL_SAVE_STATE`, but there's no validation of the loaded data. A malicious or corrupted localStorage entry could set `gold: Infinity`, `playerLevel: 99999`, or inject unexpected fields.

## What needs to be done
1. Create `src/lib/saveValidator.ts` with a `validateSaveState(raw: unknown): GameSaveState` function
2. For each field, validate: type is correct, number is in valid range, arrays contain valid entries
3. Invalid fields fall back to the `INITIAL_SAVE_STATE` default for that field
4. Log a warning to console when a field is corrected

## Acceptance criteria
- [ ] Corrupted localStorage doesn't crash the game
- [ ] `gold: Infinity` is clamped to a max value (e.g. 9_999_999)
- [ ] Array fields (ownedSkins, quests) are validated against known valid values
- [ ] At least 10 validation rules implemented
""",
        ["security", "intermediate", "save-system", "up-for-grabs"]
    ),

    (
        "🔒 Add Content Security Policy headers for the production build",
        """## Description
The production build has no Content Security Policy, making it potentially vulnerable to XSS attacks if the game ever handles user-generated content (e.g. usernames, leaderboard entries).

## What needs to be done
1. Add a `_headers` file (for Netlify) or `vercel.json` configuration with a strict CSP header
2. Restrict: `default-src 'self'`, allow Google Fonts, Firebase, and the Anthropic API origins explicitly
3. Test that the game still works with the CSP applied (check browser console for violations)

## Acceptance criteria
- [ ] CSP header present in production build
- [ ] No CSP violations in browser console during normal gameplay
- [ ] README documents the CSP for contributors who add new external resources
""",
        ["security", "intermediate", "documentation"]
    ),

]
# ────────────────────────────────────────────────────────────────────────────────


def get_headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def verify_token(token: str) -> bool:
    """Check that the token can access the target repo."""
    url  = f"{BASE_URL}"
    resp = requests.get(url, headers=get_headers(token))
    if resp.status_code == 200:
        print(f"✅ Token verified. Repo: {REPO_OWNER}/{REPO_NAME}\n")
        return True
    elif resp.status_code == 401:
        print("❌ Token is invalid or expired.")
    elif resp.status_code == 404:
        print(f"❌ Repo '{REPO_OWNER}/{REPO_NAME}' not found — check spelling or token permissions.")
    else:
        print(f"❌ Unexpected error {resp.status_code}: {resp.text}")
    return False


def get_existing_labels(token: str) -> set:
    """Return the set of label names that already exist on the repo."""
    existing = set()
    page = 1
    while True:
        resp = requests.get(
            f"{BASE_URL}/labels",
            headers=get_headers(token),
            params={"per_page": 100, "page": page},
        )
        data = resp.json()
        if not data:
            break
        for lbl in data:
            existing.add(lbl["name"])
        page += 1
    return existing


def create_labels(token: str) -> None:
    print("─── Creating labels ───────────────────────────────────")
    existing = get_existing_labels(token)

    for name, color, description in LABELS:
        if name in existing:
            print(f"  ⏭  Label already exists: '{name}'")
            continue
        payload = {"name": name, "color": color, "description": description}
        resp = requests.post(f"{BASE_URL}/labels", json=payload, headers=get_headers(token))
        if resp.status_code == 201:
            print(f"  ✅ Created label: '{name}'")
        else:
            print(f"  ⚠️  Failed to create label '{name}': {resp.status_code} — {resp.json().get('message','')}")
        time.sleep(API_DELAY)

    print()


def get_existing_issue_titles(token: str) -> set:
    """Return titles of all open+closed issues so we don't duplicate."""
    titles = set()
    page   = 1
    while True:
        resp = requests.get(
            f"{BASE_URL}/issues",
            headers=get_headers(token),
            params={"state": "all", "per_page": 100, "page": page},
        )
        data = resp.json()
        if not data:
            break
        for issue in data:
            titles.add(issue["title"])
        page += 1
    return titles


def create_issues(token: str) -> None:
    print("─── Creating issues ───────────────────────────────────")
    existing_titles = get_existing_issue_titles(token)

    created  = 0
    skipped  = 0
    failed   = 0

    for title, body, labels in ISSUES:
        if title in existing_titles:
            print(f"  ⏭  Already exists: '{title}'")
            skipped += 1
            continue

        payload = {"title": title, "body": body, "labels": labels}
        resp = requests.post(f"{BASE_URL}/issues", json=payload, headers=get_headers(token))

        if resp.status_code == 201:
            issue_url = resp.json().get("html_url", "")
            print(f"  ✅ #{resp.json()['number']:>3} — {title}")
            print(f"           {issue_url}")
            created += 1
        elif resp.status_code == 403:
            print(f"  🚫 Rate limited or forbidden. Waiting 60s ...")
            time.sleep(60)
            # retry once
            resp = requests.post(f"{BASE_URL}/issues", json=payload, headers=get_headers(token))
            if resp.status_code == 201:
                print(f"  ✅ (retry) #{resp.json()['number']:>3} — {title}")
                created += 1
            else:
                print(f"  ❌ Failed after retry: {resp.status_code}")
                failed += 1
        else:
            print(f"  ❌ Failed ({resp.status_code}): {resp.json().get('message','')}")
            failed += 1

        time.sleep(API_DELAY)

    print()
    print("─── Summary ───────────────────────────────────────────")
    print(f"  Created : {created}")
    print(f"  Skipped : {skipped}  (already existed)")
    print(f"  Failed  : {failed}")
    print("───────────────────────────────────────────────────────")


def main():
    print("═══════════════════════════════════════════════════════")
    print("  GitHub Issue Auto-Creator — Rajath2005/game-snake   ")
    print(f"  Total labels : {len(LABELS)}")
    print(f"  Total issues : {len(ISSUES)}")
    print("═══════════════════════════════════════════════════════\n")

    token = getpass.getpass("Paste your GitHub Personal Access Token (hidden): ").strip()
    if not token:
        print("❌ No token provided. Exiting.")
        sys.exit(1)

    if not verify_token(token):
        sys.exit(1)

    print("This script will create labels and issues in:")
    print(f"  https://github.com/{REPO_OWNER}/{REPO_NAME}\n")
    confirm = input("Continue? (yes/no): ").strip().lower()
    if confirm not in ("yes", "y"):
        print("Aborted.")
        sys.exit(0)

    print()
    create_labels(token)
    create_issues(token)

    print()
    print("🎉 Done! View your issues at:")
    print(f"   https://github.com/{REPO_OWNER}/{REPO_NAME}/issues")


if __name__ == "__main__":
    main()
