import { CONFIG } from './config';

export type Behavior = 'patrol-stop' | 'chase' | 'stationary' | 'patrol' | 'retreat' | 'rush';
export interface EnemyOptions {
  kind?: number;
  health?: number;
  speed?: number;
  vision?: number;
  shotInterval?: number;
  behavior?: Behavior;
  patrolAxis?: 'x' | 'y';
  patrolDistance?: number;
  retreatDistance?: number;
  boss?: boolean;
}
export const ENEMY_TYPES: Array<EnemyOptions & { texture: string }> = [
  { texture: 'worm', behavior: 'patrol-stop', patrolAxis: 'x', patrolDistance: 1 },
  { texture: 'trojan', behavior: 'chase' },
  { texture: 'ransomware', behavior: 'stationary' },
  {
    texture: 'boss',
    behavior: 'patrol',
    health: CONFIG.bossHealth,
    speed: 1.1,
    shotInterval: CONFIG.bossShotInterval,
    patrolDistance: 1,
    patrolAxis: 'x',
  },
];
