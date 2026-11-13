import type { Enemy, Game } from './combat';
import { CONFIG } from './config';
import { ENEMY_TYPES } from './enemy-types';
import type { EnemyOptions } from './enemy-types';
import { isWall } from './world';

export function createEnemy(spawn: EnemyOptions & { x: number; y: number }): Enemy {
  const options = { ...ENEMY_TYPES[spawn.kind ?? 0], ...spawn };
  return {
    ...options,
    x: spawn.x,
    y: spawn.y,
    health: options.health ?? CONFIG.enemyHealth,
    attackDelay: 1.2,
    originX: spawn.x,
    originY: spawn.y,
    patrolStep: 0,
  };
}
function move(enemy: Enemy, game: Game, dx: number, dy: number): boolean {
  const x = enemy.x + dx;
  const y = enemy.y + dy;
  if ([-0.2, 0.2].some((ox) => [-0.2, 0.2].some((oy) => isWall(x + ox, y + oy, game.level)))) return false;
  enemy.x = x;
  enemy.y = y;
  return true;
}
function patrol(enemy: Enemy, game: Game, speed: number): void {
  const axis = enemy.patrolAxis ?? 'x';
  const origin = axis === 'x' ? enemy.originX ?? enemy.x : enemy.originY ?? enemy.y;
  const phase = enemy.patrolStep ?? 0;
  const target = origin + [1, 0, -1, 0][phase] * (enemy.patrolDistance ?? 1);
  const gap = target - enemy[axis];
  const step = Math.sign(gap) * Math.min(speed, Math.abs(gap));
  const moved = move(enemy, game, axis === 'x' ? step : 0, axis === 'y' ? step : 0);
  if (!moved || Math.abs(gap) <= speed) enemy.patrolStep = (phase + 1) % 4;
}

export function moveEnemy(enemy: Enemy, game: Game, delta: number, visible: boolean): void {
  const speed = (enemy.speed ?? CONFIG.enemySpeed) * delta;
  const mode = enemy.behavior ?? 'chase';
  if (mode === 'patrol' || (mode === 'patrol-stop' && !visible)) {
    patrol(enemy, game, speed);
    return;
  }
  if (!visible) {
    enemy.retreatRemaining = undefined;
    return;
  }
  const angle = Math.atan2(game.player.y - enemy.y, game.player.x - enemy.x);
  if (mode === 'retreat') {
    retreat(enemy, game, angle, speed);
  } else if (mode === 'chase' || mode === 'rush') {
    const distance = Math.hypot(game.player.x - enemy.x, game.player.y - enemy.y);
    const step = Math.min(speed, Math.max(0, distance - 0.6));
    move(enemy, game, Math.cos(angle) * step, Math.sin(angle) * step);
  }
}

function retreat(enemy: Enemy, game: Game, angle: number, speed: number): void {
  const remaining = enemy.retreatRemaining ?? enemy.retreatDistance ?? 3;
  const step = Math.min(speed, remaining);
  const moved = move(enemy, game, -Math.cos(angle) * step, -Math.sin(angle) * step);
  enemy.retreatRemaining = moved ? Math.max(0, remaining - step) : remaining;
}
