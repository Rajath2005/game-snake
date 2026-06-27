import React, { useState } from "react";
import { 
  GameSaveState, 
  BIOMES, 
  ALL_SKINS, 
  INITIAL_TALENTS, 
  Biome, 
  Skin, 
  Talent, 
  Quest, 
  Achievement,
  ALL_RELICS,
  ALL_ARTIFACTS,
  ALL_FORMS,
  SKILL_NODES,
  DAILY_REWARDS,
  SkillNode,
  DEFAULT_ACHIEVEMENTS,
  ALL_TITLES,
  ALL_FRAMES,
  ALL_BADGES,
  HATCHABLE_DRAGONS
} from "../types";

interface MainDashboardProps {
  saveState: GameSaveState;
  onSelectSkin: (skinId: string) => void;
  onBuySkin: (skinId: string) => void;
  onUpgradeTalent: (talentId: string) => void;
  onClaimQuest: (questId: string) => void;
  onClaimAchievement: (achievementId: string) => void;
  onSelectBiome: (biome: Biome) => void;
  selectedBiome: Biome;
  onStartGame: () => void;
  onOpenSettings: () => void;

  // Extended progression props
  onUnlockSkill: (nodeId: string) => void;
  onBuyRelic: (relicId: string) => void;
  onEquipRelic: (relicId: string) => void;
  onBuyArtifact: (artifactId: string) => void;
  onEquipArtifact: (artifactId: string) => void;
  onBuyForm: (formId: string) => void;
  onSelectForm: (formId: string) => void;
  onUpgradeWeaponMagic: (type: "WEAPON" | "MAGIC", id: string, coinCost: number) => void;
  onClaimDailyCalendar: (dayNum: number) => void;
  onPrestigeReset: () => void;
  onSelectDifficulty: (level: "EASY" | "NORMAL" | "HARD" | "NIGHTMARE") => void;
  onAlert: (msg: string, title?: string) => void;
  activeTab?: TabType;
  onChangeTab?: (tab: TabType) => void;
  onSaveStateUpdate?: (newState: GameSaveState) => void;
}

type TabType = "BIOMES" | "SHOP" | "TALENTS" | "SKILLS" | "RELICS" | "FORMS" | "CALENDAR" | "PRESTIGE" | "QUESTS" | "HELP";

export default function MainDashboard({
  saveState,
  onSelectSkin,
  onBuySkin,
  onUpgradeTalent,
  onClaimQuest,
  onClaimAchievement,
  onSelectBiome,
  selectedBiome,
  onStartGame,
  onOpenSettings,

  onUnlockSkill,
  onBuyRelic,
  onEquipRelic,
  onBuyArtifact,
  onEquipArtifact,
  onBuyForm,
  onSelectForm,
  onUpgradeWeaponMagic,
  onClaimDailyCalendar,
  onPrestigeReset,
  onSelectDifficulty,
  onAlert,
  activeTab: propActiveTab,
  onChangeTab: propOnChangeTab,
  onSaveStateUpdate
}: MainDashboardProps) {
  const [localTab, setLocalTab] = useState<TabType>("BIOMES");
  const activeTab = propActiveTab !== undefined ? propActiveTab : localTab;
  const setActiveTab = propOnChangeTab !== undefined ? propOnChangeTab : setLocalTab;

  const [previewSkin, setPreviewSkin] = useState<Skin | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isHatching, setIsHatching] = useState(false);
  const [hatchedDragon, setHatchedDragon] = useState<string | null>(null);
  const [profileModalTab, setProfileModalTab] = useState<"PROFILE" | "TITLES" | "FRAMES" | "DRAGONS">("PROFILE");

  const activeTitleObj = ALL_TITLES.find(t => t.id === saveState.selectedTitle) || ALL_TITLES[0];
  const activeFrameObj = ALL_FRAMES.find(f => f.id === saveState.selectedFrame) || ALL_FRAMES[0];
  const activeBadgeObj = ALL_BADGES.find(b => b.id === saveState.selectedBadge) || ALL_BADGES[0];

  const handleHatchEgg = () => {
    if (!saveState.dragonEggs || saveState.dragonEggs <= 0) return;
    setIsHatching(true);
    setHatchedDragon(null);
    
    setTimeout(() => {
      const index = Math.floor(Math.random() * HATCHABLE_DRAGONS.length);
      const chosen = HATCHABLE_DRAGONS[index];
      
      const newHatched = [...(saveState.hatchedDragons || [])];
      if (!newHatched.includes(chosen.name)) {
        newHatched.push(chosen.name);
      }
      
      let goldGain = 1500;
      let soulsGain = 150;
      let crystalsGain = 30;
      
      const newOwnedBadges = [...(saveState.ownedBadges || ["first_step"])];
      if (!newOwnedBadges.includes("egg_hatcher") && newHatched.length >= 4) {
        newOwnedBadges.push("egg_hatcher");
      }
      
      const updated = {
        ...saveState,
        dragonEggs: saveState.dragonEggs - 1,
        hatchedDragons: newHatched,
        gold: saveState.gold + goldGain,
        souls: saveState.souls + soulsGain,
        crystals: saveState.crystals + crystalsGain,
        ownedBadges: newOwnedBadges
      };
      
      if (onSaveStateUpdate) {
        onSaveStateUpdate(updated);
      }
      
      setIsHatching(false);
      setHatchedDragon(chosen.name);
    }, 2000);
  };

  const handleBuyFrame = (frameId: string) => {
    const frame = ALL_FRAMES.find(f => f.id === frameId);
    if (!frame) return;
    
    let isAffordable = false;
    let updatedGold = saveState.gold;
    let updatedSouls = saveState.souls;
    let updatedCrystals = saveState.crystals;
    
    if (frame.costType === "Gold") {
      isAffordable = saveState.gold >= frame.cost;
      updatedGold -= frame.cost;
    } else if (frame.costType === "Souls") {
      isAffordable = saveState.souls >= frame.cost;
      updatedSouls -= frame.cost;
    } else if (frame.costType === "Crystals") {
      isAffordable = saveState.crystals >= frame.cost;
      updatedCrystals -= frame.cost;
    }
    
    if (!isAffordable) {
      onAlert(`You do not possess enough ${frame.costType} to acquire this border frame!`);
      return;
    }
    
    const updated = {
      ...saveState,
      gold: updatedGold,
      souls: updatedSouls,
      crystals: updatedCrystals,
      ownedFrames: [...(saveState.ownedFrames || ["none"]), frameId],
      selectedFrame: frameId
    };
    
    if (onSaveStateUpdate) {
      onSaveStateUpdate(updated);
    }
    onAlert(`The beautiful ${frame.name} has been acquired and styled to your profile!`);
  };

  const handleEquipFrame = (frameId: string) => {
    const updated = {
      ...saveState,
      selectedFrame: frameId
    };
    if (onSaveStateUpdate) {
      onSaveStateUpdate(updated);
    }
  };

  const handleEquipTitle = (titleId: string) => {
    const updated = {
      ...saveState,
      selectedTitle: titleId
    };
    if (onSaveStateUpdate) {
      onSaveStateUpdate(updated);
    }
  };

  const handleEquipBadge = (badgeId: string) => {
    const updated = {
      ...saveState,
      selectedBadge: badgeId
    };
    if (onSaveStateUpdate) {
      onSaveStateUpdate(updated);
    }
  };

  // Helper to get actual talent level
  const getTalentLevel = (id: string) => {
    return saveState.talents[id] || 0;
  };

  // Calculate upgrading cost
  const getTalentCost = (talent: Talent) => {
    const currentLevel = getTalentLevel(talent.id);
    return Math.floor(talent.baseCost * Math.pow(talent.costMultiplier, currentLevel));
  };

  return (
    <div className="h-full w-full bg-[#131313] text-[#e5e2e1] flex flex-col relative overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom,0px))] selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Campfire atmospheric background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-color-dodge filter brightness-[0.4]"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDdxh1HqTPx65cBYXVVXue9XFnk3aZRXsJX19vLnrG9uwpEaOrEMUroCkouddxUSgoJpM0EZl8EuUYqSZgCHOvfYfKzOIKjmKjbqjGzts5yp41uF62MabwcrisY6sHgcWbI2r_4vJwBkZmImfOHISIMrNpVxekEwkrfae9WM5VzYPM8rrCBqYZqVchWm-K_H50li8vvgJfgDr1pzeIQqxVoa8MdEvFTeRXfVYKoNEnp1VM1D99uXnDoUQKpHSKz3xF4AMOp0QTDV-Y')" 
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,_rgba(233,193,118,0.15)_0%,_transparent_50%)]" />
      </div>

      {/* Top App Bar */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-[5%] bg-surface-dim/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-md h-16 flex-shrink-0 pt-[env(safe-area-inset-top,0px)]">
        <div 
          id="onboarding-player-profile" 
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2 cursor-pointer group hover:scale-105 transition-all duration-150 select-none bg-surface-container/20 px-3 py-1 rounded-full border border-primary/10 hover:border-primary/40"
        >
          <div 
            className="w-9 h-9 rounded-full border-2 overflow-hidden flex-shrink-0 relative transition-transform group-hover:rotate-6"
            style={{ borderColor: activeFrameObj?.borderColor || 'rgba(233,193,118,0.5)' }}
          >
            <img 
              className="w-full h-full object-cover" 
              alt="Serpent Profile Portrait"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6JYDhRhoajL9WZdsg5onhcmzhEuU7vuHgfHFXqg7uMgqleF9HfhFsrpm7hLwhjczQz3FRtisy5zKNK4598lNdroj-dmka7N0qHt1X2ZauE-7rHGcKDDrlhlbdc3QCXaS6KihWUIKLQp70Jm6EXela9NJbSC6x4aOtLZoSbCAGdb0AoubJG_BzacAnR6F9z8OQrCMJP6dDU2eVHETqOLkhUBdkruYXwaa4WS0bhWJNR1kAk6Lk-04fUAnHEaPq4rmNtWvbEhtsF8A"
            />
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1">
              <span className="font-headline-md text-xs text-primary font-bold group-hover:text-secondary transition-colors">
                LVL {saveState.playerLevel || 1}
              </span>
              <span className="px-1 py-0.2 text-[8px] font-mono font-bold text-primary tracking-widest uppercase opacity-80">
                {activeTitleObj?.name || "Novice"}
              </span>
            </div>
            <span className="text-[9px] text-on-surface-variant font-medium flex items-center gap-0.5 mt-0.5">
              <span className="material-symbols-outlined text-[9px] text-secondary">
                {activeBadgeObj?.icon || "star"}
              </span>
              {activeBadgeObj?.name || "First Step"}
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop Web) */}
        <nav className="hidden lg:flex gap-4 z-10 overflow-x-auto max-w-[60%] hide-scrollbar py-1">
          {([
            { id: "BIOMES", label: "Portals", icon: "map" },
            { id: "SHOP", label: "Vault", icon: "storefront" },
            { id: "TALENTS", label: "Talents", icon: "upgrade" },
            { id: "SKILLS", label: "Skill Tree", icon: "account_tree" },
            { id: "RELICS", label: "Relics", icon: "brightness_7" },
            { id: "FORMS", label: "Forms", icon: "pest_control" },
            { id: "CALENDAR", label: "Daily Calendar", icon: "calendar_month" },
            { id: "PRESTIGE", label: "Prestige", icon: "military_tech" },
            { id: "QUESTS", label: "Missions", icon: "checklist" },
            { id: "HELP", label: "How To Play", icon: "help" }
          ] as { id: TabType; label: string; icon: string }[]).map((tab) => (
            <button
              key={tab.id}
              id={`onboarding-tab-${tab.id.toLowerCase()}`}
              onClick={() => setActiveTab(tab.id)}
              className={`font-headline-md text-[11px] tracking-wider uppercase px-2.5 py-1 cursor-pointer transition-all border-b-2 hover:text-secondary font-bold flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id 
                  ? "text-primary border-primary shadow-[0_4px_10px_rgba(233,193,118,0.2)]" 
                  : "text-on-surface-variant border-transparent opacity-80"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          <button
            id="onboarding-leaderboard-btn"
            onClick={() => onAlert("Retrieving Royal Leaderboards from local vault...", "VAULT ACCESS")}
            className="font-label-numeric text-label-numeric text-[#e9c176] border border-[#e9c176]/50 px-3 py-1.5 rounded hover:bg-[#e9c176]/10 hover:text-secondary hover:scale-105 transition-all active:scale-95 duration-75 cursor-pointer font-bold tracking-wider text-[10px] sm:text-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">leaderboard</span>
            LEADERBOARD
          </button>
          <button
            id="onboarding-settings-btn"
            onClick={onOpenSettings}
            className="font-label-numeric text-label-numeric text-primary border border-primary px-3 py-1.5 rounded hover:bg-primary/10 hover:text-secondary hover:scale-105 transition-all active:scale-95 duration-75 cursor-pointer font-bold tracking-wider text-[10px] sm:text-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">settings</span>
            SETTINGS
          </button>
        </div>
      </header>

      {/* Main Camp View Canvas */}
      <main className="flex-grow z-10 px-gutter md:px-[5%] lg:px-[10%] py-6 relative">
        
        {/* Navigation Tabs (Mobile Only Layout) */}
        <div className="flex lg:hidden justify-start gap-3 overflow-x-auto pb-2 border-b border-outline-variant/30 mb-6 hide-scrollbar">
          {([
            { id: "BIOMES", label: "Portals", icon: "map" },
            { id: "SHOP", label: "Vault", icon: "storefront" },
            { id: "TALENTS", label: "Talents", icon: "upgrade" },
            { id: "SKILLS", label: "Skill Tree", icon: "account_tree" },
            { id: "RELICS", label: "Relics", icon: "brightness_7" },
            { id: "FORMS", label: "Forms", icon: "pest_control" },
            { id: "CALENDAR", label: "Daily", icon: "calendar_month" },
            { id: "PRESTIGE", label: "Prestige", icon: "military_tech" },
            { id: "QUESTS", label: "Missions", icon: "checklist" },
            { id: "HELP", label: "Help", icon: "help" }
          ] as { id: TabType; label: string; icon: string }[]).map((tab) => (
            <button
              key={tab.id}
              id={`onboarding-tab-mobile-${tab.id.toLowerCase()}`}
              onClick={() => setActiveTab(tab.id)}
              className={`font-headline-md text-xs tracking-wider uppercase min-h-[48px] px-4 cursor-pointer whitespace-nowrap border-b-2 transition-all font-bold flex items-center justify-center gap-1.5 bg-surface-container-high/40 rounded ${
                activeTab === tab.id 
                  ? "text-primary border-primary bg-primary/10" 
                  : "text-on-surface-variant border-transparent opacity-70"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Currency Hub Box */}
        <section className="glass-panel rounded-xl p-4 mb-8 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:justify-between items-center max-w-4xl mx-auto border border-primary/20 gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              monetization_on
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Gold Coins</span>
              <span className="font-label-numeric text-sm text-primary font-bold">
                {saveState.gold.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Captured Souls</span>
              <span className="font-label-numeric text-sm text-error font-bold">
                {saveState.souls.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              diamond
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Void Crystals</span>
              <span className="font-label-numeric text-sm text-secondary drop-shadow-[0_0_5px_rgba(78,222,163,0.8)] font-bold">
                {saveState.crystals.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Skill Points</span>
              <span className="font-label-numeric text-sm text-cyan-400 font-bold">
                {saveState.skillPoints || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <span className="material-symbols-outlined text-purple-400 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              military_tech
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Prestige</span>
              <span className="font-label-numeric text-sm text-purple-400 font-bold">
                Rank {saveState.prestigeCount || 0}
              </span>
            </div>
          </div>
        </section>

        {/* Dynamic Inner Tab Router */}
        
        {/* TAB 1: BIOMES PORTALS SELECTION */}
        {activeTab === "BIOMES" && (
          <div className="max-w-2xl mx-auto animate-float">
            <h2 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2 font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-xl">map</span>
              Portal Gateways
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant mb-6">
              Select an ancient dungeon dimension to descend into. Accumulate total souls to break locks.
            </p>
            
            <div className="flex flex-col gap-4">
              {BIOMES.map((biome) => {
                const isLocked = saveState.souls < biome.unlockedAtSouls;
                const isSelected = selectedBiome.type === biome.type;
                
                return (
                  <div
                    key={biome.type}
                    onClick={() => !isLocked && onSelectBiome(biome)}
                    className={`glass-panel p-5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                      isLocked 
                        ? "opacity-50 border-outline-variant/20 cursor-not-allowed" 
                        : isSelected
                          ? "border-secondary glow-secondary shadow-[0_0_15px_rgba(78,222,163,0.3)] cursor-pointer bg-secondary-container/5"
                          : "border-outline-variant/30 hover:border-primary cursor-pointer hover:bg-surface-container-high/40"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Left portal orb */}
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center border relative"
                        style={{ 
                          borderColor: biome.accentColor,
                          boxShadow: `0 0 10px ${biome.accentColor}40`
                        }}
                      >
                        <span className="material-symbols-outlined text-2xl" style={{ color: biome.accentColor }}>
                          {isLocked ? "lock" : "cyclone"}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline-md text-base text-on-surface font-bold uppercase">
                            {biome.name}
                          </h3>
                          {isSelected && !isLocked && (
                            <span className="px-2 py-0.5 bg-secondary-container text-[#002113] font-label-numeric text-[9px] rounded font-bold tracking-widest">
                              SELECTED
                            </span>
                          )}
                        </div>
                        <p className="font-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
                          {biome.description}
                        </p>
                      </div>
                    </div>

                    {isLocked ? (
                      <div className="flex items-center gap-1 bg-surface-container-highest px-3 py-1.5 rounded text-xs font-label-numeric font-bold text-on-surface-variant border border-outline-variant/30">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span>{biome.unlockedAtSouls} SOULS NEEDED</span>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        className={`font-label-sm uppercase text-xs tracking-wider px-4 py-2 rounded-md ${
                          isSelected 
                            ? "bg-secondary text-[#002113] font-bold" 
                            : "bg-surface-container-highest border border-outline-variant text-on-surface hover:text-secondary hover:border-secondary font-bold"
                        }`}
                      >
                        {isSelected ? "ACTIVE" : "SELECT"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Difficulty Selector Panel */}
            <div className="glass-panel p-5 rounded-xl border border-outline-variant/30 mt-6 bg-[#1a1a1a]">
              <h3 className="font-headline-md text-sm text-primary mb-3 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">skull</span>
                Difficulty Level Modifier
              </h3>
              <p className="text-xs text-on-surface-variant mb-4">
                Higher difficulties augment enemy aggressiveness, health, and spawn rates, but grant up to <strong className="text-secondary">+150% Souls and Coins</strong>.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["EASY", "NORMAL", "HARD", "NIGHTMARE"] as const).map((diff) => {
                  const isActive = (saveState.difficultyLevel || "NORMAL") === diff;
                  const colors = {
                    EASY: "border-green-500/30 hover:border-green-500 text-green-400 bg-green-500/5",
                    NORMAL: "border-blue-500/30 hover:border-blue-500 text-blue-400 bg-blue-500/5",
                    HARD: "border-orange-500/30 hover:border-orange-500 text-orange-400 bg-orange-500/5",
                    NIGHTMARE: "border-red-500/40 hover:border-red-500 text-red-500 bg-red-500/5 font-extrabold"
                  };
                  const activeColors = {
                    EASY: "border-green-500 text-[#002113] bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] font-bold",
                    NORMAL: "border-blue-500 text-[#001d3d] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] font-bold",
                    HARD: "border-orange-500 text-[#2c1300] bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)] font-bold",
                    NIGHTMARE: "border-red-500 text-[#ffffff] bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)] font-bold"
                  };
                  return (
                    <button
                      key={diff}
                      onClick={() => onSelectDifficulty(diff)}
                      className={`text-center py-2.5 rounded-lg border text-xs tracking-wider transition-all duration-150 uppercase cursor-pointer ${
                        isActive ? activeColors[diff] : colors[diff]
                      }`}
                    >
                      {diff}
                      {diff === "EASY" && " (0.7x)"}
                      {diff === "NORMAL" && " (1.0x)"}
                      {diff === "HARD" && " (1.5x)"}
                      {diff === "NIGHTMARE" && " (2.5x)"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Play Button Row */}
            <div className="mt-8 flex justify-center">
              <button
                id="onboarding-play-btn"
                onClick={onStartGame}
                className="stone-button w-full py-5 rounded-xl font-headline-md text-xl text-primary flex items-center justify-center gap-3 cursor-pointer select-none font-bold tracking-widest shadow-[0_0_20px_rgba(233,193,118,0.3)] hover:shadow-[0_0_30px_rgba(78,222,163,0.6)] uppercase hover:text-secondary group active:scale-95 transition-transform"
              >
                <span>ENTER PORTAL</span>
                <span className="material-symbols-outlined font-bold">
                  local_fire_department
                </span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SKIN SHOP SYSTEM */}
        {activeTab === "SHOP" && (
          <div className="animate-float">
            <h2 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2 font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-xl">star</span>
              Premium Serpent Skins
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter mb-8">
              {ALL_SKINS.map((skin) => {
                const isOwned = saveState.ownedSkins.includes(skin.id);
                const isEquipped = saveState.equippedSkin === skin.id;
                
                return (
                  <article 
                    key={skin.id}
                    className={`glass-panel rounded-lg overflow-hidden card-glow transition-all duration-300 group cursor-pointer relative ${
                      isEquipped ? "border-secondary shadow-[0_0_15px_rgba(78,222,163,0.3)]" : "border-outline-variant/20"
                    }`}
                  >
                    {/* Rarity badge */}
                    <div className="absolute top-3 left-3 bg-surface-container-highest/95 border border-secondary text-secondary px-2.5 py-1 rounded-full font-label-numeric text-[9px] tracking-widest z-20 shadow-[0_0_10px_rgba(78,222,163,0.4)] font-bold">
                      {skin.rarity}
                    </div>

                    {isEquipped && (
                      <div className="absolute top-3 right-3 text-secondary z-20 bg-background/50 rounded-full p-1 border border-secondary/20">
                        <span className="material-symbols-outlined text-lg font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      </div>
                    )}

                    <div className="h-44 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high to-transparent z-10" />
                      <img 
                        src={skin.image} 
                        alt={skin.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                      />
                    </div>

                    <div className="p-4 relative z-20 bg-surface-container-high/85">
                      <h3 className="font-headline-md text-lg text-on-surface mb-1 font-bold">{skin.name}</h3>
                      <p className="font-body-md text-xs text-on-surface-variant mb-4 leading-relaxed h-[40px] overflow-hidden">
                        {skin.description}
                      </p>
                      
                      <div className="flex justify-between items-center mt-2">
                        {isOwned ? (
                          <span className="font-label-sm text-xs text-secondary font-bold uppercase tracking-wider">
                            {isEquipped ? "Equipped" : "Owned"}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 font-bold">
                            <span className="material-symbols-outlined text-base">
                              {skin.costType === "Crystals" ? "diamond" : "monetization_on"}
                            </span>
                            <span className="font-label-numeric text-sm text-primary">
                              {skin.cost.toLocaleString()}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewSkin(skin)}
                            className="btn-stone-inlay px-3 py-1.5 rounded text-xs font-label-sm uppercase font-bold cursor-pointer hover:text-secondary"
                          >
                            PREVIEW
                          </button>
                          
                          {isOwned ? (
                            !isEquipped && (
                              <button
                                type="button"
                                onClick={() => onSelectSkin(skin.id)}
                                className="px-3 py-1.5 bg-secondary text-on-secondary font-bold text-xs font-label-sm uppercase rounded cursor-pointer hover:bg-secondary-container transition-all"
                              >
                                EQUIP
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() => onBuySkin(skin.id)}
                              className="px-3 py-1.5 bg-primary text-on-primary font-bold text-xs font-label-sm uppercase rounded cursor-pointer hover:bg-primary-container transition-all"
                            >
                              BUY
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            
            {/* Skin preview spotlight */}
            {previewSkin && (
              <div className="glass-panel p-6 rounded-xl border border-primary/30 flex flex-col md:flex-row gap-6 max-w-2xl mx-auto mt-4 items-center">
                <div className="w-40 h-40 rounded-lg overflow-hidden border border-primary/20 flex-shrink-0">
                  <img src={previewSkin.image} alt={previewSkin.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <span className="font-label-numeric text-xs text-secondary font-bold tracking-widest">{previewSkin.rarity} SKIN</span>
                  <h3 className="font-headline-md text-xl text-primary mt-1 font-bold">{previewSkin.name}</h3>
                  <p className="font-body-md text-sm text-on-surface-variant mt-2 leading-relaxed">
                    {previewSkin.description} Perfect for demonstrating dark dragon magic and ruling over the Serpent Kingdom.
                  </p>
                  <button
                    onClick={() => setPreviewSkin(null)}
                    className="mt-4 px-4 py-2 bg-surface-container-highest border border-outline-variant text-on-surface rounded font-label-sm text-xs uppercase cursor-pointer hover:text-primary hover:border-primary font-bold"
                  >
                    DISMISS PREVIEW
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TALENT TREE PERMANENT PROGRESSION */}
        {activeTab === "TALENTS" && (
          <div className="max-w-2xl mx-auto animate-float">
            <h2 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2 font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-xl">upgrade</span>
              Eternal Talent Tree
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant mb-6">
              Spend gold coins to etch permanent magical runes onto the Serpent King, giving stats boosts in subsequent survival runs.
            </p>

            <div className="flex flex-col gap-4">
              {INITIAL_TALENTS.map((talent) => {
                const currentLvl = getTalentLevel(talent.id);
                const isMax = currentLvl >= talent.maxLevel;
                const cost = getTalentCost(talent);
                const canAfford = saveState.gold >= cost;
                
                return (
                  <div 
                    key={talent.id}
                    className="glass-panel p-5 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border border-primary/40 text-primary">
                        <span className="material-symbols-outlined text-2xl font-bold">{talent.icon}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline-md text-base text-on-surface font-bold">{talent.name}</h3>
                          <span className="font-label-numeric text-xs text-secondary font-bold">
                            LVL {currentLvl}/{talent.maxLevel}
                          </span>
                        </div>
                        <p className="font-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
                          {talent.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                      {isMax ? (
                        <span className="px-4 py-2 bg-secondary/10 border border-secondary text-secondary font-label-numeric text-xs font-bold rounded">
                          MAX LEVEL
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUpgradeTalent(talent.id)}
                          disabled={!canAfford}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded font-label-numeric text-xs font-bold transition-all cursor-pointer ${
                            canAfford 
                              ? "bg-primary text-on-primary hover:bg-primary-container" 
                              : "bg-surface-container-highest border border-outline-variant text-on-surface-variant opacity-55 cursor-not-allowed"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm font-bold">toll</span>
                          <span>{cost.toLocaleString()} COINS</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: QUESTS, DAILY LOGIN, AND ACHIEVEMENTS */}
        {activeTab === "QUESTS" && (
          <div className="max-w-2xl mx-auto animate-float flex flex-col gap-8">
            
            {/* Daily Login Reward Box */}
            <section className="glass-panel rounded-xl p-5 border border-secondary/30 relative overflow-hidden bg-secondary-container/5">
              <div className="flex justify-between items-center gap-4 relative z-10">
                <div>
                  <h3 className="font-headline-md text-lg text-secondary font-bold uppercase tracking-wide text-glow-secondary">
                    Daily Sanctum Blessing
                  </h3>
                  <p className="font-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Unlock a free divine reward every 24 hours to fuel your ancient reign.
                  </p>
                </div>
                
                {saveState.dailyChallengeClaimed ? (
                  <span className="px-4 py-2 bg-surface-container text-on-surface-variant text-xs font-label-numeric rounded font-bold border border-outline-variant/30">
                    CLAIMED
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      // Claim logic
                      onClaimQuest("daily_login");
                    }}
                    className="px-5 py-2.5 bg-secondary text-[#002113] font-label-numeric text-xs font-bold rounded hover:bg-secondary-fixed transition-all cursor-pointer glow-secondary animate-bounce"
                  >
                    CLAIM +100 CRYSTALS
                  </button>
                )}
              </div>
            </section>

            {/* Run Missions (Quests) */}
            <section>
              <h2 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2 font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-xl">priority_high</span>
                Active Dark Quests
              </h2>
              
              <div className="flex flex-col gap-4">
                {saveState.quests.map((quest) => (
                  <div 
                    key={quest.id}
                    className="glass-panel p-5 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-center">
                        <h3 className="font-body-lg text-sm text-on-surface font-bold">{quest.title}</h3>
                        <span className="font-label-numeric text-xs text-secondary font-bold">
                          {quest.current}/{quest.target}
                        </span>
                      </div>
                      <p className="font-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
                        {quest.description}
                      </p>
                      {/* Quest progress slider */}
                      <div className="w-full bg-surface-container-lowest h-2 rounded mt-3 overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded"
                          style={{ width: `${Math.min((quest.current / quest.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {quest.claimed ? (
                        <span className="px-4 py-2 bg-surface-container text-xs font-label-numeric rounded font-bold border border-outline-variant/20">
                          CLAIMED
                        </span>
                      ) : quest.completed ? (
                        <button
                          onClick={() => onClaimQuest(quest.id)}
                          className="px-5 py-2 bg-secondary text-[#002113] font-label-numeric text-xs font-bold rounded hover:bg-secondary-fixed transition-all cursor-pointer animate-pulse"
                        >
                          CLAIM {quest.rewardAmount} {quest.rewardType.toUpperCase()}
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-surface-container-highest border border-outline-variant text-xs font-label-numeric rounded font-bold opacity-60">
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: INTERACTIVE SKILL TREE (WITH WEAPON/MAGIC UPGRADES) */}
        {activeTab === "SKILLS" && (
          <div className="max-w-4xl mx-auto animate-float">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">account_tree</span>
                  Astral Skill Tree
                </h2>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  Spend acquired Skill Points to permanently mutate your serpent with ultimate spells and passive nodes.
                </p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-400/30 px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <span className="material-symbols-outlined text-cyan-400 animate-pulse">star</span>
                <span className="text-sm font-bold text-cyan-400 font-label-numeric">
                  {saveState.skillPoints || 0} SKILL POINTS AVAILABLE
                </span>
              </div>
            </div>

            {/* Part A: Eternal Armory (Weapon & Magic permanent tier levels) */}
            <section className="glass-panel p-5 rounded-xl border border-primary/20 mb-8 bg-[#181818]">
              <h3 className="font-headline-md text-sm text-primary mb-4 font-bold uppercase tracking-widest flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <span className="material-symbols-outlined text-sm">construction</span>
                Eternal Weapon & Magic Tiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Weapons tier upgrade */}
                <div className="bg-surface-container-high/40 p-4 rounded-lg border border-outline-variant/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Viper Fangs Level</span>
                    <span className="text-xs font-bold text-secondary font-label-numeric">
                      TIER {saveState.weaponsLevel?.fangs || 1}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mb-4 leading-relaxed">
                    Amplifies contact fangs damage by +15% per tier.
                  </p>
                  <button
                    onClick={() => onUpgradeWeaponMagic("WEAPON", "fangs", 1500 * (saveState.weaponsLevel?.fangs || 1))}
                    className="w-full py-2 bg-primary text-[#261900] rounded text-xs font-bold hover:bg-primary-container hover:scale-[1.02] transition-all cursor-pointer font-label-numeric uppercase"
                  >
                    UPGRADE TIER (-{1500 * (saveState.weaponsLevel?.fangs || 1)} GOLD)
                  </button>
                </div>

                {/* Magic tier upgrade */}
                <div className="bg-surface-container-high/40 p-4 rounded-lg border border-outline-variant/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Shadow Magic Level</span>
                    <span className="text-xs font-bold text-secondary font-label-numeric">
                      TIER {saveState.magicLevel?.active || 1}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mb-4 leading-relaxed">
                    Amplifies Cyclone & Spell aura damages by +20% per tier.
                  </p>
                  <button
                    onClick={() => onUpgradeWeaponMagic("MAGIC", "active", 1800 * (saveState.magicLevel?.active || 1))}
                    className="w-full py-2 bg-primary text-[#261900] rounded text-xs font-bold hover:bg-primary-container hover:scale-[1.02] transition-all cursor-pointer font-label-numeric uppercase"
                  >
                    UPGRADE TIER (-{1800 * (saveState.magicLevel?.active || 1)} GOLD)
                  </button>
                </div>
              </div>
            </section>

            {/* Part B: Graphical Skill Tree Map Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SKILL_NODES.map((node) => {
                const currentLevel = saveState.skillsUnlocked[node.id] || 0;
                const isMax = currentLevel >= node.maxLevel;
                const canUnlock = (saveState.skillPoints || 0) >= node.cost;

                // Dependencies check
                const isLockedByDependency = node.requiredSkillId && (saveState.skillsUnlocked[node.requiredSkillId] || 0) === 0;

                return (
                  <article
                    key={node.id}
                    className={`glass-panel p-5 rounded-xl border transition-all duration-300 relative flex flex-col justify-between ${
                      isLockedByDependency
                        ? "opacity-40 border-outline-variant/10 bg-black/40 cursor-not-allowed"
                        : currentLevel > 0
                          ? "border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-cyan-950/5"
                          : "border-outline-variant/25 bg-[#171717] hover:border-cyan-400/50"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-label-sm text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                            {node.type}
                          </span>
                          <h4 className="font-body-lg text-sm text-on-surface font-bold">
                            {node.name}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-on-surface-variant font-label-numeric font-bold">
                            LVL {currentLevel} / {node.maxLevel}
                          </span>
                          <span className="text-[10px] text-cyan-400 font-bold">
                            {node.cost} SP
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                        {node.description}
                      </p>

                      {isLockedByDependency && (
                        <div className="mt-3 flex items-center gap-1.5 text-error text-[10px] font-bold uppercase tracking-wider bg-error/10 px-2 py-1 rounded">
                          <span className="material-symbols-outlined text-xs">lock</span>
                          <span>Requires previous skill node unlocked</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-outline-variant/20 flex gap-2">
                      {isMax ? (
                        <span className="w-full text-center py-2 bg-surface-container text-xs font-bold text-secondary rounded uppercase tracking-wider font-label-numeric">
                          MAX TIER UNLOCKED
                        </span>
                      ) : (
                        <button
                          disabled={!!isLockedByDependency}
                          onClick={() => onUnlockSkill(node.id)}
                          className={`w-full py-2 rounded text-xs font-bold tracking-wider uppercase transition-all cursor-pointer font-label-numeric ${
                            isLockedByDependency
                              ? "bg-surface-container-highest text-on-surface/30 cursor-not-allowed"
                              : canUnlock
                                ? "bg-cyan-500 hover:bg-cyan-400 text-[#002127] font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
                                : "bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-cyan-400 font-bold"
                          }`}
                        >
                          EVOLVE NODE (-{node.cost} SP)
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: PERMANENT RELICS SHRINE */}
        {activeTab === "RELICS" && (
          <div className="max-w-4xl mx-auto animate-float">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">brightness_7</span>
                  Royal Relic Shrine
                </h2>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  Acquire cosmic relics and attach up to <strong className="text-secondary">two relics</strong> simultaneously to warp your serpent abilities.
                </p>
              </div>
              
              {/* Equipped Relic Bar */}
              <div className="flex gap-2 bg-[#1c1c1c] p-2.5 rounded-xl border border-primary/20">
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center h-full mr-2">
                  ATTACHED:
                </span>
                {(saveState.equippedRelics || []).length === 0 ? (
                  <span className="text-xs text-on-surface-variant/60 italic self-center">No Relics active</span>
                ) : (
                  (saveState.equippedRelics || []).map((id) => {
                    const relic = ALL_RELICS.find(r => r.id === id);
                    return (
                      <div key={id} className="px-3 py-1 bg-secondary/10 border border-secondary/30 rounded text-xs text-secondary font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">brightness_7</span>
                        <span>{relic?.name}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {ALL_RELICS.map((relic) => {
                const isOwned = (saveState.ownedRelics || []).includes(relic.id);
                const isEquipped = (saveState.equippedRelics || []).includes(relic.id);

                let coinBalance = saveState.gold;
                if (relic.costType === "Crystals") coinBalance = saveState.crystals;
                else if (relic.costType === "Souls") coinBalance = saveState.souls;

                const canAfford = coinBalance >= relic.cost;

                return (
                  <article
                    key={relic.id}
                    className={`glass-panel p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                      isEquipped
                        ? "border-secondary bg-secondary-container/5 shadow-[0_0_15px_rgba(78,222,163,0.2)]"
                        : "border-outline-variant/25 bg-[#171717] hover:border-primary/50"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h3 className="font-body-lg text-sm text-on-surface font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">brightness_7</span>
                            {relic.name}
                          </h3>
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                            {relic.costType} Relic
                          </span>
                        </div>
                        {isOwned ? (
                          <span className="text-[10px] bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded text-secondary font-bold uppercase">
                            OWNED
                          </span>
                        ) : (
                          <span className="text-xs text-primary font-bold font-label-numeric bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                            {relic.cost} {relic.costType.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                        {relic.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-outline-variant/10">
                      {isOwned ? (
                        <button
                          onClick={() => onEquipRelic(relic.id)}
                          className={`w-full py-2 rounded text-xs font-bold tracking-wider uppercase transition-all cursor-pointer font-label-numeric ${
                            isEquipped
                              ? "bg-error text-white hover:bg-error-container hover:scale-[1.01] font-bold"
                              : "bg-secondary text-[#002113] hover:bg-secondary-fixed hover:scale-[1.02] font-bold shadow-[0_4px_10px_rgba(78,222,163,0.2)]"
                          }`}
                        >
                          {isEquipped ? "UNPLUG RELIC" : "ATTACH RELIC"}
                        </button>
                      ) : (
                        <button
                          onClick={() => onBuyRelic(relic.id)}
                          className={`w-full py-2 rounded text-xs font-bold tracking-wider uppercase transition-all cursor-pointer font-label-numeric ${
                            canAfford
                              ? "bg-primary text-[#261900] hover:bg-primary-container hover:scale-[1.02] font-bold shadow-[0_4px_10px_rgba(233,193,118,0.2)]"
                              : "bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-primary font-bold"
                          }`}
                        >
                          ACQUIRE RELIC (-{relic.cost} {relic.costType.toUpperCase()})
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: UNLOCKABLE SERPENT FORMS */}
        {activeTab === "FORMS" && (
          <div className="max-w-4xl mx-auto animate-float">
            <div className="mb-6">
              <h2 className="font-headline-md text-headline-md text-primary font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">pest_control</span>
                Mythological Serpent Forms
              </h2>
              <p className="font-body-md text-xs text-on-surface-variant mt-1">
                Ascend to unlock extreme serpent breeds. Different breeds feature visual and elemental damage alterations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {ALL_FORMS.map((form) => {
                const isActiveSelection = (saveState.selectedForm || "sovereign_obsidian") === form.id;
                const isPrestigeRequirementMet = (saveState.prestigeCount || 0) >= form.unlockedAtPrestige;

                return (
                  <article
                    key={form.id}
                    onClick={() => {
                      if (isPrestigeRequirementMet) {
                        onSelectForm(form.id);
                      } else {
                        onAlert(`Requires Prestige Level ${form.unlockedAtPrestige} to activate.`, "FORM LOCKED");
                      }
                    }}
                    className={`glass-panel rounded-xl overflow-hidden border transition-all duration-300 flex flex-col justify-between group cursor-pointer ${
                      isActiveSelection
                        ? "border-secondary bg-secondary-container/5 shadow-[0_0_15px_rgba(78,222,163,0.3)] scale-[1.02]"
                        : isPrestigeRequirementMet
                          ? "border-outline-variant/25 hover:border-primary bg-[#171717]"
                          : "opacity-50 border-outline-variant/10 bg-black/40 cursor-not-allowed"
                    }`}
                  >
                    <div>
                      {/* Image Preview Block */}
                      <div className="h-40 w-full overflow-hidden relative bg-[#0f0f0f] border-b border-outline-variant/20 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        <span className="material-symbols-outlined text-primary text-6xl opacity-20 absolute z-0 animate-pulse">
                          pest_control
                        </span>
                        
                        {/* Custom status overlay */}
                        <div className="absolute top-3 left-3 z-20">
                          {isActiveSelection ? (
                            <span className="text-[10px] bg-secondary text-[#002113] border border-secondary/20 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                              AWAKENED & CHOSEN
                            </span>
                          ) : isPrestigeRequirementMet ? (
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                              UNLOCKED
                            </span>
                          ) : (
                            <span className="text-[10px] bg-error/20 text-error border border-error/30 px-2.5 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">lock</span>
                              <span>ASCEND TO PRESTIGE {form.unlockedAtPrestige}</span>
                            </span>
                          )}
                        </div>

                        <div className="z-10 text-center px-4 relative">
                          <h3 className="font-headline-md text-md text-on-surface font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {form.name}
                          </h3>
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-4">
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {form.description}
                        </p>

                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-[11px] border-b border-outline-variant/10 pb-1.5">
                            <span className="text-on-surface-variant">Element:</span>
                            <span className="font-bold text-primary uppercase">{form.id.includes("obsidian") ? "Dark Void" : form.id.includes("dread") ? "Hellfire" : "Cosmic Arc" }</span>
                          </div>
                          <div className="flex justify-between text-[11px] border-b border-outline-variant/10 pb-1.5">
                            <span className="text-on-surface-variant">Stat Boost:</span>
                            <span className="font-bold text-secondary">{form.id.includes("obsidian") ? "+15% HP Max" : form.id.includes("dread") ? "+25% Viper Damage" : "+20% Speed Bonus" }</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      {isActiveSelection ? (
                        <div className="w-full text-center py-2 bg-secondary/10 border border-secondary/20 text-xs text-secondary rounded font-bold tracking-wider uppercase font-label-numeric">
                          CURRENT INCARNATION
                        </div>
                      ) : isPrestigeRequirementMet ? (
                        <button className="w-full py-2 bg-[#222] text-on-surface hover:bg-primary hover:text-[#261900] rounded text-xs font-bold tracking-wider uppercase transition-all duration-100 cursor-pointer">
                          CHOOSE FORM
                        </button>
                      ) : (
                        <div className="w-full text-center py-2 bg-surface-container text-xs text-on-surface/30 rounded font-bold uppercase">
                          LOCKED BY ASCENSION
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 7: 7-DAY DAILY REWARDS CALENDAR */}
        {activeTab === "CALENDAR" && (
          <div className="max-w-3xl mx-auto animate-float">
            <div className="text-center mb-6">
              <h2 className="font-headline-md text-headline-md text-primary font-bold uppercase tracking-wider flex justify-center items-center gap-2">
                <span className="material-symbols-outlined text-xl">calendar_month</span>
                Abyssal Login Calendar
              </h2>
              <p className="font-body-md text-xs text-on-surface-variant mt-1">
                Descend consecutive days to claim dynamic currency packets and crystals.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              {DAILY_REWARDS.map((reward) => {
                const isClaimed = (saveState.claimedDailyRewards || []).includes(`day${reward.day}`);
                // Simple auto logic: allow claiming if it hasn't been claimed yet and corresponds to next progress day
                const currentProgressNum = (saveState.claimedDailyRewards || []).length + 1;
                const isAvailable = reward.day === currentProgressNum && !isClaimed;
                const isLocked = reward.day > currentProgressNum;

                return (
                  <article
                    key={reward.day}
                    onClick={() => {
                      if (isAvailable) {
                        onClaimDailyCalendar(reward.day);
                      }
                    }}
                    className={`glass-panel p-4 rounded-xl border flex flex-col justify-between items-center text-center transition-all duration-200 relative ${
                      isClaimed
                        ? "border-outline-variant/10 opacity-50 bg-black/40"
                        : isAvailable
                          ? "border-secondary shadow-[0_0_15px_rgba(78,222,163,0.3)] bg-secondary-container/5 cursor-pointer hover:scale-[1.03]"
                          : "border-outline-variant/30 bg-[#171717]"
                    }`}
                  >
                    <span className="font-label-sm text-[10px] text-on-surface-variant font-bold uppercase tracking-widest block mb-2">
                      DAY {reward.day}
                    </span>

                    {/* Reward visual icon representation */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border border-outline-variant/20 mb-3">
                      {reward.rewardType === "Gold" ? (
                        <span className="material-symbols-outlined text-primary text-2xl font-bold animate-float">
                          monetization_on
                        </span>
                      ) : reward.rewardType === "Souls" ? (
                        <span className="material-symbols-outlined text-error text-2xl font-bold animate-float">
                          local_fire_department
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-secondary text-2xl font-bold animate-float">
                          diamond
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="font-label-numeric text-sm text-on-surface font-extrabold block">
                        +{reward.rewardAmount}
                      </span>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold block">
                        {reward.rewardType}
                      </span>
                    </div>

                    <div className="w-full">
                      {isClaimed ? (
                        <span className="text-[10px] bg-surface-container border border-outline-variant/20 py-1 rounded text-on-surface-variant/70 font-bold uppercase tracking-wider block">
                          CLAIMED
                        </span>
                      ) : isAvailable ? (
                        <button className="w-full py-1 bg-secondary text-[#002113] hover:bg-secondary-fixed rounded text-[10px] font-bold uppercase tracking-wider animate-bounce cursor-pointer">
                          CLAIM
                        </button>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-wider block italic">
                          LOCKED
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 8: PRESTIGE ASCENSION TEMPLE */}
        {activeTab === "PRESTIGE" && (
          <div className="max-w-2xl mx-auto animate-float">
            <div className="text-center mb-6">
              <h2 className="font-headline-md text-headline-md text-purple-400 font-bold uppercase tracking-wider flex justify-center items-center gap-2">
                <span className="material-symbols-outlined text-xl">military_tech</span>
                Royal Ascension Altar
              </h2>
              <p className="font-body-md text-xs text-on-surface-variant mt-1">
                Evolve past temporal shells to unlock prestige multipliers on scores and currency yield.
              </p>
            </div>

            <section className="glass-panel p-6 rounded-xl border border-purple-500/30 bg-[#191522] relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-purple-500/5 pointer-events-none" />

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-lg text-center">
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block mb-1">
                    CURRENT ASCENSION
                  </span>
                  <span className="font-headline-md text-2xl text-purple-400 font-extrabold font-label-numeric block">
                    RANK {saveState.prestigeCount || 0}
                  </span>
                </div>

                <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-lg text-center">
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block mb-1">
                    CURRENCY MULTIPLIER
                  </span>
                  <span className="font-headline-md text-2xl text-purple-400 font-extrabold font-label-numeric block">
                    {Math.floor((saveState.prestigeMultiplier || 1.0) * 100)}%
                  </span>
                </div>
              </div>

              <div className="border-t border-purple-500/20 pt-4 mb-6">
                <h3 className="font-headline-md text-xs text-purple-300 mb-3 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">checklist</span>
                  Ascension Requirements
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">Dungeon Highscore (80,000 pts minimum):</span>
                    <span className={`font-bold font-label-numeric ${saveState.highScore >= 80000 ? "text-secondary" : "text-error"}`}>
                      {saveState.highScore.toLocaleString()} / 80,000 PTS
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">Retained Captured Souls (200 souls minimum):</span>
                    <span className={`font-bold font-label-numeric ${saveState.souls >= 200 ? "text-secondary" : "text-error"}`}>
                      {saveState.souls.toLocaleString()} / 200 SOULS
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant/80 italic leading-relaxed mb-6">
                *Caution: Ascending initiates an temporal reset. This clears your active gold coins, basic talents level, and basic skill tree nodes. You will RETAIN your skins, unlocked relics, serpent forms, and receive a starting bundle of gold, souls, and <strong className="text-purple-400 font-bold">+5 permanent Skill Points per Rank</strong>.
              </p>

              <button
                onClick={onPrestigeReset}
                className={`w-full py-4 rounded-xl font-headline-md text-sm font-bold tracking-widest uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  saveState.highScore >= 80000 || saveState.souls >= 200
                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.01]"
                    : "bg-surface-container-highest border border-outline-variant text-on-surface-variant opacity-60 cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined font-bold">military_tech</span>
                <span>ASCEND THE ALTAR</span>
              </button>
            </section>
          </div>
        )}

        {/* TAB 9: REWRITTEN MISSIONS & ACHIEVEMENTS */}
        {activeTab === "QUESTS" && (
          <div className="animate-float">
            {/* Daily Login Quest Card */}
            <section className="glass-panel p-6 rounded-xl border border-primary/20 mb-8 max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h3 className="font-headline-md text-lg text-primary font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                    diamond
                  </span>
                  Daybreak Portal Link
                </h3>
                <p className="font-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Daily ritual link established. Siphon the ether shards to harvest void crystals. Available once per cycle.
                </p>
              </div>

              <div className="flex-shrink-0">
                {saveState.dailyChallengeClaimed ? (
                  <span className="px-5 py-2.5 bg-surface-container text-xs font-label-numeric rounded font-bold border border-outline-variant/30">
                    CLAIMED
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      onClaimQuest("daily_login");
                    }}
                    className="px-5 py-2.5 bg-secondary text-[#002113] font-label-numeric text-xs font-bold rounded hover:bg-secondary-fixed transition-all cursor-pointer glow-secondary animate-bounce"
                  >
                    CLAIM +100 CRYSTALS
                  </button>
                )}
              </div>
            </section>

            {/* Run Missions (Quests) */}
            <section className="max-w-3xl mx-auto mb-8">
              <h2 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2 font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-xl">priority_high</span>
                Active Dark Quests
              </h2>
              
              <div className="flex flex-col gap-4">
                {saveState.quests.map((quest) => (
                  <div 
                    key={quest.id}
                    className="glass-panel p-5 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-center">
                        <h3 className="font-body-lg text-sm text-on-surface font-bold">{quest.title}</h3>
                        <span className="font-label-numeric text-xs text-secondary font-bold">
                          {quest.current}/{quest.target}
                        </span>
                      </div>
                      <p className="font-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
                        {quest.description}
                      </p>
                      {/* Quest progress slider */}
                      <div className="w-full bg-surface-container-lowest h-2 rounded mt-3 overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded"
                          style={{ width: `${Math.min((quest.current / quest.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {quest.claimed ? (
                        <span className="px-4 py-2 bg-surface-container text-xs font-label-numeric rounded font-bold border border-outline-variant/20">
                          CLAIMED
                        </span>
                      ) : quest.completed ? (
                        <button
                          onClick={() => onClaimQuest(quest.id)}
                          className="px-5 py-2 bg-secondary text-[#002113] font-label-numeric text-xs font-bold rounded hover:bg-secondary-fixed transition-all cursor-pointer animate-pulse"
                        >
                          CLAIM {quest.rewardAmount} {quest.rewardType.toUpperCase()}
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-surface-container-highest border border-outline-variant text-xs font-label-numeric rounded font-bold opacity-60">
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements Sub-Section */}
            <section className="max-w-3xl mx-auto">
              <h2 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2 font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-xl">emoji_events</span>
                Abyssal Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_ACHIEVEMENTS.map((ach) => {
                  const isCompleted = (saveState.completedAchievements || []).includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`glass-panel p-4 rounded-xl border flex gap-3 ${
                        isCompleted 
                          ? "border-secondary/30 bg-secondary/5" 
                          : "border-outline-variant/20 opacity-65 bg-[#171717]"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-2xl self-start ${isCompleted ? "text-primary" : "text-outline-variant"}`} style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "" }}>
                        emoji_events
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-on-surface">{ach.title}</h4>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                          {ach.description}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-secondary font-bold font-label-numeric">
                          {isCompleted ? "✓ ACHIEVED" : "🔒 IN PROGRESS"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2 CONTD: ANCIENT ARTIFACTS IN SHOP VAULT */}
        {activeTab === "SHOP" && (
          <div className="max-w-4xl mx-auto mt-12 border-t border-outline-variant/20 pt-8">
            <h2 className="font-headline-md text-headline-md text-primary mb-4 flex items-center gap-2 font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-xl">diamond</span>
              Reliquary Artifact Vault
            </h2>
            <p className="font-body-md text-xs text-on-surface-variant mb-6">
              Ancient permanent relics worn by the sovereign dragon. Equipping <strong className="text-secondary">one artifact</strong> grants passive rule bending.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_ARTIFACTS.map((art) => {
                const isOwned = (saveState.ownedArtifacts || []).includes(art.id);
                const isEquipped = saveState.equippedArtifact === art.id;

                let coinBalance = saveState.gold;
                if (art.costType === "Crystals") coinBalance = saveState.crystals;
                else if (art.costType === "Souls") coinBalance = saveState.souls;

                const canAfford = coinBalance >= art.cost;

                return (
                  <article
                    key={art.id}
                    className={`glass-panel p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                      isEquipped
                        ? "border-secondary bg-secondary-container/5 shadow-[0_0_15px_rgba(78,222,163,0.25)]"
                        : "border-outline-variant/25 bg-[#171717] hover:border-primary/50"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h3 className="font-body-lg text-sm text-on-surface font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-primary text-lg">diamond</span>
                            {art.name}
                          </h3>
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                            {art.costType} Artifact
                          </span>
                        </div>
                        {isOwned ? (
                          <span className="text-[10px] bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded text-secondary font-bold uppercase">
                            OWNED
                          </span>
                        ) : (
                          <span className="text-xs text-primary font-bold font-label-numeric bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                            {art.cost} {art.costType.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                        {art.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-outline-variant/10">
                      {isOwned ? (
                        <button
                          onClick={() => onEquipArtifact(art.id)}
                          className={`w-full py-2 rounded text-xs font-bold tracking-wider uppercase transition-all cursor-pointer font-label-numeric ${
                            isEquipped
                              ? "bg-error text-white hover:bg-error-container hover:scale-[1.01]"
                              : "bg-secondary text-[#002113] hover:bg-secondary-fixed hover:scale-[1.02] shadow-[0_4px_10px_rgba(78,222,163,0.2)]"
                          }`}
                        >
                          {isEquipped ? "UNEQUIP ARTIFACT" : "EQUIP ARTIFACT"}
                        </button>
                      ) : (
                        <button
                          onClick={() => onBuyArtifact(art.id)}
                          className={`w-full py-2 rounded text-xs font-bold tracking-wider uppercase transition-all cursor-pointer font-label-numeric ${
                            canAfford
                              ? "bg-primary text-[#261900] hover:bg-primary-container hover:scale-[1.02] shadow-[0_4px_10px_rgba(233,193,118,0.2)]"
                              : "bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-primary"
                          }`}
                        >
                          ACQUIRE ARTIFACT (-{art.cost} {art.costType.toUpperCase()})
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 10: HELP / HOW TO PLAY */}
        {activeTab === "HELP" && (
          <div className="max-w-4xl mx-auto animate-float pb-20">
            <h2 className="font-headline-md text-headline-lg text-primary mb-2 flex items-center gap-3 font-bold uppercase tracking-wider text-glow-primary">
              <span className="material-symbols-outlined text-3xl">help_center</span>
              How To Play
            </h2>
            <p className="text-on-surface-variant font-body mb-10">
              The ancient codex of the Serpent Kingdom. Read this carefully to survive the dangerous biomes and reclaim your throne.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Objective */}
              <div className="glass-panel p-6 border-primary/30 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <h3 className="font-headline text-lg text-primary mb-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined">radar</span>
                  Objective
                </h3>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                  You are the Ancient Abyssal Serpent. Navigate through realms, devour souls to grow longer, and survive for as long as possible. When your score peaks, a <strong className="text-error">Boss Guardian</strong> will spawn. Defeat them to ascend!
                </p>
              </div>

              {/* Controls */}
              <div className="glass-panel p-6 border-secondary/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
                <h3 className="font-headline text-lg text-secondary mb-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined">gamepad</span>
                  Controls
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-on-surface mb-1 uppercase tracking-widest">Desktop</h4>
                    <p className="text-sm text-on-surface-variant"><strong className="text-secondary">W A S D</strong> or <strong className="text-secondary">Arrow Keys</strong> to steer. Alternatively, your serpent automatically follows your mouse cursor.</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface mb-1 uppercase tracking-widest">Mobile / Touch</h4>
                    <p className="text-sm text-on-surface-variant">Tap and <strong className="text-secondary">Swipe/Drag</strong> anywhere on the screen to use the virtual joystick and steer your serpent.</p>
                  </div>
                </div>
              </div>

              {/* Souls & Growth */}
              <div className="glass-panel p-6 border-success/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-success" />
                <h3 className="font-headline text-lg text-success mb-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined">eco</span>
                  Souls & Growth
                </h3>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed mb-3">
                  Scattered throughout the map are souls. Eat them to grow your tail and gain score/gold:
                </p>
                <ul className="text-sm space-y-2 font-label">
                  <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#4edea3]" /> <span className="text-on-surface">Green (Common)</span></li>
                  <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#e9c176]" /> <span className="text-on-surface">Gold (Rare) - High Gold Value</span></li>
                  <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f43f5e]" /> <span className="text-on-surface">Red (Cursed) - Bonus XP</span></li>
                </ul>
              </div>

              {/* Combat & Bosses */}
              <div className="glass-panel p-6 border-error/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-error" />
                <h3 className="font-headline text-lg text-error mb-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined">swords</span>
                  Combat & Bosses
                </h3>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                  Avoid running your head directly into enemy attacks. To deal damage, bite enemies with your head, or <strong className="text-error">Whip</strong> them by curling your long tail around them! Defeating normal enemies grants bonus scores and summons the Realm Boss sooner.
                </p>
              </div>

              {/* Abilities */}
              <div className="glass-panel p-6 border-tertiary/30 rounded-xl relative overflow-hidden md:col-span-2">
                <div className="absolute top-0 left-0 w-1 h-full bg-tertiary" />
                <h3 className="font-headline text-lg text-tertiary mb-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined">bolt</span>
                  Active Abilities
                </h3>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed mb-4">
                  Unlock abilities in the <strong className="text-primary">Skill Tree</strong> tab. Once unlocked, click their icons on the game HUD or use hotkeys:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-surface-container p-3 rounded border border-outline-variant/30">
                    <h4 className="text-sm font-bold text-on-surface flex justify-between">Dash <span>[SPACE]</span></h4>
                    <p className="text-xs text-on-surface-variant mt-1">Short invulnerable speed boost. Breaks through enemies.</p>
                  </div>
                  <div className="bg-surface-container p-3 rounded border border-outline-variant/30">
                    <h4 className="text-sm font-bold text-on-surface flex justify-between">Cyclone <span>[Q]</span></h4>
                    <p className="text-xs text-on-surface-variant mt-1">Fires a massive whirlwind that damages everything in its path.</p>
                  </div>
                  <div className="bg-surface-container p-3 rounded border border-outline-variant/30">
                    <h4 className="text-sm font-bold text-on-surface flex justify-between">Shield <span>[E]</span></h4>
                    <p className="text-xs text-on-surface-variant mt-1">Creates an impenetrable barrier for several seconds.</p>
                  </div>
                  <div className="bg-surface-container p-3 rounded border border-outline-variant/30">
                    <h4 className="text-sm font-bold text-on-surface flex justify-between">Slow Time <span>[SHIFT]</span></h4>
                    <p className="text-xs text-on-surface-variant mt-1">Slows all enemies and projectiles, giving you time to react.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* --- SOVEREIGN SANCTUARY & PROFILE MODAL --- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-[100] flex justify-center items-center p-4">
          <div className="bg-[#141414] border border-outline-variant/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/20 bg-surface-container/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">shield_with_heart</span>
                <div>
                  <h2 className="font-headline-md text-base text-primary font-bold uppercase tracking-wider">
                    Sovereign Sanctuary
                  </h2>
                  <p className="text-[10px] text-on-surface-variant font-mono">
                    PROGESS &amp; CUSTOMIZATION ENGINE
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  setHatchedDragon(null);
                }}
                className="w-8 h-8 rounded-full border border-outline-variant/30 hover:border-error hover:text-error flex justify-center items-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Navigation */}
            <div className="flex border-b border-outline-variant/15 overflow-x-auto hide-scrollbar bg-[#161616]">
              {([
                { id: "PROFILE", label: "Overview", icon: "badge" },
                { id: "TITLES", label: "Titles & Badges", icon: "workspace_premium" },
                { id: "FRAMES", label: "Borders", icon: "center_focus_strong" },
                { id: "DRAGONS", label: "Sanctuary", icon: "egg" }
              ] as const).map((tab) => {
                const isActive = profileModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setHatchedDragon(null);
                      // @ts-ignore
                      setProfileModalTab(tab.id);
                    }}
                    className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container/10"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#121212] leading-relaxed">
              
              {/* --- PROFILE OVERVIEW TAB --- */}
              {profileModalTab === "PROFILE" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Avatar Card */}
                  <div className="glass-panel p-5 rounded-xl border border-outline-variant/20 bg-surface-container/15 flex flex-col items-center text-center">
                    <div 
                      className="w-24 h-24 rounded-full border-4 overflow-hidden relative flex-shrink-0 mb-4 shadow-lg transition-transform hover:scale-105"
                      style={{ 
                        borderColor: activeFrameObj?.borderColor || 'rgba(233,193,118,0.5)',
                        boxShadow: `0 0 20px ${activeFrameObj?.borderColor || 'rgba(233,193,118,0.2)'}`
                      }}
                    >
                      <img 
                        className="w-full h-full object-cover" 
                        alt="Serpent Profile Portrait"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6JYDhRhoajL9WZdsg5onhcmzhEuU7vuHgfHFXqg7uMgqleF9HfhFsrpm7hLwhjczQz3FRtisy5zKNK4598lNdroj-dmka7N0qHt1X2ZauE-7rHGcKDDrlhlbdc3QCXaS6KihWUIKLQp70Jm6EXela9NJbSC6x4aOtLZoSbCAGdb0AoubJG_BzacAnR6F9z8OQrCMJP6dDU2eVHETqOLkhUBdkruYXwaa4WS0bhWJNR1kAk6Lk-04fUAnHEaPq4rmNtWvbEhtsF8A"
                      />
                    </div>

                    <h3 className="font-headline-md text-lg text-primary font-bold tracking-wide">
                      {activeTitleObj?.name || "Novice Slitherer"}
                    </h3>
                    
                    <p className="text-xs text-on-surface-variant mt-1 px-4 italic">
                      "{activeTitleObj?.description || "Unleashed upon the ancient underworld."}"
                    </p>

                    <div className="flex items-center gap-1.5 mt-4 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-xs text-primary">
                        {activeBadgeObj?.icon || "star"}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
                        {activeBadgeObj?.name || "First Step"}
                      </span>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-outline-variant/10 text-left">
                      <div className="bg-surface-container/10 p-2 rounded border border-outline-variant/10">
                        <span className="text-[10px] text-on-surface-variant uppercase font-mono block">Gold Owned</span>
                        <strong className="text-sm font-bold text-primary font-label-numeric">{saveState.gold} 🪙</strong>
                      </div>
                      <div className="bg-surface-container/10 p-2 rounded border border-outline-variant/10">
                        <span className="text-[10px] text-on-surface-variant uppercase font-mono block">Souls Captured</span>
                        <strong className="text-sm font-bold text-secondary font-label-numeric">{saveState.souls} 💀</strong>
                      </div>
                      <div className="bg-surface-container/10 p-2 rounded border border-outline-variant/10">
                        <span className="text-[10px] text-on-surface-variant uppercase font-mono block">Void Crystals</span>
                        <strong className="text-sm font-bold text-cyan-400 font-label-numeric">{saveState.crystals} 💎</strong>
                      </div>
                      <div className="bg-surface-container/10 p-2 rounded border border-outline-variant/10">
                        <span className="text-[10px] text-on-surface-variant uppercase font-mono block">Crown Prestige</span>
                        <strong className="text-sm font-bold text-purple-400 font-label-numeric">Rank {saveState.prestigeCount || 0} 👑</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const text = `I am a Level ${saveState.playerLevel || 1} ${activeTitleObj?.name || "Sovereign"} in the Serpent Kingdom! High Score: ${saveState.highScore.toLocaleString()}. Join my royal clan!`;
                        if (navigator.share) {
                          navigator.share({
                            title: "Serpent Kingdom Progress",
                            text: text,
                            url: window.location.href
                          }).catch(err => {
                            if ((err as Error).name !== "AbortError") {
                              navigator.clipboard.writeText(text);
                              onAlert("Your stats have been copied to the clipboard!", "PROFILE COPIED");
                            }
                          });
                        } else {
                          navigator.clipboard.writeText(text);
                          onAlert("Your stats have been copied to the clipboard!", "PROFILE COPIED");
                        }
                      }}
                      className="w-full mt-4 py-2.5 bg-surface-container-highest border border-primary/30 rounded-lg text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">share</span>
                      Share My Progress
                    </button>
                  </div>

                  {/* Right: Level & Biome Mastery */}
                  <div className="flex flex-col gap-5">
                    
                    {/* Player Level */}
                    <div className="glass-panel p-5 rounded-xl border border-outline-variant/20 bg-surface-container/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold tracking-wider text-on-surface uppercase">
                          Player Account Level
                        </span>
                        <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded">
                          LVL {saveState.playerLevel || 1}
                        </span>
                      </div>
                      
                      {/* XP Progress Bar */}
                      {(() => {
                        const level = saveState.playerLevel || 1;
                        const xpNeeded = level * 800 + 200;
                        const xp = saveState.playerXp || 0;
                        const pct = Math.min(100, Math.floor((xp / xpNeeded) * 100));
                        return (
                          <div>
                            <div className="h-3.5 bg-surface-container-highest border border-outline-variant rounded-full overflow-hidden relative shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-500 shadow-[0_0_10px_rgba(233,193,118,0.4)]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-mono mt-1.5">
                              <span>{xp} / {xpNeeded} XP</span>
                              <span>{pct}% PROGRESS</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Biome Mastery */}
                    <div className="glass-panel p-5 rounded-xl border border-outline-variant/20 bg-surface-container/10 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold tracking-wider text-on-surface uppercase mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-base">map</span>
                          Realm Biome Mastery
                        </h4>
                        
                        <div className="space-y-3.5">
                          {BIOMES.map((biome) => {
                            const masteryXp = saveState.biomeMastery?.[biome.type] || 0;
                            const masteryLevel = Math.min(5, Math.floor(masteryXp / 100));
                            const currentProgress = masteryXp % 100;
                            const progressPercent = masteryLevel >= 5 ? 100 : currentProgress;

                            return (
                              <div key={biome.type} className="text-left">
                                <div className="flex justify-between items-center text-[11px] font-mono mb-1">
                                  <span className="font-semibold text-on-surface">{biome.name}</span>
                                  <span className="text-secondary font-bold font-label-numeric">
                                    {masteryLevel >= 5 ? "MAX RANK 5" : `RANK ${masteryLevel} (${currentProgress}/100 XP)`}
                                  </span>
                                </div>
                                <div className="h-2 bg-surface-container-highest border border-outline-variant/20 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-secondary transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <p className="text-[10px] text-on-surface-variant font-mono mt-4 pt-3 border-t border-outline-variant/10">
                        *Earn Realm Biome Mastery by surviving runs and defeating Elite Abyssal beasts in that region.
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* --- TITLES & BADGES TAB --- */}
              {profileModalTab === "TITLES" && (
                <div className="space-y-6">
                  
                  {/* Title Selection */}
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-primary uppercase mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">shield</span>
                      Active Character Titles
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ALL_TITLES.map((t) => {
                        const isOwned = (saveState.ownedTitles || []).includes(t.id);
                        const isActive = saveState.selectedTitle === t.id;

                        return (
                          <article
                            key={t.id}
                            onClick={() => {
                              if (isOwned) {
                                handleEquipTitle(t.id);
                              }
                            }}
                            className={`p-3.5 rounded-lg border text-left flex justify-between items-center transition-all ${
                              isOwned 
                                ? "cursor-pointer border-outline-variant bg-[#161616] hover:border-primary hover:bg-surface-container/20"
                                : "opacity-50 border-dashed border-outline-variant/30 bg-surface-container/5 select-none"
                            } ${isActive ? "border-primary bg-primary/5 shadow-inner" : ""}`}
                          >
                            <div>
                              <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                {t.name}
                                {isActive && <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-mono font-bold">ACTIVE</span>}
                              </h4>
                              <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">{t.description}</p>
                            </div>
                            
                            <div className="flex-shrink-0 ml-3">
                              {isOwned ? (
                                <span className={`material-symbols-outlined text-base ${isActive ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                                  {isActive ? "radio_button_checked" : "radio_button_unchecked"}
                                </span>
                              ) : (
                                <div className="flex flex-col items-end text-right text-[9px] text-error font-mono font-bold uppercase">
                                  <span className="material-symbols-outlined text-xs">lock</span>
                                  {t.unlockedAtLevel ? `LVL ${t.unlockedAtLevel}` : t.unlockedAtPrestige ? `PRESTIGE ${t.unlockedAtPrestige}` : "SECRET"}
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>

                  {/* Badge Selection */}
                  <div className="pt-4 border-t border-outline-variant/10">
                    <h3 className="text-xs font-bold tracking-wider text-secondary uppercase mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">military_tech</span>
                      Legacy Achievement Badges
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ALL_BADGES.map((b) => {
                        const isOwned = (saveState.ownedBadges || []).includes(b.id);
                        const isActive = saveState.selectedBadge === b.id;

                        return (
                          <article
                            key={b.id}
                            onClick={() => {
                              if (isOwned) {
                                handleEquipBadge(b.id);
                              }
                            }}
                            className={`p-3.5 rounded-lg border text-left flex gap-3 items-center transition-all ${
                              isOwned 
                                ? "cursor-pointer border-outline-variant bg-[#161616] hover:border-secondary hover:bg-surface-container/20"
                                : "opacity-50 border-dashed border-outline-variant/30 bg-surface-container/5 select-none"
                            } ${isActive ? "border-secondary bg-secondary/5 shadow-inner" : ""}`}
                          >
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant/30 flex-shrink-0"
                              style={{ backgroundColor: `${b.color}15`, borderColor: isOwned ? b.color : 'rgba(255,255,255,0.1)' }}
                            >
                              <span className="material-symbols-outlined text-xl" style={{ color: isOwned ? b.color : '#777' }}>
                                {b.icon}
                              </span>
                            </div>

                            <div className="flex-1">
                              <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                {b.name}
                                {isActive && <span className="text-[9px] px-1.5 py-0.2 rounded bg-secondary/20 text-secondary font-mono font-bold">EQUIPPED</span>}
                              </h4>
                              <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">{b.description}</p>
                            </div>
                            
                            <div className="flex-shrink-0">
                              {isOwned ? (
                                <span className={`material-symbols-outlined text-base ${isActive ? "text-secondary font-bold" : "text-on-surface-variant"}`}>
                                  {isActive ? "radio_button_checked" : "radio_button_unchecked"}
                                </span>
                              ) : (
                                <span className="material-symbols-outlined text-xs text-error font-bold">lock</span>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* --- PROFILE FRAMES TAB --- */}
              {profileModalTab === "FRAMES" && (
                <div className="space-y-6">
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                    Sovereign crowns demand customized frames. Style your profile portrait with borders forged in different rifts of the Serpent Kingdom.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ALL_FRAMES.map((f) => {
                      const isOwned = (saveState.ownedFrames || ["none"]).includes(f.id);
                      const isEquipped = saveState.selectedFrame === f.id;
                      
                      let coinBalance = saveState.gold;
                      if (f.costType === "Crystals") coinBalance = saveState.crystals;
                      else if (f.costType === "Souls") coinBalance = saveState.souls;

                      const canAfford = coinBalance >= f.cost;

                      return (
                        <article
                          key={f.id}
                          className={`glass-panel p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            isEquipped 
                              ? "border-primary bg-primary/5 shadow-lg"
                              : "border-outline-variant/25 bg-[#161616] hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Small Avatar Preview */}
                            <div 
                              className="w-12 h-12 rounded-full border-2 overflow-hidden relative flex-shrink-0 shadow-md"
                              style={{ borderColor: f.borderColor }}
                            >
                              <img 
                                className="w-full h-full object-cover" 
                                alt="Frame Preview"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6JYDhRhoajL9WZdsg5onhcmzhEuU7vuHgfHFXqg7uMgqleF9HfhFsrpm7hLwhjczQz3FRtisy5zKNK4598lNdroj-dmka7N0qHt1X2ZauE-7rHGcKDDrlhlbdc3QCXaS6KihWUIKLQp70Jm6EXela9NJbSC6x4aOtLZoSbCAGdb0AoubJG_BzacAnR6F9z8OQrCMJP6dDU2eVHETqOLkhUBdkruYXwaa4WS0bhWJNR1kAk6Lk-04fUAnHEaPq4rmNtWvbEhtsF8A"
                              />
                            </div>

                            <div className="text-left">
                              <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                {f.name}
                                <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                  f.rarity === "COMMON" ? "bg-on-surface-variant/10 text-on-surface-variant" :
                                  f.rarity === "RARE" ? "bg-blue-500/20 text-blue-400" :
                                  f.rarity === "EPIC" ? "bg-purple-500/20 text-purple-400" :
                                  f.rarity === "LEGENDARY" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                                }`}>
                                  {f.rarity}
                                </span>
                              </h4>
                              <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">
                                {f.description}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-outline-variant/10">
                            {isOwned ? (
                              <button
                                onClick={() => handleEquipFrame(f.id)}
                                disabled={isEquipped}
                                className={`w-full py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-all font-mono cursor-pointer ${
                                  isEquipped 
                                    ? "bg-primary/20 text-primary border border-primary/20 cursor-default"
                                    : "bg-surface-container-highest border border-outline-variant text-on-surface hover:bg-surface-container-highest hover:text-primary"
                                }`}
                              >
                                {isEquipped ? "EQUIPPED" : "EQUIP FRAME"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBuyFrame(f.id)}
                                className={`w-full py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-all font-mono cursor-pointer flex justify-center items-center gap-1.5 ${
                                  canAfford 
                                    ? "bg-secondary text-[#002113] hover:bg-secondary-fixed shadow-[0_4px_10px_rgba(78,222,163,0.15)]"
                                    : "bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant hover:text-primary"
                                }`}
                              >
                                <span>UNLOCK FRAME</span>
                                <span className="font-bold font-label-numeric bg-[#00000030] px-1.5 py-0.2 rounded">
                                  {f.cost} {f.costType.toUpperCase()}
                                </span>
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- DRAGON SANCTUARY TAB --- */}
              {profileModalTab === "DRAGONS" && (
                <div className="space-y-6">
                  
                  {/* Sanctuary Incubator */}
                  <div className="glass-panel p-5 rounded-xl border border-outline-variant/20 bg-gradient-to-b from-[#181512] to-[#121212] text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(233,193,118,0.1)_0%,_transparent_60%)]" />
                    
                    <div className="relative z-10">
                      <span className="material-symbols-outlined text-4xl text-primary animate-pulse mb-3">egg_alt</span>
                      
                      <h3 className="font-headline-md text-base text-primary font-bold uppercase tracking-wider">
                        Ancient Dragon Nest
                      </h3>
                      
                      <p className="text-xs text-on-surface-variant max-w-lg mx-auto mt-2 leading-relaxed">
                        Earn cosmic <strong className="text-primary">Dragon Eggs</strong> every 5 account level gains! Hatching an egg inside the sanctuary incubator releases a permanent dragon companion.
                      </p>

                      <div className="mt-4 flex justify-center items-center gap-6">
                        <div className="bg-[#00000050] border border-outline-variant/20 px-4 py-2 rounded-lg text-left">
                          <span className="text-[10px] text-on-surface-variant font-mono uppercase block">EGGS OWNED</span>
                          <span className="text-lg font-bold text-primary font-label-numeric flex items-center gap-1">
                            <span className="material-symbols-outlined text-base text-primary">egg</span>
                            {saveState.dragonEggs || 0}
                          </span>
                        </div>
                        <div className="bg-[#00000050] border border-outline-variant/20 px-4 py-2 rounded-lg text-left">
                          <span className="text-[10px] text-on-surface-variant font-mono uppercase block">COMPANIONS HATCHED</span>
                          <span className="text-lg font-bold text-secondary font-label-numeric flex items-center gap-1">
                            <span className="material-symbols-outlined text-base text-secondary">cruelty_free</span>
                            {(saveState.hatchedDragons || []).length} / 4
                          </span>
                        </div>
                      </div>

                      {/* Hatch Trigger Button */}
                      <div className="mt-6 flex flex-col justify-center items-center">
                        {isHatching ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-primary font-mono tracking-widest animate-pulse font-bold">
                              HATCHING EGG &amp; CHANTING RUNES...
                            </span>
                          </div>
                        ) : hatchedDragon ? (
                          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl max-w-md w-full animate-scale-up">
                            <span className="text-[9px] px-2 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold uppercase tracking-widest">
                              NEW DRAGON UNLOCKED
                            </span>
                            <h4 className="font-headline-md text-base text-primary font-bold mt-2 flex items-center justify-center gap-1.5">
                              <span className="material-symbols-outlined text-xl">egg</span>
                              {hatchedDragon}
                            </h4>
                            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed italic">
                              "{HATCHABLE_DRAGONS.find(d => d.name === hatchedDragon)?.description || ""}"
                            </p>
                            <div className="bg-secondary/15 border border-secondary/20 rounded p-2 text-center text-xs text-secondary font-bold font-mono tracking-wider mt-4">
                              CLAIMED REWARDS: +1,500 Gold 🪙, +150 Souls 💀, +30 Crystals 💎
                            </div>
                            <button
                              onClick={() => setHatchedDragon(null)}
                              className="mt-4 px-4 py-1.5 bg-primary text-[#261900] text-xs font-bold rounded hover:bg-primary-container cursor-pointer transition-colors"
                            >
                              DISMISS
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={!saveState.dragonEggs || saveState.dragonEggs <= 0}
                            onClick={handleHatchEgg}
                            className={`px-8 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all font-mono cursor-pointer shadow-lg flex items-center gap-2 ${
                              saveState.dragonEggs && saveState.dragonEggs > 0
                                ? "bg-primary text-[#261900] hover:bg-primary-container hover:scale-102 shadow-primary/10 animate-bounce-subtle"
                                : "bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant cursor-default"
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">local_fire_department</span>
                            HATCH NEST EGG
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stable of Hatched Dragons */}
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-secondary uppercase mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">roofing</span>
                      Serpent Sanctum Stable
                    </h3>

                    {(saveState.hatchedDragons || []).length === 0 ? (
                      <div className="p-8 rounded-lg border border-dashed border-outline-variant/30 text-center text-xs text-on-surface-variant bg-surface-container/5 font-mono">
                        No dragon companions have hatched yet. Level up your account to unearth cosmic dragon eggs!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {HATCHABLE_DRAGONS.map((d) => {
                          const isOwned = (saveState.hatchedDragons || []).includes(d.name);

                          return (
                            <article
                              key={d.name}
                              className={`p-4 rounded-xl border flex gap-4 text-left transition-all ${
                                isOwned 
                                  ? "border-secondary bg-secondary-container/5 shadow-[0_0_15px_rgba(78,222,163,0.1)]"
                                  : "opacity-40 border-dashed border-outline-variant/30 bg-surface-container/5"
                              }`}
                            >
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center border flex-shrink-0 relative bg-[#222]"
                                style={{ borderColor: isOwned ? '#4ee2a3' : 'rgba(255,255,255,0.1)' }}
                              >
                                <span className={`material-symbols-outlined text-2xl ${isOwned ? "text-secondary" : "text-on-surface-variant"}`}>
                                  {isOwned ? "cruelty_free" : "egg"}
                                </span>
                                {isOwned && (
                                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-ping" />
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                                  {d.name}
                                  <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                    d.rarity === "RARE" ? "bg-blue-500/20 text-blue-400" :
                                    d.rarity === "EPIC" ? "bg-purple-500/20 text-purple-400" :
                                    d.rarity === "LEGENDARY" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                                  }`}>
                                    {d.rarity}
                                  </span>
                                </h4>
                                <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">
                                  {isOwned ? d.description : "Locked. Secure and incubate an egg to hatch."}
                                </p>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container/10 flex justify-end">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setHatchedDragon(null);
                }}
                className="px-5 py-1.5 bg-surface-container-highest border border-outline-variant text-xs font-bold tracking-wider uppercase rounded hover:text-primary hover:bg-surface-container-highest transition-colors cursor-pointer font-mono"
              >
                DISMISS SANCTUARY
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
