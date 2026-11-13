import type { EnemyOptions } from './enemy-types';

export const TILES = [
  '111111111111',
  '100000000101',
  '111110110001',
  '100000011101',
  '101001000001',
  '101000101011',
  '101000100001',
  '101110101101',
  '100000000001',
  '111011101111',
  '102001000201',
  '111100011111',
  '111111111111',
];

// Координаты от левого верхнего угла; .5 — центр клетки. Угол в радианах.
export const PLAYER_SPAWN = { x: 1.5, y: 1.5, angle: 0 };
export const EXIT = { x: 5.5, y: 11.5 };
export const BOSS_SPAWN = { x: 4.5, y: 6.5 };
export const ENEMIES: (EnemyOptions & { x: number; y: number })[] = [
  { x: 4.5, y: 1.5, kind: 1 },
  { x: 1.5, y: 6.5, kind: 1 },
  { x: 9.5, y: 2.5, kind: 0 },
  { x: 10.5, y: 7.5, kind: 0 },
  { x: 3.5, y: 8.5, kind: 0 },
  { x: 4.5, y: 10.5, kind: 2 },
  { x: 7.5, y: 10.5, kind: 2 },
];
export const ITEMS: { x: number; y: number; type: 'heal' | 'trophy' | 'laser' }[] = [
  { x: 10.5, y: 1.5, type: 'heal' },
  { x: 1.5, y: 8.5, type: 'heal' },
  { x: 6.5, y: 10.5, type: 'heal' },
  { x: 1.5, y: 10.5, type: 'trophy' },
  { x: 10.5, y: 10.5, type: 'laser' },
];
