import React, { useState, useEffect } from "react";

interface GameHUDProps {
  score: number;
  highScore: number;
  souls: number;
  soulProgress: number; // 0 to 100
  activeObjective: string; // Dynamic quest/objective string
  combo: number;
  hasCrystal: boolean;
  bossActive: boolean;
  bossHealthPercent: number; // 0 to 100
  dashCooldown: number; // percentage or seconds
  slowCooldown: number;
  shieldCooldown: number;
  cycloneCooldown: number;
  onPauseToggle: () => void;
  onActivateAbility: (ability: "dash" | "slow" | "shield" | "cyclone") => void;
}

export default function GameHUD({
  score,
  highScore,
  souls,
  soulProgress,
  activeObjective,
  combo,
  hasCrystal,
  bossActive,
  bossHealthPercent,
  dashCooldown,
  slowCooldown,
  shieldCooldown,
  cycloneCooldown,
  onPauseToggle,
  onActivateAbility
}: GameHUDProps) {
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [liveScore, setLiveScore] = useState(score);
  const [liveSouls, setLiveSouls] = useState(souls);

  useEffect(() => {
    const handleMetrics = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setLiveScore(customEvent.detail.score);
        // Display bank souls + run souls during the run
        setLiveSouls(souls + customEvent.detail.soulsCount);
      }
    };
    window.addEventListener("game-metrics-update", handleMetrics);
    return () => window.removeEventListener("game-metrics-update", handleMetrics);
  }, [souls]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Pad score numbers with leading zeros like "024,500"
  const padScore = (num: number) => {
    return num.toString().padStart(6, "0");
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none">
      
      {/* Top Header Panel */}
      <header 
        className="absolute top-0 left-0 w-full flex justify-between items-center px-3 md:px-margin-edge bg-surface-dim/60 backdrop-blur-xl border-b border-outline-variant/30 shadow-md pointer-events-auto transition-all"
        style={{
          height: "calc(3.5rem + env(safe-area-inset-top, 0px))",
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingLeft: "calc(0.75rem + env(safe-area-inset-left, 0px))",
          paddingRight: "calc(0.75rem + env(safe-area-inset-right, 0px))"
        }}
        onTouchStart={(e) => e.stopPropagation()}
      >
        
        {/* Leading: Score */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Score</span>
            <span className="font-label-numeric text-sm md:text-lg text-primary text-glow-primary font-bold">
              {padScore(liveScore)}
            </span>
          </div>
          <div className="h-6 md:h-8 w-px bg-outline-variant/50" />
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider block md:hidden">High</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider hidden md:block">High Score</span>
            <span className="font-label-numeric text-sm md:text-lg text-on-surface opacity-70 font-bold">
              {padScore(highScore)}
            </span>
          </div>
        </div>

        {/* Center: Souls & Magic Bar */}
        <div className="flex items-center gap-2 md:gap-margin-edge flex-1 justify-center max-w-[150px] sm:max-w-md mx-auto">
          <div className="flex items-center gap-1 bg-surface-container p-1 md:p-2 rounded-lg border border-outline-variant/30 shadow-inner">
            <span className="material-symbols-outlined text-secondary font-bold text-xs md:text-sm">eco</span>
            <span className="font-label-numeric text-xs md:text-sm text-secondary text-glow-secondary font-bold">
              {liveSouls.toLocaleString()}
            </span>
          </div>
          <div className="hidden sm:block flex-1 max-w-[80px] md:max-w-[150px] h-3 md:h-4 bg-surface-container-lowest border border-outline-variant rounded-sm overflow-hidden p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-secondary-container to-secondary rounded-sm transition-all duration-300"
              style={{ width: `${Math.min(soulProgress, 100)}%` }}
            />
          </div>
          
          {isOffline && (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded text-[9px] text-amber-300 font-bold tracking-wider animate-pulse">
              <span className="material-symbols-outlined text-[10px]">cloud_off</span>
              <span className="hidden xs:inline">LOCAL SAVE</span>
            </div>
          )}
        </div>

        {/* Trailing: Pause Button */}
        <button
          onClick={onPauseToggle}
          className="font-headline-md text-headline-md text-primary drop-shadow-[0_0_10px_rgba(233,193,118,0.5)] hover:text-secondary hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer pointer-events-auto font-bold text-sm md:text-base"
        >
          <span className="material-symbols-outlined text-lg md:text-2xl">pause_circle</span>
          <span className="hidden sm:inline tracking-widest text-xs md:text-sm">PAUSE</span>
        </button>
      </header>

      {/* Boss Health Bar */}
      {bossActive && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl z-40 flex flex-col items-center gap-1 animate-pulse">
          <span className="font-headline-md text-headline-md text-error text-shadow-[0_0_10px_rgba(255,180,171,0.5)] font-bold tracking-widest uppercase">
            THE SERPENT KING
          </span>
          <div className="w-full h-5 bg-surface-container-lowest border-2 border-outline-variant relative overflow-hidden rounded-sm">
            <div 
              className="absolute inset-y-0 left-0 bg-error transition-all duration-100 shadow-[0_0_15px_rgba(255,180,171,0.6)]"
              style={{ width: `${Math.max(bossHealthPercent, 0)}%` }}
            />
            {/* Decorative Gold Frame Overlay */}
            <div className="absolute inset-0 border border-surface-tint opacity-30 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Center-Top: Mini Quest Box */}
      <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-30 glass-panel px-4 py-2 rounded-lg flex items-center gap-2 border border-primary/30 max-w-[90vw] justify-center">
        <span className="material-symbols-outlined text-primary text-xs sm:text-base animate-bounce">priority_high</span>
        <span className="font-body-lg text-xs sm:text-sm text-on-surface font-semibold truncate">
          {activeObjective}
        </span>
      </div>

      {/* Side: Combo Multiplier (Shows when combo > 1) */}
      {combo > 1 && (
        <div 
          className="absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-1 animate-bounce"
          style={{ right: "calc(1rem + env(safe-area-inset-right, 0px))" }}
        >
          <span className="font-headline-md text-on-surface-variant uppercase tracking-widest text-[9px] md:text-[10px] font-semibold">
            Combo
          </span>
          <span className="font-display-lg text-3xl md:text-5xl text-primary text-glow-primary font-bold">
            x{combo}
          </span>
        </div>
      )}

      {/* Left Edge: Item Slots */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 pointer-events-auto"
        style={{ left: "calc(0.75rem + env(safe-area-inset-left, 0px))" }}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Crystal Slot */}
        <div 
          className={`w-10 h-10 sm:w-12 sm:h-12 glass-panel rounded-md flex items-center justify-center border transition-all ${
            hasCrystal ? "border-primary glow-primary" : "border-outline-variant/30"
          }`}
          title={hasCrystal ? "Void Crystal Equipped" : "Void Crystal empty"}
        >
          <span 
            className={`material-symbols-outlined text-xl sm:text-2xl ${
              hasCrystal ? "text-primary animate-pulse" : "text-on-surface/20"
            }`}
            style={hasCrystal ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            diamond
          </span>
        </div>
        
        {/* Open slots */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 glass-panel rounded-md flex items-center justify-center border border-outline-variant/10">
          <span className="material-symbols-outlined text-on-surface/15 text-sm sm:text-lg">add</span>
        </div>
        
        <div className="w-10 h-10 sm:w-12 sm:h-12 glass-panel rounded-md flex items-center justify-center border border-outline-variant/10">
          <span className="material-symbols-outlined text-on-surface/15 text-sm sm:text-lg">add</span>
        </div>
      </div>

      {/* Bottom NavBar (Active Abilities) */}
      <nav 
        className="absolute left-0 w-full z-50 flex justify-center items-center gap-3 sm:gap-6 pointer-events-auto"
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        onTouchStart={(e) => e.stopPropagation()}
      >
        
        {/* Dash/Bolt Ability */}
        <div className="relative">
          <button
            onClick={() => onActivateAbility("dash")}
            disabled={dashCooldown > 0}
            className={`flex flex-col items-center justify-center bg-surface-variant/80 border rounded-full w-12 h-12 sm:w-14 sm:h-14 hover:border-secondary hover:shadow-[0_0_20px_rgba(78,222,163,0.8)] hover:scale-105 transition-all group cursor-pointer ${
              dashCooldown > 0 ? "border-outline-variant opacity-50" : "border-outline-variant/50"
            }`}
            title="Sovereign Dash (Hotkey: Space/W)"
          >
            <span className="material-symbols-outlined text-on-surface group-hover:text-secondary text-xl sm:text-2xl">
              bolt
            </span>
          </button>
          {dashCooldown > 0 && (
            <div className="absolute inset-0 bg-background/70 rounded-full flex items-center justify-center text-primary font-label-numeric text-[10px] sm:text-xs font-bold">
              {Math.ceil(dashCooldown)}s
            </div>
          )}
        </div>

        {/* Slow-Time Ability (Active/Big icon) */}
        <div className="relative">
          <button
            onClick={() => onActivateAbility("slow")}
            disabled={slowCooldown > 0}
            className={`flex flex-col items-center justify-center bg-surface-container-highest border-2 rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-[0_0_15px_rgba(233,193,118,0.4)] hover:shadow-[0_0_25px_rgba(78,222,163,0.8)] scale-105 transition-transform relative group cursor-pointer ${
              slowCooldown > 0 ? "border-outline-variant opacity-50" : "border-primary"
            }`}
            title="Chrono Shift (Hotkey: Shift/S)"
          >
            {slowCooldown === 0 && (
              <div className="absolute inset-0 rounded-full border border-secondary animate-ping opacity-30 animate-duration-1000" />
            )}
            <span className="material-symbols-outlined text-secondary text-2xl sm:text-3xl group-hover:text-primary">
              history_toggle_off
            </span>
          </button>
          {slowCooldown > 0 && (
            <div className="absolute inset-0 bg-background/70 rounded-full flex items-center justify-center text-primary font-label-numeric text-[10px] sm:text-xs font-bold">
              {Math.ceil(slowCooldown)}s
            </div>
          )}
        </div>

        {/* Shield Ability */}
        <div className="relative">
          <button
            onClick={() => onActivateAbility("shield")}
            disabled={shieldCooldown > 0}
            className={`flex flex-col items-center justify-center bg-surface-variant/80 border rounded-full w-12 h-12 sm:w-14 sm:h-14 hover:border-secondary hover:shadow-[0_0_20px_rgba(78,222,163,0.8)] hover:scale-105 transition-all group cursor-pointer ${
              shieldCooldown > 0 ? "border-outline-variant opacity-50" : "border-outline-variant/50"
            }`}
            title="Aegis Shield (Hotkey: E)"
          >
            <span className="material-symbols-outlined text-on-surface group-hover:text-secondary text-xl sm:text-2xl">
              shield
            </span>
          </button>
          {shieldCooldown > 0 && (
            <div className="absolute inset-0 bg-background/70 rounded-full flex items-center justify-center text-primary font-label-numeric text-[10px] sm:text-xs font-bold">
              {Math.ceil(shieldCooldown)}s
            </div>
          )}
        </div>

        {/* Cyclone Ability */}
        <div className="relative">
          <button
            onClick={() => onActivateAbility("cyclone")}
            disabled={cycloneCooldown > 0}
            className={`flex flex-col items-center justify-center bg-surface-variant/80 border rounded-full w-12 h-12 sm:w-14 sm:h-14 hover:border-secondary hover:shadow-[0_0_20px_rgba(78,222,163,0.8)] hover:scale-105 transition-all group cursor-pointer ${
              cycloneCooldown > 0 ? "border-outline-variant opacity-50" : "border-outline-variant/50"
            }`}
            title="Serpent Cyclone (Hotkey: Q)"
          >
            <span className="material-symbols-outlined text-on-surface group-hover:text-secondary text-xl sm:text-2xl">
              cyclone
            </span>
          </button>
          {cycloneCooldown > 0 && (
            <div className="absolute inset-0 bg-background/70 rounded-full flex items-center justify-center text-primary font-label-numeric text-[10px] sm:text-xs font-bold">
              {Math.ceil(cycloneCooldown)}s
            </div>
          )}
        </div>

      </nav>
    </div>
  );
}
