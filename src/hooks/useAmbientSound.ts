import { useCallback, useEffect, useRef, useState } from 'react';

export type AmbientSound = 'rain' | 'ocean' | 'forest' | 'white-noise';

interface AmbientSoundOption {
  id: AmbientSound;
  label: string;
  description: string;
}

export const AMBIENT_OPTIONS: AmbientSoundOption[] = [
  { id: 'rain', label: 'Yağmur', description: 'Yumuşak yağmur sesi' },
  { id: 'ocean', label: 'Okyanus', description: 'Dalga sesleri' },
  { id: 'forest', label: 'Orman', description: 'Kuş cıvıltıları ve rüzgar' },
  { id: 'white-noise', label: 'Beyaz Gürültü', description: 'Sakinleştirici sabit ses' },
];

export function useAmbientSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);
  const [currentSound, setCurrentSound] = useState<AmbientSound | null>(null);
  const [volume, setVolume] = useState(0.5);

  const stop = useCallback(() => {
    if (nodesRef.current) {
      nodesRef.current.stop();
      nodesRef.current = null;
    }
    setCurrentSound(null);
  }, []);

  const play = useCallback((sound: AmbientSound) => {
    if (nodesRef.current) {
      nodesRef.current.stop();
      nodesRef.current = null;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (!masterGainRef.current) {
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.connect(ctx.destination);
    }
    masterGainRef.current.gain.value = volume;
    const masterGain = masterGainRef.current;

    let cleanup: () => void;

    switch (sound) {
      case 'rain': {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = createNoiseBuffer(ctx, 2);
        noiseSource.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 1800;
        lowpass.Q.value = 0.5;

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 400;

        noiseSource.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(masterGain);
        noiseSource.start();

        cleanup = () => {
          noiseSource.stop();
          noiseSource.disconnect();
          highpass.disconnect();
          lowpass.disconnect();
        };
        break;
      }

      case 'ocean': {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = createNoiseBuffer(ctx, 3);
        noiseSource.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 600;
        lowpass.Q.value = 0.7;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.35;
        lfo.connect(lfoGain);
        lfoGain.connect(masterGain.gain);

        noiseSource.connect(lowpass);
        lowpass.connect(masterGain);
        noiseSource.start();
        lfo.start();

        cleanup = () => {
          noiseSource.stop();
          lfo.stop();
          noiseSource.disconnect();
          lowpass.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
        };
        break;
      }

      case 'forest': {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = createNoiseBuffer(ctx, 2);
        noiseSource.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 1200;

        noiseSource.connect(lowpass);
        lowpass.connect(masterGain);
        noiseSource.start();

        const chirpInterval = setInterval(() => {
          if (!audioCtxRef.current) return;
          const c = audioCtxRef.current;
          const osc = c.createOscillator();
          const g = c.createGain();
          const startFreq = 1500 + Math.random() * 1500;
          osc.frequency.setValueAtTime(startFreq, c.currentTime);
          osc.frequency.exponentialRampToValueAtTime(startFreq * 1.3, c.currentTime + 0.05);
          osc.frequency.exponentialRampToValueAtTime(startFreq * 0.8, c.currentTime + 0.1);
          g.gain.setValueAtTime(0, c.currentTime);
          g.gain.linearRampToValueAtTime(0.08, c.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
          osc.connect(g);
          g.connect(masterGain);
          osc.start();
          osc.stop(c.currentTime + 0.2);
        }, 800 + Math.random() * 2000);

        cleanup = () => {
          clearInterval(chirpInterval);
          noiseSource.stop();
          noiseSource.disconnect();
          lowpass.disconnect();
        };
        break;
      }

      case 'white-noise': {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = createNoiseBuffer(ctx, 2);
        noiseSource.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 800;

        noiseSource.connect(lowpass);
        lowpass.connect(masterGain);
        noiseSource.start();

        cleanup = () => {
          noiseSource.stop();
          noiseSource.disconnect();
          lowpass.disconnect();
        };
        break;
      }

      default:
        cleanup = () => {};
    }

    nodesRef.current = { stop: cleanup };
    setCurrentSound(sound);
  }, [volume]);

  const toggle = useCallback((sound: AmbientSound) => {
    if (currentSound === sound) {
      stop();
    } else {
      play(sound);
    }
  }, [currentSound, play, stop]);

  // Real-time volume control
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (nodesRef.current) {
        nodesRef.current.stop();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return { currentSound, volume, setVolume, play, stop, toggle };
}

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, sampleRate * seconds, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}
