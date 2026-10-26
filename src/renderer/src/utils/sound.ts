// Web Audio API Sound Synthesizer for Apple-style Timer Chimes
// Zero dependencies, works offline and inside Electron without external audio files.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays Apple-inspired warm melodic chime (Radar/Bell harmonic chime)
 */
export function playAppleTimerChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Harmonic bell frequencies (E5 -> G#5 -> B5 -> E6 arpeggiated chime)
    const notes = [
      { freq: 659.25, time: 0.0, duration: 0.8 },   // E5
      { freq: 830.61, time: 0.15, duration: 0.8 },  // G#5
      { freq: 987.77, time: 0.3, duration: 1.0 },   // B5
      { freq: 1318.51, time: 0.48, duration: 1.6 }  // E6
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Subtle harmonic overtone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.001, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.28, now + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.duration + 0.1);
    });

    // Second chime wave for Apple Radar reverberation
    const secondWaveOffset = 0.85;
    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + secondWaveOffset + note.time);

      gain.gain.setValueAtTime(0.001, now + secondWaveOffset + note.time);
      gain.gain.exponentialRampToValueAtTime(0.22, now + secondWaveOffset + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + secondWaveOffset + note.time + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + secondWaveOffset + note.time);
      osc.stop(now + secondWaveOffset + note.time + note.duration + 0.1);
    });
  } catch (err) {
    console.warn('Audio playback not permitted or failed:', err);
  }
}

/**
 * Plays Apple-style subtle button tap click
 */
export function playAppleButtonTap(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Silent fail if audio disabled
  }
}
