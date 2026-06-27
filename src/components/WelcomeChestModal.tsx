import React, { useState } from "react";
import { AudioManager } from "../lib/audio";

interface WelcomeChestModalProps {
  onClaim: (rewards: { gold: number; souls: number; crystals: number; achievementId: string }) => void;
}

export default function WelcomeChestModal({ onClaim }: WelcomeChestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const rewards = {
    gold: 1000,
    souls: 50,
    crystals: 15,
    achievementId: "first_run" // First Slither
  };

  const handleOpenChest = () => {
    AudioManager.playDragonRoar();
    setIsOpen(true);
  };

  const handleClaimAll = () => {
    AudioManager.playMagic();
    setClaimed(true);
    onClaim(rewards);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      {/* Radiant rotating cosmic light rays in background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(233,193,118,0.15)_0%,_transparent_60%)] pointer-events-none animate-pulse" />
      
      {!isOpen ? (
        // Closed Chest Phase
        <div className="text-center max-w-sm flex flex-col items-center animate-float">
          <div className="relative mb-6 group cursor-pointer" onClick={handleOpenChest}>
            {/* Pulsing ring underneath */}
            <div className="absolute -inset-4 rounded-full bg-primary/25 blur-xl group-hover:bg-primary/40 animate-pulse transition-all" />
            
            {/* Chest Graphic or Icon */}
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-b from-primary to-[#855e10] border-2 border-primary/60 flex items-center justify-center shadow-2xl relative transform hover:scale-110 active:scale-95 transition-all duration-150">
              <span className="material-symbols-outlined text-surface-dim text-7xl select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                inventory_2
              </span>
              <span className="material-symbols-outlined absolute text-secondary text-4xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none animate-ping opacity-70">
                stars
              </span>
            </div>
          </div>

          <h2 className="font-headline-md text-2xl text-primary font-bold uppercase tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(233,193,118,0.5)]">
            SOVEREIGN WELCOME CHEST
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant mb-6 leading-relaxed">
            The elders of the Abyssal Sanctuary have prepared a starter treasury for your coronation. Open it to claim your beginner assets!
          </p>

          <button
            onClick={handleOpenChest}
            className="stone-button px-8 py-3 rounded-xl font-headline-md text-base text-primary uppercase font-bold tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(233,193,118,0.4)]"
          >
            OPEN ROYAL CHEST
          </button>
        </div>
      ) : (
        // Opened Chest Rewards Phase
        <div className="glass-panel p-8 rounded-2xl border border-primary/40 text-center max-w-md w-full relative shadow-2xl animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="material-symbols-outlined text-primary text-4xl">redeem</span>
          </div>

          <h2 className="font-headline-md text-xl text-primary font-bold uppercase tracking-widest mb-1">
            TREASURY DISBURSED
          </h2>
          <p className="font-body-md text-xs text-on-surface-variant mb-6">
            The seals have been broken. Your starting items are ready to claim.
          </p>

          {/* Reward cards list */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* Gold */}
            <div className="bg-surface-container-high/40 border border-primary/20 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-surface-container-high/60 transition-colors">
              <span className="material-symbols-outlined text-primary text-3xl mb-1">monetization_on</span>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Gold Coins</span>
              <span className="font-label-numeric text-sm text-primary font-bold">+{rewards.gold.toLocaleString()}</span>
            </div>

            {/* Souls */}
            <div className="bg-surface-container-high/40 border border-error/20 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-surface-container-high/60 transition-colors">
              <span className="material-symbols-outlined text-error text-3xl mb-1">local_fire_department</span>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Captured Souls</span>
              <span className="font-label-numeric text-sm text-error font-bold">+{rewards.souls.toLocaleString()}</span>
            </div>

            {/* Crystals */}
            <div className="bg-surface-container-high/40 border border-secondary/20 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-surface-container-high/60 transition-colors">
              <span className="material-symbols-outlined text-secondary text-3xl mb-1">diamond</span>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Void Crystals</span>
              <span className="font-label-numeric text-sm text-secondary font-bold">+{rewards.crystals.toLocaleString()}</span>
            </div>

            {/* Achievement */}
            <div className="bg-surface-container-high/40 border border-purple-400/20 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-surface-container-high/60 transition-colors">
              <span className="material-symbols-outlined text-purple-400 text-3xl mb-1">military_tech</span>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">ACHIEVEMENT</span>
              <span className="font-headline-md text-[10px] text-purple-400 font-bold truncate max-w-full">FIRST SLITHER</span>
            </div>
          </div>

          <button
            onClick={handleClaimAll}
            className="stone-button w-full py-4 rounded-xl font-headline-md text-base text-primary uppercase font-bold tracking-widest cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(233,193,118,0.5)]"
          >
            CLAIM BEGINNER BOUNTY
          </button>
        </div>
      )}
    </div>
  );
}
