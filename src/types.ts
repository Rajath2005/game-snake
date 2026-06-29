export enum BiomeType {
  FrozenKingdom = "Frozen Kingdom",
  HauntedForest = "Haunted Forest",
  RoyalCapital = "Royal Capital",
  VolcanicRuins = "Volcanic Ruins",
  PoisonSwamp = "Poison Swamp",
  DragonMountains = "Dragon Mountains",
  Abyss = "Abyss"
}

export interface Biome {
  type: BiomeType;
  name: string;
  description: string;
  bgColor: string;
  accentColor: string;
  ambientParticles: string; // "snow", "fog", "embers", etc.
  unlockedAtSouls: number;
  terrainFeatures: string[]; // e.g. "rune_circle", "ice_patch", etc.
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  statBonus: number; // bonus per level
  icon: string;
}

export interface Skin {
  id: string;
  name: string;
  description: string;
  rarity: "LEGENDARY" | "EPIC" | "MYTHIC" | "COMMON";
  costType: "Gold" | "Crystals" | "Souls";
  cost: number;
  unlocked: boolean;
  image: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardType: "Gold" | "Souls" | "Crystals";
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  unlockedAt: number | null;
  rewards: {
    gold?: number;
    crystals?: number;
    item?: string;
  };
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  brightness: number;
  highFidelity: boolean;
  motionBlur: boolean;
  hapticFeedback: boolean;
  invertY: boolean;
  language: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  requiredSkillId?: string; // prerequisite dependency
  type: "WEAPON" | "MAGIC" | "PASSIVE" | "ULTIMATE";
  statBonus: number; // e.g. % bonus per level
  icon: string;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  statModifier: string;
  cost: number;
  costType: "Gold" | "Crystals" | "Souls";
  icon: string;
  color: string;
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  effect: string;
  cost: number;
  costType: "Gold" | "Crystals" | "Souls";
  icon: string;
  color: string;
}

export interface SerpentForm {
  id: string;
  name: string;
  description: string;
  unlockedAtPrestige: number;
  cost: number;
  costType: "Gold" | "Crystals" | "Souls";
  statBonus: string;
  icon: string;
  color: string;
}

export interface DailyReward {
  day: number;
  name: string;
  rewardType: "Gold" | "Souls" | "Crystals";
  rewardAmount: number;
  icon: string;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  unlockedAtLevel?: number;
  unlockedAtPrestige?: number;
  unlockedByAchievement?: string;
}

export interface ProfileFrame {
  id: string;
  name: string;
  description: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC" | "ANCIENT";
  cost: number;
  costType: "Gold" | "Crystals" | "Souls";
  color: string;
  borderColor: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC" | "ANCIENT";
  icon: string;
  color: string;
}

export interface GameSaveState {
  gold: number;
  souls: number;
  crystals: number;
  highScore: number;
  currentScore: number;
  talents: Record<string, number>; // id -> level
  ownedSkins: string[]; // list of skin ids
  equippedSkin: string; // skin id
  completedAchievements: string[]; // achievement ids
  dailyChallengeClaimed: boolean;
  lastLoginDate: string; // ISO string
  quests: Quest[];
  settings: GameSettings;

  // --- Extended Progression ---
  skillPoints: number;
  skillsUnlocked: Record<string, number>; // skillId -> level
  ownedRelics: string[];
  equippedRelics: string[]; // up to 2
  ownedArtifacts: string[];
  equippedArtifact: string | null; // up to 1
  weaponsLevel: Record<string, number>; // weaponId -> level
  magicLevel: Record<string, number>; // magicId -> level
  selectedForm: string; // formId
  prestigeCount: number;
  prestigeMultiplier: number;
  consecutiveLogins: number;
  claimedDailyRewards: string[]; // e.g. ["day1", "day2", ...]
  difficultyLevel: "EASY" | "NORMAL" | "HARD" | "NIGHTMARE";

  // --- Player Levels & Account Progression ---
  playerXp: number;
  playerLevel: number;
  selectedTitle: string;
  ownedTitles: string[];
  selectedFrame: string;
  ownedFrames: string[];
  selectedBadge: string;
  ownedBadges: string[];
  dragonEggs: number;
  hatchedDragons: string[];
  biomeMastery: Record<string, number>; // biomeType -> level
}

export const BIOMES: Biome[] = [
  {
    type: BiomeType.Abyss,
    name: "The Abyss",
    description: "The deepest obsidian vaults containing ancient relics and pulsing emerald magic.",
    bgColor: "#131313",
    accentColor: "#4edea3",
    ambientParticles: "emerald-fog",
    unlockedAtSouls: 0,
    terrainFeatures: ["rune_circle"]
  },
  {
    type: BiomeType.FrozenKingdom,
    name: "Frozen Kingdom",
    description: "Ice-bound cavern where freeze winds and skeletal knights wander.",
    bgColor: "#0f1620",
    accentColor: "#7dd3fc",
    ambientParticles: "snow",
    unlockedAtSouls: 100,
    terrainFeatures: ["ice_patch"]
  },
  {
    type: BiomeType.HauntedForest,
    name: "Haunted Forest",
    description: "Withered woods full of cursed wolves and whispering shadow assassins.",
    bgColor: "#111812",
    accentColor: "#a7f3d0",
    ambientParticles: "fog",
    unlockedAtSouls: 300,
    terrainFeatures: ["fog_pocket", "grave"]
  },
  {
    type: BiomeType.VolcanicRuins,
    name: "Volcanic Ruins",
    description: "Rivers of molten core and fire golems that burn with intense fury.",
    bgColor: "#1c0d0d",
    accentColor: "#f87171",
    ambientParticles: "embers",
    unlockedAtSouls: 600,
    terrainFeatures: ["lava_pool", "fire_geyser"]
  },
  {
    type: BiomeType.PoisonSwamp,
    name: "Poison Swamp",
    description: "Rotting bogs teeming with necromancers and toxic gases.",
    bgColor: "#141510",
    accentColor: "#bef264",
    ambientParticles: "spores",
    unlockedAtSouls: 1000,
    terrainFeatures: ["poison_bog", "toxic_vent"]
  }
];

export const INITIAL_SETTINGS: GameSettings = {
  masterVolume: 100,
  musicVolume: 75,
  sfxVolume: 90,
  brightness: 50,
  highFidelity: true,
  motionBlur: true,
  hapticFeedback: true,
  invertY: false,
  language: "EN"
};

export const INITIAL_TALENTS: Talent[] = [
  {
    id: "max_health",
    name: "Ancient Aegis",
    description: "Increases serpent vitality to withstand more physical impacts.",
    level: 0,
    maxLevel: 10,
    baseCost: 200,
    costMultiplier: 1.5,
    statBonus: 10, // +10 max HP per level
    icon: "shield"
  },
  {
    id: "speed",
    name: "Slither Velocity",
    description: "Increases baseline movement speed and dash intensity.",
    level: 0,
    maxLevel: 5,
    baseCost: 350,
    costMultiplier: 1.8,
    statBonus: 0.25, // +0.25 speed
    icon: "bolt"
  },
  {
    id: "magnet",
    name: "Soul Attraction",
    description: "Expands the magnetic radius for pulling in souls and crystal shards.",
    level: 0,
    maxLevel: 8,
    baseCost: 150,
    costMultiplier: 1.4,
    statBonus: 25, // +25px magnet radius
    icon: "cyclone"
  },
  {
    id: "soul_multiplier",
    name: "Royal Greed",
    description: "Consuming souls yields extra gold coins and run score bonus.",
    level: 0,
    maxLevel: 10,
    baseCost: 250,
    costMultiplier: 1.6,
    statBonus: 0.1, // +10% gold bonus
    icon: "toll"
  },
  {
    id: "ability_cooldown",
    name: "Chrono Mastery",
    description: "Decreases active ability cooldowns for continuous magic.",
    level: 0,
    maxLevel: 5,
    baseCost: 400,
    costMultiplier: 2.0,
    statBonus: 0.08, // 8% cooldown reduction
    icon: "history_toggle_off"
  }
];

export const ALL_SKINS: Skin[] = [
  {
    id: "sovereign_obsidian",
    name: "Sovereign Obsidian",
    description: "The regal garb of the first Serpent King. Adorned with gold filigree and glowing emerald accents.",
    rarity: "MYTHIC",
    costType: "Gold",
    cost: 0,
    unlocked: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwVCQ2O5_d2_NFG4ZsYvEAH9PhBXfYA5GD5iM1zD2DzJg6Rim0aaV_G0mSd9plWxbZBfbXo7ARVGAv8MWjJwY9nN7Qzmccs5CmT3sHhi9Trr4ITeMGAcDKkXGfNpBapzl38bo1d5jmMtLPHh0ttmxpcyHQqBg8b4m9bvueFn4tLUDceDBi6k-xcEQwpK3pAeds_SG2SY8vT7p3Eu-8XKdt7L1iR6QPJODidwrzaFfc27yIPW6LQnKmU_6Q6ep8t2F1-GSW-45pTVE"
  },
  {
    id: "spectral_wyrm",
    name: "Spectral Wyrm",
    description: "Ethereal scales that phase through matter. Emanates a pale, icy blue spectral mist.",
    rarity: "LEGENDARY",
    costType: "Crystals",
    cost: 1200,
    unlocked: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBL6TKw4SZuvpJZ6XHqWR0m_D88ykhm6VCNq9KeUU6E-ufzQaB73h54ptWsBQX1kbOFF8m-IaTb6pvJzM_xK4F0KUhKBgAJEwhhKZMKgRjdHz_d3EAVuXIJOvUtpWBbkli_gt2m3Z8whYDY4TQ2nA_u-IWJ--8jYya3B4E_PvPIPL7DpxiuTxTW2QrGWQyjQfhqzefYfeLVds9cSTWi1prn2WnfsolwRZZECtWBFmxFNWmUa5skr74CdtCa2u9_3j1fuZpohIHBUAI"
  },
  {
    id: "molten_core",
    name: "Molten Core",
    description: "Forged in the heart of a dying sun. Trailed by molten embers and searing steam.",
    rarity: "EPIC",
    costType: "Gold",
    cost: 8500,
    unlocked: false,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCjT88rXhL2aaXn6OYT0LRcxT8OWqIXlpPiueWV0QQPZO1flF6G5Z0mHCEKokirSy58vcJjJP2Jc_M_wRapcixuxQWVRAIF6MmU84l9IV4yLaXLIv_H3I9MI6QyWdDSPXxgNac2C7nQ2sCjVzpGCJFcM-sE1lxBf27HG5O8PBZ8ZAn1_OMMjuAVvCLTr-SArflHLQ2aX9IWrkxShBi-RGdIryJ3eAtPugBRHFP7pwQjqbVrd9Da6Op4H26JJUdk1T1Y1_hktr9GVE"
  }
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_run",
    title: "First Slither",
    description: "Complete your first run in the abyssal depths.",
    completed: false,
    unlockedAt: null,
    rewards: { gold: 200 }
  },
  {
    id: "slayer_of_king",
    title: "Slayer of the Serpent King",
    description: "Navigate the abyssal depths and vanquish the ancient Boss Terror.",
    completed: false,
    unlockedAt: null,
    rewards: { gold: 5000, crystals: 100, item: "Serpent's Fang Dagger" }
  },
  {
    id: "grow_long",
    title: "Ancient Leviathan",
    description: "Reach a serpent length of 40 segments in a single run.",
    completed: false,
    unlockedAt: null,
    rewards: { gold: 1000, crystals: 30 }
  },
  {
    id: "high_score_100k",
    title: "Gothic Opulence",
    description: "Score over 100,000 points in a single survival run.",
    completed: false,
    unlockedAt: null,
    rewards: { gold: 1500, crystals: 50 }
  }
];

export const DEFAULT_QUESTS: Quest[] = [
  {
    id: "quest_1",
    title: "Consume Souls",
    description: "Consume 5 Cursed Souls during gameplay.",
    target: 5,
    current: 0,
    rewardType: "Souls",
    rewardAmount: 200,
    completed: false,
    claimed: false
  },
  {
    id: "quest_2",
    title: "Slay Foes",
    description: "Vanquish 20 dark realm guards/skeletons.",
    target: 20,
    current: 0,
    rewardType: "Gold",
    rewardAmount: 500,
    completed: false,
    claimed: false
  },
  {
    id: "quest_3",
    title: "Combo Master",
    description: "Achieve a combo multiplier of x5.",
    target: 5,
    current: 0,
    rewardType: "Crystals",
    rewardAmount: 25,
    completed: false,
    claimed: false
  }
];

export const ALL_RELICS: Relic[] = [
  {
    id: "hourglass",
    name: "Stasis Sandglass",
    description: "Channels chronomancy currents. Decreases active ability cooldowns by 15%.",
    statModifier: "-15% Cooldowns",
    cost: 500,
    costType: "Gold",
    icon: "hourglass_empty",
    color: "#7dd3fc"
  },
  {
    id: "thorns",
    name: "Barbed Thorn Collar",
    description: "Covers your serpent segment coils in razor-sharp barbs. Deals 15 thorns damage back to attacking guards.",
    statModifier: "Thorns Reflection",
    cost: 150,
    costType: "Souls",
    icon: "line_style",
    color: "#f87171"
  },
  {
    id: "soul_urn",
    name: "Urn of Lost Souls",
    description: "An ornate ceramic vessel that captures loose soul residue. Souls heal you for +2 HP on consumption.",
    statModifier: "+2 HP on Soul Gather",
    cost: 35,
    costType: "Crystals",
    icon: "coffin",
    color: "#a7f3d0"
  },
  {
    id: "crown_greed",
    name: "Crown of Golden Avarice",
    description: "The crown of a lost dungeoneer. Grants +50% Gold Coins reward but increases contact damage taken by 20%.",
    statModifier: "+50% Gold / +20% Dmg Taken",
    cost: 1200,
    costType: "Gold",
    icon: "workspace_premium",
    color: "#e9c176"
  }
];

export const ALL_ARTIFACTS: Artifact[] = [
  {
    id: "phoenix_ash",
    name: "Sacred Phoenix Ashes",
    description: "When the serpent's life is entirely extinguished, instantly revives once per run with 50% HP.",
    effect: "1x Second Life Revival",
    cost: 100,
    costType: "Crystals",
    icon: "local_fire_department",
    color: "#f87171"
  },
  {
    id: "abyssal_eye",
    name: "Third Eye of the Abyss",
    description: "Unlocks spiritual vision. Detects stealth assassins instantly and slows enemy projectile speeds by 25%.",
    effect: "Assassins Visible & Bullet Slow",
    cost: 250,
    costType: "Souls",
    icon: "visibility",
    color: "#bef264"
  },
  {
    id: "vampiric_skull",
    name: "Vampiric Dread Skull",
    description: "Infuses the serpent with bloodlust. Restores +6 HP to your health bar on every 5th enemy vanquished.",
    effect: "Heal +6 HP per 5 kills",
    cost: 2500,
    costType: "Gold",
    icon: "skull",
    color: "#f43f5e"
  }
];

export const ALL_FORMS: SerpentForm[] = [
  {
    id: "sovereign_obsidian",
    name: "Sovereign Obsidian",
    description: "The standard majestic serpent, forged in abyssal shadows and laced with glowing gold accents.",
    unlockedAtPrestige: 0,
    cost: 0,
    costType: "Gold",
    statBonus: "Base Form (Standard Stats)",
    icon: "drag_handle",
    color: "#e9c176"
  },
  {
    id: "jade_basilisk",
    name: "Jade Basilisk",
    description: "A virulent venomous wyrm. Moves with 20% higher movement speed and is immune to swamp poison.",
    unlockedAtPrestige: 0,
    cost: 1500,
    costType: "Gold",
    statBonus: "+20% Base Speed & Poison Immunity",
    icon: "pest_control",
    color: "#bef264"
  },
  {
    id: "crimson_dread",
    name: "Crimson Dread",
    description: "A heavy armor leviathan covered in razor plates. Increases serpent collision size and physical damage by 35%.",
    unlockedAtPrestige: 1,
    cost: 300,
    costType: "Souls",
    statBonus: "+35% Collision Size & Thorns/Contact Damage",
    icon: "grid_view",
    color: "#f87171"
  },
  {
    id: "shadow_hydra",
    name: "Cosmic Shadow Hydra",
    description: "A cosmic dragon that exists across parallel voids. Starts every survival run with +4 segment length.",
    unlockedAtPrestige: 2,
    cost: 120,
    costType: "Crystals",
    statBonus: "+4 Starting Segment Length",
    icon: "grain",
    color: "#a78bfa"
  }
];

export const SKILL_NODES: SkillNode[] = [
  {
    id: "fang_poison",
    name: "Viper Fangs",
    description: "Injects toxic poison into basic bites. Deals +5 poison damage over time to hit guards.",
    cost: 1,
    maxLevel: 3,
    type: "WEAPON",
    statBonus: 5,
    icon: "colorize"
  },
  {
    id: "body_armor",
    name: "Spiked Carapace",
    description: "Permanent spiked scales. Adds +4 contact damage when dragging your segment coils through foes.",
    cost: 1,
    maxLevel: 3,
    type: "WEAPON",
    statBonus: 4,
    icon: "shield"
  },
  {
    id: "spark_magic",
    name: "Eldritch Spores",
    description: "Sheds cosmic spores from your tail that float and detonate when enemies touch them, dealing 15 AoE damage.",
    cost: 1,
    maxLevel: 3,
    type: "MAGIC",
    statBonus: 15,
    icon: "grain"
  },
  {
    id: "chrono_shift",
    name: "Chrono Extension",
    description: "Enhances the Chrono Shift (Slow Time) active skill. Increases duration by +1 second per level.",
    cost: 1,
    maxLevel: 3,
    type: "MAGIC",
    statBonus: 60, // 60 frames (1 second)
    icon: "history"
  },
  {
    id: "blood_feast",
    name: "Crimson Feast",
    description: "Harvest energy from the fallen. Slain enemies have a 5% chance to drop a blood orb restoring +5 HP.",
    cost: 1,
    maxLevel: 3,
    type: "PASSIVE",
    statBonus: 0.05,
    icon: "favorite"
  },
  {
    id: "void_magnet",
    name: "Gravitational Coils",
    description: "Draws space-time. Increases baseline pick-up magnet pull radius by +40 pixels per level.",
    cost: 1,
    maxLevel: 3,
    type: "PASSIVE",
    statBonus: 40,
    icon: "filter_tilt_shift"
  },
  {
    id: "ragnarok",
    name: "Ragnarok Shockwave",
    description: "Ultimate: Automatically unleashes a massive screen-wide red cosmic explosion every 20 seconds, dealing 40 damage.",
    cost: 3,
    maxLevel: 1,
    requiredSkillId: "blood_feast",
    type: "ULTIMATE",
    statBonus: 40,
    icon: "explosion"
  },
  {
    id: "serpent_tempest",
    name: "Abyssal Storm",
    description: "Ultimate: Smites nearby guards with lightning bolts every 8 seconds, dealing 25 damage to up to 4 nearby enemies.",
    cost: 3,
    maxLevel: 1,
    requiredSkillId: "void_magnet",
    type: "ULTIMATE",
    statBonus: 25,
    icon: "thunderstorm"
  }
];

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, name: "Gold Cache", rewardType: "Gold", rewardAmount: 300, icon: "monetization_on" },
  { day: 2, name: "Souls Cluster", rewardType: "Souls", rewardAmount: 150, icon: "local_fire_department" },
  { day: 3, name: "Crystals Shard", rewardType: "Crystals", rewardAmount: 20, icon: "diamond" },
  { day: 4, name: "Royal Treasury", rewardType: "Gold", rewardAmount: 700, icon: "monetization_on" },
  { day: 5, name: "Cursed Harvest", rewardType: "Souls", rewardAmount: 300, icon: "local_fire_department" },
  { day: 6, name: "Void Infusion", rewardType: "Crystals", rewardAmount: 50, icon: "diamond" },
  { day: 7, name: "Sovereign Fortune", rewardType: "Crystals", rewardAmount: 150, icon: "workspace_premium" }
];

export const ALL_TITLES: Title[] = [
  { id: "novice", name: "Novice Slitherer", description: "Unleashed upon the ancient underworld.", unlockedAtLevel: 1 },
  { id: "cursed_sov", name: "Cursed Sovereign", description: "Vested with abyssal shadow crowns.", unlockedAtLevel: 5 },
  { id: "soul_reaper", name: "Soul Reaper", description: "Siphoned over 100 deep-rift souls.", unlockedAtLevel: 10 },
  { id: "dragon_born", name: "Dragon Hatchlord", description: "Hatched a legendary dragon egg in the sanctuary.", unlockedAtLevel: 15 },
  { id: "abyssal_col", name: "Abyssal Colossus", description: "Attained a total serpent length of 40 segments.", unlockedAtLevel: 20 },
  { id: "demigod", name: "Eldritch Demigod", description: "Prestiged your serpent crown to Rank 1 or above.", unlockedAtPrestige: 1 },
  { id: "serpent_god", name: "Eternal Serpent Emperor", description: "Prestiged your serpent crown to Rank 3 or above.", unlockedAtPrestige: 3 }
];

export const ALL_FRAMES: ProfileFrame[] = [
  { id: "none", name: "Standard Border", description: "A humble bronze-trimmed shadow frame.", rarity: "COMMON", cost: 0, costType: "Gold", color: "#e5e2e1", borderColor: "rgba(229,226,225,0.4)" },
  { id: "obsidian_border", name: "Obsidian Royalty", description: "Imbued with pulsing deep obsidian shard trim.", rarity: "RARE", cost: 800, costType: "Gold", color: "#e9c176", borderColor: "rgba(233,193,118,0.7)" },
  { id: "crimson_spike", name: "Crimson Spike", description: "Spiked plates forged in molten lava ruins.", rarity: "EPIC", cost: 200, costType: "Souls", color: "#f87171", borderColor: "rgba(248,113,113,0.8)" },
  { id: "cosmic_void", name: "Cosmic Void Aura", description: "A swirling aura of stellar nebulae and celestial gems.", rarity: "LEGENDARY", cost: 80, costType: "Crystals", color: "#a78bfa", borderColor: "rgba(167,139,250,0.9)" },
  { id: "ancient_gold", name: "Sovereign Gold Frame", description: "An ancient pure-gold relic frame worn by the first dragon gods.", rarity: "MYTHIC", cost: 15000, costType: "Gold", color: "#f59e0b", borderColor: "rgba(245,158,11,1)" }
];

export const ALL_BADGES: Badge[] = [
  { id: "first_step", name: "First Step", description: "Began the sovereign slither trials.", rarity: "COMMON", icon: "footprint", color: "#7dd3fc" },
  { id: "boss_slayer", name: "Boss Purger", description: "Vanquished the Rift Boss Terror.", rarity: "EPIC", icon: "skull", color: "#f87171" },
  { id: "hoarder", name: "Golden Hoarder", description: "Possess over 5,000 active Gold Coins.", rarity: "RARE", icon: "toll", color: "#fbbf24" },
  { id: "prestigious", name: "Crown Royal", description: "Performed a prestige crown ascent.", rarity: "LEGENDARY", icon: "military_tech", color: "#c084fc" },
  { id: "egg_hatcher", name: "Egg Master", description: "Hatched a legendary dragon egg.", rarity: "LEGENDARY", icon: "egg", color: "#34d399" }
];

export const HATCHABLE_DRAGONS = [
  { name: "Amethyst Drake", rarity: "RARE", description: "A crystal dragon that breathes shimmering violet embers.", icon: "egg" },
  { name: "Obsidian Wyrm", rarity: "EPIC", description: "A pure shadow companion that whispers ancient runes.", icon: "egg" },
  { name: "Searing Pyre Hatchling", rarity: "LEGENDARY", description: "A fire dragon born in molten cores, leaving warm spark trails.", icon: "egg" },
  { name: "Aetherial Void Dragon", rarity: "MYTHIC", description: "A cosmic leviathan that warps space-time inside your sanctuary.", icon: "egg" }
];

export const INITIAL_SAVE_STATE: GameSaveState = {
  gold: 450,
  souls: 120,
  crystals: 45,
  highScore: 142000,
  currentScore: 0,
  talents: {
    max_health: 0,
    speed: 0,
    magnet: 0,
    soul_multiplier: 0,
    ability_cooldown: 0
  },
  ownedSkins: ["sovereign_obsidian"],
  equippedSkin: "sovereign_obsidian",
  completedAchievements: [],
  dailyChallengeClaimed: false,
  lastLoginDate: new Date().toISOString(),
  quests: DEFAULT_QUESTS,
  settings: INITIAL_SETTINGS,

  // --- Extended Progression default state ---
  skillPoints: 5, // give some initial points to let them try it immediately!
  skillsUnlocked: {},
  ownedRelics: [],
  equippedRelics: [],
  ownedArtifacts: [],
  equippedArtifact: null,
  weaponsLevel: { fangs: 1, body: 1 },
  magicLevel: { active: 1, ultimate: 0 },
  selectedForm: "sovereign_obsidian",
  prestigeCount: 0,
  prestigeMultiplier: 1.0,
  consecutiveLogins: 0,
  claimedDailyRewards: [],
  difficultyLevel: "NORMAL",

  // --- Player Levels & Account Progression ---
  playerXp: 0,
  playerLevel: 1,
  selectedTitle: "novice",
  ownedTitles: ["novice"],
  selectedFrame: "none",
  ownedFrames: ["none"],
  selectedBadge: "first_step",
  ownedBadges: ["first_step"],
  dragonEggs: 1,
  hatchedDragons: [],
  biomeMastery: {}
};

