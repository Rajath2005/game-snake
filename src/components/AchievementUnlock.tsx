import React from "react";

interface AchievementUnlockProps {
  onClaim: () => void;
}

export default function AchievementUnlock({ onClaim }: AchievementUnlockProps) {
  return (
    <div className="fixed inset-0 z-[120] w-full h-full bg-[#131313]/95 flex flex-col items-center justify-start md:justify-center p-4 sm:p-6 overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center opacity-30 blur-sm"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDdQaHfC-VSlUz_UtHcFd6ZUgfiFkrFABilWLXCzo2QxkqfekXnUXCgYzRE60W8rPdXNMN3e-518UeG6kEL1gfBv_pYrg8OycbxYuIxMrWx-YQ8R3fpczTjrEjsbYoca57hPA-NSi0OIYD7Cmnlixqaz5h7t68yjvH9Snv6ONfj70Cwjt6gO_zrzsFpdZfguJRq3i1wGQZeOCOj5czqVwwZxfy76ha0-pIjZvOkHKsZRRrhHd_2N8iTOVLbGnofL55rCR1VBHrnNTI')" 
          }}
        />
        <div className="absolute inset-0 bg-[#131313]/80 backdrop-blur-md" />
      </div>

      {/* Main Content Modal */}
      <div className="w-full max-w-2xl relative animate-float z-10 my-auto py-4">
        
        {/* Golden outer glow box */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/30 via-secondary/10 to-primary/30 rounded-xl blur-lg opacity-70 pointer-events-none" />

        {/* Content Container */}
        <div className="glass-panel rounded-xl p-panel-padding relative z-10 flex flex-col items-center text-center border-t border-primary/50">
          
          {/* Trophy Icon */}
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6 border-2 border-secondary shadow-[0_0_20px_rgba(78,222,163,0.4)]">
            <span className="material-symbols-outlined text-secondary text-5xl emerald-glow font-bold">
              workspace_premium
            </span>
          </div>

          {/* Titles */}
          <h2 className="font-label-numeric text-label-numeric text-primary tracking-[0.2em] mb-2 font-bold">
            ACHIEVEMENT UNLOCKED
          </h2>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6 font-bold leading-tight">
            Slayer of the Serpent King
          </h1>
          
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-8 leading-relaxed">
            You have successfully navigated the abyssal depths and vanquished the ancient terror. The realm breathes a sigh of relief.
          </p>

          {/* Rewards Section */}
          <div className="w-full bg-surface-container-high/80 rounded-lg p-6 mb-8 border border-outline-variant/30 text-left">
            <h3 className="font-headline-md text-headline-md text-primary mb-4 gold-glow border-b border-outline-variant/30 pb-2 font-bold tracking-wider">
              REWARDS COLLECTED
            </h3>
            
            <ul className="flex flex-col gap-3">
              {/* Gold reward */}
              <li className="flex items-center gap-4 p-3 hover:bg-surface-variant/50 rounded transition-colors group">
                <span className="material-symbols-outlined text-primary text-3xl font-bold">
                  toll
                </span>
                <div className="flex-1">
                  <p className="font-body-md text-body-md text-on-surface font-semibold">5,000 Gold Coins</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Standard Currency</p>
                </div>
              </li>

              {/* Crystal reward */}
              <li className="flex items-center gap-4 p-3 hover:bg-surface-variant/50 rounded transition-colors group">
                <span className="material-symbols-outlined text-secondary text-3xl emerald-glow font-bold">
                  diamond
                </span>
                <div className="flex-1">
                  <p className="font-body-md text-body-md text-on-surface font-semibold">Void Crystal</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Legendary Crafting Material</p>
                </div>
                <span className="px-2 py-1 bg-surface-container-lowest text-secondary font-label-numeric text-[10px] rounded border border-secondary/30 font-bold tracking-widest">
                  LEGENDARY
                </span>
              </li>

              {/* Epic weapon item */}
              <li className="flex items-center gap-4 p-3 hover:bg-surface-variant/50 rounded transition-colors group">
                <span className="material-symbols-outlined text-tertiary text-3xl font-bold">
                  swords
                </span>
                <div className="flex-1">
                  <p className="font-body-md text-body-md text-on-surface font-semibold">Serpent's Fang Dagger</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Weapon - Epic</p>
                </div>
                <span className="px-2 py-1 bg-surface-container-lowest text-tertiary font-label-numeric text-[10px] rounded border border-tertiary/30 font-bold tracking-widest">
                  EPIC ITEM
                </span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={onClaim}
            className="stone-button w-full md:w-auto px-12 py-4 rounded font-headline-md text-headline-md text-primary flex items-center justify-center gap-3 cursor-pointer group font-bold"
          >
            <span>CLAIM REWARDS</span>
            <span className="material-symbols-outlined group-hover:translate-x-1.5 transition-transform font-bold">
              arrow_forward
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}
