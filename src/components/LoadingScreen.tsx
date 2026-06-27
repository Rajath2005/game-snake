import React, { useState, useEffect } from "react";

const ANCIENT_TIPS = [
  "\"Consuming souls of the fallen grants temporary invincibility, though the hunger grows.\"",
  "\"Active abilities like Chrono Shift slow down time, allowing you to dodge incoming arrows.\"",
  "\"Upgrading Max Health at the camp lets your Serpent King survive lethal boss attacks.\"",
  "\"Collecting glowing Void Crystals unlocks premium dragon skins with divine traits.\"",
  "\"Hold and swipe on screen, or use the WASD/Arrow keys to guide the Serpent King.\"",
  "\"Look out for the ancient Serpent Boss when your soul gauge overflows!\""
];

interface LoadingScreenProps {
  onFinishedLoading: () => void;
}

export default function LoadingScreen({ onFinishedLoading }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [tip, setTip] = useState("");

  useEffect(() => {
    // Select random tip
    const randomTip = ANCIENT_TIPS[Math.floor(Math.random() * ANCIENT_TIPS.length)];
    setTip(randomTip);

    // Simulate natural loading speed
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 8 + 2;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          onFinishedLoading();
        }, 500);
      }
      setProgress(Math.floor(currentProgress));
    }, 120);

    return () => clearInterval(interval);
  }, [onFinishedLoading]);

  // Generate embers
  const embers = Array.from({ length: 15 }).map((_, i) => {
    const size = Math.random() * 4 + 2;
    const delay = Math.random() * 5;
    const duration = Math.random() * 6 + 4;
    const left = Math.random() * 100;
    return (
      <div
        key={i}
        className="ambient-ember bg-secondary/30 shadow-[0_0_10px_#4edea3]"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`
        }}
      />
    );
  });

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col justify-end items-center relative font-body-md select-none bg-background text-on-surface">
      
      {/* Background Layer: Ancient Map Map & Fog overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAoWrbi_MUIjqnFNoToFentqu08yS2TZneMy13TV5R-jmD6iZxGJjf3k4CugMshYn8svEavWlytHe98_YfeiVaoBpBa1HQczk_UZx4IKtVFp1jUdLlcQ7FesYoyUXsohicWKiyVTYMHpQ_2Y8UTzYnv1Szn9aE0Xn7FxfWgJp1Qt00XaFa_POLfFKa_XY4aTiXCarbd-dreXOmSDGHkPA4FGFCniRPcWTgwF24YYRSDq-lqie5x5GRB7bBpVlUmmFzZVOrAyVOjYFA')" 
          }}
        />
        {/* Animated Embers */}
        {embers}
        {/* Dark radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#131313_100%)]" />
      </div>

      {/* Center: Rotating Rune Glow */}
      <div className="absolute inset-0 z-10 flex justify-center items-center pointer-events-none">
        <div className="relative w-40 h-40 sm:w-64 sm:h-64 flex justify-center items-center">
          {/* Glowing pulse aura */}
          <div className="absolute w-28 h-28 sm:w-48 sm:h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          
          {/* Rune Image */}
          <img 
            className="w-24 h-24 sm:w-48 sm:h-48 object-contain rune-spin z-20 drop-shadow-[0_0_20px_rgba(233,193,118,0.7)]" 
            alt="Ancient Serpent Kingdom Rune Intertwined circular metallic design"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYZyaIOEuogDAxY6euwD6xxfR_4xQPFuBobqp63JRIuB2K8XU9YAoLNxiR4ydiQwxhBu53Dy-W7kTv5ozVgGkDKFmyaexUZI2ac8Y4MorM1A8Kgsfw0NfFMps8ESjDMkMudt5-BzbD0uUloq5jwrkUWrDONUruxeo_sjSzcOlj9ozxjzsRbs8fL2QXtP2E8kEVplsS3i0s8z6A6mOfD2UZPWcW1sDzOEXsNUvY6ulR2OjQPvnF9D97XSeYG1JmNow-mxlZ6J2xbc8"
          />
        </div>
      </div>

      {/* Bottom HUD Layer: Progress Bar & Tips */}
      <div className="z-20 w-[90%] md:w-[60%] lg:w-[40%] flex flex-col items-center pb-6 sm:pb-[80px] gap-gutter">
        
        {/* Tip Text */}
        <div className="text-center bg-surface-variant/40 backdrop-blur-md px-panel-padding py-4 rounded-xl border border-outline-variant/30 shadow-[0_0_15px_rgba(78,222,163,0.1)] w-full">
          <p className="font-label-sm text-label-sm text-primary tracking-widest uppercase mb-2 opacity-80">
            Wisdom of the Ancients
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-md mx-auto leading-relaxed min-h-[48px]">
            {tip}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-surface-container-high rounded-full h-8 relative overflow-hidden border-2 border-outline-variant/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]">
          {/* Embellishments */}
          <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-surface-tint/20 to-transparent z-10" />
          <div className="absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-l from-surface-tint/20 to-transparent z-10" />
          
          {/* The Fill */}
          <div 
            className="h-full bg-secondary shadow-[0_0_20px_rgba(78,222,163,0.9)] relative flex items-center justify-end transition-all duration-100 ease-out" 
            style={{ width: `${progress}%` }}
          >
            <div className="w-1 h-full bg-white/40 blur-[1px]" />
          </div>

          {/* Percentage Text overlaid */}
          <div className="absolute inset-0 flex justify-center items-center z-20 pointer-events-none">
            <span className="font-label-numeric text-label-numeric text-on-surface drop-shadow-md">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
