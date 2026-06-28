import React, { useEffect, useState, useRef } from "react";
import { AudioManager } from "../lib/audio";

interface UITourOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TOUR_STEPS = [
  {
    title: "Welcome to The Serpent Kingdom",
    description: "Prepare to reclaim your throne, ancient one. Let's take a quick look around your camp before you descend into the abyss.",
    targetId: null,
    position: "center",
  },
  {
    title: "The Objective",
    description: "Your goal is to devour souls, grow your serpent body, defeat dimensional bosses, and amass immense power to rule once more.",
    targetId: null,
    position: "center",
  },
  {
    title: "Play Button",
    description: "When you're ready, click here to select a biome portal and begin your run. Surrive, grow, and conquer!",
    targetId: ["onboarding-play-btn"],
    position: "top",
  },
  {
    title: "Player Profile",
    description: "Here you can view your current Level, Rank, and total currencies (Gold, Souls, Void Crystals, Skill Points).",
    targetId: ["onboarding-player-profile"],
    position: "bottom",
  },
  {
    title: "The Vault (Shop)",
    description: "Spend your hard-earned currencies here to acquire new cosmetics, starter advantages, and permanent stat boosts.",
    targetId: ["onboarding-tab-shop", "onboarding-tab-mobile-shop"],
    position: "bottom",
  },
  {
    title: "Inventory & Loadout",
    description: "Equip Relics, learn new Talents, unlock Skill Tree nodes, and change your Serpent Form in these tabs.",
    targetId: ["onboarding-tab-relics", "onboarding-tab-mobile-relics"],
    position: "bottom",
  },
  {
    title: "Missions & Quests",
    description: "Complete daily missions and lifetime achievements to earn massive rewards and exclusive artifacts.",
    targetId: ["onboarding-tab-quests", "onboarding-tab-mobile-quests"],
    position: "bottom",
  },
  {
    title: "Leaderboards",
    description: "Compete against other ancient serpents across the realms. Prove your dominance on the global high scores!",
    targetId: ["onboarding-leaderboard-btn"],
    position: "bottom-left",
  },
  {
    title: "Settings",
    description: "Tweak your visual graphics, audio volume, and game preferences here to ensure an optimal experience.",
    targetId: ["onboarding-settings-btn"],
    position: "bottom-left",
  },
  {
    title: "Start First Adventure",
    description: "Your guided tour is complete! Are you ready to reclaim what is yours? Start your adventure now!",
    targetId: null,
    position: "center",
  }
];

export default function UITourOverlay({ onComplete, onSkip }: UITourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const resizeTimeout = useRef<NodeJS.Timeout>();

  const step = TOUR_STEPS[currentStep];

  const updateTargetRect = () => {
    if (!step.targetId) {
      setTargetRect(null);
      return;
    }

    let el: HTMLElement | null = null;
    for (const id of step.targetId) {
      el = document.getElementById(id);
      if (el && el.offsetParent !== null) { // Ensure it's visible
        break;
      }
    }

    if (el) {
      // Add scroll into view smoothly if element is out of bounds
      const rect = el.getBoundingClientRect();
      const isVisible = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );

      if (!isVisible) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Recalculate after scroll
        setTimeout(() => {
          setTargetRect(el!.getBoundingClientRect());
        }, 300);
      } else {
        setTargetRect(rect);
      }
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    updateTargetRect();
    
    const handleResize = () => {
      clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(updateTargetRect, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      clearTimeout(resizeTimeout.current);
    };
  }, [currentStep]);

  const handleNext = () => {
    AudioManager.playClick();
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    AudioManager.playClick();
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dimmed Background Overlay with cutout */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-all duration-500 ease-in-out"
        style={{
          clipPath: targetRect 
            ? `polygon(
                0% 0%, 0% 100%, 
                ${targetRect.left - 10}px 100%, 
                ${targetRect.left - 10}px ${targetRect.top - 10}px, 
                ${targetRect.right + 10}px ${targetRect.top - 10}px, 
                ${targetRect.right + 10}px ${targetRect.bottom + 10}px, 
                ${targetRect.left - 10}px ${targetRect.bottom + 10}px, 
                ${targetRect.left - 10}px 100%, 
                100% 100%, 100% 0%
              )`
            : 'none'
        }}
      />
      
      {/* Animated Highlight Ring */}
      {targetRect && (
        <div 
          className="absolute border-2 border-primary rounded-xl transition-all duration-500 ease-in-out pointer-events-none animate-pulse-slow shadow-[0_0_20px_rgba(233,193,118,0.5)]"
          style={{
            left: targetRect.left - 10,
            top: targetRect.top - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
          }}
        />
      )}

      {/* Tooltip Card */}
      <div 
        className={`absolute pointer-events-auto transition-all duration-500 ease-in-out ${
          targetRect ? 'transform-gpu' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
        style={targetRect ? {
          top: step.position.includes('top') ? targetRect.top - 20 : (step.position.includes('bottom') ? targetRect.bottom + 20 : targetRect.top),
          left: step.position.includes('left') ? targetRect.left - 300 : (step.position.includes('right') ? targetRect.right + 20 : targetRect.left + (targetRect.width / 2)),
          transform: targetRect ? (
            step.position === 'top' ? 'translate(-50%, -100%)' :
            step.position === 'bottom' ? 'translate(-50%, 0)' :
            step.position === 'bottom-left' ? 'translate(-100%, 0)' :
            'translate(0, 0)'
          ) : undefined
        } : {}}
      >
        <div className="w-[320px] bg-surface p-5 rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20 flex flex-col gap-3">
          
          <div className="flex justify-between items-center">
            <span className="font-label-numeric text-[10px] text-primary font-bold tracking-widest uppercase">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <button 
              onClick={() => {
                AudioManager.playButton();
                onSkip();
              }}
              className="text-on-surface-variant hover:text-error text-[10px] tracking-widest uppercase font-bold transition-colors"
            >
              Skip
            </button>
          </div>

          <h3 className="font-headline text-lg text-primary uppercase tracking-wider font-bold">
            {step.title}
          </h3>
          
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            {step.description}
          </p>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-outline-variant/20">
            <button
              onClick={handlePrev}
              className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                currentStep > 0 ? "text-on-surface hover:text-primary" : "text-transparent pointer-events-none"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="stone-button px-4 py-1.5 rounded text-xs text-primary uppercase font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
              <span className="material-symbols-outlined text-[14px]">
                {currentStep === TOUR_STEPS.length - 1 ? "check" : "arrow_forward"}
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
