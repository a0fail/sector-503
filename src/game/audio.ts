import { SOUND_FILES, AUDIO_CONFIG } from './sound-config';
import type { SoundName } from './sound-config';

export interface GameAudio {
  unlock: () => void;
  play: (sound: SoundName) => void;
  close: () => void;
  stop: () => void;
  music: (enabled: boolean) => void;
}

export function createAudio(): GameAudio {
  let context: AudioContext | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let note = 0;
  let track: HTMLAudioElement | null = null;
  let wantsMusic = false;
  const buffers = new Map<SoundName, AudioBuffer>();
  let loading = false;
  const active = new Set<AudioScheduledSourceNode>();

  function loadEffects() {
    if (loading || !context) return;
    loading = true;
    const audioContext = context;
    (Object.keys(SOUND_FILES) as SoundName[]).forEach((name) => {
      const path = SOUND_FILES[name];
      if (!path) return;
      fetch(path)
        .then((response) => {
          if (!response.ok) throw new Error('Audio unavailable');
          return response.arrayBuffer();
        })
        .then((bytes) => audioContext.decodeAudioData(bytes))
        .then((buffer) => {
          buffers.set(name, buffer);
        })
        .catch(() => undefined);
    });
  }

  function unlock() {
    try {
      if (!context) context = new AudioContext();
      loadEffects();
      if (context.state === 'suspended') context.resume().catch(() => undefined);
    } catch {
      // Если браузер не поддерживает звук, игра остаётся работоспособной.
    }
  }

  function playBuffer(buffer: AudioBuffer) {
    if (!context) return;
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = AUDIO_CONFIG.effectVolume;
    source.connect(gain);
    gain.connect(context.destination);
    active.add(source);
    source.start();
    source.onended = () => {
      active.delete(source);
      source.disconnect();
      gain.disconnect();
    };
  }

  function play(sound: SoundName) {
    if (!context || context.state !== 'running') return;
    const buffer = buffers.get(sound);
    if (buffer) {
      playBuffer(buffer);
      return;
    }
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    const time = context.currentTime;
    const frequency = { shot: 150, hurt: 70, win: 440, kill: 260, heal: 660, trophy: 880, weapon: 330 }[sound];
    oscillator.type = ['win', 'heal', 'trophy', 'weapon'].includes(sound) ? 'sine' : 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(
      { shot: 30, hurt: 30, kill: 30, win: 440, heal: 990, trophy: 1320, weapon: 495 }[sound],
      time + 0.15,
    );
    volume.gain.setValueAtTime(0.001, time);
    volume.gain.linearRampToValueAtTime(0.06 * AUDIO_CONFIG.effectVolume, time + 0.015);
    volume.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    oscillator.connect(volume);
    volume.connect(context.destination);
    active.add(oscillator);
    oscillator.start(time);
    oscillator.stop(time + 0.2);
    oscillator.onended = () => {
      active.delete(oscillator);
      oscillator.disconnect();
      volume.disconnect();
    };
  }

  function music(enabled: boolean) {
    wantsMusic = enabled;
    if (track) track.pause();
    if (timer) clearInterval(timer);
    timer = null;
    if (!enabled) return;
    if (AUDIO_CONFIG.music) {
      if (!track) {
        track = new Audio(AUDIO_CONFIG.music);
        track.loop = true;
      }
      track.volume = AUDIO_CONFIG.musicVolume;
      track.play().catch(() => {
        if (wantsMusic) startSynthMusic();
      });
      return;
    }
    startSynthMusic();
  }

  function startSynthMusic() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (!context || context.state !== 'running') return;
      const melody = [
        110, 164.81, 220, 164.81, 130.81, 196, 261.63, 196, 98, 146.83, 196, 146.83, 123.47, 164.81, 246.94, 164.81,
      ];
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = melody[note % melody.length];
      note += 1;
      gain.gain.setValueAtTime(0.125 * AUDIO_CONFIG.musicVolume, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.24);
      oscillator.connect(gain);
      gain.connect(context.destination);
      active.add(oscillator);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.25);
      oscillator.onended = () => {
        active.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
    }, 270);
  }

  function stop() {
    music(false);
    active.forEach((source) => {
      try {
        source.stop();
      } catch {
        /* Уже завершён. */
      }
    });
    active.clear();
  }

  return {
    stop,
    music,
    unlock,
    play,
    close: () => {
      stop();
      if (context) context.close().catch(() => undefined);
      context = null;
    },
  };
}
