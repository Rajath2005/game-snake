import React from "react";
import { GameSettings, INITIAL_SETTINGS } from "../types";
import { AudioManager } from "../lib/audio";

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onClose: () => void;
  onReplayOnboarding?: () => void;
}

export default function SettingsScreen({ settings, onUpdateSettings, onClose, onReplayOnboarding }: SettingsScreenProps) {
  const handleChange = (key: keyof GameSettings, value: any) => {
    onUpdateSettings({
      ...settings,
      [key]: value
    });
  };

  const handleRestoreDefaults = () => {
    onUpdateSettings({ ...INITIAL_SETTINGS });
    // Play quick deep vibration sound if any
  };

  return (
    <div className="h-full w-full bg-[#131313] text-[#e5e2e1] flex flex-col relative overflow-y-auto pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#2a2a2a_0%,_transparent_60%)] pointer-events-none z-0" />

      {/* Top App Bar */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-margin-edge bg-surface-dim/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-md h-16 flex-shrink-0 pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center">
          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant hover:border-primary hover:text-primary transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5)] group cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(233,193,118,0.8)] transition-all">
              close
            </span>
          </button>
        </div>
        <h1 className="font-headline-md text-base sm:text-headline-md text-primary drop-shadow-[0_0_10px_rgba(233,193,118,0.5)] absolute left-1/2 -translate-x-1/2 uppercase tracking-widest font-bold">
          SETTINGS
        </h1>
        <div>
          <button
            onClick={onClose}
            className="font-label-numeric text-label-numeric text-on-surface-variant hover:text-secondary hover:scale-105 transition-all cursor-pointer font-bold"
          >
            SAVE
          </button>
        </div>
      </header>

      {/* Main Settings Form Container */}
      <main className="w-full max-w-2xl px-4 md:px-gutter mt-6 mb-10 flex flex-col gap-panel-padding relative z-10 mx-auto">
        
        {/* Audio Section */}
        <section className="glass-panel rounded-xl p-panel-padding flex flex-col gap-gutter border border-primary/20">
          <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-4">
            <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_8px_rgba(233,193,118,0.5)]">
              volume_up
            </span>
            <h2 className="font-headline-md text-headline-md text-primary">Audio</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            {/* Master Volume */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-body-md text-body-md text-on-surface">Master Volume</label>
                <span className="font-label-numeric text-label-numeric text-primary">{settings.masterVolume}%</span>
              </div>
              <div className="cleft-input p-2 rounded-lg flex items-center h-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.masterVolume}
                  onChange={(e) => handleChange("masterVolume", parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1"
                />
              </div>
            </div>

            {/* Music Volume */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-body-md text-body-md text-on-surface">Music</label>
                <span className="font-label-numeric text-label-numeric text-primary">{settings.musicVolume}%</span>
              </div>
              <div className="cleft-input p-2 rounded-lg flex items-center h-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.musicVolume}
                  onChange={(e) => handleChange("musicVolume", parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1"
                />
              </div>
            </div>

            {/* SFX Volume */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-body-md text-body-md text-on-surface">Effects (SFX)</label>
                <span className="font-label-numeric text-label-numeric text-primary">{settings.sfxVolume}%</span>
              </div>
              <div className="cleft-input p-2 rounded-lg flex items-center h-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sfxVolume}
                  onChange={(e) => handleChange("sfxVolume", parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Visuals Section */}
        <section className="glass-panel rounded-xl p-panel-padding flex flex-col gap-gutter border border-primary/20">
          <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-4">
            <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_8px_rgba(233,193,118,0.5)]">
              visibility
            </span>
            <h2 className="font-headline-md text-headline-md text-primary">Visuals</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            {/* Brightness / Gamma */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-body-md text-body-md text-on-surface">Gamma / Brightness</label>
                <span className="font-label-numeric text-label-numeric text-primary">{settings.brightness}%</span>
              </div>
              <div className="cleft-input p-2 rounded-lg flex items-center h-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.brightness}
                  onChange={(e) => handleChange("brightness", parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1"
                />
              </div>
            </div>

            {/* High Fidelity Textures Toggle */}
            <div className="flex justify-between items-center py-2">
              <div className="flex flex-col pr-4">
                <label className="font-body-md text-body-md text-on-surface">High Fidelity Textures</label>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  May impact performance on older scrying devices.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange("highFidelity", !settings.highFidelity)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  settings.highFidelity ? "bg-secondary-container" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.highFidelity ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Motion Blur Toggle */}
            <div className="flex justify-between items-center py-2">
              <div className="flex flex-col pr-4">
                <label className="font-body-md text-body-md text-on-surface">Motion Blur</label>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Smooths rapid camera movements.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange("motionBlur", !settings.motionBlur)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  settings.motionBlur ? "bg-secondary-container" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.motionBlur ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Gameplay Section */}
        <section className="glass-panel rounded-xl p-panel-padding flex flex-col gap-gutter border border-primary/20">
          <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-4">
            <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_8px_rgba(233,193,118,0.5)]">
              gamepad
            </span>
            <h2 className="font-headline-md text-headline-md text-primary">Gameplay</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            {/* Vibration/Haptic Toggle */}
            <div className="flex justify-between items-center py-2">
              <div className="flex flex-col pr-4">
                <label className="font-body-md text-body-md text-on-surface">Haptic Feedback</label>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Enable physical resonance in controller.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange("hapticFeedback", !settings.hapticFeedback)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  settings.hapticFeedback ? "bg-secondary-container" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.hapticFeedback ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Invert Y Axis */}
            <div className="flex justify-between items-center py-2">
              <div className="flex flex-col pr-4">
                <label className="font-body-md text-body-md text-on-surface">Invert Look (Y-Axis)</label>
              </div>
              <button
                type="button"
                onClick={() => handleChange("invertY", !settings.invertY)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  settings.invertY ? "bg-secondary-container" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.invertY ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* General Options Section */}
        <section className="glass-panel rounded-xl p-panel-padding flex flex-col gap-gutter border border-primary/20">
          <div className="flex items-center gap-3 border-b border-outline-variant/50 pb-4">
            <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_8px_rgba(233,193,118,0.5)]">
              settings
            </span>
            <h2 className="font-headline-md text-headline-md text-primary">General</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Language Selection */}
            <button className="flex justify-between items-center p-4 bg-surface-container-high border border-outline-variant rounded-lg hover:border-primary group transition-colors cursor-pointer text-left">
              <span className="font-body-md text-body-md text-on-surface">Language</span>
              <div className="flex items-center gap-2">
                <span className="font-label-numeric text-label-numeric text-primary">EN</span>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                  chevron_right
                </span>
              </div>
            </button>

            {/* Replay Onboarding */}
            {onReplayOnboarding && (
              <button
                type="button"
                onClick={() => {
                  AudioManager.playMagic();
                  onReplayOnboarding();
                }}
                className="w-full py-4 bg-surface-container-high border border-primary/40 rounded-lg text-primary font-headline-md text-headline-md hover:bg-primary/15 hover:border-primary transition-all hover:shadow-[0_0_15px_rgba(233,193,118,0.2)] cursor-pointer tracking-wider flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">school</span>
                REPLAY INTERACTIVE ONBOARDING
              </button>
            )}

            {/* Restore Defaults */}
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="w-full py-4 mt-4 bg-surface-container-lowest border border-error/50 rounded-lg text-error font-headline-md text-headline-md hover:bg-error-container/20 hover:border-error transition-all hover:shadow-[0_0_15px_rgba(255,180,171,0.2)] cursor-pointer tracking-wider"
            >
              RESTORE ANCIENT DEFAULTS
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
