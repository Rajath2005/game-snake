import React, { useState, useEffect } from "react";
import { 
  GameSaveState, 
  INITIAL_SAVE_STATE, 
  Biome, 
  BIOMES, 
  Skin, 
  ALL_SKINS, 
  Quest, 
  Achievement, 
  INITIAL_TALENTS, 
  BiomeType,
  ALL_RELICS,
  ALL_ARTIFACTS,
  ALL_FORMS,
  SKILL_NODES,
  DAILY_REWARDS
} from "./types";

import { AudioManager } from "./lib/audio";

// Import custom components
import LoadingScreen from "./components/LoadingScreen";
import MainDashboard from "./components/MainDashboard";
import GameHUD from "./components/GameHUD";
import GameCanvas from "./components/GameCanvas";
import GameOver from "./components/GameOver";
import AchievementUnlock from "./components/AchievementUnlock";
import SettingsScreen from "./components/SettingsScreen";
import OnboardingOverlay from "./components/OnboardingOverlay";
import WelcomeChestModal from "./components/WelcomeChestModal";

type ScreenState = "LOADING" | "CAMP" | "GAMEPLAY";

export default function App() {
  const [screen, setScreen] = useState<ScreenState>("LOADING");
  
  // Game save state
  const [saveState, setSaveState] = useState<GameSaveState>(INITIAL_SAVE_STATE);
  
  // Active game run states
  const [selectedBiome, setSelectedBiome] = useState<Biome>(BIOMES[0]);
  const [isPaused, setIsPaused] = useState(false);
  const [activeRunScore, setActiveRunScore] = useState(0);
  const [activeRunCoins, setActiveRunCoins] = useState(0);
  const [activeRunXp, setActiveRunXp] = useState(0);
  
  // Modals overlays
  const [showGameOver, setShowGameOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievementUnlock, setShowAchievementUnlock] = useState(false);
  const [justDefeatedBoss, setJustDefeatedBoss] = useState(false);

  // Onboarding states
  const [onboardingActive, setOnboardingActive] = useState(false);
  const [welcomeChestActive, setWelcomeChestActive] = useState(false);
  const [dashboardActiveTab, setDashboardActiveTab] = useState<any>("BIOMES");

  // Live fight metrics synced from GameCanvas
  const [bossActive, setBossActive] = useState(false);
  const [bossHealthPercent, setBossHealthPercent] = useState(100);

  // Demo & Tutorial Modes
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isTutorialMode, setIsTutorialMode] = useState(false);

  // Custom interactive modal dialog replacing blocking alerts/confirms
  const [modalDialog, setModalDialog] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  } | null>(null);

  const showCustomAlert = (message: string, title = "ROYAL DECREE") => {
    setModalDialog({
      title,
      message,
      confirmText: "UNDERSTOOD"
    });
  };

  const showCustomConfirm = (message: string, onConfirm: () => void, title = "ASCENSION RITUAL") => {
    setModalDialog({
      title,
      message,
      confirmText: "PROCEED",
      cancelText: "RETREAT",
      onConfirm
    });
  };

  // Abilities cooldown state (linked from GameCanvas to HUD)
  const [abilitiesCooldowns, setAbilitiesCooldowns] = useState({
    dash: 0,
    slow: 0,
    shield: 0,
    cyclone: 0
  });

  // Hot-trigger to send button-clicks from HUD to the canvas engine
  const [activeAbilityTrigger, setActiveAbilityTrigger] = useState("");

  // Load save state from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("serpent_kingdom_save_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initial just in case schema changes
        setSaveState({
          ...INITIAL_SAVE_STATE,
          ...parsed,
          talents: {
            ...INITIAL_SAVE_STATE.talents,
            ...(parsed.talents || {})
          },
          skillsUnlocked: {
            ...INITIAL_SAVE_STATE.skillsUnlocked,
            ...(parsed.skillsUnlocked || {})
          },
          weaponsLevel: {
            ...INITIAL_SAVE_STATE.weaponsLevel,
            ...(parsed.weaponsLevel || {})
          },
          magicLevel: {
            ...INITIAL_SAVE_STATE.magicLevel,
            ...(parsed.magicLevel || {})
          },
          settings: {
            ...INITIAL_SAVE_STATE.settings,
            ...(parsed.settings || {})
          }
        });
      } catch (e) {
        console.error("Error loading serpent saveState, using initial defaults", e);
      }
    }
  }, []);

  // Sync volume settings with AudioManager
  useEffect(() => {
    AudioManager.updateSettings(saveState.settings);
  }, [saveState.settings]);

  // Sync screen ambient states
  useEffect(() => {
    if (screen === "CAMP") {
      AudioManager.init();
      AudioManager.setBiomeAmbience("Camp");
      AudioManager.setBgmState("ambient");
    } else if (screen === "GAMEPLAY") {
      AudioManager.init();
    }
  }, [screen]);

  // Auto-trigger onboarding for first-time players on dashboard entry
  useEffect(() => {
    if (screen === "CAMP") {
      const completed = localStorage.getItem("serpent_onboarding_completed");
      if (!completed) {
        setOnboardingActive(true);
      }
    }
  }, [screen]);

  // Cleanup on final app disposal
  useEffect(() => {
    return () => {
      AudioManager.dispose();
    };
  }, []);

  // Idle Demo Mode Detector
  useEffect(() => {
    if (screen !== "CAMP" || onboardingActive || welcomeChestActive || showSettings || showAchievementUnlock || modalDialog) return;

    let idleTimer: ReturnType<typeof setTimeout>;
    
    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsDemoMode(true);
        handleStartGame();
      }, 25000); // 25 seconds of idle time
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("click", resetTimer);
    
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [screen, onboardingActive, welcomeChestActive, showSettings, showAchievementUnlock, modalDialog]);

  // Save state to LocalStorage whenever it changes
  const saveToLocalStorage = (newState: GameSaveState) => {
    setSaveState(newState);
    localStorage.setItem("serpent_kingdom_save_v1", JSON.stringify(newState));
  };

  // Cancel Demo Mode on interaction
  useEffect(() => {
    if (!isDemoMode || screen !== "GAMEPLAY") return;

    const cancelDemo = (e: Event) => {
      if (!e.isTrusted) return;
      setIsDemoMode(false);
      handleCloseGameOver(); // Escapes the game back to dashboard
    };

    const timer = setTimeout(() => {
      window.addEventListener("mousemove", cancelDemo);
      window.addEventListener("keydown", cancelDemo);
      window.addEventListener("touchstart", cancelDemo);
      window.addEventListener("click", cancelDemo);
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", cancelDemo);
      window.removeEventListener("keydown", cancelDemo);
      window.removeEventListener("touchstart", cancelDemo);
      window.removeEventListener("click", cancelDemo);
    };
  }, [isDemoMode, screen]);

  // Onboarding & Coronation chest handlers
  const handleOnboardingComplete = () => {
    setOnboardingActive(false);
    localStorage.setItem("serpent_onboarding_completed", "true");
    setWelcomeChestActive(true);
  };

  const handleOnboardingSkip = () => {
    setOnboardingActive(false);
    localStorage.setItem("serpent_onboarding_completed", "true");
    setWelcomeChestActive(true);
  };

  const handleClaimWelcomeChest = (rewards: { gold: number; souls: number; crystals: number; achievementId: string }) => {
    setWelcomeChestActive(false);
    const updated = {
      ...saveState,
      gold: saveState.gold + rewards.gold,
      souls: saveState.souls + rewards.souls,
      crystals: saveState.crystals + rewards.crystals,
      completedAchievements: saveState.completedAchievements.includes(rewards.achievementId)
        ? saveState.completedAchievements
        : [...saveState.completedAchievements, rewards.achievementId]
    };
    saveToLocalStorage(updated);

    showCustomAlert(
      "Your royal welcome bounty has been fully claimed! You received +1,000 Cursed Gold, +50 Souls, +15 Crystals, and unlocked the 'First Slither' legacy achievement! Slither forward, sovereign, and reclaim your crown!",
      "CORONATION SANCTIONED"
    );
  };

  // 1. SKIN SHOP ACTIONS
  const handleSelectSkin = (skinId: string) => {
    AudioManager.playClick();
    const updated = {
      ...saveState,
      equippedSkin: skinId
    };
    saveToLocalStorage(updated);
  };

  const handleBuySkin = (skinId: string) => {
    const skin = ALL_SKINS.find(s => s.id === skinId);
    if (!skin) return;

    let balance = 0;
    let balanceKey: "gold" | "crystals" | "souls" = "gold";

    if (skin.costType === "Gold") {
      balance = saveState.gold;
      balanceKey = "gold";
    } else if (skin.costType === "Crystals") {
      balance = saveState.crystals;
      balanceKey = "crystals";
    } else {
      balance = saveState.souls;
      balanceKey = "souls";
    }

    if (balance >= skin.cost) {
      AudioManager.playMagic();
      const updatedOwned = [...saveState.ownedSkins];
      if (!updatedOwned.includes(skinId)) {
        updatedOwned.push(skinId);
      }

      const updated = {
        ...saveState,
        [balanceKey]: balance - skin.cost,
        ownedSkins: updatedOwned,
        equippedSkin: skinId
      };
      saveToLocalStorage(updated);
    } else {
      AudioManager.playClick();
      showCustomAlert(`Insufficient ${skin.costType} to acquire the ${skin.name}! Collect more in the portals.`, "ACQUISITION BLOCKED");
    }
  };

  // 2. TALENT UPGRADE SYSTEM
  const handleUpgradeTalent = (talentId: string) => {
    const talent = INITIAL_TALENTS.find(t => t.id === talentId);
    if (!talent) return;

    const currentLvl = saveState.talents[talentId] || 0;
    if (currentLvl >= talent.maxLevel) return;

    const cost = Math.floor(talent.baseCost * Math.pow(talent.costMultiplier, currentLvl));
    if (saveState.gold >= cost) {
      AudioManager.playMagic();
      const updatedTalents = {
        ...saveState.talents,
        [talentId]: currentLvl + 1
      };

      const updated = {
        ...saveState,
        gold: saveState.gold - cost,
        talents: updatedTalents
      };
      saveToLocalStorage(updated);
    }
  };

  // 3. CLAIM QUESTS AND GENERAL MILESTONES
  const handleClaimQuest = (questId: string) => {
    if (questId === "daily_login") {
      AudioManager.playMagic();
      const updated = {
        ...saveState,
        crystals: saveState.crystals + 100,
        dailyChallengeClaimed: true
      };
      saveToLocalStorage(updated);
      return;
    }

    if (questId === "premium_pass") {
      if (saveState.crystals >= 950) {
        AudioManager.playMagic();
        // Unlock premium, give gold
        const updated = {
          ...saveState,
          crystals: saveState.crystals - 950,
          gold: saveState.gold + 5000,
          souls: saveState.souls + 200
        };
        saveToLocalStorage(updated);
        showCustomAlert("Sovereign Premium Pass Unlocked! Earned +5,000 Gold Coins and +200 Captured Souls.", "PREMIUM PASS UNLOCKED");
      } else {
        AudioManager.playClick();
        showCustomAlert("Insufficient Crystals. Decend into the dungeons to reap crystal shards.", "CRYSTALS BLOCKED");
      }
      return;
    }

    const questIndex = saveState.quests.findIndex(q => q.id === questId);
    if (questIndex === -1) return;

    const quest = saveState.quests[questIndex];
    if (!quest.completed || quest.claimed) return;

    AudioManager.playMagic();
    const updatedQuests = [...saveState.quests];
    updatedQuests[questIndex] = {
      ...quest,
      claimed: true
    };

    let goldBonus = 0;
    let soulBonus = 0;
    let crystalBonus = 0;

    if (quest.rewardType === "Gold") goldBonus = quest.rewardAmount;
    else if (quest.rewardType === "Souls") soulBonus = quest.rewardAmount;
    else if (quest.rewardType === "Crystals") crystalBonus = quest.rewardAmount;

    const updated = {
      ...saveState,
      gold: saveState.gold + goldBonus,
      souls: saveState.souls + soulBonus,
      crystals: saveState.crystals + crystalBonus,
      quests: updatedQuests
    };
    saveToLocalStorage(updated);
  };

  const handleClaimAchievement = (id: string) => {
    // Standard claimed trigger
  };

  // ==========================================
  // --- EXPANDED PROGRESSION HANDLERS ---
  // ==========================================

  // 1. INTERACTIVE SKILL TREE SYSTEM
  const handleUnlockSkill = (nodeId: string) => {
    const node = SKILL_NODES.find(n => n.id === nodeId);
    if (!node) return;

    const currentLvl = saveState.skillsUnlocked[nodeId] || 0;
    if (currentLvl >= node.maxLevel) return;

    if (saveState.skillPoints >= node.cost) {
      AudioManager.playMagic();
      const updatedSkills = {
        ...saveState.skillsUnlocked,
        [nodeId]: currentLvl + 1
      };
      const updated = {
        ...saveState,
        skillPoints: saveState.skillPoints - node.cost,
        skillsUnlocked: updatedSkills
      };
      saveToLocalStorage(updated);
    } else {
      AudioManager.playClick();
      showCustomAlert("Insufficient Skill Points! Complete more portal runs and defeat guards to harvest Skill Points.", "TREE GROWTH BLOCKED");
    }
  };

  // 2. PERMANENT RELICS SHOP & ATTACHMENT
  const handleBuyRelic = (relicId: string) => {
    const relic = ALL_RELICS.find(r => r.id === relicId);
    if (!relic) return;

    if (saveState.ownedRelics.includes(relicId)) return;

    let balance = saveState.gold;
    let balanceKey: "gold" | "crystals" | "souls" = "gold";
    if (relic.costType === "Crystals") {
      balance = saveState.crystals;
      balanceKey = "crystals";
    } else if (relic.costType === "Souls") {
      balance = saveState.souls;
      balanceKey = "souls";
    }

    if (balance >= relic.cost) {
      AudioManager.playMagic();
      const updated = {
        ...saveState,
        [balanceKey]: balance - relic.cost,
        ownedRelics: [...saveState.ownedRelics, relicId]
      };
      saveToLocalStorage(updated);
    } else {
      AudioManager.playClick();
      showCustomAlert(`Insufficient ${relic.costType} to acquire the ${relic.name}!`, "MERCHANT REJECTS");
    }
  };

  const handleEquipRelic = (relicId: string) => {
    if (!saveState.ownedRelics.includes(relicId)) return;

    AudioManager.playClick();
    let equipped = [...(saveState.equippedRelics || [])];
    if (equipped.includes(relicId)) {
      // Unequip
      equipped = equipped.filter(id => id !== relicId);
    } else {
      // Equip (up to 2 relics)
      if (equipped.length >= 2) {
        equipped.shift(); // remove oldest
      }
      equipped.push(relicId);
    }

    const updated = {
      ...saveState,
      equippedRelics: equipped
    };
    saveToLocalStorage(updated);
  };

  // 3. ANCIENT ARTIFACTS
  const handleBuyArtifact = (artifactId: string) => {
    const artifact = ALL_ARTIFACTS.find(a => a.id === artifactId);
    if (!artifact) return;

    if (saveState.ownedArtifacts.includes(artifactId)) return;

    let balance = saveState.gold;
    let balanceKey: "gold" | "crystals" | "souls" = "gold";
    if (artifact.costType === "Crystals") {
      balance = saveState.crystals;
      balanceKey = "crystals";
    } else if (artifact.costType === "Souls") {
      balance = saveState.souls;
      balanceKey = "souls";
    }

    if (balance >= artifact.cost) {
      AudioManager.playMagic();
      const updated = {
        ...saveState,
        [balanceKey]: balance - artifact.cost,
        ownedArtifacts: [...saveState.ownedArtifacts, artifactId]
      };
      saveToLocalStorage(updated);
    } else {
      AudioManager.playClick();
      showCustomAlert(`Insufficient ${artifact.costType} to purchase the ${artifact.name}!`, "MERCHANT REJECTS");
    }
  };

  const handleEquipArtifact = (artifactId: string) => {
    if (!saveState.ownedArtifacts.includes(artifactId)) return;

    AudioManager.playClick();
    // Equip or toggle
    const current = saveState.equippedArtifact;
    const nextArtifact = current === artifactId ? null : artifactId;

    const updated = {
      ...saveState,
      equippedArtifact: nextArtifact
    };
    saveToLocalStorage(updated);
  };

  // 4. UNLOCKABLE SERPENT FORMS
  const handleBuyForm = (formId: string) => {
    const form = ALL_FORMS.find(f => f.id === formId);
    if (!form) return;

    if (saveState.prestigeCount < form.unlockedAtPrestige) {
      AudioManager.playClick();
      showCustomAlert(`This serpent form requires Prestige level ${form.unlockedAtPrestige} to awaken.`, "FORM LOCKED");
      return;
    }

    let balance = saveState.gold;
    let balanceKey: "gold" | "crystals" | "souls" = "gold";
    if (form.costType === "Crystals") {
      balance = saveState.crystals;
      balanceKey = "crystals";
    } else if (form.costType === "Souls") {
      balance = saveState.souls;
      balanceKey = "souls";
    }

    if (balance >= form.cost) {
      AudioManager.playDragonRoar(); // Awakening the beast!
      const updated = {
        ...saveState,
        [balanceKey]: balance - form.cost,
        selectedForm: formId
      };
      saveToLocalStorage(updated);
    } else {
      AudioManager.playClick();
      showCustomAlert(`Insufficient ${form.costType} to awaken the ${form.name}!`, "AWAKENING FAIL");
    }
  };

  const handleSelectForm = (formId: string) => {
    AudioManager.playClick();
    const updated = {
      ...saveState,
      selectedForm: formId
    };
    saveToLocalStorage(updated);
  };

  // 5. WEAPON & MAGIC ETERNAL UPGRADES (spent with Gold Coins)
  const handleUpgradeWeaponMagic = (type: "WEAPON" | "MAGIC", id: string, coinCost: number) => {
    if (saveState.gold >= coinCost) {
      AudioManager.playMagic();
      const levels = type === "WEAPON" ? { ...(saveState.weaponsLevel || {}) } : { ...(saveState.magicLevel || {}) };
      levels[id] = (levels[id] || 1) + 1;

      const updated = {
        ...saveState,
        gold: saveState.gold - coinCost,
        [type === "WEAPON" ? "weaponsLevel" : "magicLevel"]: levels
      };
      saveToLocalStorage(updated);
    } else {
      showCustomAlert("Insufficient Gold Coins to upgrade!", "REAP WEALTH");
    }
  };

  // 6. DAILY CALENDAR CONSECUTIVE REWARDS
  const handleClaimDailyCalendar = (dayNum: number) => {
    if ((saveState.claimedDailyRewards || []).includes(`day${dayNum}`)) return;

    const reward = DAILY_REWARDS.find(r => r.day === dayNum);
    if (!reward) return;

    AudioManager.playMagic();
    let goldAdd = 0;
    let soulsAdd = 0;
    let crystalsAdd = 0;

    if (reward.rewardType === "Gold") goldAdd = reward.rewardAmount;
    else if (reward.rewardType === "Souls") soulsAdd = reward.rewardAmount;
    else if (reward.rewardType === "Crystals") crystalsAdd = reward.rewardAmount;

    const nextConsecutive = (saveState.consecutiveLogins || 0) + 1;

    const updated = {
      ...saveState,
      gold: saveState.gold + goldAdd,
      souls: saveState.souls + soulsAdd,
      crystals: saveState.crystals + crystalsAdd,
      consecutiveLogins: nextConsecutive,
      claimedDailyRewards: [...(saveState.claimedDailyRewards || []), `day${dayNum}`]
    };
    saveToLocalStorage(updated);
  };

  // 7. PRESTIGE MODE ASCENSION
  const handlePrestigeReset = () => {
    if (saveState.highScore < 80000 && saveState.souls < 200) {
      AudioManager.playClick();
      showCustomAlert("Prestige Ascension is locked! You must score over 80,000 points or harvest at least 200 souls to initiate Ascension.", "ASCENSION LOCKED");
      return;
    }

    showCustomConfirm(
      "Are you sure you want to perform PRESTIGE ASCENSION?\n\nThis will reset your Gold, Talents, and Skill Tree progress in exchange for +50% permanent multipliers on Gold, Souls, and a stack of +5 bonus Skill Points!",
      () => {
        AudioManager.playDragonRoar();
        const nextPrestige = (saveState.prestigeCount || 0) + 1;
        const nextMultiplier = 1.0 + (nextPrestige * 0.5);

        const updated: GameSaveState = {
          ...saveState,
          gold: 800, // starting gold bonus
          souls: 50, // starting souls bonus
          crystals: saveState.crystals + 30, // keep crystals + get prestige crystals
          talents: {
            max_health: 0,
            speed: 0,
            magnet: 0,
            soul_multiplier: 0,
            ability_cooldown: 0
          },
          skillsUnlocked: {},
          skillPoints: 5 + (nextPrestige * 5), // grant fresh starting skill points
          prestigeCount: nextPrestige,
          prestigeMultiplier: nextMultiplier,
          ownedRelics: saveState.ownedRelics, // keep relics
          equippedRelics: saveState.equippedRelics,
          ownedArtifacts: saveState.ownedArtifacts, // keep artifacts
          equippedArtifact: saveState.equippedArtifact,
          selectedForm: saveState.selectedForm, // keep forms
          weaponsLevel: { fangs: 1, body: 1 }, // reset weapon/magic levels
          magicLevel: { active: 1, ultimate: 0 }
        };
        saveToLocalStorage(updated);
        showCustomAlert(`Royal Ascension Completed! You are now Prestige Level ${nextPrestige}. Permanent multiplier (+${nextPrestige * 50}%) activated!`, "ASCENDED");
      },
      "ASCENSION RITUAL"
    );
  };

  // 8. DIFFICULTY LEVEL SELECT
  const handleSelectDifficulty = (level: "EASY" | "NORMAL" | "HARD" | "NIGHTMARE") => {
    AudioManager.playClick();
    const updated = {
      ...saveState,
      difficultyLevel: level
    };
    saveToLocalStorage(updated);
  };

  // 4. ACTIVE GAMEPLAY LIFECYCLE CONTROLLER
  const handleStartGame = () => {
    AudioManager.playButton();
    setIsPaused(false);
    setActiveRunScore(0);
    setActiveRunCoins(0);
    setActiveRunXp(0);
    setShowGameOver(false);
    setJustDefeatedBoss(false);
    setScreen("GAMEPLAY");
  };

  const handleGameOver = (finalScore: number, coins: number, xp: number, defBoss: boolean) => {
    // 1. Difficulty reward multipliers
    let diffMult = 1.0;
    if (saveState.difficultyLevel === "EASY") diffMult = 0.7;
    else if (saveState.difficultyLevel === "HARD") diffMult = 1.5;
    else if (saveState.difficultyLevel === "NIGHTMARE") diffMult = 2.5;

    // 2. Prestige multiplier
    const prestigeMult = saveState.prestigeMultiplier || 1.0;

    // 3. Relic coin boosters (e.g. crown of greed grants +50% coins)
    let relicGoldMult = 1.0;
    if (saveState.equippedRelics && saveState.equippedRelics.includes("crown_greed")) {
      relicGoldMult = 1.5;
    }

    const calculatedCoins = Math.floor(coins * diffMult * prestigeMult * relicGoldMult);
    const baseSoulsEarned = Math.floor(finalScore / 1000);
    const calculatedSouls = Math.floor(baseSoulsEarned * diffMult * prestigeMult);

    // 4. Grant Skill Points based on performance: 1 point per 8,000 points scored, capped at 3 per run
    const earnedSkillPoints = Math.min(3, Math.floor(finalScore / 8000));

    setActiveRunScore(finalScore);
    setActiveRunCoins(calculatedCoins);
    setActiveRunXp(xp);
    setJustDefeatedBoss(defBoss);

    // Update global state scores and highscores
    const isNewHigh = finalScore > saveState.highScore;
    const updatedHighScore = isNewHigh ? finalScore : saveState.highScore;

    // Player XP and leveling progression
    let currentLevel = saveState.playerLevel || 1;
    let currentXp = (saveState.playerXp || 0) + xp;
    let leveledUp = false;
    let skillPointsEarned = 0;
    let levelUpGoldReward = 0;
    let levelUpSoulsReward = 0;
    let levelUpCrystalsReward = 0;
    let levelUpEggsEarned = 0;

    const xpNeededForNextLevel = (lvl: number) => lvl * 800 + 200;

    while (currentXp >= xpNeededForNextLevel(currentLevel)) {
      currentXp -= xpNeededForNextLevel(currentLevel);
      currentLevel++;
      leveledUp = true;
      skillPointsEarned += 1;
      levelUpGoldReward += currentLevel * 300;
      levelUpSoulsReward += currentLevel * 50;
      levelUpCrystalsReward += 10;
      if (currentLevel % 5 === 0) {
        levelUpEggsEarned += 1;
      }
    }

    // Unlocking titles based on level
    const newlyUnlockedTitles: string[] = [];
    const currentOwnedTitles = saveState.ownedTitles || ["novice"];
    
    if (currentLevel >= 5 && !currentOwnedTitles.includes("cursed_sov")) newlyUnlockedTitles.push("cursed_sov");
    if (currentLevel >= 10 && !currentOwnedTitles.includes("soul_reaper")) newlyUnlockedTitles.push("soul_reaper");
    if (currentLevel >= 15 && !currentOwnedTitles.includes("dragon_born")) newlyUnlockedTitles.push("dragon_born");
    if (currentLevel >= 20 && !currentOwnedTitles.includes("abyssal_col")) newlyUnlockedTitles.push("abyssal_col");

    // Biome Mastery
    const biomeKey = selectedBiome.type;
    const currentMasteryXp = saveState.biomeMastery?.[biomeKey] || 0;
    const previousMasteryLvl = Math.min(5, Math.floor(currentMasteryXp / 100));
    const masteryXpGained = Math.floor(finalScore / 1000);
    const newMasteryXp = currentMasteryXp + masteryXpGained;
    const newMasteryLvl = Math.min(5, Math.floor(newMasteryXp / 100));
    
    const masteredBiomes = {
      ...(saveState.biomeMastery || {}),
      [biomeKey]: newMasteryXp
    };

    const updated = {
      ...saveState,
      gold: saveState.gold + calculatedCoins + levelUpGoldReward,
      souls: saveState.souls + calculatedSouls + levelUpSoulsReward,
      crystals: saveState.crystals + levelUpCrystalsReward,
      skillPoints: (saveState.skillPoints || 0) + earnedSkillPoints + skillPointsEarned,
      highScore: updatedHighScore,
      playerXp: currentXp,
      playerLevel: currentLevel,
      ownedTitles: [...currentOwnedTitles, ...newlyUnlockedTitles],
      dragonEggs: (saveState.dragonEggs || 0) + levelUpEggsEarned,
      biomeMastery: masteredBiomes
    };

    saveToLocalStorage(updated);
    setShowGameOver(true);

    if (leveledUp) {
      setTimeout(() => {
        try {
          AudioManager.playMagic();
          AudioManager.setBgmState("victory");
        } catch (err) {}
        showCustomAlert(
          `Sovereign Ascent! You have reached Level ${currentLevel}! 🌟\n\n` +
          `✨ Rewards Claimed:\n` +
          `• +${levelUpGoldReward} Gold Coins 🪙\n` +
          `• +${levelUpSoulsReward} Captured Souls 💀\n` +
          `• +${levelUpCrystalsReward} Void Crystals 💎\n` +
          `• +${skillPointsEarned} Skill Point(s) ⚡\n` +
          (levelUpEggsEarned > 0 ? `• +${levelUpEggsEarned} Pulsing Dragon Egg 🥚 (Hatch in the sanctuary profile!)\n` : "") +
          (newlyUnlockedTitles.length > 0 ? `• Unlocked Title(s): ${newlyUnlockedTitles.map(t => t === "cursed_sov" ? "Cursed Sovereign" : t === "soul_reaper" ? "Soul Reaper" : t === "dragon_born" ? "Dragon Born" : "Abyssal Colossus").join(", ")} 👑\n` : "") +
          `\nKeep slithering to unlock ancient cosmic forms!`,
          "PLAYER LEVEL UP!"
        );
      }, 1200);
    } else if (newMasteryLvl > previousMasteryLvl) {
      setTimeout(() => {
        try {
          AudioManager.playMagic();
          AudioManager.setBgmState("victory");
        } catch (err) {}
        showCustomAlert(
          `Biome Mastery Unlocked! 🗺️\n\nYou have achieved Mastery Rank ${newMasteryLvl} in the ${selectedBiome.name}! You earn +100 Gold and +20 Souls for cementing your rule.`,
          "PORTAL DOMINATED"
        );
      }, 1200);
    }
  };

  const handleQuestProgress = (id: string, increment: number) => {
    const questIndex = saveState.quests.findIndex(q => q.id === id);
    if (questIndex === -1) return;

    const quest = saveState.quests[questIndex];
    if (quest.completed) return;

    const updatedQuests = [...saveState.quests];
    const newCurrent = Math.min(quest.current + increment, quest.target);
    updatedQuests[questIndex] = {
      ...quest,
      current: newCurrent,
      completed: newCurrent >= quest.target
    };

    setSaveState({
      ...saveState,
      quests: updatedQuests
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: "Serpent Kingdom Score",
      text: `I scored ${activeRunScore.toLocaleString()} in the Serpent Kingdom! Join my royal clan and reclaim the crown.`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showCustomAlert("Your royal score has been shared with the realm!", "SHARE SUCCESSFUL");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
          copyToClipboard(shareData.text);
        }
      }
    } else {
      copyToClipboard(shareData.text);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showCustomAlert("Your royal decree has been copied to the clipboard. Paste it to spread the word!", "COPIED TO SCROLL");
    }).catch(err => {
      console.error("Could not copy text: ", err);
      showCustomAlert(`Score: ${activeRunScore.toLocaleString()}! Spread the word, sovereign!`, "RECONNAISSANCE");
    });
  };

  // Claim achievement reward
  const handleClaimAchievementRewards = () => {
    // Unlocked standard Slayer of the Serpent King
    const updated = {
      ...saveState,
      gold: saveState.gold + 5000,
      crystals: saveState.crystals + 100
    };
    saveToLocalStorage(updated);
    setShowAchievementUnlock(false);
    
    // Resume to camp after epic unlock
    setScreen("CAMP");
  };

  const handleCloseGameOver = () => {
    setShowGameOver(false);
    if (justDefeatedBoss) {
      // Trigger legendary boss reward claim dialog first!
      setShowAchievementUnlock(true);
    } else {
      setScreen("CAMP");
    }
  };

  // Derive Talent Bonuses
  const getMaxHealthBonus = () => {
    const lvl = saveState.talents["max_health"] || 0;
    return lvl * 10;
  };

  const getSpeedBonus = () => {
    const lvl = saveState.talents["speed"] || 0;
    return lvl * 0.25;
  };

  const getMagnetBonus = () => {
    const lvl = saveState.talents["magnet"] || 0;
    return lvl * 25;
  };

  const getGoldMultiplier = () => {
    const lvl = saveState.talents["soul_multiplier"] || 0;
    return 1 + lvl * 0.1;
  };

  const getCooldownReduction = () => {
    const lvl = saveState.talents["ability_cooldown"] || 0;
    return lvl * 0.08;
  };

  // Find active Skin specs
  const activeSkinObj = ALL_SKINS.find(s => s.id === saveState.equippedSkin) || ALL_SKINS[0];

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#131313] relative select-none font-body-md text-on-surface">
      
      {/* 1. INITIAL LOADING SCREEN */}
      {screen === "LOADING" && (
        <LoadingScreen onFinishedLoading={() => setScreen("CAMP")} />
      )}

      {/* 2. CAMP MAIN DASHBOARD */}
      {screen === "CAMP" && !showSettings && (
        <MainDashboard
          saveState={saveState}
          onSelectSkin={handleSelectSkin}
          onBuySkin={handleBuySkin}
          onUpgradeTalent={handleUpgradeTalent}
          onClaimQuest={handleClaimQuest}
          onClaimAchievement={handleClaimAchievement}
          onSelectBiome={setSelectedBiome}
          selectedBiome={selectedBiome}
          onStartGame={handleStartGame}
          onOpenSettings={() => setShowSettings(true)}
          onAlert={showCustomAlert}
          activeTab={dashboardActiveTab}
          onChangeTab={setDashboardActiveTab}
          
          // Extended progression props
          onUnlockSkill={handleUnlockSkill}
          onBuyRelic={handleBuyRelic}
          onEquipRelic={handleEquipRelic}
          onBuyArtifact={handleBuyArtifact}
          onEquipArtifact={handleEquipArtifact}
          onBuyForm={handleBuyForm}
          onSelectForm={handleSelectForm}
          onUpgradeWeaponMagic={handleUpgradeWeaponMagic}
          onClaimDailyCalendar={handleClaimDailyCalendar}
          onPrestigeReset={handlePrestigeReset}
          onSelectDifficulty={handleSelectDifficulty}
          onSaveStateUpdate={saveToLocalStorage}
        />
      )}

      {/* 3. SETTINGS OVERLAY PANEL */}
      {showSettings && (
        <SettingsScreen
          settings={saveState.settings}
          onUpdateSettings={(newSettings) => {
            const updated = {
              ...saveState,
              settings: newSettings
            };
            saveToLocalStorage(updated);
          }}
          onClose={() => setShowSettings(false)}
          onReplayOnboarding={() => {
            setOnboardingActive(true);
            setShowSettings(false);
          }}
        />
      )}

      {/* 4. ACTIVE GAMEPLAY HUD & CANVAS */}
      {screen === "GAMEPLAY" && (
        <div className="w-full h-full relative">
          {/* Main 2D engine */}
          <GameCanvas
            biome={selectedBiome}
            settings={saveState.settings}
            equippedSkin={activeSkinObj}
            healthBonus={getMaxHealthBonus()}
            speedBonus={getSpeedBonus()}
            magnetBonus={getMagnetBonus()}
            goldMultiplier={getGoldMultiplier()}
            cooldownReduction={getCooldownReduction()}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            isDemoMode={isDemoMode}
            isTutorialMode={isTutorialMode}
            onQuestProgress={handleQuestProgress}
            onGameOver={handleGameOver}
            onActiveAbilitiesCooldowns={setAbilitiesCooldowns}
            activeAbilityTrigger={activeAbilityTrigger}
            onResetTrigger={() => setActiveAbilityTrigger("")}
            onBossState={(active, percent) => {
              setBossActive(active);
              setBossHealthPercent(percent);
            }}

            // Extended progression props
            skillsUnlocked={saveState.skillsUnlocked || {}}
            equippedRelics={saveState.equippedRelics || []}
            equippedArtifact={saveState.equippedArtifact}
            selectedForm={saveState.selectedForm || "sovereign_obsidian"}
            difficultyLevel={saveState.difficultyLevel || "NORMAL"}
            weaponsLevel={saveState.weaponsLevel || { fangs: 1, body: 1 }}
            magicLevel={saveState.magicLevel || { active: 1, ultimate: 0 }}
          />

          {/* HUD widgets */}
          {!isDemoMode && (
            <GameHUD
              score={activeRunScore}
              highScore={saveState.highScore}
              souls={saveState.souls}
              soulProgress={(saveState.souls / 15) * 100} // dynamic tier loop
              activeObjective={
                bossActive 
                  ? "DEFEAT THE BOSS GUARDIAN" 
                  : (saveState.quests.find(q => !q.isCompleted && q.current < q.target)
                      ? `${saveState.quests.find(q => !q.isCompleted && q.current < q.target)!.title} (${saveState.quests.find(q => !q.isCompleted && q.current < q.target)!.current}/${saveState.quests.find(q => !q.isCompleted && q.current < q.target)!.target})`
                      : "Survive and grow stronger!")
              }
              combo={3} // default starting base or dynamic from canvas
              hasCrystal={saveState.crystals >= 10}
              bossActive={bossActive}
              bossHealthPercent={bossHealthPercent}
              dashCooldown={abilitiesCooldowns.dash}
              slowCooldown={abilitiesCooldowns.slow}
              shieldCooldown={abilitiesCooldowns.shield}
              cycloneCooldown={abilitiesCooldowns.cyclone}
              onPauseToggle={() => setIsPaused(!isPaused)}
              onActivateAbility={(ability) => setActiveAbilityTrigger(ability)}
            />
          )}

          {/* Demo Mode Overlay Text */}
          {isDemoMode && (
             <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 animate-pulse text-center pointer-events-none">
               <h1 className="font-headline text-2xl md:text-4xl text-primary font-bold uppercase tracking-widest text-glow-primary">
                 Cinematic Demo Mode
               </h1>
               <p className="text-white font-body text-sm mt-2 opacity-80 uppercase tracking-widest">
                 Press any key or click to play
               </p>
             </div>
          )}

          {/* Pause overlay screen indicator */}
          {isPaused && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[80] flex flex-col items-center justify-center pointer-events-auto">
              <div className="glass-panel p-panel-padding rounded-xl text-center max-w-sm border border-primary/30 animate-float">
                <span className="material-symbols-outlined text-primary text-5xl mb-4 animate-spin-rune">pause_circle</span>
                <h2 className="font-headline-md text-2xl text-primary font-bold uppercase tracking-wider">GAME PAUSED</h2>
                <p className="font-body-md text-sm text-on-surface-variant mt-2 mb-6">
                  "The scrying portal of the Serpent Kingdom is suspended in stasis."
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="stone-button w-full py-3 rounded-lg font-headline-md text-sm text-primary uppercase font-bold cursor-pointer"
                  >
                    Resume Journey
                  </button>
                  <button
                    onClick={() => {
                      setIsPaused(false);
                      setScreen("CAMP");
                    }}
                    className="w-full py-3 rounded-lg bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest hover:border-primary/50 text-on-surface text-xs uppercase font-semibold cursor-pointer"
                  >
                    Flee to Camp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. GAME OVER MODAL OVERLAY */}
      {showGameOver && (
        <GameOver
          score={activeRunScore}
          highScore={saveState.highScore}
          isNewRecord={activeRunScore >= saveState.highScore}
          coinsEarned={activeRunCoins}
          xpEarned={activeRunXp}
          onRetry={handleStartGame}
          onContinue={handleCloseGameOver}
          onShare={handleShare}
          onOpenLeaderboard={() => showCustomAlert("Retrieving Royal Leaderboards from local vault...", "VAULT ACCESS")}
        />
      )}

      {/* 6. ACHIEVEMENT UNLOCKED NOTIFICATION */}
      {showAchievementUnlock && (
        <AchievementUnlock onClaim={handleClaimAchievementRewards} />
      )}

      {/* 7. CUSTOM DIALOG MODAL (REPLACES BROWSER ALERTS/CONFIRMS) */}
      {modalDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99] flex items-center justify-center pointer-events-auto p-4">
          <div className="glass-panel p-6 rounded-xl text-center max-w-sm border border-primary/40 shadow-2xl relative">
            <span className="material-symbols-outlined text-primary text-4xl mb-2 animate-pulse">gavel</span>
            <h3 className="font-headline-md text-xl text-primary font-bold uppercase tracking-wider mb-2">
              {modalDialog.title}
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant whitespace-pre-line mb-6">
              {modalDialog.message}
            </p>
            <div className="flex gap-3 justify-center">
              {modalDialog.cancelText && (
                <button
                  onClick={() => {
                    AudioManager.playClick();
                    setModalDialog(null);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-surface-container-high border border-outline hover:bg-surface-container-highest hover:border-primary/50 text-on-surface text-xs uppercase font-semibold cursor-pointer transition-colors"
                >
                  {modalDialog.cancelText}
                </button>
              )}
              <button
                onClick={() => {
                  AudioManager.playMagic();
                  if (modalDialog.onConfirm) {
                    modalDialog.onConfirm();
                  }
                  setModalDialog(null);
                }}
                className="stone-button px-5 py-2.5 rounded-lg font-headline-md text-xs text-primary uppercase font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                {modalDialog.confirmText || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. ONBOARDING OVERLAY */}
      {onboardingActive && (
        <OnboardingOverlay
          onStartAdventure={() => {
            handleOnboardingComplete();
            setIsTutorialMode(false);
            handleStartGame();
          }}
          onWatchGameplay={() => {
            handleOnboardingComplete();
            setIsDemoMode(true);
            handleStartGame();
          }}
          onHowToPlay={() => {
            handleOnboardingComplete();
            setIsTutorialMode(true);
            handleStartGame();
          }}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* 9. WELCOME CORONATION CHEST */}
      {welcomeChestActive && screen === "CAMP" && (
        <WelcomeChestModal
          onClaim={handleClaimWelcomeChest}
        />
      )}

    </div>
  );
}
