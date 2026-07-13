import { useRef, useCallback } from 'react';

export function useClickSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Click sound - spring tension with strong vibrato
  const playSpringSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Main oscillators
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      
      // Gain nodes
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      const gain3 = ctx.createGain();
      const masterGain = ctx.createGain();

      // Connect
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);
      gain1.connect(masterGain);
      gain2.connect(masterGain);
      gain3.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Main pluck tone
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(700, now);
      osc1.frequency.exponentialRampToValueAtTime(150, now + 0.12);
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.35);
      
      // Harmonic
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1100, now);
      osc2.frequency.exponentialRampToValueAtTime(250, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(100, now + 0.25);

      // Sub bass
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(180, now);
      osc3.frequency.exponentialRampToValueAtTime(50, now + 0.2);

      // Envelopes
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.15, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      gain2.gain.setValueAtTime(0.18, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      gain3.gain.setValueAtTime(0.22, now);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      masterGain.gain.setValueAtTime(0.5, now);

      // Start oscillators
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.28);
      osc3.stop(now + 0.32);

      // STRONG VIBRATO - multiple LFOs for rich wobble
      const lfo1 = ctx.createOscillator();
      const lfo1Gain = ctx.createGain();
      lfo1.type = 'sine';
      lfo1.frequency.setValueAtTime(45, now);
      lfo1.frequency.linearRampToValueAtTime(12, now + 0.35);
      lfo1Gain.gain.setValueAtTime(80, now);
      lfo1Gain.gain.linearRampToValueAtTime(15, now + 0.35);
      lfo1.connect(lfo1Gain);
      lfo1Gain.connect(osc1.frequency);
      lfo1.start(now);
      lfo1.stop(now + 0.4);

      // Second LFO for more complexity
      const lfo2 = ctx.createOscillator();
      const lfo2Gain = ctx.createGain();
      lfo2.type = 'triangle';
      lfo2.frequency.setValueAtTime(60, now);
      lfo2.frequency.linearRampToValueAtTime(20, now + 0.3);
      lfo2Gain.gain.setValueAtTime(40, now);
      lfo2Gain.gain.linearRampToValueAtTime(8, now + 0.3);
      lfo2.connect(lfo2Gain);
      lfo2Gain.connect(osc2.frequency);
      lfo2.start(now);
      lfo2.stop(now + 0.35);

      // Amplitude vibrato for tremolo effect
      const lfo3 = ctx.createOscillator();
      const lfo3Gain = ctx.createGain();
      lfo3.type = 'sine';
      lfo3.frequency.setValueAtTime(35, now);
      lfo3.frequency.linearRampToValueAtTime(15, now + 0.3);
      lfo3Gain.gain.setValueAtTime(0.3, now);
      lfo3Gain.gain.linearRampToValueAtTime(0.1, now + 0.3);
      lfo3.connect(lfo3Gain);
      lfo3Gain.connect(masterGain.gain);
      lfo3.start(now);
      lfo3.stop(now + 0.35);

    } catch (err) {
      console.error('Error playing click sound:', err);
    }
  }, [getAudioContext]);

  // Enter sound - deep bass tension with heavy vibrato
  const playEnterSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Deep bass oscillators
      const bassOsc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const midOsc = ctx.createOscillator();
      const highOsc = ctx.createOscillator();
      
      // Gains
      const bassGain = ctx.createGain();
      const subGain = ctx.createGain();
      const midGain = ctx.createGain();
      const highGain = ctx.createGain();
      const masterGain = ctx.createGain();

      // Connect
      bassOsc.connect(bassGain);
      subOsc.connect(subGain);
      midOsc.connect(midGain);
      highOsc.connect(highGain);
      bassGain.connect(masterGain);
      subGain.connect(masterGain);
      midGain.connect(masterGain);
      highGain.connect(masterGain);
      masterGain.connect(ctx.destination);

      // DEEP bass tone - starts low, goes lower
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(120, now);
      bassOsc.frequency.exponentialRampToValueAtTime(45, now + 0.3);
      bassOsc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

      // Sub bass - very low rumble
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(60, now);
      subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.4);
      subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.7);

      // Mid tone for presence
      midOsc.type = 'triangle';
      midOsc.frequency.setValueAtTime(300, now);
      midOsc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      midOsc.frequency.exponentialRampToValueAtTime(50, now + 0.5);

      // High shimmer
      highOsc.type = 'sine';
      highOsc.frequency.setValueAtTime(600, now);
      highOsc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      highOsc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      // Envelopes - longer sustain for deep impact
      bassGain.gain.setValueAtTime(0.5, now);
      bassGain.gain.linearRampToValueAtTime(0.4, now + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.linearRampToValueAtTime(0.5, now + 0.15);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      midGain.gain.setValueAtTime(0.25, now);
      midGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      highGain.gain.setValueAtTime(0.15, now);
      highGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      masterGain.gain.setValueAtTime(0.6, now);

      // Start all
      bassOsc.start(now);
      subOsc.start(now);
      midOsc.start(now);
      highOsc.start(now);
      
      bassOsc.stop(now + 0.75);
      subOsc.stop(now + 0.85);
      midOsc.stop(now + 0.55);
      highOsc.stop(now + 0.4);

      // HEAVY VIBRATO on bass
      const lfo1 = ctx.createOscillator();
      const lfo1Gain = ctx.createGain();
      lfo1.type = 'sine';
      lfo1.frequency.setValueAtTime(25, now);
      lfo1.frequency.linearRampToValueAtTime(6, now + 0.6);
      lfo1Gain.gain.setValueAtTime(30, now);
      lfo1Gain.gain.linearRampToValueAtTime(8, now + 0.6);
      lfo1.connect(lfo1Gain);
      lfo1Gain.connect(bassOsc.frequency);
      lfo1.start(now);
      lfo1.stop(now + 0.7);

      // Sub vibrato - slower, deeper wobble
      const lfo2 = ctx.createOscillator();
      const lfo2Gain = ctx.createGain();
      lfo2.type = 'sine';
      lfo2.frequency.setValueAtTime(8, now);
      lfo2.frequency.linearRampToValueAtTime(3, now + 0.7);
      lfo2Gain.gain.setValueAtTime(15, now);
      lfo2Gain.gain.linearRampToValueAtTime(5, now + 0.7);
      lfo2.connect(lfo2Gain);
      lfo2Gain.connect(subOsc.frequency);
      lfo2.start(now);
      lfo2.stop(now + 0.8);

      // Amplitude tremolo
      const lfo3 = ctx.createOscillator();
      const lfo3Gain = ctx.createGain();
      lfo3.type = 'sine';
      lfo3.frequency.setValueAtTime(18, now);
      lfo3.frequency.linearRampToValueAtTime(5, now + 0.5);
      lfo3Gain.gain.setValueAtTime(0.25, now);
      lfo3Gain.gain.linearRampToValueAtTime(0.08, now + 0.5);
      lfo3.connect(lfo3Gain);
      lfo3Gain.connect(masterGain.gain);
      lfo3.start(now);
      lfo3.stop(now + 0.6);

    } catch (err) {
      console.error('Error playing enter sound:', err);
    }
  }, [getAudioContext]);

  return { playSpringSound, playEnterSound };
}
