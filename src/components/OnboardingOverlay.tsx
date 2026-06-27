import React, { useState, useEffect, useRef } from "react";
import { AudioManager } from "../lib/audio";

export interface OnboardingStep {
  targetId: string | null;
  title: string;
  description: string;
  tabToActivate?: "BIOMES" | "SHOP" | "TALENTS" | "SKILLS" | "RELICS" | "FORMS" | "CALENDAR" | "PRESTIGE" | "QUESTS";
}

interface OnboardingOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
  onStepChange?: (tab: "BIOMES" | "SHOP" | "TALENTS" | "SKILLS" | "RELICS" | "FORMS" | "CALENDAR" | "PRESTIGE" | "QUESTS") => void;
}

export default function OnboardingOverlay({ onComplete, onSkip, onStepChange }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const pollingRef = useRef<number | null>(null);

  const steps: OnboardingStep[] = [
    {
      targetId: null,
      title: "Welcome to The Serpent Kingdom",
      description: "Greetings, Sovereign! You have inherited the crown of the Abyssal Serpent. Here you will slither through dangerous portals, devour lost souls, and expand your ancient reign.",
    },
    {
      targetId: "onboarding-player-profile",
      title: "The Sovereign Profile",
      description: "This is your royal avatar and state level. Entering portal battles grants experience (XP) to level up. Higher levels awaken greater raw potential and prestige modifiers!",
      tabToActivate: "BIOMES",
    },
    {
      targetId: "onboarding-play-btn",
      title: "Ancient Portal Gateways",
      description: "Clicking 'ENTER PORTAL' starts a match! Descent into any of the active Biomes to harvest cursed gold, gather captured souls, and claim rare dimensional crystals.",
      tabToActivate: "BIOMES",
    },
    {
      targetId: "onboarding-tab-shop",
      title: "The Imperial Vault (Shop)",
      description: "Spend your hard-earned Gold and Crystals in the Vault. Unlock legendary serpent skins (like Spectral Wyrm and Molten Core) and upgrade your starting weapon attributes!",
      tabToActivate: "SHOP",
    },
    {
      targetId: "onboarding-tab-relics",
      title: "Sovereign Inventory & Relics",
      description: "Equip up to two active Relics and one powerful Artifact. Relics modify baseline stats, while Artifacts grant ultimate modifiers like instant revive on defeat!",
      tabToActivate: "RELICS",
    },
    {
      targetId: "onboarding-tab-quests",
      title: "Dark Quests & Milestones",
      description: "Claim milestone achievements and claim rewards for daily login cycles here. Complete active bounties to speed up your progression and unlock premium currency.",
      tabToActivate: "QUESTS",
    },
    {
      targetId: "onboarding-leaderboard-btn",
      title: "Royal Clan Leaderboards",
      description: "See where you rank among other serpent commanders in the kingdom. Achieve massive score multipliers to showcase your prowess and claim supreme global glory!",
    },
    {
      targetId: "onboarding-settings-btn",
      title: "Altar of Settings",
      description: "Adjust controller haptics, graphics quality, or audio volumes here. If you ever feel lost, you can restart this interactive tour from the Settings menu at any time.",
    },
  ];

  const activeStepObj = steps[currentStep];

  // Sync active tab with main dashboard based on current step requirements
  useEffect(() => {
    if (activeStepObj.tabToActivate && onStepChange) {
      onStepChange(activeStepObj.tabToActivate);
    }
  }, [currentStep, activeStepObj.tabToActivate, onStepChange]);

  // Scroll target element into view when step changes
  useEffect(() => {
    if (activeStepObj.targetId) {
      // Small delay to allow any tab rendering to occur first
      const timer = setTimeout(() => {
        let el = document.getElementById(activeStepObj.targetId!);
        if (!el) {
          el = document.getElementById(activeStepObj.targetId!.replace("onboarding-tab-", "onboarding-tab-mobile-"));
        }
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, activeStepObj.targetId]);

  // Track the bounding box of the highlighted element
  useEffect(() => {
    const updateRect = () => {
      if (!activeStepObj.targetId) {
        setRect(null);
        return;
      }
      const el = document.getElementById(activeStepObj.targetId);
      if (el) {
        const bounding = el.getBoundingClientRect();
        // Check if the element is currently visible / has size
        if (bounding.width > 0 && bounding.height > 0) {
          setRect(bounding);
        } else {
          // If on mobile and tab button is in a scrolled container, fall back to parent tabs container
          const alternative = document.getElementById(activeStepObj.targetId.replace("onboarding-tab-", "onboarding-tab-mobile-"));
          if (alternative) {
            setRect(alternative.getBoundingClientRect());
          }
        }
      } else {
        setRect(null);
      }
    };

    // Poll to keep rect accurate even during layout shifts or image loading
    const poll = () => {
      updateRect();
      pollingRef.current = requestAnimationFrame(poll);
    };

    poll();

    return () => {
      if (pollingRef.current) {
        cancelAnimationFrame(pollingRef.current);
      }
    };
  }, [currentStep, activeStepObj.targetId]);

  const handleNext = () => {
    AudioManager.playMagic();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    AudioManager.playClick();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    AudioManager.playClick();
    onSkip();
  };

  // Determine tooltip style positioning based on focused rectangle
  let tooltipStyle: React.CSSProperties = {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 99,
  };

  let arrowClass = "";

  if (rect) {
    const tooltipWidth = Math.min(350, window.innerWidth - 32);
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    // Bounds clamping
    left = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, left));

    let top = rect.bottom + 20; // Default below
    arrowClass = "after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-b-surface-container-high";

    // If bottom overflow, place above
    if (rect.bottom + 220 > window.innerHeight) {
      top = rect.top - 200;
      arrowClass = "after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-surface-container-high";
    }

    // Clamp top value
    top = Math.max(80, Math.min(window.innerHeight - 220, top));

    tooltipStyle = {
      position: "fixed",
      left: `${left}px`,
      top: `${top}px`,
      width: `${tooltipWidth}px`,
      zIndex: 99,
    };
  }

  const maskId = `onboarding-svg-mask-${currentStep}`;

  return (
    <div className="fixed inset-0 w-full h-full z-[80] pointer-events-none select-none">
      {/* 1. FULLSCREEN OVERLAY DIMMING WITH CUTOUT */}
      <svg className="fixed inset-0 w-full h-full pointer-events-auto z-[81]" style={{ mixBlendMode: "multiply" }}>
        <defs>
          <mask id={maskId}>
            {/* White fills the mask (fully opaque background) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cut out (fully transparent hole at the focused element) */}
            {rect && (
              <rect
                x={rect.left - 6}
                y={rect.top - 6}
                width={rect.width + 12}
                height={rect.height + 12}
                rx={10}
                ry={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Semi-transparent dark overlay */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(8, 8, 8, 0.88)"
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* 2. ANIMATED PULSING HIGHLIGHT RING */}
      {rect && (
        <div
          className="fixed pointer-events-none border-2 border-primary rounded-xl z-[82]"
          style={{
            left: rect.left - 8,
            top: rect.top - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: "0 0 25px rgba(233, 193, 118, 0.9), inset 0 0 15px rgba(233, 193, 118, 0.6)",
            transition: "all 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {/* Outer ripples */}
          <div className="absolute inset-0 border border-secondary rounded-xl animate-ping opacity-60" style={{ animationDuration: "1.8s" }} />
          <div className="absolute -inset-1 border border-primary/40 rounded-xl animate-pulse opacity-40" />
        </div>
      )}

      {/* 3. TOOLTIP CARD */}
      <div
        style={tooltipStyle}
        className={`pointer-events-auto glass-panel p-6 rounded-xl border border-primary/40 shadow-2xl bg-surface-dim/95 backdrop-blur-md relative ${arrowClass}`}
      >
        {/* Step Indicator Badge */}
        <div className="flex justify-between items-center mb-3">
          <span className="px-2.5 py-1 bg-primary/10 border border-primary/30 rounded text-[10px] font-mono text-primary font-bold tracking-widest uppercase">
            Sovereign Guide
          </span>
          <span className="font-label-numeric text-[10px] text-on-surface-variant font-bold">
            STEP {currentStep + 1} OF {steps.length}
          </span>
        </div>

        {/* Card Title */}
        <h3 className="font-headline-md text-base text-primary uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(233,193,118,0.4)]">
          <span className="material-symbols-outlined text-sm text-secondary">verified</span>
          {activeStepObj.title}
        </h3>

        {/* Card Body */}
        <p className="font-body-md text-xs text-on-surface leading-relaxed mb-6">
          {activeStepObj.description}
        </p>

        {/* Step Progress Bar */}
        <div className="w-full bg-surface-container-lowest h-1 rounded-full mb-6 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 shadow-[0_0_8px_#e9c176]"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex justify-between items-center gap-2">
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="text-on-surface-variant hover:text-error text-[10px] tracking-wider uppercase font-semibold transition-colors cursor-pointer py-1"
          >
            Skip Tour
          </button>

          {/* Prev / Next controls */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded bg-surface-container border border-outline hover:bg-surface-container-high text-on-surface text-[10px] uppercase font-bold cursor-pointer transition-colors"
              >
                Prev
              </button>
            )}
            <button
              onClick={handleNext}
              className="stone-button px-4 py-1.5 rounded font-headline-md text-[10px] text-primary uppercase font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <span>{currentStep === steps.length - 1 ? "Finish" : "Next"}</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
