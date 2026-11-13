import { CONFIG } from './config';
import { createEnemy, moveEnemy } from './enemy-movement';
import type { EnemyOptions } from './enemy-types';
import { collectItems, createItems } from './items';
import type { Item } from './items';
import { ENEMIES, EXIT } from './level';
import { updateProjectiles } from './projectiles';
import type { Projectile } from './projectiles';
import { castRay } from './raycast';
import type { SoundName } from './sound-config';
import { createPlayer, isWall, movePlayer, LEVEL } from './world';
import type { Controls, Player } from './world';

export interface Enemy extends EnemyOptions {
  originX?: number;
  originY?: number;
  patrolStep?: number;
  retreatRemaining?: number;
  x: number;
  y: number;
  health: number;
  attackDelay: number;
  kind?: number;
  shotFlash?: number;
  boss?: boolean;
}
export interface Game {
  player: Player;
  level: string[];
  items: Item[];
  laser: boolean;
  message: string;
  time: number;
  sounds: SoundName[];
  paused: boolean;
  enemies: Enemy[];
  projectiles: Projectile[];
  health: number;
  score: number;
  shotDelay: number;
  flash: number;
  hurt: number;
  status: 'playing' | 'won' | 'lost';
}

export function createGame(): Game {
  return {
    player: createPlayer(),
    level: [...LEVEL],
    items: createItems(),
    laser: false,
    message: 'Очисти сектор и вернись к зелёному выходу на карте. Тёмные панели можно разрушить.',
    time: 0,
    sounds: [],
    paused: false,
    enemies: ENEMIES.map(createEnemy),
    projectiles: [],
    health: CONFIG.playerHealth,
    score: 0,
    shotDelay: 0,
    flash: 0,
    hurt: 0,
    status: 'playing',
  };
}

export function hasSight(from: { x: number; y: number }, to: { x: number; y: number }, level = LEVEL): boolean {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const steps = Math.ceil(Math.hypot(dx, dy) / 0.04);
  for (let step = 1; step <= steps; step++) {
    if (isWall(from.x + (dx * step) / steps, from.y + (dy * step) / steps, level)) return false;
  }
  return true;
}

export function shoot(game: Game): void {
  if (game.paused || game.status !== 'playing' || game.shotDelay > 0) return;
  game.shotDelay = CONFIG.shotInterval;
  game.flash = 0.1;
  const { player } = game;
  let target: Enemy | null = null;
  let closest = CONFIG.shotRange;
  for (let index = 0; index < game.enemies.length; index++) {
    const enemy = game.enemies[index];
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const forward = dx * Math.cos(player.angle) + dy * Math.sin(player.angle);
    const sideways = Math.abs(dy * Math.cos(player.angle) - dx * Math.sin(player.angle));
    if (enemy.health > 0 && forward > 0 && forward < closest && sideways < 0.3 && hasSight(player, enemy, game.level)) {
      target = enemy;
      closest = forward;
    }
  }
  if (target) {
    target.health = Math.max(0, target.health - (game.laser ? 2 : 1));
    if (target.health === 0) {
      game.score += CONFIG.killScore;
      game.sounds.push('kill');
    }
  }
  if (!target) breakSecretWall(game);
}

function breakSecretWall(game: Game): void {
  const { player } = game;
  const hit = castRay(player, Math.cos(player.angle), Math.sin(player.angle), game.level);
  if (hit.tile !== '2' || hit.distance >= CONFIG.shotRange) return;
  const row = game.level[hit.cell.y];
  game.level[hit.cell.y] = `${row.slice(0, hit.cell.x)}0${row.slice(hit.cell.x + 1)}`;
  game.message = 'Скрытая панель разрушена. Внутри что-то есть!';
}

function updateEnemy(game: Game, enemy: Enemy, delta: number): void {
  if (enemy.health <= 0) return;
  enemy.shotFlash = Math.max(0, (enemy.shotFlash ?? 0) - delta);
  enemy.attackDelay = Math.max(0, enemy.attackDelay - delta);
  let distance = Math.hypot(game.player.x - enemy.x, game.player.y - enemy.y);
  const visible = hasSight(enemy, game.player, game.level) && distance <= (enemy.vision ?? CONFIG.enemyVision);
  moveEnemy(enemy, game, delta, visible);
  if (!visible || !hasSight(enemy, game.player, game.level)) return;
  distance = Math.hypot(game.player.x - enemy.x, game.player.y - enemy.y);
  if (enemy.behavior !== 'rush' && distance > 0.65 && enemy.attackDelay === 0) {
    const angle = Math.atan2(game.player.y - enemy.y, game.player.x - enemy.x);
    game.projectiles.push({ x: enemy.x, y: enemy.y, dx: Math.cos(angle), dy: Math.sin(angle), life: 4 });
    enemy.attackDelay = enemy.shotInterval ?? (enemy.boss ? CONFIG.bossShotInterval : CONFIG.enemyShotInterval);
    enemy.shotFlash = 0.2;
  }
  if (distance <= 0.65 && enemy.attackDelay === 0) {
    game.health = Math.max(0, game.health - CONFIG.enemyDamage);
    game.hurt = 0.2;
    enemy.attackDelay = CONFIG.enemyAttackInterval;
    if (game.health === 0) game.status = 'lost';
  }
}

export function updateGame(game: Game, controls: Controls, delta: number, firing: boolean): void {
  game.sounds = [];
  if (game.paused || game.status !== 'playing') return;
  game.shotDelay = Math.max(0, game.shotDelay - delta);
  game.flash = Math.max(0, game.flash - delta);
  game.hurt = Math.max(0, game.hurt - delta);
  game.time += delta;
  movePlayer(game.player, controls, delta, game.level);
  collectItems(game);
  if (firing) shoot(game);
  if (game.status === 'playing') game.enemies.forEach((enemy) => updateEnemy(game, enemy, delta));
  if (game.status === 'playing') updateProjectiles(game, delta);
  if (
    game.status === 'playing' &&
    game.enemies.every((enemy) => enemy.health <= 0) &&
    Math.hypot(game.player.x - EXIT.x, game.player.y - EXIT.y) < 0.45
  )
    game.status = 'won';
}
