import React from "react";

interface RunStats {
  timeSurvived: number;
  enemiesKilled: number;
  soulsCollected: number;
  distanceTraveled: number;
  damageDealt: number;
}

interface GameOverProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  coinsEarned: number;
  xpEarned: number;
  runStats: RunStats | null;
  onRetry: () => void;
  onContinue: () => void;
  onShare: () => void;
  onOpenLeaderboard: () => void;
}

export default function GameOver({
  score,
  highScore,
  isNewRecord,
  coinsEarned,
  xpEarned,
  runStats,
  onRetry,
  onContinue,
  onShare,
  onOpenLeaderboard
}: GameOverProps) {
  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-background/90 flex flex-col items-center justify-start md:justify-center p-4 sm:p-6 overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
      
      {/* Background Image Overlay matching original design */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div 
          className="w-full h-full bg-cover bg-center opacity-45 filter grayscale brightness-50"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCytdRwTQm4BijW79ivA2Nz4O_wxehBfQa9UtFGcmq3DNQHjMvkPpVp6HPIRKPLxt6Ah2Q3sPZKaWY7iuA0xYEp-Q3HAngM5FtE3z4Onl6dd1BYC2iL67H3hTDRqsgoQyCN0rkqgyk02Hb8oKgruNvuiXVQ4m7LtxGr0GzA0wVYKcPC6ZCap3UL6qNO5usrf_jTbysLXzOcqBbVcUwBUWeIC8TjSLH6-UBS8MOHPccjGP6QKLn2yiwbVmcNx178b7YgUF9CcwRBu8s')" 
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#131313_100%)]" />
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-20 w-full max-w-xl flex flex-col items-center my-auto py-4 animate-float">
        
        {/* Heading */}
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-error gold-glow text-center mb-panel-padding tracking-widest uppercase font-bold text-shadow-[0_0_15px_rgba(255,180,171,0.6)]">
          Death Is Not The End
        </h1>

        {/* Results Panel */}
        <div className="glass-panel rounded-xl w-full p-panel-padding flex flex-col items-center relative overflow-hidden border border-primary/30">
          
          <div className="relative z-10 flex flex-col items-center w-full">
            
            {/* Score Section */}
            <div className="text-center mb-gutter">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1 font-semibold">
                Final Score
              </p>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span 
                  className="font-label-numeric text-primary text-4xl sm:text-5xl md:text-6xl gold-glow select-all font-bold" 
                  style={{ lineHeight: "1" }}
                >
                  {score.toLocaleString()}
                </span>
              </div>
              
              {/* Record Badge */}
              {isNewRecord ? (
                <div className="inline-flex items-center gap-2 bg-surface-container-highest/80 border border-secondary rounded-full px-4 py-1.5 emerald-glow mt-2">
                  <span className="material-symbols-outlined text-secondary text-sm font-bold">
                    workspace_premium
                  </span>
                  <span className="font-label-numeric text-label-numeric text-secondary text-sm tracking-wider font-bold">
                    NEW RECORD
                  </span>
                </div>
              ) : (
                <p className="font-label-numeric text-label-numeric text-on-surface-variant text-sm tracking-wider">
                  HIGH SCORE: {highScore.toLocaleString()}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-6" />

            {/* Rewards */}
            <div className="w-full flex justify-around mb-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border border-primary/50 mb-2 shadow-[0_0_10px_rgba(233,193,118,0.3)]">
                  <span className="material-symbols-outlined text-primary text-2xl font-bold">
                    monetization_on
                  </span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase font-semibold">Coins Earned</p>
                <p className="font-label-numeric text-label-numeric text-primary font-bold">+{coinsEarned}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border border-secondary/50 mb-2 shadow-[0_0_10px_rgba(78,222,163,0.3)]">
                  <span className="material-symbols-outlined text-secondary text-2xl font-bold">
                    star
                  </span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase font-semibold">XP Earned</p>
                <p className="font-label-numeric text-label-numeric text-secondary font-bold">+{xpEarned}</p>
              </div>
            </div>

            {/* Death Recap Stats */}
            {runStats && (
              <>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-4" />
              <div className="w-full grid grid-cols-2 gap-3 mb-4">
                <div className="glass-panel rounded-lg p-3 text-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-lg block mb-0.5">schedule</span>
                  <p className="font-label-numeric text-label-numeric text-primary text-sm font-bold">{Math.floor(runStats.timeSurvived)}s</p>
                  <p className="font-label-sm text-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Time</p>
                </div>
                <div className="glass-panel rounded-lg p-3 text-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary text-lg block mb-0.5">skull</span>
                  <p className="font-label-numeric text-label-numeric text-secondary text-sm font-bold">{runStats.enemiesKilled}</p>
                  <p className="font-label-sm text-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Slain</p>
                </div>
                <div className="glass-panel rounded-lg p-3 text-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-lg block mb-0.5">eco</span>
                  <p className="font-label-numeric text-label-numeric text-primary text-sm font-bold">{runStats.soulsCollected}</p>
                  <p className="font-label-sm text-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Souls</p>
                </div>
                <div className="glass-panel rounded-lg p-3 text-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary text-lg block mb-0.5">swords</span>
                  <p className="font-label-numeric text-label-numeric text-secondary text-sm font-bold">{Math.floor(runStats.damageDealt)}</p>
                  <p className="font-label-sm text-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Dmg</p>
                </div>
              </div>
              </>
            )}

            {/* Actions */}
            <div className="w-full flex flex-col gap-3 mt-4">
              {/* Retry Button */}
              <button
                onClick={onRetry}
                className="stone-button w-full py-4 rounded-lg flex items-center justify-center gap-2 group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="material-symbols-outlined text-primary group-hover:text-secondary transition-colors font-bold">
                  replay
                </span>
                <span className="font-headline-md text-headline-md text-primary group-hover:text-secondary tracking-widest uppercase transition-colors font-bold">
                  Retry
                </span>
              </button>

              {/* Continue / Back to Camp Button */}
              <button
                onClick={onContinue}
                className="w-full py-4 rounded-lg bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest hover:border-primary/50 transition-all flex items-center justify-center gap-2 cursor-pointer text-on-surface"
              >
                <span className="font-body-lg text-body-lg text-on-surface tracking-wide uppercase font-semibold">
                  Back To Camp
                </span>
                <span className="material-symbols-outlined text-on-surface text-sm font-bold">
                  arrow_forward
                </span>
              </button>

              {/* Social buttons */}
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={onShare}
                  className="flex-1 py-3 rounded-lg bg-transparent border border-outline-variant hover:bg-surface-variant/50 transition-colors flex items-center justify-center gap-2 cursor-pointer text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-sm font-bold">
                    share
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                    Share
                  </span>
                </button>
                
                <button
                  onClick={onOpenLeaderboard}
                  className="flex-1 py-3 rounded-lg bg-transparent border border-outline-variant hover:bg-surface-variant/50 transition-colors flex items-center justify-center gap-2 cursor-pointer text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-sm font-bold">
                    leaderboard
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                    Leaderboard
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
