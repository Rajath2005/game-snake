import { GameSettings } from "../types";

class AudioManagerClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Cached noise buffer
  private noiseBuffer: AudioBuffer | null = null;

  // Sound settings
  private settings: GameSettings = {
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 80,
    brightness: 100,
    highFidelity: true,
    motionBlur: true,
    hapticFeedback: true,
    invertY: false,
    language: "en"
  };

  // Ambient sound states
  private windSource: AudioBufferSourceNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private fireSource: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private fireGain: GainNode | null = null;
  private ambientTimer: any = null;

  // BGM Sequencer state
  private musicInterval: any = null;
  private isBgmPlaying = false;
  private bgmState: "ambient" | "boss" | "victory" = "ambient";
  private currentStep = 0;
  private nextNoteTime = 0;
  private bpm = 80;

  constructor() {
    // Audio Context is lazily initialized on user interaction
  }

  /**
   * Initializes the AudioContext and configures all audio routing nodes.
   * Runs upon first user click/gesture to satisfy browser autoplay policies.
   */
  public init() {
    if (this.ctx) return;

    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master audio routing
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.connect(this.masterGain);

      // Create white noise buffer
      this.createNoiseBuffer();

      // Update initial node gains based on local settings
      this.applyGains();

      // Start continuous ambient synthesis loop
      this.startAmbience();

      // Start music sequencer
      this.startMusicSequencer();

      console.log("Audio system initialized successfully via Web Audio API.");
    } catch (err) {
      console.warn("Failed to initialize Web Audio API:", err);
    }
  }

  /**
   * Safe getter to verify AudioContext is running.
   */
  public resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  /**
   * Updates settings and real-time gain node levels.
   */
  public updateSettings(newSettings: GameSettings) {
    this.settings = {
      masterVolume: newSettings?.masterVolume ?? 80,
      musicVolume: newSettings?.musicVolume ?? 80,
      sfxVolume: newSettings?.sfxVolume ?? 80,
      cameraShake: newSettings?.cameraShake ?? true,
      visualEffects: newSettings?.visualEffects ?? "HIGH",
      showDamageNumbers: newSettings?.showDamageNumbers ?? true,
    };
    this.applyGains();
  }

  private applyGains() {
    if (!this.masterGain || !this.musicGain || !this.sfxGain || !this.ambientGain) return;

    // Convert percentages [0..100] to linear gain [0..1]
    const master = this.settings.masterVolume / 100;
    const music = this.settings.musicVolume / 100;
    const sfx = this.settings.sfxVolume / 100;

    this.masterGain.gain.setTargetAtTime(master, this.ctx!.currentTime, 0.05);
    this.musicGain.gain.setTargetAtTime(music, this.ctx!.currentTime, 0.05);
    this.sfxGain.gain.setTargetAtTime(sfx, this.ctx!.currentTime, 0.05);
    // Ambient sound scales with SFX/Master
    this.ambientGain.gain.setTargetAtTime(sfx * 0.4, this.ctx!.currentTime, 0.05);
  }

  /**
   * Generate 2 seconds of high quality white noise for procedural filters.
   */
  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  /* =========================================================================
     AMBIENT PROCEDURAL AUDIO GENERATION
     ========================================================================= */

  private startAmbience() {
    if (!this.ctx || !this.noiseBuffer || !this.ambientGain) return;

    // 1. HOWLING WIND NODE
    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.windGain.connect(this.ambientGain);

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);
    windFilter.frequency.setValueAtTime(400, this.ctx.currentTime);

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = this.noiseBuffer;
    windSource.loop = true;
    windSource.connect(windFilter);
    windFilter.connect(this.windGain);
    windSource.start();
    this.windSource = windSource;

    // Dynamic howling modulation via LFO
    const windLFO = this.ctx.createOscillator();
    windLFO.frequency.setValueAtTime(0.08, this.ctx.currentTime); // very slow cycle
    const windLFOGain = this.ctx.createGain();
    windLFOGain.gain.setValueAtTime(150, this.ctx.currentTime); // oscillate by +/- 150Hz
    windLFO.connect(windLFOGain);
    windLFOGain.connect(windFilter.frequency);
    windLFO.start();

    // 2. RAIN SOUND NODE
    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.rainGain.connect(this.ambientGain);

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = "bandpass";
    rainFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);
    rainFilter.frequency.setValueAtTime(2000, this.ctx.currentTime);

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = this.noiseBuffer;
    rainSource.loop = true;
    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    rainSource.start();
    this.rainSource = rainSource;

    // 3. FIRE CRACKLE NODE
    this.fireGain = this.ctx.createGain();
    this.fireGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.fireGain.connect(this.ambientGain);

    const fireLowFilter = this.ctx.createBiquadFilter();
    fireLowFilter.type = "lowpass";
    fireLowFilter.frequency.setValueAtTime(120, this.ctx.currentTime); // low rumble

    const fireSource = this.ctx.createBufferSource();
    fireSource.buffer = this.noiseBuffer;
    fireSource.loop = true;
    fireSource.connect(fireLowFilter);
    fireLowFilter.connect(this.fireGain);
    fireSource.start();
    this.fireSource = fireSource;

    // Active scheduling for randomized fire crackling sparks and forest bird chirps
    this.ambientTimer = setInterval(() => {
      this.playRandomCrackles();
      this.playRandomForestChirps();
    }, 150);
  }

  /**
   * Simulates dry wooden logs crackling with high-pass filtered bursts.
   */
  private playRandomCrackles() {
    if (!this.ctx || !this.fireGain || !this.ambientGain) return;
    // Only crackle if fire is active
    if (this.fireGain.gain.value < 0.05) return;

    // Random trigger chance
    if (Math.random() > 0.35) return;

    const time = this.ctx.currentTime;
    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(4000 + Math.random() * 3000, time);

    const gain = this.ctx.createGain();
    const duration = 0.005 + Math.random() * 0.02; // extremely short impulse
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.12 * Math.random(), time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    crackleSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    crackleSource.start(time);
    crackleSource.stop(time + duration + 0.05);
  }

  /**
   * Birds and whispers inside the deep enchanted woodlands.
   */
  private playRandomForestChirps() {
    if (!this.ctx || !this.windGain || !this.ambientGain) return;
    // Only play forest chirps if wind is on (forest ambient active)
    if (this.windGain.gain.value < 0.05) return;

    // Low chance (approx once every 7-8 seconds)
    if (Math.random() > 0.02) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.03 * Math.random(), time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);

    // Chirpy frequency sweep
    const startFreq = 1500 + Math.random() * 1000;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(startFreq + 1000, time + 0.15);
    osc.frequency.exponentialRampToValueAtTime(startFreq - 500, time + 0.35);

    osc.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(time);
    osc.stop(time + 0.45);
  }

  /**
   * Adjusts active loop volume based on Selected Biome/Area.
   */
  public setBiomeAmbience(biomeType: string) {
    this.resumeContext();
    if (!this.ctx || !this.windGain || !this.rainGain || !this.fireGain) return;

    const time = this.ctx.currentTime;

    switch (biomeType) {
      case "Haunted Forest":
        this.windGain.gain.setTargetAtTime(0.5, time, 1.0);
        this.rainGain.gain.setTargetAtTime(0.1, time, 1.0);
        this.fireGain.gain.setTargetAtTime(0.0, time, 1.0);
        break;
      case "Frozen Kingdom":
        this.windGain.gain.setTargetAtTime(0.8, time, 1.0); // Howling ice winds
        this.rainGain.gain.setTargetAtTime(0.0, time, 1.0);
        this.fireGain.gain.setTargetAtTime(0.0, time, 1.0);
        break;
      case "Volcanic Ruins":
        this.windGain.gain.setTargetAtTime(0.2, time, 1.0);
        this.rainGain.gain.setTargetAtTime(0.0, time, 1.0);
        this.fireGain.gain.setTargetAtTime(0.7, time, 1.0); // Extreme flames
        break;
      case "Poison Swamp":
        this.windGain.gain.setTargetAtTime(0.1, time, 1.0);
        this.rainGain.gain.setTargetAtTime(0.6, time, 1.0); // Thick constant rain
        this.fireGain.gain.setTargetAtTime(0.0, time, 1.0);
        break;
      case "Dragon Mountains":
      case "Abyss":
        this.windGain.gain.setTargetAtTime(0.6, time, 1.0);
        this.rainGain.gain.setTargetAtTime(0.2, time, 1.0);
        this.fireGain.gain.setTargetAtTime(0.3, time, 1.0);
        break;
      default:
        // Camp/Normal forest ambience
        this.windGain.gain.setTargetAtTime(0.3, time, 1.0);
        this.rainGain.gain.setTargetAtTime(0.0, time, 1.0);
        this.fireGain.gain.setTargetAtTime(0.2, time, 1.0);
        break;
    }
  }


  /* =========================================================================
     SOUND EFFECTS (SFX) SYNTHESIZERS
     ========================================================================= */

  /**
   * UI Click Sound
   */
  public playClick() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(450, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.06);
  }

  /**
   * Button Warm Confirmation beep
   */
  public playButton() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(550, time);
    osc.frequency.linearRampToValueAtTime(660, time + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(1000, time);

    osc.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  /**
   * Metallic FM strike for shields, blocks, or direct contact fangs.
   */
  public playMetalImpact() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const time = this.ctx.currentTime;

    // Carrier Oscillator
    const oscCar = this.ctx.createOscillator();
    oscCar.type = "triangle";
    oscCar.frequency.setValueAtTime(150, time);

    // Modulator Oscillator (Tuned inharmonically)
    const oscMod = this.ctx.createOscillator();
    oscMod.type = "sine";
    oscMod.frequency.setValueAtTime(370, time);

    // Modulator Gain (FM Index)
    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(250, time);
    modGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

    // Filter to clean high noise
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, time);

    oscMod.connect(modGain);
    modGain.connect(oscCar.frequency);

    oscCar.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    oscCar.start(time);
    oscMod.start(time);

    oscCar.stop(time + 0.2);
    oscMod.stop(time + 0.2);
  }

  /**
   * Magic sparkling energy (Cyclone, Slow spell trigger, dashboard upgrades).
   */
  public playMagic() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, time);
    osc.frequency.exponentialRampToValueAtTime(1800, time + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(700, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);

    // Simple delay feedback line
    const delay = this.ctx.createDelay();
    delay.delayTime.setValueAtTime(0.08, time);
    const delayGain = this.ctx.createGain();
    delayGain.gain.setValueAtTime(0.4, time);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    // Route gain through delay to sfx for shiny echo
    gain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.45);
  }

  /**
   * Sparkling crisp bell sound when vacuuming lost souls.
   */
  public playSoulCollection() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const time = this.ctx.currentTime;
    
    // Core high chime oscillator
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, time);
    osc.frequency.exponentialRampToValueAtTime(3200, time + 0.22);

    // FM Operator
    const fmOsc = this.ctx.createOscillator();
    fmOsc.type = "sine";
    fmOsc.frequency.setValueAtTime(2700, time);
    
    const fmGain = this.ctx.createGain();
    fmGain.gain.setValueAtTime(400, time);
    fmGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);

    fmOsc.connect(fmGain);
    fmGain.connect(osc.frequency);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    fmOsc.start(time);

    osc.stop(time + 0.3);
    fmOsc.stop(time + 0.3);
  }

  /**
   * Massive roaring sawtooth synthesizer with FM growl and high distortion.
   */
  public playDragonRoar() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const time = this.ctx.currentTime;

    // Sub base roaring oscillator
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(95, time);
    osc.frequency.linearRampToValueAtTime(45, time + 0.7);

    // Low rumble modulator
    const mod = this.ctx.createOscillator();
    mod.type = "sawtooth";
    mod.frequency.setValueAtTime(42, time);

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(75, time);

    // Add white noise for vocal fry
    const roarNoise = this.ctx.createBufferSource();
    roarNoise.buffer = this.noiseBuffer;
    const roarNoiseGain = this.ctx.createGain();
    roarNoiseGain.gain.setValueAtTime(0.22, time);
    roarNoiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);

    const roarNoiseFilter = this.ctx.createBiquadFilter();
    roarNoiseFilter.type = "bandpass";
    roarNoiseFilter.frequency.setValueAtTime(350, time);
    roarNoiseFilter.Q.setValueAtTime(1.5, time);

    // Main gain envelopes
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.65, time + 0.12);
    gain.gain.linearRampToValueAtTime(0.4, time + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);

    // Distortion wave shaper
    const shaper = this.ctx.createWaveShaper();
    shaper.curve = this.makeDistortionCurve(55);

    // High cut filter to avoid pain
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(550, time);

    mod.connect(modGain);
    modGain.connect(osc.frequency);

    osc.connect(shaper);
    shaper.connect(filter);
    filter.connect(gain);

    roarNoise.connect(roarNoiseFilter);
    roarNoiseFilter.connect(roarNoiseGain);
    roarNoiseGain.connect(gain);

    gain.connect(this.sfxGain);

    osc.start(time);
    mod.start(time);
    roarNoise.start(time);

    osc.stop(time + 0.85);
    mod.stop(time + 0.85);
    roarNoise.stop(time + 0.85);
  }

  private makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0 ; i < n_samples; ++i ) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }


  /* =========================================================================
     ADAPTIVE PROCEDURAL BACKGROUND MUSIC (BGM) ENGINE
     ========================================================================= */

  /**
   * Sets up the periodic clock scheduler for background music.
   */
  private startMusicSequencer() {
    this.nextNoteTime = 0;
    this.currentStep = 0;
    this.isBgmPlaying = true;

    // Fast-polling loop (runs every 100ms) to schedule steps ahead of time
    this.musicInterval = setInterval(() => {
      this.scheduler();
    }, 100);
  }

  private scheduler() {
    if (!this.ctx || !this.isBgmPlaying || !this.musicGain) return;

    const lookAhead = 0.2; // schedule notes 200ms in advance
    const time = this.ctx.currentTime;

    if (this.nextNoteTime === 0) {
      this.nextNoteTime = time + 0.05;
    }

    // Adapt tempo dynamically
    const currentBpm = this.bgmState === "boss" ? 132 : 80;
    const stepDuration = 60 / currentBpm / 4; // 16th notes duration

    while (this.nextNoteTime < time + lookAhead) {
      this.playSequencerStep(this.currentStep, this.nextNoteTime);
      this.nextNoteTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 16;
    }
  }

  /**
   * Synthesizes and schedules music notes on the current sequencer step.
   * Features dynamic accompaniment depending on "bgmState".
   */
  private playSequencerStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    if (this.bgmState === "victory") {
      // Short-circuit: play glorious fanfare notes and transition back
      this.playVictoryStep(step, time);
      return;
    }

    const isBoss = this.bgmState === "boss";

    // Chord progressions
    // Exploration (Ambient): A minor, F major, G major, E minor (4 bars)
    // Boss fight: A minor, Bb minor, A minor, G# minor (tense chromatic)
    const chordIndex = Math.floor(step / 4) % 4;
    const notesAmbient = [
      [110, 130.81, 164.81], // A min (A2, C3, E3)
      [87.31, 130.81, 174.61], // F maj (F2, C3, F3)
      [98.0, 146.83, 196.0],   // G maj (G2, D3, G3)
      [82.41, 123.47, 164.81]  // E min (E2, B2, E3)
    ];

    const notesBoss = [
      [110, 130.81, 164.81], // A min
      [116.54, 138.59, 174.61], // Bb min
      [110, 130.81, 164.81], // A min
      [103.83, 123.47, 155.56]  // G# min
    ];

    const activeChord = isBoss ? notesBoss[chordIndex] : notesAmbient[chordIndex];

    // 1. CHORD PADS (Play on step 0 and step 8 to form sweeping background pads)
    if (step === 0 || step === 8) {
      activeChord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq * (isBoss ? 2 : 1), time); // Higher register for boss pad

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0, time);
        // Soft attack
        gain.gain.linearRampToValueAtTime(0.06, time + 0.5);
        // Gradual decay
        gain.gain.setValueAtTime(0.06, time + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.0);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(isBoss ? 700 : 450, time);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(time);
        osc.stop(time + 2.1);
      });
    }

    // 2. DRIVING SYNTH BASSLINE (Intense 8th notes during boss fight)
    if (isBoss) {
      // Bass plays on steps: 0, 2, 4, 6, 8, 10, 12, 14 (8th notes)
      if (step % 2 === 0) {
        const baseRoot = activeChord[0]; // A2, Bb2, A2, G#2
        const osc = this.ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(baseRoot / 2, time); // Deep sub-octave (A1, etc)

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(250, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + 0.18);
      }
    }

    // 3. SPARKLY MELODY CHIMES (Arpeggios)
    // Exploration plays slow sparkling notes. Boss plays fast chaotic alarms.
    const arpChance = isBoss ? 0.6 : 0.25;
    const shouldArp = (isBoss && step % 2 !== 0) || (!isBoss && step % 4 === 0);

    if (shouldArp && Math.random() < arpChance) {
      // Pick a random note from the chord and pitch it up
      const rootNote = activeChord[Math.floor(Math.random() * activeChord.length)];
      const chimeFreq = rootNote * 4; // Pitch up by 2 octaves

      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(chimeFreq, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(isBoss ? 0.05 : 0.04, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + (isBoss ? 0.15 : 0.45));

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.5);
    }

    // 4. PROCEDURAL DRUM MACHINE (Intense beat during boss fights)
    if (isBoss) {
      // KICK: Beats 1 and 3 (Steps 0 and 8)
      if (step === 0 || step === 8) {
        const kickOsc = this.ctx.createOscillator();
        kickOsc.type = "sine";
        kickOsc.frequency.setValueAtTime(140, time);
        kickOsc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

        const kickGain = this.ctx.createGain();
        kickGain.gain.setValueAtTime(0.35, time);
        kickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);

        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);
        kickOsc.start(time);
        kickOsc.stop(time + 0.18);
      }

      // SNARE: Beats 2 and 4 (Steps 4 and 12)
      if (step === 4 || step === 12) {
        const snareSource = this.ctx.createBufferSource();
        snareSource.buffer = this.noiseBuffer;

        const snareFilter = this.ctx.createBiquadFilter();
        snareFilter.type = "highpass";
        snareFilter.frequency.setValueAtTime(1200, time);

        const snareGain = this.ctx.createGain();
        snareGain.gain.setValueAtTime(0.12, time);
        snareGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

        snareSource.connect(snareFilter);
        snareFilter.connect(snareGain);
        snareGain.connect(this.musicGain);

        snareSource.start(time);
        snareSource.stop(time + 0.16);
      }

      // HI-HAT: Upbeats (Steps 2, 6, 10, 14)
      if (step % 4 === 2) {
        const hatSource = this.ctx.createBufferSource();
        hatSource.buffer = this.noiseBuffer;

        const hatFilter = this.ctx.createBiquadFilter();
        hatFilter.type = "highpass";
        hatFilter.frequency.setValueAtTime(8000, time);

        const hatGain = this.ctx.createGain();
        hatGain.gain.setValueAtTime(0.04, time);
        hatGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

        hatSource.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(this.musicGain);

        hatSource.start(time);
        hatSource.stop(time + 0.06);
      }
    }
  }

  /**
   * Glorious major theme sequence for Victory Music.
   */
  private playVictoryStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    // Victory progression: C maj, F maj, G maj, C maj (magnificent brassy fanfares)
    const melody = [
      261.63, // C4
      329.63, // E4
      392.00, // G4
      523.25, // C5
      440.00, // A4
      523.25, // C5
      587.33, // D5
      783.99  // G5
    ];

    if (step % 2 === 0) {
      const idx = Math.floor(step / 2) % melody.length;
      const freq = melody[idx];

      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, time);

      // Mild vibrato
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(6, time);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(6, time);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      lfo.start(time);
      osc.start(time);

      lfo.stop(time + 0.4);
      osc.stop(time + 0.4);
    }

    // After completing 16 steps of fanfare, return to normal ambient explorer track
    if (step === 15) {
      this.bgmState = "ambient";
    }
  }

  /**
   * Toggles the background music intensity dynamically.
   */
  public setBgmState(state: "ambient" | "boss" | "victory") {
    this.resumeContext();
    this.bgmState = state;
    // Reset counter to align beats nicely
    this.currentStep = 0;
    this.nextNoteTime = this.ctx ? this.ctx.currentTime + 0.02 : 0;
  }

  /**
   * Destroys BGM scheduler to prevent CPU memory leaks.
   */
  public dispose() {
    this.isBgmPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
    }
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
    }
    if (this.ctx) {
      this.ctx.close();
    }
  }
}

export const AudioManager = new AudioManagerClass();
