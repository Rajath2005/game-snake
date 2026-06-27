import React from "react";
import { AudioManager } from "../lib/audio";

interface FirstTimeExperienceProps {
  onStartAdventure: () => void;
  onWatchGameplay: () => void;
  onHowToPlay: () => void;
  onSkip: () => void;
}

export default function FirstTimeExperience({
  onStartAdventure,
  onWatchGameplay,
  onHowToPlay,
  onSkip
}: FirstTimeExperienceProps) {
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
              AudioManager.play("click");
              onStartAdventure();
            }}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline-md font-bold text-lg uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">play_arrow</span>
            Start Adventure
          </button>
          
          <button 
            onClick={() => {
              AudioManager.play("click");
              onWatchGameplay();
            }}
            className="w-full py-4 bg-surface-container-high border border-primary/30 text-primary rounded-xl font-headline-md font-bold text-lg uppercase tracking-wider hover:bg-primary/10 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">movie</span>
            Watch Gameplay
          </button>
          
          <button 
            onClick={() => {
              AudioManager.play("click");
              onHowToPlay();
            }}
            className="w-full py-4 bg-surface-container-high border border-outline-variant text-on-surface rounded-xl font-headline-md font-bold text-lg uppercase tracking-wider hover:bg-surface-container-highest transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">help</span>
            How To Play
          </button>
        </div>

        <button 
          onClick={() => {
            AudioManager.play("click");
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
