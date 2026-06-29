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
    description: "Devour souls, grow your serpent body, defeat dimensional bosses, and amass immense power to rule once more.",
    targetId: null,
    position: "center",
  },
  {
    title: "Enter the Portal",
    description: "Tap this button anytime to start your run. Survive, grow, and conquer the realms!",
    targetId: ["floating-play-btn", "onboarding-hero-play-btn", "onboarding-play-btn"],
    position: "left",
  },
  {
    title: "Player Profile",
    description: "View your Level, Rank, and currencies (Gold, Souls, Void Crystals, Skill Points).",
    targetId: ["onboarding-player-profile"],
    position: "bottom",
  },
  {
    title: "The Vault (Shop)",
    description: "Spend currencies on cosmetics, boosts, and permanent stat upgrades.",
    targetId: ["onboarding-tab-shop", "onboarding-tab-mobile-shop"],
    position: "bottom",
  },
  {
    title: "Inventory & Loadout",
    description: "Equip Relics, learn Talents, unlock Skills, and change your Serpent Form.",
    targetId: ["onboarding-tab-relics", "onboarding-tab-mobile-relics"],
    position: "bottom",
  },
  {
    title: "Missions & Quests",
    description: "Complete missions and achievements to earn massive rewards and exclusive items.",
    targetId: ["onboarding-tab-quests", "onboarding-tab-mobile-quests"],
    position: "bottom",
  },
  {
    title: "Settings",
    description: "Tweak graphics, audio, and game preferences for an optimal experience.",
    targetId: ["onboarding-settings-btn"],
    position: "left",
  },
  {
    title: "Start First Adventure",
    description: "Your guided tour is complete! Are you ready to reclaim what is yours? Tap the play button to begin!",
    targetId: null,
    position: "center",
  }
];

export default function UITourOverlay({ onComplete, onSkip }: UITourOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const resizeTimeout = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStep];

  const updateTargetRect = () => {
    if (!step.targetId) {
      setTargetRect(null);
      return;
    }

    let el: HTMLElement | null = null;
    for (const id of step.targetId) {
      el = document.getElementById(id);
      if (el && el.offsetParent !== null) {
        break;
      }
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      const isVisible = (
        rect.top >= -50 &&
        rect.left >= -50 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 50 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + 50
      );

      if (!isVisible) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          setTargetRect(el!.getBoundingClientRect());
        }, 350);
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

  const computeTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const gap = 12;
    const tooltipW = Math.min(320, window.innerWidth - 32);
    let top: number;
    let left: number;
    let transform = '';

    switch (step.position) {
      case 'top':
        top = targetRect.top - gap;
        left = targetRect.left + targetRect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = targetRect.bottom + gap;
        left = targetRect.left + targetRect.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - gap;
        transform = 'translate(-100%, -50%)';
        break;
      default:
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.right + gap;
        transform = 'translate(0, -50%)';
    }

    // Clamp to viewport bounds
    const pad = 8;
    const estimatedH = 280;
    top = Math.max(pad, Math.min(top, window.innerHeight - estimatedH));
    left = Math.max(pad, Math.min(left, window.innerWidth - tooltipW - pad));

    return { top, left, transform };
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
        ref={tooltipRef}
        className="absolute pointer-events-auto transition-all duration-500 ease-in-out transform-gpu"
        style={computeTooltipStyle()}
      >
        <div className="w-[90vw] max-w-[320px] bg-surface p-4 md:p-5 rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20 flex flex-col gap-3">
          
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

          <h3 className="font-headline text-base md:text-lg text-primary uppercase tracking-wider font-bold">
            {step.title}
          </h3>
          
          <p className="font-body text-xs md:text-sm text-on-surface-variant leading-relaxed">
            {step.description}
          </p>

          <div className="flex justify-between items-center mt-2 pt-3 border-t border-outline-variant/20">
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
