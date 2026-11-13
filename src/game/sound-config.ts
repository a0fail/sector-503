export type SoundName = 'shot' | 'hurt' | 'win' | 'kill' | 'heal' | 'trophy' | 'weapon';

// null = встроенный синтез. Свой файл: '/audio/kill.mp3' (лежит в public/audio).
export const SOUND_FILES: Record<SoundName, string | null> = {
  shot: null,
  hurt: null,
  win: null,
  kill: null,
  heal: null,
  trophy: null,
  weapon: null,
};
export const AUDIO_CONFIG: { music: string | null; effectVolume: number; musicVolume: number } = {
  music: null,
  effectVolume: 0.5,
  musicVolume: 0.2,
};
