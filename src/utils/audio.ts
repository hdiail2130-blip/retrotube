/**
 * Web Audio Synthesizer for iconic nostalgic OS and browser sound effects.
 * Synthesized completely client-side without external audio file dependencies.
 */

let fanAudioContext: AudioContext | null = null;
let fanNoiseNode: AudioBufferSourceNode | null = null;

export function playIEClick(enabled = true) {
  if (!enabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {
    // Audio gesture protection gracefully handled
  }
}

export function startPCFanSound(enabled = true) {
  if (!enabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    fanAudioContext = new AudioContextClass();
    const bufferSize = fanAudioContext.sampleRate * 4; // 4 seconds whir
    const buffer = fanAudioContext.createBuffer(1, bufferSize, fanAudioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    fanNoiseNode = fanAudioContext.createBufferSource();
    fanNoiseNode.buffer = buffer;

    const filter = fanAudioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, fanAudioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(900, fanAudioContext.currentTime + 1.2);
    filter.frequency.exponentialRampToValueAtTime(120, fanAudioContext.currentTime + 3.8);

    const gain = fanAudioContext.createGain();
    gain.gain.setValueAtTime(0.01, fanAudioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.16, fanAudioContext.currentTime + 1.0);
    gain.gain.linearRampToValueAtTime(0.001, fanAudioContext.currentTime + 3.9);

    fanNoiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(fanAudioContext.destination);

    fanNoiseNode.start(0);
  } catch (e) {
    // Graceful catch
  }
}

export function playMSNNudge(enabled = true) {
  if (!enabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130 + i * 45, now);

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.03 + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22 + i * 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Graceful catch
  }
}

export function playCashRegister(enabled = true) {
  if (!enabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Ding chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);

    // Ka-ching noise
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(3200, now + 0.06);
    osc2.frequency.setValueAtTime(2800, now + 0.12);

    gain2.gain.setValueAtTime(0.1, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.46);
  } catch (e) {
    // Silent
  }
}

export function playMcnFanfare(enabled = true) {
  if (!enabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.06, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.25);
    });
  } catch (e) {
    // Silent
  }
}

