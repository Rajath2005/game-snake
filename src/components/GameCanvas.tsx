import React, { useRef, useEffect, useState } from "react";
import { Biome, BiomeType, GameSettings, Skin } from "../types";
import { AudioManager } from "../lib/audio";

interface GameCanvasProps {
  biome: Biome;
  settings: GameSettings;
  equippedSkin: Skin;
  healthBonus: number; // derived from talents
  speedBonus: number;
  magnetBonus: number;
  goldMultiplier: number;
  cooldownReduction: number;
  isDemoMode?: boolean;
  isTutorialMode?: boolean;
  onGameOver: (finalScore: number, coinsEarned: number, xpEarned: number, defeatedBoss: boolean) => void;
  onQuestProgress: (id: string, increment: number) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  onActiveAbilitiesCooldowns: (cooldowns: {
    dash: number;
    slow: number;
    shield: number;
    cyclone: number;
  }) => void;
  activeAbilityTrigger: string; // "dash" | "slow" | "shield" | "cyclone"
  onResetTrigger: () => void;

  // Extended progression props
  skillsUnlocked: Record<string, number>;
  equippedRelics: string[];
  equippedArtifact: string | null;
  selectedForm: string;
  difficultyLevel: "EASY" | "NORMAL" | "HARD" | "NIGHTMARE";
  weaponsLevel: Record<string, number>;
  magicLevel: Record<string, number>;
  onBossState?: (bossActive: boolean, bossHealthPercent: number) => void;
  onActivateAbility?: (ability: "dash" | "slow" | "shield" | "cyclone") => void;
}

// Coordinate interface
interface Point {
  x: number;
  y: number;
}

// Particle class
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  active: boolean;
}

// Soul class
interface Soul {
  id: string;
  x: number;
  y: number;
  type: "emerald" | "cursed" | "gold";
  size: number;
  pulseTimer: number;
  isAttracted: boolean;
}

// Enemy class
interface Enemy {
  id: string;
  x: number;
  y: number;
  type: "knight" | "wizard" | "wolf" | "boss" | "archer" | "assassin" | "necromancer" | "skeleton";
  hp: number;
  maxHp: number;
  speed: number;
  size: number;
  chargeCooldown: number;
  shootCooldown: number;
  angle: number;
  flashTimer?: number;
  knockbackX?: number;
  knockbackY?: number;
  shudderTimer?: number;
  state?: string;
  stateTimer?: number;
  isStealth?: boolean;
  summonCooldown?: number;
  dodgeTimer?: number;
  dodgeVx?: number;
  dodgeVy?: number;
  phase?: number;
  poisonTimer?: number;
  poisonDmg?: number;
}

// Projectile class
interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

// Floating Text
interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife?: number;
  scale?: number;
  vx?: number;
}

type TerrainType = "rune_circle" | "ice_patch" | "fog_pocket" | "grave" | "lava_pool" | "fire_geyser" | "poison_bog" | "toxic_vent";

interface TerrainTile {
  x: number;
  y: number;
  radius: number;
  type: TerrainType;
  animTimer: number;
  cooldown: number;
  active: boolean;
  width?: number;
  height?: number;
}

interface ArenaObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "wall" | "spikes" | "trap" | "moving_barrier";
  color: string;
  accentColor: string;
  trapTriggered: boolean;
  trapCooldown: number;
  spikesExtended: boolean;
  spikeAnimTimer: number;
  moveStartX: number;
  moveStartY: number;
  moveEndX: number;
  moveEndY: number;
  moveProgress: number;
  moveForward: boolean;
  moveSpeed: number;
}

export default function GameCanvas({
  biome,
  settings,
  equippedSkin,
  healthBonus,
  speedBonus,
  magnetBonus,
  goldMultiplier,
  cooldownReduction,
  isDemoMode,
  isTutorialMode,
  onGameOver,
  onQuestProgress,
  isPaused,
  setIsPaused,
  onActiveAbilitiesCooldowns,
  activeAbilityTrigger,
  onResetTrigger,
  skillsUnlocked,
  equippedRelics,
  equippedArtifact,
  selectedForm,
  difficultyLevel,
  weaponsLevel,
  magicLevel,
  onBossState,
  onActivateAbility
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core gameplay states
  const [score, setScore] = useState(0);
  const [soulsCount, setSoulsCount] = useState(0);

  // Gameplay Tutorial states
  const [tutorialStep, setTutorialStep] = useState<string | null>(null);
  const tutorialStepRef = useRef<string | null>(null);

  useEffect(() => {
    let hasCompleted: string | null = null;
    try { hasCompleted = localStorage.getItem("serpent_gameplay_tutorial_completed"); } catch {};
    if (isTutorialMode || !hasCompleted) {
      setTutorialStep("MOVEMENT");
      tutorialStepRef.current = "MOVEMENT";
    }
  }, [isTutorialMode]);

  const transitionTutorialStep = (nextStep: string | null) => {
    tutorialStepRef.current = nextStep;
    setTutorialStep(nextStep);
    if (nextStep === null) {
      localStorage.setItem("serpent_gameplay_tutorial_completed", "true");
      if (isTutorialMode) {
        // Reward the player with Coins, XP, Achievement, Starter Chest
        // Trigger a game over with generous stats
        onGameOver(5000, 500, 1000, true);
      }
    }
  };

  // References to keep loop state without re-triggering useEffect
  const stateRef = useRef({
    score: 0,
    soulsCount: 0,
    distanceTraveled: 0,
    soulsCollected: 0,
    enemiesKilled: 0,
    playerHealth: 100 + healthBonus,
    playerMaxHealth: 100 + healthBonus,
    serpentSegments: [] as Point[],
    targetLength: 15,
    headingAngle: 0,
    speed: 4 + speedBonus,
    targetSpeed: 4 + speedBonus,
    combo: 1,
    comboTimer: 0,
    isSlowed: false,
    slowTimer: 0,
    isShielded: false,
    shieldTimer: 0,
    cycloneActive: false,
    cycloneTimer: 0,
    cyclonePos: { x: 0, y: 0 },
    bossActive: false,
    bossHp: 1000,
    bossMaxHp: 1000,
    
    // Cooldown clocks (in seconds)
    dashCooldown: 0,
    slowCooldown: 0,
    shieldCooldown: 0,
    cycloneCooldown: 0,
    
    // Lists
    particles: Array.from({ length: 1500 }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: "",
      size: 0,
      life: 0,
      maxLife: 0,
      active: false
    })) as Particle[],
    souls: [] as Soul[],
    enemies: [] as Enemy[],
    projectiles: [] as Projectile[],
    floatingTexts: [] as FloatingText[],
    glowingRings: [] as { x: number; y: number; r: number; maxR: number; color: string; alpha: number }[],
    
    // Inputs
    mousePos: { x: 0, y: 0 } as Point,
    mouseActive: false,
    keys: {} as Record<string, boolean>,
    touchStart: { x: 0, y: 0 } as Point,
    touchCurrent: { x: 0, y: 0 } as Point,
    isTouchActive: false,
    
    // Camera Position for Smooth Interpolation
    cameraPos: { x: 1200, y: 900 } as Point,

    // Feel/Juice
    hitStopDuration: 0,
    
    // Screenshake
    shakeAmount: 0,
    screenFlash: 0, // opac

    // Extended revival tracking
    hasRevived: false,

    // Extended progression systems state
    spores: [] as { x: number; y: number; vx: number; vy: number; life: number; damage: number }[],
    tempestLightnings: [] as { x1: number; y1: number; x2: number; y2: number; life: number }[],
    frameCount: 0,
    
    // Terrain features
    terrainTiles: [] as TerrainTile[],
    isOnIce: false,
    
    // Arena obstacles
    arenaObstacles: [] as ArenaObstacle[]
  });

  // Base configurations
  const arenaWidth = 2400;
  const arenaHeight = 1800;

  // Track size
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 800,
          height: entry.contentRect.height || 600
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Set up initial state of the run
  const initGame = () => {
    const s = stateRef.current;
    s.score = 0;
    s.soulsCount = 0;
    s.distanceTraveled = 0;
    s.soulsCollected = 0;
    s.enemiesKilled = 0;
    
    // Initialize audio systems
    AudioManager.updateSettings(settings);
    AudioManager.resumeContext();
    AudioManager.setBiomeAmbience(biome.type);
    AudioManager.setBgmState("ambient");
    
    // Base stats with selected form modifiers
    let baseMaxHp = 100 + healthBonus;
    if (selectedForm === "sovereign_obsidian") {
      baseMaxHp = Math.ceil(baseMaxHp * 1.15); // +15% HP Max
    }
    s.playerMaxHealth = baseMaxHp;
    s.playerHealth = s.playerMaxHealth;

    // Shadow Hydra starts with +4 tail segments
    s.targetLength = 15 + (selectedForm === "shadow_hydra" ? 4 : 0);
    s.headingAngle = 0;

    // Jade Basilisk starts with +0.8 baseline speed
    let baseSpeed = 4 + speedBonus;
    if (selectedForm === "jade_basilisk") {
      baseSpeed += 0.8;
    }
    s.speed = baseSpeed;
    s.targetSpeed = baseSpeed;

    s.combo = 1;
    s.comboTimer = 0;
    s.isSlowed = false;
    s.isShielded = false;
    s.cycloneActive = false;
    s.bossActive = false;
    s.cameraPos = { x: arenaWidth / 2, y: arenaHeight / 2 };
    s.glowingRings = [];
    s.hitStopDuration = 0;
    s.hasRevived = false;
    
    s.dashCooldown = 0;
    s.slowCooldown = 0;
    s.shieldCooldown = 0;
    s.cycloneCooldown = 0;

    s.particles = Array.from({ length: 400 }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: "#fff",
      size: 0,
      life: 0,
      maxLife: 0,
      active: false
    }));
    s.projectiles = [];
    s.floatingTexts = [];
    s.enemies = [];
    s.souls = [];
    s.spores = [];
    s.tempestLightnings = [];
    s.frameCount = 0;

    // Center snake segments
    s.serpentSegments = [];
    const centerX = arenaWidth / 2;
    const centerY = arenaHeight / 2;
    for (let i = 0; i < s.targetLength; i++) {
      s.serpentSegments.push({ x: centerX + i * 15, y: centerY });
    }

    // Spawn starting souls
    for (let i = 0; i < 40; i++) {
      spawnSoul();
    }

    // Spawn starting enemies
    for (let i = 0; i < 15; i++) {
      spawnEnemy();
    }

    // Generate terrain features based on biome
    s.terrainTiles = [];
    s.isOnIce = false;
    const margin = 100;
    const terrainTypes = biome.terrainFeatures || [];

    terrainTypes.forEach((tf: string) => {
      const count = tf === "grave" ? 18 : tf === "fire_geyser" || tf === "toxic_vent" ? 6 : 12;
      for (let i = 0; i < count; i++) {
        let x: number, y: number;
        let radius = 60;
        let width: number | undefined;
        let height: number | undefined;

        if (tf === "ice_patch") {
          radius = 0;
          width = 90 + Math.random() * 60;
          height = 90 + Math.random() * 60;
          x = margin + Math.random() * (arenaWidth - margin * 2 - width);
          y = margin + Math.random() * (arenaHeight - margin * 2 - height);
        } else if (tf === "grave") {
          radius = 0;
          width = 20;
          height = 28;
          x = margin + Math.random() * (arenaWidth - margin * 2);
          y = margin + Math.random() * (arenaHeight - margin * 2);
        } else if (tf === "fire_geyser" || tf === "toxic_vent") {
          radius = 18;
          x = margin + Math.random() * (arenaWidth - margin * 2);
          y = margin + Math.random() * (arenaHeight - margin * 2);
        } else {
          radius = 50 + Math.random() * 30;
          x = margin + Math.random() * (arenaWidth - margin * 2);
          y = margin + Math.random() * (arenaHeight - margin * 2);
        }

        // Avoid spawning on player start
        const cx = arenaWidth / 2;
        const cy = arenaHeight / 2;
        const distToCenter = Math.hypot(x - cx, y - cy);
        if (distToCenter < 150) {
          x = cx + 200 + Math.random() * 300;
          y = cy + 200 + Math.random() * 300;
        }

        s.terrainTiles.push({
          x, y, radius,
          type: tf as TerrainType,
          animTimer: Math.random() * 100,
          cooldown: tf === "fire_geyser" ? 160 + Math.random() * 60 : tf === "toxic_vent" ? 200 + Math.random() * 80 : 0,
          active: false,
          width, height
        });
      }
    });

    // ==========================================
    // GENERATE ARENA OBSTACLES PER BIOME
    // ==========================================
    s.arenaObstacles = [];
    const genRandPos = (pad = 120) => ({
      x: pad + Math.random() * (arenaWidth - pad * 2),
      y: pad + Math.random() * (arenaHeight - pad * 2)
    });

    const avoidCenter = (p: { x: number; y: number }, minDist = 250) => {
      const cxA = arenaWidth / 2, cyA = arenaHeight / 2;
      if (Math.hypot(p.x - cxA, p.y - cyA) < minDist) {
        const a = Math.random() * Math.PI * 2;
        p.x = cxA + Math.cos(a) * (minDist + 80 + Math.random() * 200);
        p.y = cyA + Math.sin(a) * (minDist + 80 + Math.random() * 200);
        p.x = Math.max(20, Math.min(arenaWidth - 20, p.x));
        p.y = Math.max(20, Math.min(arenaHeight - 20, p.y));
      }
      return p;
    };

    const push = (obs: ArenaObstacle[]) => { obs.forEach(o => s.arenaObstacles.push(o)); };

    if (biome.type === BiomeType.Abyss) {
      const positions = [
        { x: 300, y: 350 }, { x: 600, y: 700 }, { x: 900, y: 200 },
        { x: 1500, y: 1400 }, { x: 1900, y: 900 }, { x: 1200, y: 1500 },
        { x: 2100, y: 400 }, { x: 400, y: 1500 }
      ];
      positions.forEach(p => {
        push([{
          ...p, width: 45, height: 130,
          type: "wall", color: "#1a1a2e", accentColor: "#4edea3",
          trapTriggered: false, trapCooldown: 0,
          spikesExtended: true, spikeAnimTimer: 0,
          moveStartX: 0, moveStartY: 0, moveEndX: 0, moveEndY: 0,
          moveProgress: 0, moveForward: true, moveSpeed: 0
        }]);
      });
    } else if (biome.type === BiomeType.FrozenKingdom) {
      for (let i = 0; i < 6; i++) {
        const p = avoidCenter(genRandPos());
        push([{
          ...p, width: 35, height: 180,
          type: "wall", color: "#1a2a4a", accentColor: "#7dd3fc",
          trapTriggered: false, trapCooldown: 0,
          spikesExtended: true, spikeAnimTimer: 0,
          moveStartX: 0, moveStartY: 0, moveEndX: 0, moveEndY: 0,
          moveProgress: 0, moveForward: true, moveSpeed: 0
        }]);
      }
      for (let i = 0; i < 8; i++) {
        const p = avoidCenter(genRandPos(), 200);
        push([{
          ...p, width: 22, height: 22,
          type: "spikes", color: "#7dd3fc", accentColor: "#e0f2fe",
          trapTriggered: false, trapCooldown: 0,
          spikesExtended: true, spikeAnimTimer: Math.random() * 60,
          moveStartX: 0, moveStartY: 0, moveEndX: 0, moveEndY: 0,
          moveProgress: 0, moveForward: true, moveSpeed: 0
        }]);
      }
    } else if (biome.type === BiomeType.HauntedForest) {
      for (let i = 0; i < 8; i++) {
        const p = avoidCenter(genRandPos());
        push([{
          ...p, width: 38, height: 38,
          type: "wall", color: "#1a1508", accentColor: "#a7f3d0",
          trapTriggered: false, trapCooldown: 0,
          spikesExtended: true, spikeAnimTimer: 0,
          moveStartX: 0, moveStartY: 0, moveEndX: 0, moveEndY: 0,
          moveProgress: 0, moveForward: true, moveSpeed: 0
        }]);
      }
      for (let i = 0; i < 6; i++) {
        const p = avoidCenter(genRandPos(), 180);
        push([{
          ...p, width: 50, height: 50,
          type: "trap", color: "#1a1a1a", accentColor: "#a7f3d0",
          trapTriggered: false, trapCooldown: 0,
          spikesExtended: true, spikeAnimTimer: 0,
          moveStartX: 0, moveStartY: 0, moveEndX: 0, moveEndY: 0,
          moveProgress: 0, moveForward: true, moveSpeed: 0
        }]);
      }
    } else if (biome.type === BiomeType.VolcanicRuins) {
      for (let i = 0; i < 5; i++) {
        const p = avoidCenter(genRandPos());
        push([{
          ...p, width: 55, height: 140,
          type: "wall", color: "#2a0a0a", accentColor: "#f87171",
          trapTriggered: false, trapCooldown: 0,
          spikesExtended: true, spikeAnimTimer: 0,
          moveStartX: 0, moveStartY: 0, moveEndX: 0, moveEndY: 0,
          moveProgress: 0, moveForward: true, moveSpeed: 0
        }]);
      }
      for (let i = 0; i < 5; i++) {
        const p = avoidCenter(genRandPos(), 200);
        push([{
          ...p, width: 25, height: 25,
          type: "spikes", color: "#f87171", accentColor: "#fca5a5",
          trapTriggered: false, trapCooldown: 0,
          spikesExtended: true, spikeAnimTimer: Math.random() * 60,
          moveStartX: 0, moveStartY: 0, moveEndX: 0, moveEndY: 0,
          moveProgress: 0, moveForward: true, moveSpeed: 0
        }]);
      }
      // Moving barriers — 2 patrols
      const mb1 = { x: 800, y: 600, width: 35, height: 140, color: "#3a1515", accentColor: "#f87171" };
      const mb2 = { x: 1600, y: 900, width: 140, height: 35, color: "#3a1515", accentColor: "#f87171" };
      push([
        { ...mb1, type: "moving_barrier", trapTriggered: false, trapCooldown: 0, spikesExtended: true, spikeAnimTimer: 0, moveStartX: 600, moveStartY: 600, moveEndX: 1000, moveEndY: 600, moveProgress: 0, moveForward: true, moveSpeed: 0.006 },
        { ...mb2, type: "moving_barrier", trapTriggered: false, trapCooldown: 0, spikesExtended: true, spikeAnimTimer: 0, moveStartX: 1600, moveStartY: 700, moveEndX: 1600, moveEndY: 1200, moveProgress: 0.5, moveForward: true, moveSpeed: 0.005 }
      ]);
    } else if (biome.type === BiomeType.PoisonSwamp) {
      for (let i = 0; i < 6; i++) {
        const p = avoidCenter(genRandPos());
        push([{
          ...p, width: 25, height: 160,
          type: "wall", color: "#1a1a0a", accentColor: "#bef264",
          trapTriggered: false, trapCooldown: 0,
          spikesExtended: true, spikeAnimTimer: 0,
          moveStartX: 0, moveStartY: 0, moveEndX: 0, moveEndY: 0,
          moveProgress: 0, moveForward: true, moveSpeed: 0
        }]);
      }
      for (let i = 0; i < 4; i++) {
        const p = avoidCenter(genRandPos(), 180);
        push([{
          ...p, width: 55, height: 55,
          type: "trap", color: "#1a1a0a", accentColor: "#bef264",
          trapTriggered: false, trapCooldown: 0,
          spikesExtended: true, spikeAnimTimer: 0,
          moveStartX: 0, moveStartY: 0, moveEndX: 0, moveEndY: 0,
          moveProgress: 0, moveForward: true, moveSpeed: 0
        }]);
      }
      for (let i = 0; i < 5; i++) {
        const p = avoidCenter(genRandPos(), 200);
        push([{
          ...p, width: 22, height: 22,
          type: "spikes", color: "#bef264", accentColor: "#d9f99d",
          trapTriggered: false, trapCooldown: 0,
          spikesExtended: true, spikeAnimTimer: Math.random() * 60,
          moveStartX: 0, moveStartY: 0, moveEndX: 0, moveEndY: 0,
          moveProgress: 0, moveForward: true, moveSpeed: 0
        }]);
      }
    }

    setScore(0);
    setSoulsCount(0);
  };

  const spawnSoul = (fixedType?: "emerald" | "cursed" | "gold") => {
    const s = stateRef.current;
    let type: "emerald" | "cursed" | "gold" = "emerald";
    const rand = Math.random();
    if (fixedType) {
      type = fixedType;
    } else if (rand < 0.15) {
      type = "cursed";
    } else if (rand < 0.3) {
      type = "gold";
    }

    s.souls.push({
      id: Math.random().toString(),
      x: Math.random() * (arenaWidth - 100) + 50,
      y: Math.random() * (arenaHeight - 100) + 50,
      type,
      size: type === "cursed" ? 10 : 7,
      pulseTimer: Math.random() * 10,
      isAttracted: false
    });
  };

  const spawnEnemy = (fixedType?: "knight" | "wizard" | "wolf" | "archer" | "assassin" | "necromancer" | "skeleton") => {
    const s = stateRef.current;
    let type: "knight" | "wizard" | "wolf" | "archer" | "assassin" | "necromancer" | "skeleton" = "knight";
    const rand = Math.random();
    if (fixedType) {
      type = fixedType;
    } else {
      // Balanced distribution of enemy types to make waves feel like a premium tactical coordinate
      if (rand < 0.25) {
        type = "knight";
      } else if (rand < 0.50) {
        type = "wolf";
      } else if (rand < 0.70) {
        type = "archer";
      } else if (rand < 0.85) {
        type = "wizard";
      } else if (rand < 0.95) {
        type = "assassin";
      } else {
        type = "necromancer";
      }
    }

    // Spawn randomly around player but out of screen view
    const pHead = s.serpentSegments[0];
    let x = Math.random() * arenaWidth;
    let y = Math.random() * arenaHeight;
    while (Math.hypot(x - pHead.x, y - pHead.y) < 500) {
      x = Math.random() * arenaWidth;
      y = Math.random() * arenaHeight;
    }

    let hp = 45;
    let speed = 1.8;
    let size = 15;

    if (type === "wizard") {
      hp = 30;
      speed = 1.2;
      size = 14;
    } else if (type === "wolf") {
      hp = 25;
      speed = 2.8;
      size = 12;
    } else if (type === "archer") {
      hp = 35;
      speed = 1.5;
      size = 13;
    } else if (type === "assassin") {
      hp = 35;
      speed = 2.2;
      size = 13;
    } else if (type === "necromancer") {
      hp = 50;
      speed = 1.1;
      size = 16;
    } else if (type === "skeleton") {
      hp = 15;
      speed = 1.6;
      size = 11;
    }

    s.enemies.push({
      id: Math.random().toString(),
      x,
      y,
      type,
      hp,
      maxHp: hp,
      speed,
      size,
      chargeCooldown: 0,
      shootCooldown: Math.random() * 80 + 30,
      angle: Math.random() * Math.PI * 2,
      state: type === "assassin" ? "stealth" : "chase",
      stateTimer: 0,
      isStealth: type === "assassin" ? true : false,
      summonCooldown: type === "necromancer" ? 150 : 0,
      dodgeTimer: 0,
      dodgeVx: 0,
      dodgeVy: 0
    });
  };

  const spawnBoss = () => {
    const s = stateRef.current;
    s.bossActive = true;
    s.bossHp = 1000;
    s.bossMaxHp = 1000;

    // Trigger boss music and roar
    AudioManager.playDragonRoar();
    AudioManager.setBgmState("boss");

    // Spawn at center top
    s.enemies.push({
      id: "boss_terror",
      x: arenaWidth / 2,
      y: 100,
      type: "boss",
      hp: 1000,
      maxHp: 1000,
      speed: 1.5,
      size: 55,
      chargeCooldown: 0,
      shootCooldown: 50,
      angle: Math.PI / 2
    });

    s.floatingTexts.push({
      x: s.serpentSegments[0].x,
      y: s.serpentSegments[0].y - 50,
      text: "THE ANCIENT SERPENT KING AWAKES!",
      color: "#ff7f74",
      life: 180
    });

    s.shakeAmount = 20;
  };

  const lastParticleIdxRef = useRef(0);

  const spawnParticle = (x: number, y: number, vx: number, vy: number, color: string, size: number, maxLife: number) => {
    const s = stateRef.current;
    const poolSize = s.particles.length;
    let idx = lastParticleIdxRef.current;
    for (let i = 0; i < poolSize; i++) {
      const pIdx = (idx + i) % poolSize;
      const p = s.particles[pIdx];
      if (!p.active) {
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.color = color;
        p.size = size;
        p.life = 0;
        p.maxLife = maxLife;
        p.active = true;
        lastParticleIdxRef.current = (pIdx + 1) % poolSize;
        return;
      }
    }
    // Override oldest if pool is fully exhausted
    const p = s.particles[idx];
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.color = color;
    p.size = size;
    p.life = 0;
    p.maxLife = maxLife;
    p.active = true;
    lastParticleIdxRef.current = (idx + 1) % poolSize;
  };

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (settings.hapticFeedback && typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // ignore
      }
    }
  };

  const triggerParticleBurst = (x: number, y: number, color: string, count = 10) => {
    const finalCount = settings.highFidelity ? count : Math.ceil(count / 2);
    for (let i = 0; i < finalCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      spawnParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        Math.random() * 4 + 2,
        Math.random() * 30 + 20
      );
    }
  };

  // Keyboard events
  useEffect(() => {
    const s = stateRef.current;
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      s.keys[key] = true;

      // Active Ability Hotkeys
      if (onActivateAbility) {
        if (key === " " || key === "spacebar") {
          onActivateAbility("dash");
        } else if (key === "q") {
          onActivateAbility("cyclone");
        } else if (key === "e") {
          onActivateAbility("shield");
        } else if (e.key === "Shift") {
          onActivateAbility("slow");
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      s.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Initialize game immediately
    initGame();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [healthBonus, speedBonus]);

  // Handles active ability triggering from parent HUD button clicks
  useEffect(() => {
    if (!activeAbilityTrigger) return;
    const s = stateRef.current;
    
    if (activeAbilityTrigger === "dash" && s.dashCooldown <= 0) {
      // Dash
      AudioManager.playDragonRoar();
      triggerHaptic(20);
      s.targetSpeed = (4 + speedBonus) * 2.8;
      s.isShielded = true;
      s.shieldTimer = 35; // invulnerable during dash
      s.dashCooldown = 6 * (1 - cooldownReduction);
      s.shakeAmount = 14;
      triggerParticleBurst(s.serpentSegments[0].x, s.serpentSegments[0].y, "#4edea3", 35);
      
      s.glowingRings.push({
        x: s.serpentSegments[0].x,
        y: s.serpentSegments[0].y,
        r: 10,
        maxR: 120,
        color: "#4edea3",
        alpha: 1.0
      });
      
      // Dash timer
      setTimeout(() => {
        s.targetSpeed = 4 + speedBonus;
        s.isShielded = false;
      }, 500);
    } 
    else if (activeAbilityTrigger === "slow" && s.slowCooldown <= 0) {
      // Slow Time
      AudioManager.playMagic();
      triggerHaptic([15, 30, 15]);
      s.isSlowed = true;
      const extraTime = (skillsUnlocked["chrono_shift"] || 0) * 60; // 60 frames = +1s per level
      s.slowTimer = 300 + extraTime; // ~5 seconds base + bonus
      s.slowCooldown = 12 * (1 - cooldownReduction);
      s.floatingTexts.push({
        x: s.serpentSegments[0].x,
        y: s.serpentSegments[0].y - 40,
        text: "CHRONO SHIFT",
        color: "#e9c176",
        life: 90
      });
      s.shakeAmount = 12;
      triggerParticleBurst(s.serpentSegments[0].x, s.serpentSegments[0].y, "#e9c176", 30);
      s.glowingRings.push({
        x: s.serpentSegments[0].x,
        y: s.serpentSegments[0].y,
        r: 10,
        maxR: 350,
        color: "#e9c176",
        alpha: 1.0
      });
    } 
    else if (activeAbilityTrigger === "shield" && s.shieldCooldown <= 0) {
      // Shield
      AudioManager.playMagic();
      triggerHaptic(25);
      s.isShielded = true;
      s.shieldTimer = 240; // ~4 seconds
      s.shieldCooldown = 15 * (1 - cooldownReduction);
      s.floatingTexts.push({
        x: s.serpentSegments[0].x,
        y: s.serpentSegments[0].y - 40,
        text: "AEGIS SHIELD ACTIVE",
        color: "#4edea3",
        life: 90
      });
      s.shakeAmount = 8;
      triggerParticleBurst(s.serpentSegments[0].x, s.serpentSegments[0].y, "#4edea3", 25);
      s.glowingRings.push({
        x: s.serpentSegments[0].x,
        y: s.serpentSegments[0].y,
        r: 10,
        maxR: 90,
        color: "#4edea3",
        alpha: 1.0
      });
    } 
    else if (activeAbilityTrigger === "cyclone" && s.cycloneCooldown <= 0) {
      // Cyclone
      AudioManager.playMagic();
      triggerHaptic([10, 50, 10]);
      s.cycloneActive = true;
      s.cycloneTimer = 240; // ~4 seconds
      s.cyclonePos = { ...s.serpentSegments[0] };
      s.cycloneCooldown = 14 * (1 - cooldownReduction);
      s.floatingTexts.push({
        x: s.serpentSegments[0].x,
        y: s.serpentSegments[0].y - 40,
        text: "SERPENT CYCLONE UNLEASHED",
        color: "#4edea3",
        life: 90
      });
      s.shakeAmount = 15;
      triggerParticleBurst(s.serpentSegments[0].x, s.serpentSegments[0].y, "#38bdf8", 30);
      s.glowingRings.push({
        x: s.serpentSegments[0].x,
        y: s.serpentSegments[0].y,
        r: 10,
        maxR: 180,
        color: "#38bdf8",
        alpha: 1.0
      });
    }

    onResetTrigger();
  }, [activeAbilityTrigger, speedBonus, cooldownReduction]);

  // Main game rendering loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;

    let lastTime = performance.now();
    const frameInterval = 1000 / 60;

    const gameLoop = (timestamp: number) => {
      animId = requestAnimationFrame(gameLoop);
      if (isPaused) {
        return;
      }

      const elapsed = timestamp - lastTime;
      const dt = Math.min(elapsed / frameInterval, 3);

      if (elapsed >= frameInterval - 1) {
        lastTime = timestamp;
        s.frameCount++;

      // Advance gameplay tutorial steps based on player progression
      if (tutorialStepRef.current) {
        if (tutorialStepRef.current === "MOVEMENT" && s.distanceTraveled > 250) {
          transitionTutorialStep("SOULS");
        } else if (tutorialStepRef.current === "SOULS" && s.soulsCollected > 0) {
          transitionTutorialStep("GROWTH");
        } else if (tutorialStepRef.current === "GROWTH" && s.serpentSegments.length >= 17) {
          transitionTutorialStep("OBSTACLES");
        } else if (tutorialStepRef.current === "OBSTACLES" && s.frameCount > 400) {
          transitionTutorialStep("COMBAT");
        } else if (tutorialStepRef.current === "COMBAT" && s.enemiesKilled > 0) {
          transitionTutorialStep("ABILITIES");
        } else if (tutorialStepRef.current === "ABILITIES" && (s.dashCooldown > 0 || s.cycloneCooldown > 0 || s.shieldCooldown > 0 || s.slowCooldown > 0)) {
          transitionTutorialStep("POWERUPS");
        } else if (tutorialStepRef.current === "POWERUPS" && s.frameCount > 1000) {
          transitionTutorialStep("BOSS_FIGHT");
          if (!s.bossActive) spawnBoss(); // Force spawn for tutorial
        } else if (tutorialStepRef.current === "BOSS_FIGHT" && s.bossActive === false && s.frameCount > 1200) {
          // Finished the tutorial! (Boss defeated)
          transitionTutorialStep(null);
        }
      }

      // ULTIMATE: Ragnarok Shockwave (Every 20 seconds)
      if (skillsUnlocked["ragnarok"] > 0 && s.frameCount % 1200 === 0 && s.frameCount > 0) {
        AudioManager.playDragonRoar();
        s.shakeAmount = 30;
        const hX = s.serpentSegments[0]?.x || 0;
        const hY = s.serpentSegments[0]?.y || 0;
        s.floatingTexts.push({
          x: hX,
          y: hY - 60,
          text: "RAGNAROK BURST!",
          color: "#ef4444",
          life: 90
        });
        s.glowingRings.push({
          x: hX,
          y: hY,
          r: 10,
          maxR: 900,
          color: "#ef4444",
          alpha: 1.0
        });
        // Damage all enemies
        s.enemies.forEach(enemy => {
          const dx = enemy.x - hX;
          const dy = enemy.y - hY;
          const dist = Math.hypot(dx, dy);
          if (dist < 900) {
            enemy.hp -= 40;
            enemy.flashTimer = 10;
            const kAngle = Math.atan2(dy, dx);
            enemy.knockbackX = Math.cos(kAngle) * 18;
            enemy.knockbackY = Math.sin(kAngle) * 18;
            s.floatingTexts.push({
              x: enemy.x,
              y: enemy.y - 20,
              text: "-40 RAGNAROK",
              color: "#f87171",
              life: 45
            });
          }
        });
      }

      // ULTIMATE: Serpent Tempest / Abyssal Storm (Every 8 seconds)
      if (skillsUnlocked["serpent_tempest"] > 0 && s.frameCount % 480 === 0 && s.frameCount > 0) {
        const hX = s.serpentSegments[0]?.x || 0;
        const hY = s.serpentSegments[0]?.y || 0;
        const targets = s.enemies
          .map(enemy => {
            const dx = enemy.x - hX;
            const dy = enemy.y - hY;
            return { enemy, dist: Math.hypot(dx, dy) };
          })
          .filter(t => t.dist < 500)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 4);

        if (targets.length > 0) {
          AudioManager.playMetalImpact();
          s.shakeAmount = 12;
          targets.forEach(t => {
            const enemy = t.enemy;
            enemy.hp -= 25;
            enemy.flashTimer = 8;
            s.floatingTexts.push({
              x: enemy.x,
              y: enemy.y - 20,
              text: "-25 THUNDER",
              color: "#38bdf8",
              life: 45
            });
            s.tempestLightnings.push({
              x1: hX,
              y1: hY,
              x2: enemy.x,
              y2: enemy.y,
              life: 15
            });
          });
        }
      }

      // 1. UPDATE SPELL COOLDOWNS & TIMERS
      if (s.dashCooldown > 0) s.dashCooldown = Math.max(0, s.dashCooldown - 1/60);
      if (s.slowCooldown > 0) s.slowCooldown = Math.max(0, s.slowCooldown - 1/60);
      if (s.shieldCooldown > 0) s.shieldCooldown = Math.max(0, s.shieldCooldown - 1/60);
      if (s.cycloneCooldown > 0) s.cycloneCooldown = Math.max(0, s.cycloneCooldown - 1/60);

      // Report cooldowns to HUD
      onActiveAbilitiesCooldowns({
        dash: s.dashCooldown,
        slow: s.slowCooldown,
        shield: s.shieldCooldown,
        cyclone: s.cycloneCooldown
      });

      if (s.slowTimer > 0) {
        s.slowTimer--;
        if (s.slowTimer === 0) s.isSlowed = false;
      }
      if (s.shieldTimer > 0) {
        s.shieldTimer--;
        if (s.shieldTimer === 0) s.isShielded = false;
      }
      if (s.cycloneTimer > 0) {
        s.cycloneTimer--;
        if (s.cycloneTimer === 0) s.cycloneActive = false;
      }

      if (s.comboTimer > 0) {
        s.comboTimer--;
        if (s.comboTimer === 0) s.combo = 1;
      }

      // Trap cooldowns
      for (let oi = 0; oi < s.arenaObstacles.length; oi++) {
        const ob = s.arenaObstacles[oi];
        if (ob.type === "trap") {
          if (ob.trapCooldown > 0) ob.trapCooldown--;
          if (ob.trapCooldown <= 0) ob.trapTriggered = false;
        }
      }

      // Handle screen effects fade
      if (s.shakeAmount > 0) s.shakeAmount *= 0.92;
      if (s.screenFlash > 0) s.screenFlash -= 0.05;

      // 2. INPUT STEERING
      const head = s.serpentSegments[0];

      // DEMO MODE AUTOMATION AI
      if (isDemoMode) {
        // AI Steering: Find closest soul or enemy, avoid boss
        let targetPoint: Point | null = null;
        let minDistance = Infinity;

        // Try to find a soul
        for (let i = 0; i < s.souls.length; i++) {
          const soul = s.souls[i];
          const dist = Math.hypot(soul.x - head.x, soul.y - head.y);
          if (dist < minDistance) {
            minDistance = dist;
            targetPoint = { x: soul.x, y: soul.y };
          }
        }

        // If no soul, wander around center
        if (!targetPoint) {
          targetPoint = { 
            x: (arenaWidth / 2) + Math.cos(s.frameCount * 0.01) * 400, 
            y: (arenaHeight / 2) + Math.sin(s.frameCount * 0.01) * 400 
          };
        }

        // Avoid boss if active
        if (s.bossActive) {
           const boss = s.enemies.find(e => e.type === "boss");
           if (boss) {
             const distToBoss = Math.hypot(boss.x - head.x, boss.y - head.y);
             if (distToBoss < 300) {
               // Steer away
               targetPoint = {
                 x: head.x - (boss.x - head.x),
                 y: head.y - (boss.y - head.y)
               };
             } else if (distToBoss > 400) {
               // Attack boss if safe
               targetPoint = { x: boss.x, y: boss.y };
             }
           }
        }

        if (targetPoint) {
          const angleToTarget = Math.atan2(targetPoint.y - head.y, targetPoint.x - head.x);
          let angleDiff = angleToTarget - s.headingAngle;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          s.headingAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.1);
        }

        // Randomly use abilities
        if (s.frameCount % 200 === 0 && s.dashCooldown <= 0) {
           s.targetSpeed = (4 + speedBonus) * 2.8;
           s.isShielded = true;
           s.shieldTimer = 35;
           s.dashCooldown = 6 * (1 - cooldownReduction);
           triggerParticleBurst(s.serpentSegments[0].x, s.serpentSegments[0].y, "#4edea3", 35);
        }
      }

      // Keyboard Controls (Smooth rotation or direct WASD)
      const steerRate = (s.isOnIce ? 0.14 : 0.07) * dt;
      if (s.keys["a"] || s.keys["arrowleft"]) {
        s.headingAngle -= steerRate;
      }
      if (s.keys["d"] || s.keys["arrowright"]) {
        s.headingAngle += steerRate;
      }
      if (s.keys["w"] || s.keys["arrowup"]) {
        // Forward speed boost while held
        s.targetSpeed = (4 + speedBonus) * 2.2;
      }

      // Touch virtual joystick steering
      if (s.isTouchActive) {
        const tDx = s.touchCurrent.x - s.touchStart.x;
        const tDy = s.touchCurrent.y - s.touchStart.y;
        const tDist = Math.hypot(tDx, tDy);
        if (tDist > 15) {
          const targetAngle = Math.atan2(tDy, tDx);
          let angleDiff = targetAngle - s.headingAngle;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          s.headingAngle += angleDiff * (0.2 * dt);
        }
      }
      // Follow Mouse Angle if dragging/moving
      else if (s.mouseActive) {
        // Map viewport mouse coordinates to our current viewport camera offset
        const camX = head.x - dimensions.width / 2;
        const camY = head.y - dimensions.height / 2;
        const targetWorldX = s.mousePos.x + camX;
        const targetWorldY = s.mousePos.y + camY;
        
        const angleToMouse = Math.atan2(targetWorldY - head.y, targetWorldX - head.x);
        
        // Smoothly rotate headingAngle towards angleToMouse
        let angleDiff = angleToMouse - s.headingAngle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        
        s.headingAngle += angleDiff * (0.14 * dt);
      }

      // Interpolate speed smoothly
      s.speed += (s.targetSpeed - s.speed) * (0.18 * dt);

      // UPDATE MOVING BARRIERS
      for (let oi = 0; oi < s.arenaObstacles.length; oi++) {
        const ob = s.arenaObstacles[oi];
        if (ob.type !== "moving_barrier") continue;
        if (ob.moveForward) {
          ob.moveProgress += ob.moveSpeed;
          if (ob.moveProgress >= 1) { ob.moveProgress = 1; ob.moveForward = false; }
        } else {
          ob.moveProgress -= ob.moveSpeed;
          if (ob.moveProgress <= 0) { ob.moveProgress = 0; ob.moveForward = true; }
        }
        ob.x = ob.moveStartX + (ob.moveEndX - ob.moveStartX) * ob.moveProgress;
        ob.y = ob.moveStartY + (ob.moveEndY - ob.moveStartY) * ob.moveProgress;
      }

      let skipUpdate = false;
      if (s.hitStopDuration > 0) {
        s.hitStopDuration--;
        skipUpdate = true;
      }

      // 3. MOVE SERPENT
      let nextHead = head;
      if (!skipUpdate) {
        const dx = Math.cos(s.headingAngle) * s.speed;
        const dy = Math.sin(s.headingAngle) * s.speed;
        s.distanceTraveled += Math.hypot(dx, dy);
        
        nextHead = {
          x: Math.max(20, Math.min(arenaWidth - 20, head.x + dx)),
          y: Math.max(20, Math.min(arenaHeight - 20, head.y + dy))
        };

        // Grave obstacle collision — push player away from graves
        for (let gi = 0; gi < s.terrainTiles.length; gi++) {
          const grave = s.terrainTiles[gi];
          if (grave.type !== "grave") continue;
          const gW = grave.width || 20;
          const gH = grave.height || 28;
          if (
            nextHead.x + 15 > grave.x && nextHead.x - 15 < grave.x + gW &&
            nextHead.y + 15 > grave.y && nextHead.y - 15 < grave.y + gH
          ) {
            // Push away from grave center
            const pushAngle = Math.atan2(nextHead.y - (grave.y + gH / 2), nextHead.x - (grave.x + gW / 2));
            nextHead.x += Math.cos(pushAngle) * 3;
            nextHead.y += Math.sin(pushAngle) * 3;
            // Clamp again
            nextHead.x = Math.max(20, Math.min(arenaWidth - 20, nextHead.x));
            nextHead.y = Math.max(20, Math.min(arenaHeight - 20, nextHead.y));
            s.screenFlash = Math.max(s.screenFlash, 0.05);
            triggerHaptic(8);
            break;
          }
        }

        // ARENA OBSTACLE COLLISION — resolve against wall/moving_barrier AABBs
        const resolveCircleRect = (cx: number, cy: number, cr: number, rx: number, ry: number, rw: number, rh: number) => {
          const cX = Math.max(rx, Math.min(cx, rx + rw));
          const cY = Math.max(ry, Math.min(cy, ry + rh));
          const dxO = cx - cX, dyO = cy - cY;
          const dSq = dxO * dxO + dyO * dyO;
          if (dSq >= cr * cr) return { x: cx, y: cy, hit: false };
          const dist = Math.sqrt(dSq) || 1;
          const overlap = cr - dist;
          return {
            x: cx + (dxO / dist) * overlap,
            y: cy + (dyO / dist) * overlap,
            hit: true
          };
        };
        for (let oi = 0; oi < s.arenaObstacles.length; oi++) {
          const ob = s.arenaObstacles[oi];
          if (ob.type !== "wall" && ob.type !== "moving_barrier") continue;
          const res = resolveCircleRect(nextHead.x, nextHead.y, 18, ob.x, ob.y, ob.width, ob.height);
          if (res.hit) {
            nextHead.x = res.x;
            nextHead.y = res.y;
            triggerHaptic(6);
            break;
          }
        }

        // TERRAIN EFFECTS ON PLAYER
        s.isOnIce = false;
        for (let ti = 0; ti < s.terrainTiles.length; ti++) {
          const tile = s.terrainTiles[ti];
          const inTile = tile.radius > 0
            ? Math.hypot(nextHead.x - tile.x, nextHead.y - tile.y) < tile.radius
            : (tile.width && tile.height
              ? nextHead.x > tile.x && nextHead.x < tile.x + tile.width &&
                nextHead.y > tile.y && nextHead.y < tile.y + tile.height
              : false);

          if (inTile) {
            s.isOnIce = tile.type === "ice_patch";
            if (tile.type === "rune_circle") {
              s.targetSpeed = (4 + speedBonus) + 2;
            }
            if (tile.type === "lava_pool" && !s.isShielded) {
              s.playerHealth -= 1 / 60;
              s.screenFlash = Math.max(s.screenFlash, 0.08);
              triggerHaptic(5);
            }
            if (tile.type === "poison_bog" && !s.isShielded && selectedForm !== "jade_basilisk") {
              s.playerHealth -= 0.5 / 60;
              s.screenFlash = Math.max(s.screenFlash, 0.05);
            }
            break;
          }
        }

        // Update geysers/vents
        for (let ti = 0; ti < s.terrainTiles.length; ti++) {
          const tile = s.terrainTiles[ti];
          if (tile.type !== "fire_geyser" && tile.type !== "toxic_vent") continue;
          tile.animTimer++;
          if (tile.cooldown > 0) {
            if (tile.animTimer >= tile.cooldown) {
              tile.animTimer = 0;
              tile.active = true;
            }
            if (tile.active && tile.animTimer > 30) {
              tile.active = false;
            }
          }
          if (tile.active) {
            const distToGeyser = Math.hypot(nextHead.x - tile.x, nextHead.y - tile.y);
            if (distToGeyser < tile.radius + 40 && !s.isShielded) {
              const dmg = tile.type === "fire_geyser" ? 8 : 4;
              s.playerHealth -= dmg / 60;
              s.screenFlash = Math.max(s.screenFlash, 0.12);
              triggerHaptic(10);
            }
          }
        }

        // SPIKE / TRAP DAMAGE TO PLAYER
        const headR = 18;
        for (let oi = 0; oi < s.arenaObstacles.length; oi++) {
          const ob = s.arenaObstacles[oi];
          if (ob.type === "wall" || ob.type === "moving_barrier") continue;
          if (ob.type === "spikes") {
            ob.spikeAnimTimer++;
            const ext = Math.sin(ob.spikeAnimTimer * 0.04) * 0.3 + 0.7;
            const cX = Math.max(ob.x, Math.min(nextHead.x, ob.x + ob.width));
            const cY = Math.max(ob.y, Math.min(nextHead.y, ob.y + ob.height));
            const dxS = nextHead.x - cX, dyS = nextHead.y - cY;
            if (dxS * dxS + dyS * dyS < (headR + 8 * ext) * (headR + 8 * ext) && !s.isShielded) {
              s.playerHealth -= 1.5 / 60;
              s.screenFlash = Math.max(s.screenFlash, 0.1);
              triggerHaptic(8);
              // Push away slightly
              const pAngle = Math.atan2(nextHead.y - (ob.y + ob.height / 2), nextHead.x - (ob.x + ob.width / 2));
              nextHead.x += Math.cos(pAngle) * 2;
              nextHead.y += Math.sin(pAngle) * 2;
            }
          }
          if (ob.type === "trap") {
            const cX = Math.max(ob.x, Math.min(nextHead.x, ob.x + ob.width));
            const cY = Math.max(ob.y, Math.min(nextHead.y, ob.y + ob.height));
            const dxT = nextHead.x - cX, dyT = nextHead.y - cY;
            const tDist = Math.hypot(dxT, dyT);
            const tRadius = Math.max(ob.width, ob.height) / 2 + 10;
            if (tDist < tRadius && !ob.trapTriggered && ob.trapCooldown <= 0 && !s.isShielded) {
              ob.trapTriggered = true;
              ob.trapCooldown = 180;
              s.playerHealth -= 12;
              s.shakeAmount = 14;
              s.screenFlash = Math.max(s.screenFlash, 0.3);
              triggerHaptic([20, 30, 40]);
              triggerParticleBurst(nextHead.x, nextHead.y, ob.accentColor, 20);
              s.glowingRings.push({
                x: nextHead.x, y: nextHead.y, r: 5, maxR: 100, color: ob.accentColor, alpha: 1
              });
              s.floatingTexts.push({
                x: nextHead.x, y: nextHead.y - 30,
                text: "TRAP! -12 HP", color: ob.accentColor, life: 45, maxLife: 45, scale: 1.4
              });
            }
          }
        }

        // Add to front of segments
        s.serpentSegments.unshift(nextHead);

        // Tail trailing
        while (s.serpentSegments.length > s.targetLength) {
          s.serpentSegments.pop();
        }

        // Emit ambient skin trails if moving fast (dash, or standard high speed)
        if (settings.highFidelity && s.speed > 4.5 && Math.random() < 0.45) {
          const seg = s.serpentSegments[Math.floor(Math.random() * s.serpentSegments.length)];
          if (seg) {
            const skinId = equippedSkin.id;
            let pColor = "#e9c176";
            if (skinId === "spectral_wyrm") pColor = "rgba(125,211,252,0.6)";
            else if (skinId === "molten_core") pColor = "rgba(248,113,113,0.7)";
            spawnParticle(
              seg.x + (Math.random() - 0.5) * 15,
              seg.y + (Math.random() - 0.5) * 15,
              (Math.random() - 0.5) * 0.5,
              -Math.random() * 1.5,
              pColor,
              Math.random() * 3 + 1,
              Math.random() * 25 + 15
            );
          }
        }
      }

      // 4. ANIMATE CYCLONE BLACKHOLE
      if (s.cycloneActive) {
        // Cyclone pulls in souls, damages enemies
        // Spawn particles inside
        for (let i = 0; i < 3; i++) {
          const r = Math.random() * 80;
          const a = Math.random() * Math.PI * 2;
          spawnParticle(
            s.cyclonePos.x + Math.cos(a) * r,
            s.cyclonePos.y + Math.sin(a) * r,
            -Math.cos(a) * 3,
            -Math.sin(a) * 3,
            "#4edea3",
            Math.random() * 3 + 1,
            20
          );
        }
      }

      // 5. UPDATE SOULS (MAGNETIC INTERACTION)
      let magnetRadius = 100 + magnetBonus;
      if (skillsUnlocked["void_magnet"] > 0) {
        magnetRadius += skillsUnlocked["void_magnet"] * 40;
      }
      const magnetRadiusSq = magnetRadius * magnetRadius;
      for (let i = 0; i < s.souls.length; i++) {
        const soul = s.souls[i];
        soul.pulseTimer += 0.05;
        
        // Check distance to cyclone first
        if (s.cycloneActive) {
          const dxC = soul.x - s.cyclonePos.x;
          const dyC = soul.y - s.cyclonePos.y;
          const distToCycloneSq = dxC * dxC + dyC * dyC;
          if (distToCycloneSq < 22500) { // 150 * 150 = 22500
            soul.x += (s.cyclonePos.x - soul.x) * 0.15;
            soul.y += (s.cyclonePos.y - soul.y) * 0.15;
          }
        }

        // Distance to head
        const dxH = soul.x - nextHead.x;
        const dyH = soul.y - nextHead.y;
        const distSq = dxH * dxH + dyH * dyH;
        if (distSq < magnetRadiusSq) {
          soul.isAttracted = true;
          // Magnet pull velocity
          soul.x += (nextHead.x - soul.x) * 0.12;
          soul.y += (nextHead.y - soul.y) * 0.12;
        }

        if (soul.isAttracted && Math.random() < 0.25) {
          spawnParticle(
            soul.x,
            soul.y,
            (nextHead.x - soul.x) * 0.05 + (Math.random() - 0.5) * 2,
            (nextHead.y - soul.y) * 0.05 + (Math.random() - 0.5) * 2,
            soul.type === "cursed" ? "#ff7f74" : soul.type === "gold" ? "#e9c176" : soul.type === "blood" ? "#f43f5e" : "#4edea3",
            Math.random() * 2 + 1,
            15
          );
        }

        // Eat Soul
        if (distSq < 484) { // 22 * 22 = 484
          // Eat!
          AudioManager.playSoulCollection();
          triggerHaptic(12);
          let scoreGained = 100 * s.combo;
          let goldReward = Math.ceil(5 * goldMultiplier);
          let soulGain = 1;

          let sColor = "#4edea3";
          if (soul.type === "cursed") {
            scoreGained = 250 * s.combo;
            goldReward = Math.ceil(15 * goldMultiplier);
            soulGain = 2;
            sColor = "#ff7f74";
            onQuestProgress("quest_1", 1); // cursed quest
          } else if (soul.type === "gold") {
            scoreGained = 150 * s.combo;
            goldReward = Math.ceil(25 * goldMultiplier);
            sColor = "#e9c176";
          } else if (soul.type === "blood") {
            scoreGained = 50 * s.combo;
            goldReward = 0;
            soulGain = 0;
            sColor = "#f43f5e";
            s.playerHealth = Math.min(s.playerMaxHealth, s.playerHealth + 5);
            s.floatingTexts.push({
              x: soul.x,
              y: soul.y + 25,
              text: "+5 HP FEAST",
              color: "#f43f5e",
              life: 45
            });
          }

          s.score += scoreGained;
          s.soulsCount += soulGain;
          s.soulsCollected += soulGain;
          s.targetLength += 1; // Grow serpent segments!

          // Relic: Urn of Lost Souls (+2 HP on consumption)
          if (equippedRelics.includes("soul_urn")) {
            s.playerHealth = Math.min(s.playerMaxHealth, s.playerHealth + 2);
            s.floatingTexts.push({
              x: soul.x,
              y: soul.y + 15,
              text: "+2 HP",
              color: "#4edea3",
              life: 30,
              maxLife: 30,
              scale: 1.0,
              vx: (Math.random() - 0.5) * 1.5
            });
          }
          
          // Combo up
          s.combo = Math.min(10, s.combo + 1);
          s.comboTimer = 180; // 3 seconds to chain next

          onQuestProgress("quest_3", s.combo); // combo trigger

          // Floating text with scaling and drift
          s.floatingTexts.push({
            x: soul.x,
            y: soul.y - 10,
            text: `+${scoreGained.toLocaleString()} PTS`,
            color: sColor,
            life: 45,
            maxLife: 45,
            scale: 1.4,
            vx: (Math.random() - 0.5) * 2
          });

          // Gold/Emerald expanding glow shockwave
          s.glowingRings.push({
            x: soul.x,
            y: soul.y,
            r: 5,
            maxR: 50,
            color: sColor,
            alpha: 1.0
          });

          // Gold spawn particles
          triggerParticleBurst(soul.x, soul.y, soul.type === "cursed" ? "#ff7f74" : soul.type === "gold" ? "#e9c176" : soul.type === "blood" ? "#f43f5e" : "#4edea3", 12);

          // Spawn a replacing soul
          soul.x = -9999; // mark to remove
          if (soul.type !== "blood") {
            spawnSoul();
          }
        }
      }

      // Zero-allocation in-place compaction for souls list
      let soulWriteIdx = 0;
      for (let i = 0; i < s.souls.length; i++) {
        const soul = s.souls[i];
        if (soul.x !== -9999) {
          s.souls[soulWriteIdx++] = soul;
        }
      }
      s.souls.length = soulWriteIdx;

      // 6. UPDATE ENEMIES
      s.enemies.forEach((enemy) => {
        const dxToPlayer = enemy.x - nextHead.x;
        const dyToPlayer = enemy.y - nextHead.y;
        const distToPlayerSq = dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer;
        const distToPlayer = Math.sqrt(distToPlayerSq);

        // Decay knockbacks
        if (enemy.knockbackX) enemy.knockbackX *= 0.82;
        if (enemy.knockbackY) enemy.knockbackY *= 0.82;

        // Apply Poison Ticks (Viper Fangs Skill)
        if (enemy.poisonTimer && enemy.poisonTimer > 0) {
          enemy.poisonTimer--;
          const tickDmg = enemy.poisonDmg || 0.1;
          enemy.hp -= tickDmg;
          enemy.flashTimer = Math.max(enemy.flashTimer || 0, 1);
          if (Math.random() < 0.12) {
            spawnParticle(
              enemy.x + (Math.random() - 0.5) * enemy.size,
              enemy.y + (Math.random() - 0.5) * enemy.size,
              (Math.random() - 0.5) * 1,
              -Math.random() * 1.5,
              "#84cc16", // Viper Green
              Math.random() * 2 + 1,
              20
            );
          }
        }

        // Bite / Poison application on head contact
        if (distToPlayer < enemy.size + 25) {
          if (skillsUnlocked["fang_poison"] > 0) {
            const pLevel = skillsUnlocked["fang_poison"];
            if (!enemy.poisonTimer || enemy.poisonTimer <= 0) {
              enemy.poisonTimer = 180; // 3 seconds
              enemy.poisonDmg = pLevel * 0.1; // Deal total 18 poison ticks (approx +5 damage per level)
              s.floatingTexts.push({
                x: enemy.x,
                y: enemy.y - 15,
                text: "POISONED",
                color: "#84cc16",
                life: 30
              });
            }
          }
        }

        // TERRAIN EFFECTS ON ENEMIES
        let enemyInFog = false;
        let enemyOnIce = false;
        // Reset fog stealth for non-assassins each frame
        if (enemy.type !== "assassin") {
          enemy.isStealth = false;
        }
        for (let ti = 0; ti < s.terrainTiles.length; ti++) {
          const tile = s.terrainTiles[ti];
          const inTile = tile.radius > 0
            ? Math.hypot(enemy.x - tile.x, enemy.y - tile.y) < tile.radius
            : (tile.width && tile.height
              ? enemy.x > tile.x && enemy.x < tile.x + tile.width &&
                enemy.y > tile.y && enemy.y < tile.y + tile.height
              : false);
          if (!inTile) continue;

          if (tile.type === "lava_pool") {
            enemy.hp -= 2 / 60;
            enemy.flashTimer = Math.max(enemy.flashTimer || 0, 1);
            if (Math.random() < 0.3) {
              spawnParticle(
                enemy.x + (Math.random() - 0.5) * enemy.size,
                enemy.y + (Math.random() - 0.5) * enemy.size,
                (Math.random() - 0.5) * 1,
                -Math.random() * 2,
                "#f87171",
                Math.random() * 3 + 1,
                15
              );
            }
          }
          if (tile.type === "poison_bog") {
            enemy.hp -= 0.3 / 60;
            enemy.flashTimer = Math.max(enemy.flashTimer || 0, 1);
          }
          if (tile.type === "ice_patch") {
            enemyOnIce = true;
          }
          if (tile.type === "fog_pocket") {
            enemyInFog = true;
          }
          if (tile.type === "fire_geyser" && tile.active) {
            const distG = Math.hypot(enemy.x - tile.x, enemy.y - tile.y);
            if (distG < tile.radius + 40) {
              enemy.hp -= 8 / 60;
              enemy.flashTimer = Math.max(enemy.flashTimer || 0, 3);
            }
          }
          if (tile.type === "toxic_vent" && tile.active) {
            const distV = Math.hypot(enemy.x - tile.x, enemy.y - tile.y);
            if (distV < tile.radius + 50) {
              enemy.hp -= 4 / 60;
              enemy.flashTimer = Math.max(enemy.flashTimer || 0, 2);
            }
          }
        }

        // Mark enemy as in fog for stealth rendering
        if (enemyInFog && enemy.type !== "boss") {
          enemy.isStealth = true;
        }

        // ARENA OBSTACLE COLLISION FOR ENEMIES
        for (let oi = 0; oi < s.arenaObstacles.length; oi++) {
          const ob = s.arenaObstacles[oi];
          const oCx = enemy.x, oCy = enemy.y, oCr = enemy.size;
          if (ob.type === "wall" || ob.type === "moving_barrier") {
            const cX = Math.max(ob.x, Math.min(oCx, ob.x + ob.width));
            const cY = Math.max(ob.y, Math.min(oCy, ob.y + ob.height));
            const dxO = oCx - cX, dyO = oCy - cY;
            const dSq = dxO * dxO + dyO * dyO;
            if (dSq < oCr * oCr) {
              const dist = Math.sqrt(dSq) || 1;
              const overlap = oCr - dist;
              enemy.x += (dxO / dist) * overlap;
              enemy.y += (dyO / dist) * overlap;
            }
          }
          if (ob.type === "spikes") {
            const cX = Math.max(ob.x, Math.min(oCx, ob.x + ob.width));
            const cY = Math.max(ob.y, Math.min(oCy, ob.y + ob.height));
            const dxS = oCx - cX, dyS = oCy - cY;
            if (dxS * dxS + dyS * dyS < (oCr + 6) * (oCr + 6)) {
              enemy.hp -= 1.5 / 60;
              enemy.flashTimer = Math.max(enemy.flashTimer || 0, 1);
            }
          }
          if (ob.type === "trap" && ob.trapTriggered) {
            const cX = Math.max(ob.x, Math.min(oCx, ob.x + ob.width));
            const cY = Math.max(ob.y, Math.min(oCy, ob.y + ob.height));
            const distT = Math.hypot(oCx - cX, oCy - cY);
            if (distT < Math.max(ob.width, ob.height) && !ob.trapTriggered && ob.trapCooldown > 150) {
              enemy.hp -= 10;
              enemy.flashTimer = Math.max(enemy.flashTimer || 0, 5);
            }
          }
        }

        // Check if caught in cyclone
        if (s.cycloneActive) {
          const dxC = enemy.x - s.cyclonePos.x;
          const dyC = enemy.y - s.cyclonePos.y;
          const distToCycloneSq = dxC * dxC + dyC * dyC;
          if (distToCycloneSq < 22500) { // 150 * 150 = 22500
            enemy.x += (s.cyclonePos.x - enemy.x) * 0.08;
            enemy.y += (s.cyclonePos.y - enemy.y) * 0.08;
            enemy.hp -= 0.6; // continuous cyclone ticks
            enemy.flashTimer = 2; // quick flash
          }
        }

        // If player is invulnerable/shielded and dashes through enemies, crush them
        if (s.speed > (4 + speedBonus) * 2.1 && distToPlayerSq < 1600) { // 40 * 40 = 1600
          const dashDmg = 25;
          enemy.hp -= dashDmg; // Massive hit
          enemy.flashTimer = 5;
          
          AudioManager.playMetalImpact();
          
          // Apply strong knockback
          const kAngle = Math.atan2(enemy.y - nextHead.y, enemy.x - nextHead.x);
          enemy.knockbackX = Math.cos(kAngle) * 20;
          enemy.knockbackY = Math.sin(kAngle) * 20;

          triggerParticleBurst(enemy.x, enemy.y, "#bef264", 15);
          s.shakeAmount = 10;
          s.hitStopDuration = 3; // 3 frames screen freeze
          
          s.floatingTexts.push({
            x: enemy.x,
            y: enemy.y - 20,
            text: `-${dashDmg}`,
            color: "#bef264",
            life: 30,
            maxLife: 30,
            scale: 1.6,
            vx: (Math.random() - 0.5) * 2
          });
        }

        // Tail-whip: if any other segment of the serpent collides with the enemy, knock them back and whip-damage them!
        const thresh = enemy.size + 15;
        const threshSq = thresh * thresh;
        for (let i = 1; i < s.serpentSegments.length; i++) {
          const seg = s.serpentSegments[i];
          if (!seg) continue;
          const dxS = enemy.x - seg.x;
          const dyS = enemy.y - seg.y;
          const distToSegSq = dxS * dxS + dyS * dyS;
          if (distToSegSq < threshSq) {
            // Apply slight knockback away from segment
            const kAngle = Math.atan2(dyS, dxS);
            enemy.knockbackX = Math.cos(kAngle) * 7;
            enemy.knockbackY = Math.sin(kAngle) * 7;
            
            // Whipping damages them! Especially if we are moving fast
            if (s.speed > 5) {
              let whipDmg = 3;
              if (skillsUnlocked["body_armor"] > 0) {
                whipDmg += skillsUnlocked["body_armor"] * 4; // Spiked Carapace skill
              }
              enemy.hp -= whipDmg;
              enemy.flashTimer = 2;
              if (Math.random() < 0.15) {
                AudioManager.playMetalImpact();
              }
              if (Math.random() < 0.2) {
                triggerParticleBurst(enemy.x, enemy.y, skillsUnlocked["body_armor"] > 0 ? "#84cc16" : "#ff7f74", 4);
              }
            }
            break;
          }
        }

        // Steer towards closest segment or head
        let speedFactor = s.isSlowed ? 0.25 : 1.0;
        if (enemyOnIce) speedFactor *= 0.5;
        const moveSpeed = enemy.speed * speedFactor;

        // 1. Separation force (Cooperation - don't cluster in a single spot)
        let separationX = 0;
        let separationY = 0;
        let neighborCount = 0;
        for (let j = 0; j < s.enemies.length; j++) {
          const other = s.enemies[j];
          if (other.id !== enemy.id && other.x !== -9999) {
            const dx = enemy.x - other.x;
            const dy = enemy.y - other.y;
            const dSq = dx * dx + dy * dy;
            if (dSq < 1600) { // 40 * 40 = 1600
              const d = Math.sqrt(dSq);
              separationX += dx / (d + 1);
              separationY += dy / (d + 1);
              neighborCount++;
            }
          }
        }
        if (neighborCount > 0) {
          separationX /= neighborCount;
          separationY /= neighborCount;
        }

        // 2. Intelligent Flanking Target
        let targetX = nextHead.x;
        let targetY = nextHead.y;
        if (enemy.type === "knight" || enemy.type === "wolf" || enemy.type === "skeleton") {
          const idHash = parseInt(enemy.id.slice(-4), 16) || (enemy.id.charCodeAt(0) + (enemy.id.charCodeAt(1) || 0));
          const flankAngle = (idHash % 4) * (Math.PI / 2);
          const flankDist = 30 + (idHash % 3) * 15;
          targetX += Math.cos(flankAngle) * flankDist;
          targetY += Math.sin(flankAngle) * flankDist;
        }

        // 3. Intelligent Pathfinding: Obstacle Avoidance (Walls & Hazards like cyclone)
        let wallAvoidanceX = 0;
        let wallAvoidanceY = 0;
        if (enemy.x < 80) wallAvoidanceX += (80 - enemy.x) * 0.15;
        if (enemy.x > arenaWidth - 80) wallAvoidanceX -= (enemy.x - (arenaWidth - 80)) * 0.15;
        if (enemy.y < 80) wallAvoidanceY += (80 - enemy.y) * 0.15;
        if (enemy.y > arenaHeight - 80) wallAvoidanceY -= (enemy.y - (arenaHeight - 80)) * 0.15;

        let hazardSteerX = 0;
        let hazardSteerY = 0;
        if (s.cycloneActive && enemy.type !== "skeleton") {
          const dxC = enemy.x - s.cyclonePos.x;
          const dyC = enemy.y - s.cyclonePos.y;
          const distToCycloneSq = dxC * dxC + dyC * dyC;
          if (distToCycloneSq < 40000) { // 200 * 200 = 40000
            const distToCyclone = Math.sqrt(distToCycloneSq);
            const angleFromCyclone = Math.atan2(dyC, dxC);
            // Steer away!
            hazardSteerX = Math.cos(angleFromCyclone) * 3.5;
            hazardSteerY = Math.sin(angleFromCyclone) * 3.5;
          }
        }

        // 4. Intelligent Dodging: React to Player Dash or special strike
        if (s.speed > (4 + speedBonus) * 1.5 && distToPlayerSq < 32400 && !enemy.dodgeTimer && enemy.type !== "skeleton") { // 180 * 180 = 32400
          const pToEnemyX = enemy.x - nextHead.x;
          const pToEnemyY = enemy.y - nextHead.y;
          const dotProduct = Math.cos(s.headingAngle) * pToEnemyX + Math.sin(s.headingAngle) * pToEnemyY;
          if (dotProduct > 0) { // Player heading towards enemy
            const perpAngle = s.headingAngle + (Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
            enemy.dodgeTimer = 22; // 22 frames dodge duration
            enemy.dodgeVx = Math.cos(perpAngle) * 4.2;
            enemy.dodgeVy = Math.sin(perpAngle) * 4.2;
            
            s.floatingTexts.push({
              x: enemy.x,
              y: enemy.y - 12,
              text: "DODGE!",
              color: "#ffffff",
              life: 20,
              maxLife: 20,
              scale: 0.9
            });
          }
        }

        // Move vectors
        let mx = 0;
        let my = 0;

        // 5. Tactical State Machines per Enemy Type
        if (enemy.type === "knight") {
          if (enemy.state === "charge") {
            enemy.stateTimer = (enemy.stateTimer || 1) - 1;
            if (enemy.stateTimer > 35) {
              enemy.shudderTimer = 2;
              enemy.flashTimer = 2;
            } else {
              const chargeAngle = enemy.angle;
              mx = Math.cos(chargeAngle) * 4.2 * speedFactor;
              my = Math.sin(chargeAngle) * 4.2 * speedFactor;
              if (Math.random() < 0.25) {
                spawnParticle(
                  enemy.x,
                  enemy.y,
                  -Math.cos(chargeAngle) * 1.5,
                  -Math.sin(chargeAngle) * 1.5,
                  "rgba(255,127,116,0.35)",
                  Math.random() * 2 + 1,
                  15
                );
              }
            }
            if (enemy.stateTimer <= 0) {
              enemy.state = "chase";
              enemy.chargeCooldown = 150;
            }
          } else {
            const angleToTarget = Math.atan2(targetY - enemy.y, targetX - enemy.x);
            enemy.angle = angleToTarget;
            mx = Math.cos(angleToTarget) * moveSpeed;
            my = Math.sin(angleToTarget) * moveSpeed;

            if (enemy.chargeCooldown > 0) {
              enemy.chargeCooldown--;
            } else if (distToPlayer < 200 && distToPlayer > 80 && Math.random() < 0.015) {
              enemy.state = "charge";
              enemy.stateTimer = 55;
              enemy.angle = Math.atan2(nextHead.y - enemy.y, nextHead.x - enemy.x);
            }
          }

        } else if (enemy.type === "wolf") {
          const angleToTarget = Math.atan2(targetY - enemy.y, targetX - enemy.x);
          enemy.angle = angleToTarget;
          mx = Math.cos(angleToTarget) * moveSpeed;
          my = Math.sin(angleToTarget) * moveSpeed;

        } else if (enemy.type === "archer") {
          const angleToPlayer = Math.atan2(nextHead.y - enemy.y, nextHead.x - enemy.x);
          if (distToPlayer < 180) {
            mx = -Math.cos(angleToPlayer) * moveSpeed * 1.35;
            my = -Math.sin(angleToPlayer) * moveSpeed * 1.35;
            enemy.angle = angleToPlayer + Math.PI;
          } else if (distToPlayer > 350) {
            mx = Math.cos(angleToPlayer) * moveSpeed;
            my = Math.sin(angleToPlayer) * moveSpeed;
            enemy.angle = angleToPlayer;
          } else {
            const circleAngle = angleToPlayer + Math.PI / 2;
            mx = Math.cos(circleAngle) * moveSpeed * 0.75;
            my = Math.sin(circleAngle) * moveSpeed * 0.75;
            enemy.angle = angleToPlayer;
          }

          enemy.shootCooldown--;
          if (enemy.shootCooldown <= 0) {
            enemy.shootCooldown = 120 + Math.random() * 50;
            s.projectiles.push({
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(angleToPlayer) * 4.8 * speedFactor,
              vy: Math.sin(angleToPlayer) * 4.8 * speedFactor,
              color: "#a3e635",
              size: 4
            });
            triggerParticleBurst(enemy.x, enemy.y, "#a3e635", 4);
          }

        } else if (enemy.type === "wizard") {
          const wizardAngle = Math.atan2(nextHead.y - enemy.y, nextHead.x - enemy.x);
          if (distToPlayer < 130) {
            // Teleport blink!
            const tpAngle = Math.random() * Math.PI * 2;
            const tpDist = 200 + Math.random() * 80;
            const oldX = enemy.x;
            const oldY = enemy.y;
            enemy.x = Math.max(30, Math.min(arenaWidth - 30, nextHead.x + Math.cos(tpAngle) * tpDist));
            enemy.y = Math.max(30, Math.min(arenaHeight - 30, nextHead.y + Math.sin(tpAngle) * tpDist));

            triggerParticleBurst(oldX, oldY, "#a78bfa", 12);
            triggerParticleBurst(enemy.x, enemy.y, "#a78bfa", 12);
            s.glowingRings.push({
              x: oldX,
              y: oldY,
              r: 5,
              maxR: 45,
              color: "#a78bfa",
              alpha: 1.0
            });
            s.floatingTexts.push({
              x: oldX,
              y: oldY - 20,
              text: "BLINK!",
              color: "#a78bfa",
              life: 25,
              maxLife: 25,
              scale: 1.1
            });
          } else {
            mx = Math.cos(wizardAngle) * moveSpeed;
            my = Math.sin(wizardAngle) * moveSpeed;
            enemy.angle = wizardAngle;
          }

          enemy.shootCooldown--;
          if (enemy.shootCooldown <= 0) {
            enemy.shootCooldown = 160;
            s.projectiles.push({
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(wizardAngle) * 3.5 * speedFactor,
              vy: Math.sin(wizardAngle) * 3.5 * speedFactor,
              color: "#a78bfa",
              size: 5
            });
          }

        } else if (enemy.type === "assassin") {
          const assassinAngle = Math.atan2(nextHead.y - enemy.y, nextHead.x - enemy.x);
          if (enemy.state === "ambush") {
            enemy.stateTimer = (enemy.stateTimer || 1) - 1;
            mx = Math.cos(enemy.angle) * 5.0 * speedFactor;
            my = Math.sin(enemy.angle) * 5.0 * speedFactor;
            enemy.isStealth = false;

            if (Math.random() < 0.35) {
              spawnParticle(
                enemy.x,
                enemy.y,
                0,
                0,
                "rgba(56, 189, 248, 0.4)",
                enemy.size,
                10
              );
            }
            if (enemy.stateTimer <= 0) {
              enemy.state = "stealth";
              enemy.isStealth = true;
            }
          } else {
            mx = Math.cos(assassinAngle) * moveSpeed * 0.8;
            my = Math.sin(assassinAngle) * moveSpeed * 0.8;
            enemy.angle = assassinAngle;
            enemy.isStealth = true;

            if (distToPlayer < 170 && Math.random() < 0.04) {
              enemy.state = "ambush";
              enemy.stateTimer = 40;
              enemy.angle = assassinAngle;
              enemy.isStealth = false;
              enemy.flashTimer = 8;

              s.floatingTexts.push({
                x: enemy.x,
                y: enemy.y - 15,
                text: "AMBUSH!",
                color: "#38bdf8",
                life: 35,
                maxLife: 35,
                scale: 1.3
              });
              triggerParticleBurst(enemy.x, enemy.y, "#38bdf8", 12);
            }
          }

        } else if (enemy.type === "necromancer") {
          const necroAngle = Math.atan2(nextHead.y - enemy.y, nextHead.x - enemy.x);
          if (distToPlayer < 240) {
            mx = -Math.cos(necroAngle) * moveSpeed * 1.25;
            my = -Math.sin(necroAngle) * moveSpeed * 1.25;
            enemy.angle = necroAngle + Math.PI;
          } else if (distToPlayer > 400) {
            mx = Math.cos(necroAngle) * moveSpeed;
            my = Math.sin(necroAngle) * moveSpeed;
            enemy.angle = necroAngle;
          } else {
            const circleAngle = necroAngle + Math.PI / 2;
            mx = Math.cos(circleAngle) * moveSpeed * 0.6;
            my = Math.sin(circleAngle) * moveSpeed * 0.6;
            enemy.angle = necroAngle;
          }

          enemy.summonCooldown = (enemy.summonCooldown || 0) - 1;
          if (enemy.summonCooldown <= 0) {
            enemy.summonCooldown = 220 + Math.random() * 60;
            enemy.flashTimer = 12;

            for (let i = 0; i < 2; i++) {
              const sAngle = Math.random() * Math.PI * 2;
              const sx = enemy.x + Math.cos(sAngle) * 35;
              const sy = enemy.y + Math.sin(sAngle) * 35;

              s.enemies.push({
                id: Math.random().toString(),
                x: Math.max(25, Math.min(arenaWidth - 25, sx)),
                y: Math.max(25, Math.min(arenaHeight - 25, sy)),
                type: "skeleton",
                hp: 15,
                maxHp: 15,
                speed: 1.6,
                size: 11,
                chargeCooldown: 0,
                shootCooldown: 0,
                angle: sAngle,
                state: "chase"
              });
              triggerParticleBurst(sx, sy, "#e2e8f0", 6);
            }

            s.floatingTexts.push({
              x: enemy.x,
              y: enemy.y - 20,
              text: "+RISE!+",
              color: "#e11d48",
              life: 40,
              maxLife: 40,
              scale: 1.2
            });
            s.glowingRings.push({
              x: enemy.x,
              y: enemy.y,
              r: 5,
              maxR: 45,
              color: "#e11d48",
              alpha: 1.0
            });
          }

        } else if (enemy.type === "skeleton") {
          const skelAngle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
          enemy.angle = skelAngle;
          mx = Math.cos(skelAngle) * moveSpeed;
          my = Math.sin(skelAngle) * moveSpeed;

        } else if (enemy.type === "boss") {
          // Dynamic Multi-Phase Boss
          let phase = 1;
          if (enemy.hp <= 350) {
            phase = 3;
          } else if (enemy.hp <= 700) {
            phase = 2;
          }

          if (enemy.phase !== phase) {
            enemy.phase = phase;
            s.hitStopDuration = 15;
            s.shakeAmount = 18;

            let text = "PHASE 2: DEFIANT SHELL!";
            let col = "#e9c176";
            if (phase === 3) {
              text = "FINAL PHASE: ENRAGED CHAOS!";
              col = "#ff7f74";
            }

            s.floatingTexts.push({
              x: enemy.x,
              y: enemy.y - 70,
              text,
              color: col,
              life: 130,
              maxLife: 130,
              scale: 1.8
            });

            s.glowingRings.push({
              x: enemy.x,
              y: enemy.y,
              r: 20,
              maxR: 240,
              color: col,
              alpha: 1.0
            });

            if (phase === 2) {
              spawnEnemy("necromancer");
              spawnEnemy("knight");
              spawnEnemy("knight");
            } else if (phase === 3) {
              spawnEnemy("wolf");
              spawnEnemy("wolf");
              spawnEnemy("assassin");
            }
          }

          const bossAngle = Math.atan2(nextHead.y - enemy.y, nextHead.x - enemy.x);
          enemy.angle = bossAngle;

          let bossSpeedMult = 1.0;
          if (phase === 2) bossSpeedMult = 1.15;
          if (phase === 3) bossSpeedMult = 1.45;

          mx = Math.cos(bossAngle) * moveSpeed * bossSpeedMult;
          my = Math.sin(bossAngle) * moveSpeed * bossSpeedMult;

          // Attack routines per phase
          enemy.shootCooldown--;
          if (enemy.shootCooldown <= 0) {
            if (phase === 1) {
              enemy.shootCooldown = 110;
              for (let i = 0; i < 8; i++) {
                const projAngle = (Math.PI / 4) * i;
                s.projectiles.push({
                  x: enemy.x,
                  y: enemy.y,
                  vx: Math.cos(projAngle) * 4.5,
                  vy: Math.sin(projAngle) * 4.5,
                  color: "#ff7f74",
                  size: 7
                });
              }
            } else if (phase === 2) {
              enemy.shootCooldown = 85;
              const angleToPlayer = Math.atan2(nextHead.y - enemy.y, nextHead.x - enemy.x);
              for (let i = -1; i <= 1; i++) {
                const spreadAngle = angleToPlayer + i * 0.25;
                s.projectiles.push({
                  x: enemy.x,
                  y: enemy.y,
                  vx: Math.cos(spreadAngle) * 5.2,
                  vy: Math.sin(spreadAngle) * 5.2,
                  color: "#e9c176",
                  size: 8
                });
              }
            } else if (phase === 3) {
              enemy.shootCooldown = 40;
              const spiralOffset = (Date.now() / 150) % (Math.PI * 2);
              for (let i = 0; i < 5; i++) {
                const spiralAngle = spiralOffset + (i * Math.PI * 2) / 5;
                s.projectiles.push({
                  x: enemy.x,
                  y: enemy.y,
                  vx: Math.cos(spiralAngle) * 5.8,
                  vy: Math.sin(spiralAngle) * 5.8,
                  color: "#ff3b30",
                  size: 9
                });
              }

              if (Math.random() < 0.45) {
                s.glowingRings.push({
                  x: enemy.x,
                  y: enemy.y,
                  r: 10,
                  maxR: 320,
                  color: "#ff3b30",
                  alpha: 1.0
                });
                s.shakeAmount = 15;
                if (distToPlayer < 240) {
                  if (!s.isShielded) {
                    s.playerHealth -= 5;
                    s.screenFlash = 0.45;
                    triggerHaptic([30, 20, 30]);
                  }
                }
              }
            }
          }
        }

        // Apply knockbacks and sum movement vectors
        const kx = enemy.knockbackX || 0;
        const ky = enemy.knockbackY || 0;

        let dodgeX = 0;
        let dodgeY = 0;
        if (enemy.dodgeTimer && enemy.dodgeTimer > 0) {
          enemy.dodgeTimer--;
          dodgeX = enemy.dodgeVx || 0;
          dodgeY = enemy.dodgeVy || 0;
        }

        // Apply final positioning with integrated pathfinding (avoidance, separation)
        enemy.x += mx + kx + separationX * 1.8 + wallAvoidanceX + hazardSteerX + dodgeX;
        enemy.y += my + ky + separationY * 1.8 + wallAvoidanceY + hazardSteerY + dodgeY;

        // Damage serpent on collision
        if (distToPlayer < enemy.size + 15) {
          if (!s.isShielded) {
            let dmgTaken = enemy.type === "boss" ? 1.5 : 0.4;
            if (equippedRelics.includes("crown_greed")) {
              dmgTaken *= 1.2; // Avarice drawback
            }
            s.playerHealth -= dmgTaken;
            s.shakeAmount = 6;
            s.screenFlash = 0.3; // blood overlay
            s.hitStopDuration = 2; // quick freeze on taking hit
            triggerHaptic([30, 20, 30]);
            
            // Barbed Thorn Collar reflection
            if (equippedRelics.includes("thorns")) {
              enemy.hp -= 15;
              s.floatingTexts.push({
                x: enemy.x,
                y: enemy.y - 15,
                text: "15 THORNS",
                color: "#f87171",
                life: 25,
                maxLife: 25
              });
            }

            // Wolves, knights, assassins, skeletons die on impact with shields
            if (enemy.type === "wolf" || enemy.type === "knight" || enemy.type === "skeleton" || enemy.type === "assassin") {
              enemy.hp -= 5;
            }
          }
        }

        // Slay enemy
        if (enemy.hp <= 0) {
          let scoreReward = 300;
          if (enemy.type === "boss") scoreReward = 10000;
          else if (enemy.type === "skeleton") scoreReward = 100;
          else if (enemy.type === "wolf") scoreReward = 200;
          else if (enemy.type === "knight") scoreReward = 250;
          else if (enemy.type === "archer") scoreReward = 300;
          else if (enemy.type === "wizard") scoreReward = 350;
          else if (enemy.type === "assassin") scoreReward = 400;
          else if (enemy.type === "necromancer") scoreReward = 500;

          // Lava kills grant bonus score
          const inLava = s.terrainTiles.some(t => t.type === "lava_pool" &&
            Math.hypot(enemy.x - t.x, enemy.y - t.y) < t.radius);
          if (inLava && enemy.type !== "boss") {
            const bonus = Math.floor(scoreReward * 0.5);
            scoreReward += bonus;
            s.floatingTexts.push({
              x: enemy.x,
              y: enemy.y - 30,
              text: `+${bonus} LAVA BONUS`,
              color: "#f87171",
              life: 40,
              maxLife: 40,
              scale: 1.1
            });
          }

          s.score += scoreReward;
          triggerParticleBurst(enemy.x, enemy.y, enemy.type === "boss" ? "#7d000a" : enemy.type === "skeleton" ? "#e2e8f0" : "#bef264", 20);
          
          // Hit stop and screenshake on kill
          s.hitStopDuration = enemy.type === "boss" ? 22 : 4;
          s.shakeAmount = enemy.type === "boss" ? 20 : 7;

          if (enemy.type === "boss") {
            s.bossActive = false;
            
            // Play roar and victory fanfare
            AudioManager.playDragonRoar();
            AudioManager.setBgmState("victory");

            // Spawns 3 high crystal shards!
            for (let i = 0; i < 3; i++) spawnSoul("gold");
            s.floatingTexts.push({
              x: enemy.x,
              y: enemy.y - 30,
              text: "BOSS VANQUISHED!",
              color: "#4edea3",
              life: 150,
              maxLife: 150,
              scale: 2.0
            });
            s.glowingRings.push({
              x: enemy.x,
              y: enemy.y,
              r: 10,
              maxR: 250,
              color: "#e9c176",
              alpha: 1.0
            });
          } else {
            s.floatingTexts.push({
              x: enemy.x,
              y: enemy.y - 15,
              text: `SLAYED!`,
              color: "#bef264",
              life: 40,
              maxLife: 40,
              scale: 1.3,
              vx: (Math.random() - 0.5) * 1.5
            });
          }
          
          s.enemiesKilled += 1;
          onQuestProgress("quest_2", 1); // slay quest
          
          // Crimson Feast drops a blood orb (5% per level)
          if (skillsUnlocked["blood_feast"] > 0) {
            const chance = skillsUnlocked["blood_feast"] * 0.05;
            if (Math.random() < chance) {
              s.souls.push({
                id: Math.random().toString(),
                x: enemy.x,
                y: enemy.y,
                type: "blood",
                size: 8,
                pulseTimer: Math.random() * 5,
                isAttracted: false
              });
              s.floatingTexts.push({
                x: enemy.x,
                y: enemy.y - 15,
                text: "BLOOD ORB",
                color: "#f43f5e",
                life: 45
              });
            }
          }

          enemy.x = -9999; // remove
        }
      });

      // Filter dead enemies (in-place zero-allocation compaction)
      let enemyWriteIdx = 0;
      for (let i = 0; i < s.enemies.length; i++) {
        const enemy = s.enemies[i];
        if (enemy.x !== -9999) {
          s.enemies[enemyWriteIdx++] = enemy;
        }
      }
      s.enemies.length = enemyWriteIdx;

      // Keep spawning enemies to keep dungeon alive
      if (s.enemies.length < 15 && !s.bossActive) {
        spawnEnemy();
      }

      // Check Boss Spawn condition
      if (s.score >= 15000 && !s.bossActive && s.enemies.every(e => e.type !== "boss")) {
        spawnBoss();
      }

      // ==========================================
      // ELDRITCH SPORES PROGRESSION SKILL
      // ==========================================
      // Spore Spawn (Every 90 frames from tail)
      if (skillsUnlocked["spark_magic"] > 0 && s.frameCount % 90 === 0 && s.frameCount > 0) {
        const tail = s.serpentSegments[s.serpentSegments.length - 1];
        if (tail) {
          s.spores.push({
            x: tail.x,
            y: tail.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 300, // 5 seconds
            damage: skillsUnlocked["spark_magic"] * 15
          });
        }
      }

      // Spores Update (Drift, detect overlap, detonate)
      s.spores.forEach((spore) => {
        spore.x += spore.vx;
        spore.y += spore.vy;
        spore.life--;

        // Collision with any active enemies
        s.enemies.forEach((enemy) => {
          if (enemy.x !== -9999) {
            const dx = enemy.x - spore.x;
            const dy = enemy.y - spore.y;
            if (dx * dx + dy * dy < (enemy.size + 15) * (enemy.size + 15)) {
              spore.life = 0; // mark to destroy
              
              // Deal radial AoE damage
              s.enemies.forEach((other) => {
                if (other.x !== -9999) {
                  const dxO = other.x - spore.x;
                  const dyO = other.y - spore.y;
                  if (dxO * dxO + dyO * dyO < 14400) { // 120px radius
                    other.hp -= spore.damage;
                    other.flashTimer = 6;
                    
                    const kAngle = Math.atan2(dyO, dxO);
                    other.knockbackX = Math.cos(kAngle) * 8;
                    other.knockbackY = Math.sin(kAngle) * 8;
                    
                    s.floatingTexts.push({
                      x: other.x,
                      y: other.y - 15,
                      text: `-${Math.round(spore.damage)} SPORE`,
                      color: "#c084fc",
                      life: 30
                    });
                  }
                }
              });

              // Explosion effects
              triggerParticleBurst(spore.x, spore.y, "#c084fc", 15);
              s.glowingRings.push({
                x: spore.x,
                y: spore.y,
                r: 5,
                maxR: 120,
                color: "#c084fc",
                alpha: 1.0
              });
              AudioManager.playMetalImpact();
            }
          }
        });
      });
      s.spores = s.spores.filter((spore) => spore.life > 0);

      // 7. UPDATE PROJECTILES
      for (let i = 0; i < s.projectiles.length; i++) {
        const proj = s.projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Collision with serpent (using optimized distance squared checks)
        const dx = proj.x - nextHead.x;
        const dy = proj.y - nextHead.y;
        const distSq = dx * dx + dy * dy;
        const threshold = proj.size + 15;
        if (distSq < threshold * threshold) {
          if (!s.isShielded) {
            s.playerHealth -= 8;
            s.shakeAmount = 10;
            s.screenFlash = 0.45;
            triggerHaptic([30, 20, 30]);
          }
          proj.x = -9999; // destroy
        }
      }
      
      // In-place compaction for projectiles
      let projWriteIdx = 0;
      for (let i = 0; i < s.projectiles.length; i++) {
        const proj = s.projectiles[i];
        if (proj.x > -100 && proj.x < arenaWidth + 100 && proj.y > -100 && proj.y < arenaHeight + 100 && proj.x !== -9999) {
          s.projectiles[projWriteIdx++] = proj;
        }
      }
      s.projectiles.length = projWriteIdx;

      // 8. UPDATE PARTICLES & TEXTS & RINGS (using particle pooling and in-place array compaction)
      for (let i = 0; i < s.particles.length; i++) {
        const p = s.particles[i];
        if (p.active) {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          if (p.life >= p.maxLife) {
            p.active = false;
          }
        }
      }

      let textWriteIdx = 0;
      for (let i = 0; i < s.floatingTexts.length; i++) {
        const t = s.floatingTexts[i];
        const vx = t.vx || 0;
        t.x += vx;
        t.y -= 0.8;
        t.life--;
        if (t.life > 0) {
          s.floatingTexts[textWriteIdx++] = t;
        }
      }
      s.floatingTexts.length = textWriteIdx;

      let ringWriteIdx = 0;
      for (let i = 0; i < s.glowingRings.length; i++) {
        const ring = s.glowingRings[i];
        ring.r += 3.5;
        ring.alpha = Math.max(0, 1 - ring.r / ring.maxR);
        if (ring.alpha > 0.01) {
          s.glowingRings[ringWriteIdx++] = ring;
        }
      }
      s.glowingRings.length = ringWriteIdx;

      // 9. CHECK DEATH / RUN END
      if (s.playerHealth <= 0) {
        if (equippedArtifact === "phoenix_ash" && !s.hasRevived) {
          s.hasRevived = true;
          s.playerHealth = Math.floor(s.playerMaxHealth * 0.5);
          s.screenFlash = 0.8;
          s.shakeAmount = 15;
          s.floatingTexts.push({
            x: head.x,
            y: head.y - 30,
            text: "PHOENIX ASHES REVIVED! (50% HP)",
            color: "#f87171",
            life: 80,
            maxLife: 80
          });

          // Ring visual
          s.glowingRings.push({
            x: head.x,
            y: head.y,
            r: 10,
            maxR: 200,
            color: "#f87171",
            alpha: 1
          });

          // Explode particles
          triggerParticleBurst(head.x, head.y, "#f87171", 35);
        } else {
          // Run over! Calculate rewards earned
          const finalCoins = Math.ceil((s.score / 150) * goldMultiplier);
          const finalXp = Math.ceil((s.score / 70));
          
          // Find if boss died (if boss active is false but boss spawned)
          const defBoss = s.score >= 15000; 

          onGameOver(s.score, finalCoins, finalXp, defBoss);
          return;
        }
      }

      // Report boss state to parent
      if (onBossState) {
        if (s.bossActive) {
          const bossEnemy = s.enemies.find(e => e.type === "boss");
          if (bossEnemy) {
            const pct = Math.max(0, Math.min(100, (bossEnemy.hp / bossEnemy.maxHp) * 100));
            onBossState(true, pct);
          } else {
            onBossState(false, 0);
          }
        } else {
          onBossState(false, 0);
        }
      }

      // Live metrics state sync for HUD
      // Using custom event to prevent massive re-renders of GameCanvas
      const now = Date.now();
      if (!s.lastEventTime || now - s.lastEventTime > 50) {
        s.lastEventTime = now;
        window.dispatchEvent(new CustomEvent('game-metrics-update', {
          detail: { score: s.score, soulsCount: s.soulsCount }
        }));
      }

      } // end `if (elapsed >= frameInterval - 1)` physics tick

      // 10. DRAWING EVERYTHING (CANVAS RENDERER) — runs every animation frame
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      ctx.save();
      
      // CAMERA SYSTEM (Center camera smooth follow with interpolation & boundary clamping)
      const camHead = s.serpentSegments[0] || s.cameraPos;
      const targetCamX = camHead.x - dimensions.width / 2;
      const targetCamY = camHead.y - dimensions.height / 2;

      // Smooth camera interpolation (lerp)
      s.cameraPos.x += (targetCamX - s.cameraPos.x) * 0.12;
      s.cameraPos.y += (targetCamY - s.cameraPos.y) * 0.12;

      // Arena boundary clamping (prevents showing outer space)
      const minCamX = 0;
      const maxCamX = Math.max(0, arenaWidth - dimensions.width);
      const minCamY = 0;
      const maxCamY = Math.max(0, arenaHeight - dimensions.height);

      const clampedCamX = Math.max(minCamX, Math.min(maxCamX, s.cameraPos.x));
      const clampedCamY = Math.max(minCamY, Math.min(maxCamY, s.cameraPos.y));

      // Apply screenshake around interpolated camera
      let shakeX = 0;
      let shakeY = 0;
      if (s.shakeAmount > 0.1) {
        shakeX = (Math.random() - 0.5) * s.shakeAmount;
        shakeY = (Math.random() - 0.5) * s.shakeAmount;
      }

      ctx.translate(-clampedCamX + shakeX, -clampedCamY + shakeY);

      // Draw Dungeon Floor Grid/Runes
      ctx.strokeStyle = "rgba(78, 222, 163, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < arenaWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, arenaHeight);
        ctx.stroke();
      }
      for (let y = 0; y < arenaHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(arenaWidth, y);
        ctx.stroke();
      }

      // Draw Arena Borders (obsidian stone style)
      ctx.strokeStyle = "#e9c176";
      ctx.lineWidth = 8;
      ctx.strokeRect(0, 0, arenaWidth, arenaHeight);
      
      // Ambient ancient glyphs
      ctx.fillStyle = "rgba(233, 193, 118, 0.1)";
      ctx.font = "bold 24px Orbitron";
      ctx.fillText("SERPENT VAULT I", 100, 150);
      ctx.fillText("ANCIENT ROYAL COURT", arenaWidth - 400, arenaHeight - 150);

      // TERRAIN FEATURES RENDERING
      s.terrainTiles.forEach((tile) => {
        ctx.save();

        if (tile.type === "rune_circle") {
          const pulse = 0.8 + Math.sin(tile.animTimer * 0.03) * 0.2;
          const grad = ctx.createRadialGradient(tile.x, tile.y, 2, tile.x, tile.y, tile.radius * pulse);
          grad.addColorStop(0, "rgba(78, 222, 163, 0.15)");
          grad.addColorStop(0.6, "rgba(78, 222, 163, 0.08)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(tile.x, tile.y, tile.radius * pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(78, 222, 163, ${0.2 + Math.sin(tile.animTimer * 0.05) * 0.1})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 12]);
          ctx.beginPath();
          ctx.arc(tile.x, tile.y, tile.radius * 0.6 * pulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Rune symbols
          ctx.fillStyle = `rgba(78, 222, 163, ${0.15 + Math.sin(tile.animTimer * 0.04) * 0.08})`;
          ctx.font = "18px serif";
          ctx.textAlign = "center";
          ctx.fillText("ᛉ", tile.x, tile.y + 6);
        }

        if (tile.type === "ice_patch") {
          const w = tile.width || 100;
          const h = tile.height || 100;
          ctx.fillStyle = "rgba(125, 211, 252, 0.12)";
          ctx.beginPath();
          const r = 8;
          ctx.moveTo(tile.x + r, tile.y);
          ctx.lineTo(tile.x + w - r, tile.y);
          ctx.quadraticCurveTo(tile.x + w, tile.y, tile.x + w, tile.y + r);
          ctx.lineTo(tile.x + w, tile.y + h - r);
          ctx.quadraticCurveTo(tile.x + w, tile.y + h, tile.x + w - r, tile.y + h);
          ctx.lineTo(tile.x + r, tile.y + h);
          ctx.quadraticCurveTo(tile.x, tile.y + h, tile.x, tile.y + h - r);
          ctx.lineTo(tile.x, tile.y + r);
          ctx.quadraticCurveTo(tile.x, tile.y, tile.x + r, tile.y);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = "rgba(125, 211, 252, 0.25)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Frost hex pattern
          for (let hi = 0; hi < 3; hi++) {
            for (let hj = 0; hj < 3; hj++) {
              const hx = tile.x + 15 + hi * (w - 30) / 2;
              const hy = tile.y + 15 + hj * (h - 30) / 2;
              ctx.strokeStyle = "rgba(125, 211, 252, 0.08)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              for (let side = 0; side < 6; side++) {
                const a = (Math.PI / 3) * side - Math.PI / 6;
                const px = hx + Math.cos(a) * 8;
                const py = hy + Math.sin(a) * 8;
                side === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.stroke();
            }
          }
        }

        if (tile.type === "fog_pocket") {
          const fogPulse = 0.9 + Math.sin(tile.animTimer * 0.02) * 0.1;
          const grad = ctx.createRadialGradient(tile.x, tile.y, 5, tile.x, tile.y, tile.radius * fogPulse);
          grad.addColorStop(0, "rgba(30, 40, 30, 0.55)");
          grad.addColorStop(0.5, "rgba(30, 40, 30, 0.35)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(tile.x, tile.y, tile.radius * fogPulse, 0, Math.PI * 2);
          ctx.fill();
        }

        if (tile.type === "grave") {
          const gW = tile.width || 20;
          const gH = tile.height || 28;
          // Tombstone body
          ctx.fillStyle = "rgba(60, 55, 50, 0.85)";
          ctx.beginPath();
          ctx.moveTo(tile.x + 3, tile.y);
          ctx.quadraticCurveTo(tile.x + gW / 2, tile.y - 8, tile.x + gW - 3, tile.y);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "rgba(45, 42, 38, 0.9)";
          ctx.fillRect(tile.x + 1, tile.y + 2, gW - 2, gH - 2);

          // Epitaph scratch
          ctx.fillStyle = "rgba(100, 90, 80, 0.5)";
          ctx.font = "6px serif";
          ctx.textAlign = "center";
          ctx.fillText("RIP", tile.x + gW / 2, tile.y + gH / 2 + 2);
        }

        if (tile.type === "lava_pool") {
          const bubble = Math.sin(tile.animTimer * 0.08) * 3;
          const grad = ctx.createRadialGradient(tile.x, tile.y, 2, tile.x, tile.y, tile.radius);
          grad.addColorStop(0, "rgba(255, 127, 116, 0.35)");
          grad.addColorStop(0.5, "rgba(248, 113, 113, 0.15)");
          grad.addColorStop(0.8, "rgba(200, 60, 30, 0.08)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(tile.x, tile.y + bubble, tile.radius, 0, Math.PI * 2);
          ctx.fill();

          // Ember particles on lava surface
          if (Math.random() < 0.3) {
            const ax = tile.x + (Math.random() - 0.5) * tile.radius * 1.5;
            const ay = tile.y + (Math.random() - 0.5) * tile.radius * 1.5;
            ctx.fillStyle = `rgba(255, 200, 100, ${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(ax, ay, Math.random() * 2 + 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (tile.type === "fire_geyser") {
          const isActive = tile.active;
          // Vent base
          ctx.fillStyle = "rgba(60, 35, 30, 0.8)";
          ctx.beginPath();
          ctx.arc(tile.x, tile.y, tile.radius, 0, Math.PI * 2);
          ctx.fill();

          if (isActive) {
            // Flame column
            const flameH = 40 + Math.sin(tile.animTimer * 0.5) * 15;
            const grad = ctx.createRadialGradient(tile.x, tile.y - flameH / 2, 2, tile.x, tile.y - flameH / 2, flameH / 2 + 10);
            grad.addColorStop(0, "rgba(255, 200, 50, 0.5)");
            grad.addColorStop(0.4, "rgba(255, 100, 30, 0.3)");
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.fillRect(tile.x - 25, tile.y - flameH - 10, 50, flameH + 20);

            // Core flame
            ctx.fillStyle = "rgba(255, 220, 100, 0.6)";
            ctx.beginPath();
            ctx.arc(tile.x, tile.y - flameH + 10, 8, 0, Math.PI * 2);
            ctx.fill();

            // Sparks
            for (let si = 0; si < 3; si++) {
              const sx = tile.x + (Math.random() - 0.5) * 30;
              const sy = tile.y - Math.random() * flameH;
              ctx.fillStyle = `rgba(255, 200, 50, ${Math.random() * 0.5})`;
              ctx.beginPath();
              ctx.arc(sx, sy, Math.random() * 2 + 1, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Warning glow
          const glowIntensity = isActive ? 0.3 : 0.08;
          const glowGrad = ctx.createRadialGradient(tile.x, tile.y, 2, tile.x, tile.y, tile.radius + 30);
          glowGrad.addColorStop(0, `rgba(255, 127, 116, ${glowIntensity})`);
          glowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(tile.x, tile.y, tile.radius + 30, 0, Math.PI * 2);
          ctx.fill();
        }

        if (tile.type === "poison_bog") {
          const bogPulse = 0.95 + Math.sin(tile.animTimer * 0.03) * 0.05;
          const grad = ctx.createRadialGradient(tile.x, tile.y, 2, tile.x, tile.y, tile.radius * bogPulse);
          grad.addColorStop(0, "rgba(190, 242, 100, 0.2)");
          grad.addColorStop(0.5, "rgba(132, 200, 64, 0.12)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(tile.x, tile.y, tile.radius * bogPulse, 0, Math.PI * 2);
          ctx.fill();

          // Bubbles
          if (Math.random() < 0.15) {
            const bx = tile.x + (Math.random() - 0.5) * tile.radius * 1.2;
            const by = tile.y + (Math.random() - 0.5) * tile.radius * 1.2;
            ctx.strokeStyle = "rgba(190, 242, 100, 0.2)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bx, by, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        if (tile.type === "toxic_vent") {
          const isActive = tile.active;
          // Vent base
          ctx.fillStyle = "rgba(40, 50, 30, 0.8)";
          ctx.beginPath();
          ctx.arc(tile.x, tile.y, tile.radius, 0, Math.PI * 2);
          ctx.fill();

          // Gas cloud when active
          if (isActive) {
            const cloudR = tile.radius + 30 + Math.sin(tile.animTimer * 0.3) * 10;
            const grad = ctx.createRadialGradient(tile.x, tile.y, 2, tile.x, tile.y, cloudR);
            grad.addColorStop(0, "rgba(132, 204, 22, 0.3)");
            grad.addColorStop(0.6, "rgba(132, 204, 22, 0.12)");
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(tile.x, tile.y, cloudR, 0, Math.PI * 2);
            ctx.fill();

            for (let gi = 0; gi < 4; gi++) {
              const gx = tile.x + (Math.random() - 0.5) * 40;
              const gy = tile.y + (Math.random() - 0.5) * 40;
              ctx.fillStyle = `rgba(132, 204, 22, ${Math.random() * 0.15})`;
              ctx.beginPath();
              ctx.arc(gx, gy, Math.random() * 6 + 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Warning glow
          const warningGrad = ctx.createRadialGradient(tile.x, tile.y, 2, tile.x, tile.y, tile.radius + 20);
          warningGrad.addColorStop(0, `rgba(190, 242, 100, ${isActive ? 0.25 : 0.06})`);
          warningGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = warningGrad;
          ctx.beginPath();
          ctx.arc(tile.x, tile.y, tile.radius + 20, 0, Math.PI * 2);
          ctx.fill();
        }

        // Animate timer
        tile.animTimer++;
        ctx.restore();
      });

      // ARENA OBSTACLES RENDERING
      s.arenaObstacles.forEach((ob) => {
        ctx.save();
        const cx = ob.x + ob.width / 2;
        const cy = ob.y + ob.height / 2;

        if (ob.type === "wall") {
          // Main body
          ctx.fillStyle = ob.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = ob.accentColor;
          ctx.beginPath();
          const r = 4;
          ctx.moveTo(ob.x + r, ob.y);
          ctx.lineTo(ob.x + ob.width - r, ob.y);
          ctx.quadraticCurveTo(ob.x + ob.width, ob.y, ob.x + ob.width, ob.y + r);
          ctx.lineTo(ob.x + ob.width, ob.y + ob.height - r);
          ctx.quadraticCurveTo(ob.x + ob.width, ob.y + ob.height, ob.x + ob.width - r, ob.y + ob.height);
          ctx.lineTo(ob.x + r, ob.y + ob.height);
          ctx.quadraticCurveTo(ob.x, ob.y + ob.height, ob.x, ob.y + ob.height - r);
          ctx.lineTo(ob.x, ob.y + r);
          ctx.quadraticCurveTo(ob.x, ob.y, ob.x + r, ob.y);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;

          // Accent border glow
          ctx.strokeStyle = ob.accentColor;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.003) * 0.15;
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Surface rune/scratch detail
          ctx.fillStyle = "rgba(255,255,255,0.04)";
          for (let ri = 0; ri < 3; ri++) {
            ctx.fillRect(ob.x + 5 + ri * 12, ob.y + 10, 6, ob.height - 20);
          }
        }

        if (ob.type === "spikes") {
          const ext = Math.sin(ob.spikeAnimTimer * 0.04) * 0.3 + 0.7;
          const count = Math.floor(ob.width / 8);
          // Base platform
          ctx.fillStyle = "rgba(40,35,30,0.7)";
          ctx.fillRect(ob.x, ob.y + ob.height * 0.5, ob.width, ob.height * 0.5);

          for (let si = 0; si < count; si++) {
            const sx = ob.x + (si + 0.5) * (ob.width / count);
            const sh = ob.height * ext;
            ctx.fillStyle = ob.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = ob.accentColor;
            ctx.beginPath();
            ctx.moveTo(sx - 4, ob.y + ob.height * 0.5);
            ctx.lineTo(sx, ob.y + ob.height * 0.5 - sh);
            ctx.lineTo(sx + 4, ob.y + ob.height * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          // Glow line on base
          ctx.strokeStyle = `rgba(255,255,255,${0.15 * ext})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ob.x, ob.y + ob.height * 0.5);
          ctx.lineTo(ob.x + ob.width, ob.y + ob.height * 0.5);
          ctx.stroke();
        }

        if (ob.type === "trap") {
          const tR = Math.max(ob.width, ob.height) / 2;
          const armed = !ob.trapTriggered && ob.trapCooldown <= 0;
          const pulse = armed ? 0.8 + Math.sin(Date.now() * 0.005) * 0.2 : 0.5;

          // Ground glow
          const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, tR * pulse);
          grad.addColorStop(0, armed ? "rgba(255,255,255,0.08)" : "rgba(100,100,100,0.05)");
          grad.addColorStop(0.5, armed ? `${ob.accentColor.replace(")", ",0.12)").replace("rgb", "rgba")}` : "rgba(80,80,80,0.06)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, tR * pulse, 0, Math.PI * 2);
          ctx.fill();

          // Rim circle
          ctx.strokeStyle = armed ? ob.accentColor : "rgba(100,100,100,0.2)";
          ctx.lineWidth = armed ? 2 : 1;
          ctx.globalAlpha = armed ? 0.6 : 0.2;
          ctx.setLineDash(armed ? [] : [4, 4]);
          ctx.beginPath();
          ctx.arc(cx, cy, tR * pulse * 0.7, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;

          // Center rune
          if (armed) {
            ctx.fillStyle = ob.accentColor;
            ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.004) * 0.15;
            ctx.font = "16px serif";
            ctx.textAlign = "center";
            ctx.fillText("ⵔ", cx, cy + 6);
            ctx.globalAlpha = 1;
          }
        }

        if (ob.type === "moving_barrier") {
          // Trail / motion blur behind direction
          const trailLen = 12;
          const tDx = ob.moveEndX - ob.moveStartX;
          const tDy = ob.moveEndY - ob.moveStartY;
          const tLen = Math.hypot(tDx, tDy) || 1;
          const tNx = tDx / tLen;
          const tNy = tDy / tLen;
          for (let ti = 1; ti <= 4; ti++) {
            const alpha = 0.08 / ti;
            ctx.fillStyle = ob.color.replace(")", `,${alpha})`).replace("rgb", "rgba");
            ctx.fillRect(ob.x - tNx * ti * trailLen, ob.y - tNy * ti * trailLen, ob.width, ob.height);
          }

          // Main body
          ctx.fillStyle = ob.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = ob.accentColor;
          ctx.beginPath();
          const mr = 4;
          ctx.moveTo(ob.x + mr, ob.y);
          ctx.lineTo(ob.x + ob.width - mr, ob.y);
          ctx.quadraticCurveTo(ob.x + ob.width, ob.y, ob.x + ob.width, ob.y + mr);
          ctx.lineTo(ob.x + ob.width, ob.y + ob.height - mr);
          ctx.quadraticCurveTo(ob.x + ob.width, ob.y + ob.height, ob.x + ob.width - mr, ob.y + ob.height);
          ctx.lineTo(ob.x + mr, ob.y + ob.height);
          ctx.quadraticCurveTo(ob.x, ob.y + ob.height, ob.x, ob.y + ob.height - mr);
          ctx.lineTo(ob.x, ob.y + mr);
          ctx.quadraticCurveTo(ob.x, ob.y, ob.x + mr, ob.y);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;

          // Direction arrow
          ctx.strokeStyle = ob.accentColor;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.moveTo(cx - tNx * 20, cy - tNy * 20);
          ctx.lineTo(cx + tNx * 20, cy + tNy * 20);
          ctx.stroke();
          // Arrowhead
          const headSize = 8;
          ctx.beginPath();
          ctx.moveTo(cx + tNx * 20 + tNy * headSize, cy + tNy * 20 - tNx * headSize);
          ctx.lineTo(cx + tNx * 20, cy + tNy * 20);
          ctx.lineTo(cx + tNx * 20 - tNy * headSize, cy + tNy * 20 + tNx * headSize);
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Edge accent glow
          ctx.strokeStyle = ob.accentColor;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.2;
          ctx.strokeRect(ob.x, ob.y, ob.width, ob.height);
          ctx.globalAlpha = 1;
        }

        ctx.restore();
      });

      // A. DRAW SOULS WITH LIGHT POOLS
      s.souls.forEach((soul) => {
        const pulse = 1 + Math.sin(soul.pulseTimer) * 0.15;
        let color = "#4edea3"; // emerald default
        let glowColor = "rgba(78, 222, 163, 0.45)";

        if (soul.type === "cursed") {
          color = "#ff7f74"; // blood/cursed red
          glowColor = "rgba(255, 127, 116, 0.45)";
        } else if (soul.type === "gold") {
          color = "#e9c176"; // royal gold
          glowColor = "rgba(233, 193, 118, 0.45)";
        } else if (soul.type === "blood") {
          color = "#f43f5e"; // bright crimson crimson drop
          glowColor = "rgba(244, 63, 94, 0.55)";
        }

        ctx.save();
        
        // Ambient glow light pool under soul
        const soulLight = ctx.createRadialGradient(soul.x, soul.y, 2, soul.x, soul.y, soul.size * 5 * pulse);
        soulLight.addColorStop(0, glowColor);
        soulLight.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = soulLight;
        ctx.beginPath();
        ctx.arc(soul.x, soul.y, soul.size * 5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw solid core
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        
        if (soul.type === "cursed") {
          // Draw diamond
          ctx.moveTo(soul.x, soul.y - soul.size * pulse);
          ctx.lineTo(soul.x + soul.size * pulse, soul.y);
          ctx.lineTo(soul.x, soul.y + soul.size * pulse);
          ctx.lineTo(soul.x - soul.size * pulse, soul.y);
        } else if (soul.type === "blood") {
          // Beautiful drop/heart shape for blood feast drop
          ctx.moveTo(soul.x, soul.y - soul.size * pulse * 1.2);
          ctx.quadraticCurveTo(soul.x + soul.size * pulse * 1.3, soul.y, soul.x, soul.y + soul.size * pulse * 1.3);
          ctx.quadraticCurveTo(soul.x - soul.size * pulse * 1.3, soul.y, soul.x, soul.y - soul.size * pulse * 1.2);
        } else {
          // Draw pulsing circle
          ctx.arc(soul.x, soul.y, soul.size * pulse, 0, Math.PI * 2);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // A2. DRAW ELDRITCH SPORES
      s.spores.forEach((spore) => {
        ctx.save();
        const pulse = 1 + Math.sin(s.frameCount * 0.1) * 0.2;
        // Radial glowing gradient
        const grad = ctx.createRadialGradient(spore.x, spore.y, 1, spore.x, spore.y, 14 * pulse);
        grad.addColorStop(0, "rgba(192, 132, 252, 0.9)");
        grad.addColorStop(0.5, "rgba(167, 139, 250, 0.5)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(spore.x, spore.y, 14 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // A3. DRAW TEMPEST LIGHTNINGS
      s.tempestLightnings.forEach((bolt) => {
        ctx.save();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#0284c7";
        
        // Draw a jagged line
        ctx.beginPath();
        ctx.moveTo(bolt.x1, bolt.y1);
        const steps = 4;
        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          const px = bolt.x1 + (bolt.x2 - bolt.x1) * t;
          const py = bolt.y1 + (bolt.y2 - bolt.y1) * t;
          // Add offset perpendicular to the line
          const dx = bolt.x2 - bolt.x1;
          const dy = bolt.y2 - bolt.y1;
          const len = Math.hypot(dx, dy);
          const nx = -dy / len;
          const ny = dx / len;
          const offset = (Math.random() - 0.5) * 35;
          ctx.lineTo(px + nx * offset, py + ny * offset);
        }
        ctx.lineTo(bolt.x2, bolt.y2);
        ctx.stroke();
        ctx.restore();
      });
      // Clean up dead lightnings
      s.tempestLightnings = s.tempestLightnings.filter(b => b.life-- > 0);

      // B. DRAW CYCLONE BLACKHOLE WITH GLOW POOL
      if (s.cycloneActive) {
        ctx.save();
        
        // Ambient light pool
        const cycloneGlow = ctx.createRadialGradient(s.cyclonePos.x, s.cyclonePos.y, 10, s.cyclonePos.x, s.cyclonePos.y, 160);
        cycloneGlow.addColorStop(0, "rgba(78, 222, 163, 0.25)");
        cycloneGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = cycloneGlow;
        ctx.beginPath();
        ctx.arc(s.cyclonePos.x, s.cyclonePos.y, 160, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(78, 222, 163, 0.45)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.cyclonePos.x, s.cyclonePos.y, 110, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(18, 17, 17, 0.75)";
        ctx.beginPath();
        ctx.arc(s.cyclonePos.x, s.cyclonePos.y, 90 + Math.sin(Date.now() * 0.05) * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // C. DRAW ENEMIES WITH WHITE DAMAGE FLASHES
      s.enemies.forEach((enemy) => {
        ctx.save();
        let color = "#ffb4ac"; // skeleton default
        let label = "SKELETON";
        
        if (enemy.type === "knight") {
          color = "#ff7f74";
          label = "KNIGHT";
        } else if (enemy.type === "wizard") {
          color = "#a78bfa";
          label = "WIZARD";
        } else if (enemy.type === "wolf") {
          color = "#c5a059";
          label = "WOLF";
        } else if (enemy.type === "archer") {
          color = "#a3e635";
          label = "ARCHER";
        } else if (enemy.type === "assassin") {
          color = "#38bdf8";
          label = "ASSASSIN";
        } else if (enemy.type === "necromancer") {
          color = "#e11d48";
          label = "NECROMANCER";
        } else if (enemy.type === "skeleton") {
          color = "#e2e8f0";
          label = "SKELETON";
        } else if (enemy.type === "boss") {
          color = "#7d000a";
          label = "SERPENT KING";
        }

        // Apply stealth effect for assassins
        if (enemy.isStealth) {
          ctx.globalAlpha = 0.12 + Math.sin(Date.now() * 0.01) * 0.04;
        }

        // Ambient red/orange light under boss
        if (enemy.type === "boss") {
          const bossLight = ctx.createRadialGradient(enemy.x, enemy.y, 5, enemy.x, enemy.y, enemy.size * 4);
          bossLight.addColorStop(0, "rgba(125, 0, 10, 0.35)");
          bossLight.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = bossLight;
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw simple shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y + 10, enemy.size, 0, Math.PI * 2);
        ctx.fill();

        // Check White Damage Flash
        let flashColor = color;
        let whiteFlashActive = false;
        if (enemy.flashTimer && enemy.flashTimer > 0) {
          enemy.flashTimer--;
          flashColor = "#ffffff";
          whiteFlashActive = true;
        }

        // Draw body
        ctx.fillStyle = flashColor;
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 2;
        
        // Apply tiny shudder/shake if hit
        let shx = 0;
        let shy = 0;
        if (enemy.flashTimer && enemy.flashTimer > 0) {
          shx = (Math.random() - 0.5) * 6;
          shy = (Math.random() - 0.5) * 6;
        }

        ctx.beginPath();
        ctx.arc(enemy.x + shx, enemy.y + shy, enemy.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (whiteFlashActive) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#ffffff";
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.beginPath();
          ctx.arc(enemy.x + shx, enemy.y + shy, enemy.size + 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw targeting indicator/eyes
        ctx.fillStyle = whiteFlashActive ? "#ff0000" : "#ffffff";
        ctx.beginPath();
        ctx.arc(enemy.x - 4 + shx, enemy.y - 4 + shy, 2, 0, Math.PI * 2);
        ctx.arc(enemy.x + 4 + shx, enemy.y - 4 + shy, 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw red boss dragon horns
        if (enemy.type === "boss") {
          ctx.strokeStyle = "#e9c176";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(enemy.x - 15 + shx, enemy.y - 20 + shy);
          ctx.lineTo(enemy.x - 25 + shx, enemy.y - 45 + shy);
          ctx.moveTo(enemy.x + 15 + shx, enemy.y - 20 + shy);
          ctx.lineTo(enemy.x + 25 + shx, enemy.y - 45 + shy);
          ctx.stroke();
        }

        // Health slider for enemies
        if (enemy.hp < enemy.maxHp) {
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(enemy.x - 20 + shx, enemy.y - enemy.size - 10 + shy, 40, 5);
          ctx.fillStyle = "#ff7f74";
          ctx.fillRect(enemy.x - 20 + shx, enemy.y - enemy.size - 10 + shy, (enemy.hp / enemy.maxHp) * 40, 5);
        }

        // Draw Boss Shield Orbs (Phase 2 & 3)
        if (enemy.type === "boss" && enemy.phase && enemy.phase >= 2) {
          const orbCount = enemy.phase === 3 ? 4 : 3;
          const radius = enemy.size + 25;
          const rotationSpeed = Date.now() * 0.003;
          
          for (let i = 0; i < orbCount; i++) {
            const orbAngle = rotationSpeed + (i * Math.PI * 2) / orbCount;
            const orbX = enemy.x + Math.cos(orbAngle) * radius + shx;
            const orbY = enemy.y + Math.sin(orbAngle) * radius + shy;
            
            ctx.save();
            ctx.fillStyle = enemy.phase === 3 ? "#ff3b30" : "#e9c176";
            ctx.shadowBlur = 12;
            ctx.shadowColor = enemy.phase === 3 ? "#ff3b30" : "#e9c176";
            ctx.beginPath();
            ctx.arc(orbX, orbY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        ctx.restore();
      });

      // D. DRAW PROJECTILES
      s.projectiles.forEach((proj) => {
        ctx.save();
        ctx.fillStyle = proj.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // E. DRAW SERPENT KING (SEGMENTS & HEAD)
      const skinColor = equippedSkin.id === "spectral_wyrm" ? "#7dd3fc" : equippedSkin.id === "molten_core" ? "#f87171" : "#e9c176";
      const skinOutline = equippedSkin.id === "spectral_wyrm" ? "rgba(125,211,252,0.3)" : equippedSkin.id === "molten_core" ? "rgba(248,113,113,0.3)" : "rgba(78,222,163,0.3)";
      const isSpectral = equippedSkin.id === "spectral_wyrm";

      // 1. Draw glowing background connecting ribbon path (creates single premium organic beast feel!)
      if (s.serpentSegments.length > 1) {
        ctx.save();
        ctx.strokeStyle = skinColor;
        ctx.shadowBlur = 15;
        ctx.shadowColor = skinColor;
        ctx.lineWidth = 15;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = isSpectral ? 0.35 : 0.65;
        
        ctx.beginPath();
        ctx.moveTo(s.serpentSegments[0].x, s.serpentSegments[0].y);
        for (let i = 1; i < s.serpentSegments.length; i++) {
          ctx.lineTo(s.serpentSegments[i].x, s.serpentSegments[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw tail/body segments in reverse to overlap beautifully
      for (let i = s.serpentSegments.length - 1; i >= 0; i--) {
        const seg = s.serpentSegments[i];
        if (!seg) continue;
        
        const isHead = i === 0;
        const radius = isHead ? 20 : Math.max(10, 20 - i * 0.4);
        
        ctx.save();
        if (isSpectral) {
          ctx.globalAlpha = 0.55 - (i / s.serpentSegments.length) * 0.3;
        }

        ctx.shadowBlur = isHead ? 15 : 5;
        ctx.shadowColor = skinColor;
        ctx.fillStyle = i % 2 === 0 ? skinColor : "#1c1b1b";
        ctx.strokeStyle = skinOutline;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Specific dragon scale markings
        if (i > 0 && i % 3 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Draw Head Details (glowing emerald eye, metallic horns)
      ctx.save();
      const headSeg = s.serpentSegments[0];
      if (headSeg) {
        // Soft ambient golden light pool following head
        const headLight = ctx.createRadialGradient(headSeg.x, headSeg.y, 2, headSeg.x, headSeg.y, 75);
        headLight.addColorStop(0, "rgba(233, 193, 118, 0.18)");
        headLight.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = headLight;
        ctx.beginPath();
        ctx.arc(headSeg.x, headSeg.y, 75, 0, Math.PI * 2);
        ctx.fill();

        // Draw snout facing direction
        const snoutX = headSeg.x + Math.cos(s.headingAngle) * 15;
        const snoutY = headSeg.y + Math.sin(s.headingAngle) * 15;
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(snoutX, snoutY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Eye left and right relative to steering angle
        const eyeLeftX = headSeg.x + Math.cos(s.headingAngle - 0.5) * 10;
        const eyeLeftY = headSeg.y + Math.sin(s.headingAngle - 0.5) * 10;
        const eyeRightX = headSeg.x + Math.cos(s.headingAngle + 0.5) * 10;
        const eyeRightY = headSeg.y + Math.sin(s.headingAngle + 0.5) * 10;

        ctx.fillStyle = "#4edea3"; // Glowing emerald eyes
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#4edea3";
        ctx.beginPath();
        ctx.arc(eyeLeftX, eyeLeftY, 3.5, 0, Math.PI * 2);
        ctx.arc(eyeRightX, eyeRightY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.strokeStyle = "#e9c176";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(headSeg.x - Math.cos(s.headingAngle) * 5, headSeg.y - Math.sin(s.headingAngle) * 5);
        ctx.lineTo(headSeg.x - Math.cos(s.headingAngle - 0.8) * 28, headSeg.y - Math.sin(s.headingAngle - 0.8) * 28);
        ctx.moveTo(headSeg.x - Math.cos(s.headingAngle) * 5, headSeg.y - Math.sin(s.headingAngle) * 5);
        ctx.lineTo(headSeg.x - Math.cos(s.headingAngle + 0.8) * 28, headSeg.y - Math.sin(s.headingAngle + 0.8) * 28);
        ctx.stroke();

        // Shield Bubble overlay
        if (s.isShielded) {
          ctx.strokeStyle = "rgba(78, 222, 163, 0.6)";
          ctx.lineWidth = 3;
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#4edea3";
          ctx.beginPath();
          ctx.arc(headSeg.x, headSeg.y, 40, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();

      // F. DRAW PARTICLES (highly optimized loop rendering only active pooled items)
      for (let i = 0; i < s.particles.length; i++) {
        const p = s.particles[i];
        if (p.active) {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, 1 - p.life / p.maxLife));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // F-2. DRAW GLOWING SHOCKWAVE RINGS
      s.glowingRings.forEach((ring) => {
        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = ring.alpha;
        ctx.lineWidth = 3 * ring.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ring.color;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // G. DRAW FLOATING TEXTS WITH DRIVES AND SCALING ANIMATIONS
      s.floatingTexts.forEach((t) => {
        ctx.save();
        const scale = t.scale || 1.0;
        const currentLifeRatio = t.life / (t.maxLife || 40);

        ctx.globalAlpha = Math.min(1.0, currentLifeRatio * 1.5);
        ctx.fillStyle = t.color;
        ctx.font = `bold ${Math.floor(14 * scale)}px Orbitron`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = t.color;
        ctx.textAlign = "center";
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });

      ctx.restore(); // end camera transformation

      // Draw virtual joystick on screen overlay if touch is active
      if (s.isTouchActive) {
        ctx.save();
        
        // Joystick Base (Outer ring)
        ctx.beginPath();
        ctx.arc(s.touchStart.x, s.touchStart.y, 55, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(19, 19, 19, 0.45)";
        ctx.fill();
        ctx.strokeStyle = "rgba(78, 222, 163, 0.6)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Outer glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(78, 222, 163, 0.9)";
        ctx.stroke();

        // Calculate clamped thumb position
        const dx = s.touchCurrent.x - s.touchStart.x;
        const dy = s.touchCurrent.y - s.touchStart.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 55;
        
        let thumbX = s.touchStart.x + dx;
        let thumbY = s.touchStart.y + dy;
        
        if (dist > maxDist) {
          thumbX = s.touchStart.x + (dx / dist) * maxDist;
          thumbY = s.touchStart.y + (dy / dist) * maxDist;
        }

        // Joystick Thumb (Inner handle)
        ctx.beginPath();
        ctx.arc(thumbX, thumbY, 22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(233, 193, 118, 0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw dynamic guiding line between center and thumb
        ctx.beginPath();
        ctx.moveTo(s.touchStart.x, s.touchStart.y);
        ctx.lineTo(thumbX, thumbY);
        ctx.strokeStyle = "rgba(78, 222, 163, 0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // Draw overlay blood screenshield on damage
      if (s.screenFlash > 0.01) {
        ctx.fillStyle = `rgba(125, 0, 10, ${s.screenFlash})`;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      }

      // Draw Time Slow grey desaturation vignette
      if (s.isSlowed) {
        ctx.strokeStyle = "rgba(233, 193, 118, 0.25)";
        ctx.lineWidth = 40;
        ctx.strokeRect(0, 0, dimensions.width, dimensions.height);
      }
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [dimensions, isPaused, healthBonus, speedBonus]);

  // Touch and drag support for mobile controls
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const s = stateRef.current;
    if (e.touches[0]) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      s.touchStart = { x, y };
      s.touchCurrent = { x, y };
      s.isTouchActive = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const s = stateRef.current;
    if (e.touches[0]) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      s.touchCurrent = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const s = stateRef.current;
    s.isTouchActive = false;
    s.touchStart = { x: 0, y: 0 };
    s.touchCurrent = { x: 0, y: 0 };
  };

  // Mouse controls
  const handleMouseMove = (e: React.MouseEvent) => {
    const s = stateRef.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    s.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    s.mouseActive = true;
  };

  const handleMouseLeave = () => {
    const s = stateRef.current;
    s.mousePos = { x: 0, y: 0 };
    s.mouseActive = false;
  };

  const handleMouseEnter = () => {
    const s = stateRef.current;
    s.mouseActive = true;
  };

  const GAMEPLAY_TUTORIAL_STEPS = [
    {
      id: "MOVEMENT",
      title: "1. Sovereignty Slither (Movement)",
      description: "Move your mouse cursor 🖱️ or press WASD / Arrow Keys ⌨️ to slither. (Drag the digital joystick 🕹️ on mobile/touch screens). Try slithering around now!",
    },
    {
      id: "SOULS",
      title: "2. Harvesting Cursed Souls",
      description: "Navigate towards floating glowing Green, Red, or Golden Souls 💀 to devour them. Souls grant Score and Gold, siphoning their ancient power!",
    },
    {
      id: "GROWTH",
      title: "3. Giant Serpent Growth",
      description: "Devouring souls extends your serpent tail segment count! 🐉 A longer tail multiplies your scores and increases your visual presence.",
    },
    {
      id: "OBSTACLES",
      title: "4. Avoiding Heavy Attacks",
      description: "Enemy guardians will fire magical bolts or charge at you! Avoid crashing your head into their attacks 🛡️, but don't worry—your segments are durable.",
    },
    {
      id: "COMBAT",
      title: "5. Tactical Combat & Whips",
      description: "Bite enemies with your head, or wrap your long serpent tail segments ⚔️ directly around guards to slam them and trigger whip explosions!",
    },
    {
      id: "ABILITIES",
      title: "6. Eldritch Abilities",
      description: "Unleash magic! Press SPACE to Dash ⚡, Q for Cyclone 🌀, E for Divine Shield 🛡️, or SHIFT to Slow Time. Cooldowns are shown in the HUD.",
    },
    {
      id: "POWERUPS",
      title: "7. Breakable Vessels & Pots",
      description: "Slay guards or destroy ambient entities to drop golden coins and celestial magnets 💎 that draw souls from massive distances!",
    },
    {
      id: "BOSS_FIGHT",
      title: "8. Dimensional Rift Boss",
      description: "When your score spikes, the Boss Terror 👹 will materialize! Maintain your distance, dodge heavy circles, and bite his tail to destroy him.",
    },
    {
      id: "REWARDS",
      title: "9. Extraction & Ancient Chests",
      description: "Defeating the Boss or surviving the rift unlocks the ultimate reward chest. Get ready, sovereign! Your trial ends now. Conquer the kingdom!",
    }
  ];

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative cursor-crosshair select-none overflow-hidden touch-none"
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="block bg-surface"
        role="img"
        aria-label="Serpent Kingdom game arena"
      />

      {/* GAMEPLAY TUTORIAL HUD OVERLAY */}
      {tutorialStep && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50 pointer-events-auto bg-[#131313]/95 border border-primary/50 backdrop-blur-md rounded-xl p-4 md:p-5 shadow-2xl flex flex-col gap-3 select-none animate-scale-in">
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/30 rounded text-[9px] font-mono text-primary font-bold tracking-widest uppercase">
              Rift Combat Trial
            </span>
            <span className="font-label-numeric text-[9px] text-[#e5e2e1]/70 font-bold">
              STEP {GAMEPLAY_TUTORIAL_STEPS.findIndex(s => s.id === tutorialStep) + 1} OF {GAMEPLAY_TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Title & Description */}
          <div>
            <h4 className="font-headline-md text-sm md:text-base text-primary uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(233,193,118,0.4)]">
              <span className="material-symbols-outlined text-xs text-secondary animate-pulse">swords</span>
              {GAMEPLAY_TUTORIAL_STEPS.find(s => s.id === tutorialStep)?.title}
            </h4>
            <p className="font-body-md text-xs text-[#e5e2e1]/90 leading-relaxed">
              {GAMEPLAY_TUTORIAL_STEPS.find(s => s.id === tutorialStep)?.description}
            </p>
          </div>

          {/* Interactive instruction / Skip button row */}
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant/20">
            <button
              onClick={() => {
                AudioManager.playClick();
                transitionTutorialStep(null);
              }}
              className="text-on-surface-variant hover:text-error text-[10px] tracking-wider uppercase font-semibold transition-colors cursor-pointer"
            >
              Skip Tutorial
            </button>
            <button
              onClick={() => {
                AudioManager.playClick();
                const currentIndex = GAMEPLAY_TUTORIAL_STEPS.findIndex(s => s.id === tutorialStep);
                if (currentIndex < GAMEPLAY_TUTORIAL_STEPS.length - 1) {
                  transitionTutorialStep(GAMEPLAY_TUTORIAL_STEPS[currentIndex + 1].id);
                } else {
                  transitionTutorialStep(null);
                }
              }}
              className="stone-button px-3.5 py-1 rounded text-[10px] text-primary uppercase font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <span>{GAMEPLAY_TUTORIAL_STEPS.findIndex(s => s.id === tutorialStep) === GAMEPLAY_TUTORIAL_STEPS.length - 1 ? "Finish" : "Got It"}</span>
              <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {!isDemoMode && (
        <div className="portrait-warning absolute inset-0 bg-background/95 z-[100] flex-col items-center justify-center p-6 text-center backdrop-blur-md portrait:flex landscape:hidden">
          <span className="material-symbols-outlined text-primary text-6xl mb-4 animate-pulse">screen_rotation</span>
          <h2 className="font-headline text-2xl text-primary font-bold uppercase tracking-widest mb-2">Rotate Device</h2>
          <p className="text-on-surface-variant font-body text-sm mb-6 max-w-sm leading-relaxed">
            The Abyssal Sanctuary requires a horizontal landscape for optimal slithering. Please rotate your device.
          </p>
        </div>
      )}
    </div>
  );
}
