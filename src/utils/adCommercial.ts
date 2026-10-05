// Nostalgic retro commercial presets and audio synthesizer

export interface AdPresetInfo {
  id: 'cybersoda' | 'retro_console' | 'megahits' | 'vintage_cereal';
  title: string;
  sponsorName: string;
  tagline: string;
  badge: string;
  primaryColor: string;
  secondaryColor: string;
  bulletPoints: string[];
  cta: string;
  estimatedDuration: number;
}

export const AD_PRESETS: Record<string, AdPresetInfo> = {
  cybersoda: {
    id: 'cybersoda',
    title: 'CyberSoda 2000™ - Extreme Citrus Fuel!',
    sponsorName: 'CyberSoda Laboratories Inc.',
    tagline: 'FEEL THE 2000s NEON VOLTAGE RUSH!',
    badge: '★ #1 ENERGY DRINK FOR 90S & 2000S GAMERS ★',
    primaryColor: '#00ff66',
    secondaryColor: '#00ccff',
    bulletPoints: [
      '⚡ 400% Extreme Natural Guarana & Citrus Fizz',
      '🎮 Tested & Approved by Pro Starcraft & Quake Champions',
      '💿 Free CD-ROM Game Demo Under Every 2-Liter Bottle Cap!',
    ],
    cta: 'Grab a Cold Can at Your Local Gas Station & Electronics Store!',
    estimatedDuration: 15,
  },
  retro_console: {
    id: 'retro_console',
    title: 'MegaBit 64™ - True 3D Polygonal Powerhouse!',
    sponsorName: 'MegaBit Entertainment System',
    tagline: 'ENTER THE THIRD DIMENSION OF INTERACTIVE ENTERTAINMENT',
    badge: '🔥 64-BIT ULTRA RISC GRAPHICS PROCESSOR 🔥',
    primaryColor: '#8b5cf6',
    secondaryColor: '#f59e0b',
    bulletPoints: [
      '🕹️ Mind-Blowing 3D Texture Mapping & Smooth 60 FPS',
      '🎵 16-Channel CD-Quality Stereo Surround Sound',
      '🏎️ Includes Turbo Rumble Pack & Dual Analog Controller!',
    ],
    cta: 'Only $199.99! In Stores Everywhere This Holiday Season!',
    estimatedDuration: 15,
  },
  megahits: {
    id: 'megahits',
    title: "Now That's What I Call Nostalgia! 2000s Mega Hits CD",
    sponsorName: 'RetroWave Music Group',
    tagline: '36 SMASH HITS ACROSS 2 COMPACT DISCS!',
    badge: '💿 AS SEEN ON LATE NIGHT TV COMMERCIALS 💿',
    primaryColor: '#ec4899',
    secondaryColor: '#3b82f6',
    bulletPoints: [
      '🎸 Featuring the Greatest 90s Alternative, Pop & Eurodance',
      '📦 Double Jewel Case + 24-Page Full Color Collector Booklet',
      '📞 Call 1-800-555-RETRO to Order with Free Bonus Cassette Tape!',
    ],
    cta: 'Call within the next 10 minutes to receive FREE shipping!',
    estimatedDuration: 15,
  },
  vintage_cereal: {
    id: 'vintage_cereal',
    title: 'Frosted Cyber Blasts™ Breakfast Cereal',
    sponsorName: 'Morning Crunch Corp.',
    tagline: 'PART OF A BALANCED SATURDAY MORNING CARTOON BREAKFAST!',
    badge: '🥣 FREE TOY SURPRISE INSIDE EVERY SPECIALLY MARKED BOX 🥣',
    primaryColor: '#ef4444',
    secondaryColor: '#fbbf24',
    bulletPoints: [
      '⭐ Marshmallow Stars, Rainbow Rings & Crunchy Sugar Shells',
      '👾 Free Holographic Scratch Sticker in Every Box',
      '🚀 Send 3 Proof-of-Purchase Box Tops to Win a Video Game Console!',
    ],
    cta: 'Look for the Neon Blue Box in the Cereal Aisle Today!',
    estimatedDuration: 15,
  },
};

/**
 * Play authentic nostalgic TV commercial jingle via Web Audio API
 */
export function playRetroAdJingle(presetId: string = 'cybersoda') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Master volume compressor
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.22, now);
    master.gain.linearRampToValueAtTime(0.01, now + 3.2);
    master.connect(ctx.destination);

    // Chords / Melody arpeggio
    const notes = [
      { f: 261.63, t: 0.0, d: 0.25 }, // C4
      { f: 329.63, t: 0.15, d: 0.25 }, // E4
      { f: 392.0, t: 0.3, d: 0.25 }, // G4
      { f: 523.25, t: 0.45, d: 0.4 }, // C5
      { f: 659.25, t: 0.7, d: 0.3 }, // E5
      { f: 783.99, t: 0.95, d: 0.6 }, // G5 (fanfare hit!)
      { f: 1046.5, t: 1.25, d: 0.9 }, // C6 high bell
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = presetId === 'retro_console' ? 'square' : presetId === 'megahits' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0, now + n.t);
      gain.gain.linearRampToValueAtTime(0.18, now + n.t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.1);
    });

    // Retro Brass synth bass sweep
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(130.81, now); // C3
    bass.frequency.exponentialRampToValueAtTime(65.41, now + 1.2); // C2 drop

    bassGain.gain.setValueAtTime(0.15, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    bass.connect(bassGain);
    bassGain.connect(master);

    bass.start(now);
    bass.stop(now + 2.1);

    setTimeout(() => {
      try {
        ctx.close();
      } catch (e) {}
    }, 4000);
  } catch (err) {
    // Non-blocking safe catch
  }
}
