import React, { useState } from "react";
import { AudioManager } from "../lib/audio";

interface FirstTimeExperienceProps {
  onStartAdventure: () => void;
  onWatchGameplay: () => void;
  onHowToPlay: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: "Sovereignty Slither",
    description: "Move your mouse cursor or press WASD / Arrow Keys to slither. On mobile, drag the digital joystick. Master your movement to survive.",
    icon: "open_with"
  },
  {
    title: "Harvesting Souls",
    description: "Navigate towards floating glowing Green, Red, or Golden Souls to devour them. Souls grant Score and Gold, siphoning their ancient power!",
    icon: "diamond"
  },
  {
    title: "Serpent Growth",
    description: "Devouring souls extends your serpent tail segment count! A longer tail multiplies your scores and increases your visual presence.",
    icon: "trending_up"
  },
  {
    title: "Avoiding Attacks",
    description: "Enemy guardians will fire magical bolts or charge at you! Avoid crashing your head into their attacks, but your segments are durable.",
    icon: "shield"
  },
  {
    title: "Tactical Combat",
    description: "Bite enemies with your head, or wrap your long serpent tail segments directly around guards to slam them and trigger whip explosions!",
    icon: "swords"
  },
  {
    title: "Eldritch Abilities",
    description: "Unleash magic! Dash, Cyclone, Divine Shield, or Slow Time. Equip active abilities in the Skill Tree and use them to dominate the rift.",
    icon: "bolt"
  },
  {
    title: "Artifacts & Relics",
    description: "Equip Relics for passive boosts, and powerful Artifacts that alter gameplay mechanics. Collect them from the Vault to customize your build.",
    icon: "auto_awesome"
  },
  {
    title: "Dimensional Bosses",
    description: "When your score spikes, the Boss Guardian will materialize! Maintain your distance, dodge heavy attacks, and strike its weak points.",
    icon: "skull"
  },
  {
    title: "Extraction & Chests",
    description: "Defeating the Boss unlocks the ultimate reward chest. Gather your courage, Sovereign. Reclaim your lost kingdom!",
    icon: "redeem"
  }
];

export default function FirstTimeExperience({
  onStartAdventure,
  onWatchGameplay,
  onHowToPlay,
  onSkip
}: FirstTimeExperienceProps) {
  const [view, setView] = useState<"MENU" | "TUTORIAL">("MENU");
  const [currentStep, setCurrentStep] = useState(0);

  if (view === "TUTORIAL") {
    const step = TUTORIAL_STEPS[currentStep];
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md">
        <div className="relative z-10 w-full max-w-2xl bg-surface p-8 md:p-12 rounded-2xl border-2 border-primary/20 shadow-2xl shadow-primary/10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          
          <div className="flex justify-between items-center w-full mb-8">
            <span className="font-label-numeric text-xs text-on-surface-variant font-bold tracking-widest uppercase">
              Codex Step {currentStep + 1} / {TUTORIAL_STEPS.length}
            </span>
            <button 
              onClick={() => {
                AudioManager.playButton();
                onSkip(); // Skip straight to reward
              }}
              className="text-on-surface-variant hover:text-error text-xs uppercase tracking-widest font-bold transition-colors"
            >
              Skip
            </button>
          </div>

          <span className="material-symbols-outlined text-secondary text-7xl mb-6 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
            {step.icon}
          </span>

          <h2 className="font-headline text-2xl md:text-3xl text-primary text-glow-primary mb-4 uppercase tracking-widest">
            {step.title}
          </h2>
          
          <p className="font-body text-base md:text-lg text-on-surface-variant leading-relaxed max-w-md mx-auto min-h-[100px]">
            {step.description}
          </p>

          <div className="flex gap-4 mt-8 w-full max-w-xs">
            {currentStep > 0 && (
              <button 
                onClick={() => {
                  AudioManager.playClick();
                  setCurrentStep(c => c - 1);
                }}
                className="flex-1 py-3 bg-surface-container-high text-on-surface rounded-xl font-headline-md font-bold uppercase tracking-wider hover:bg-surface-container-highest transition-all"
              >
                Back
              </button>
            )}
            
            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <button 
                onClick={() => {
                  AudioManager.playClick();
                  setCurrentStep(c => c + 1);
                }}
                className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-headline-md font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Next
              </button>
            ) : (
              <button 
                onClick={() => {
                  AudioManager.playButton();
                  onHowToPlay(); // Finish tutorial and get reward
                }}
                className="flex-[2] py-3 bg-secondary text-background rounded-xl font-headline-md font-bold uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">redeem</span>
                Claim Reward
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="relative z-10 w-full max-w-2xl bg-surface p-8 md:p-12 rounded-2xl border-2 border-primary/20 shadow-2xl shadow-primary/10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
        
        <h1 className="font-headline text-3xl md:text-5xl text-primary text-glow-primary mb-6 uppercase tracking-widest leading-tight">
          Welcome to<br/>The Serpent Kingdom
        </h1>
        
        <div className="font-body text-base md:text-lg text-on-surface-variant space-y-2 mb-10">
          <p>Become the Ancient Serpent.</p>
          <p>Consume Souls.</p>
          <p>Grow Stronger.</p>
          <p>Defeat Ancient Guardians.</p>
          <p>Reclaim the Kingdom.</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button 
            onClick={() => {
              AudioManager.playButton();
              onStartAdventure();
            }}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline-md font-bold text-lg uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">play_arrow</span>
            Start Adventure
          </button>
          
          <button 
            onClick={() => {
              AudioManager.playButton();
              onWatchGameplay();
            }}
            className="w-full py-4 bg-surface-container-high border border-primary/30 text-primary rounded-xl font-headline-md font-bold text-lg uppercase tracking-wider hover:bg-primary/10 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">movie</span>
            Watch Gameplay
          </button>
          
          <button 
            onClick={() => {
              AudioManager.playButton();
              setView("TUTORIAL");
            }}
            className="w-full py-4 bg-surface-container-high border border-outline-variant text-on-surface rounded-xl font-headline-md font-bold text-lg uppercase tracking-wider hover:bg-surface-container-highest transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">help</span>
            How To Play
          </button>
        </div>

        <button 
          onClick={() => {
            AudioManager.playButton();
            onSkip();
          }}
          className="mt-8 text-on-surface-variant hover:text-on-surface font-label text-sm uppercase tracking-wider transition-colors underline decoration-on-surface-variant/30 cursor-pointer"
        >
          Skip Tutorial
        </button>
      </div>
    </div>
  );
}
