import { expect, it, vi } from 'vitest';

import { createGame, updateGame } from './combat';
import { createEnemy, moveEnemy } from './enemy-movement';

vi.mock('./level', () => import('./test-level'));

it('patrol follows spawn, forward, spawn, backward even without sight', () => {
  const game = createGame();
  const enemy = createEnemy({ x: 6.5, y: 1.5, kind: 0, behavior: 'patrol', speed: 1 });
  const positions: number[] = [];
  for (let i = 0; i < 4; i++) {
    moveEnemy(enemy, game, 1, false);
    positions.push(enemy.x);
  }
  expect(positions).toEqual([7.5, 6.5, 5.5, 6.5]);
});
it('boss uses the same patrol modes as normal enemies', () => {
  const game = createGame();
  const boss = createEnemy({ x: 6.5, y: 9.5, kind: 3, speed: 1 });
  moveEnemy(boss, game, 1, true);
  expect(boss.x).toBe(7.5);
  moveEnemy(boss, game, 1, true);
  expect(boss.x).toBe(6.5);
});
it('paused level freezes enemies, projectiles, health and timers, then resumes', () => {
  const game = createGame();
  game.projectiles.push({ x: 1.8, y: 1.5, dx: -1, dy: 0, life: 4 });
  game.paused = true;
  const before = JSON.stringify(game);
  for (let i = 0; i < 120; i++)
    updateGame(game, { forward: true, backward: false, left: false, right: false }, 1 / 60, true);
  expect(JSON.stringify(game)).toBe(before);
  game.paused = false;
  updateGame(game, { forward: false, backward: false, left: false, right: false }, 0.04, false);
  expect(game.time).toBeGreaterThan(0);
  expect(game.health).toBeLessThan(100);
});
it('enemy overrides apply and walls block patrol movement', () => {
  const game = createGame();
  const enemy = createEnemy({ x: 1.5, y: 1.5, kind: 1, behavior: 'patrol', patrolAxis: 'y', speed: 1, health: 7 });
  expect(enemy.health).toBe(7);
  game.level[2] = '111111111111';
  moveEnemy(enemy, game, 1, false);
  expect(enemy.y).toBe(1.5);
});

it('patrol-stop freezes at detection and resumes when sight is lost', () => {
  const game = createGame();
  const enemy = createEnemy({ x: 6.5, y: 1.5, behavior: 'patrol-stop', speed: 1 });
  moveEnemy(enemy, game, 0.5, false);
  expect(enemy.x).toBe(7);
  moveEnemy(enemy, game, 1, true);
  expect(enemy.x).toBe(7);
  moveEnemy(enemy, game, 0.5, false);
  expect(enemy.x).toBe(7.5);
});
it('retreat backs up three cells and then stops', () => {
  const game = createGame();
  const enemy = createEnemy({ x: 4.5, y: 1.5, behavior: 'retreat', speed: 1 });
  for (let i = 0; i < 5; i++) moveEnemy(enemy, game, 1, true);
  expect(enemy.x).toBe(7.5);
  expect(enemy.retreatRemaining).toBe(0);
});
it.each(['chase', 'stationary', 'patrol', 'patrol-stop', 'retreat'] as const)(
  '%s shoots at a visible player',
  (behavior) => {
    const game = createGame();
    game.enemies = [createEnemy({ x: 4.5, y: 1.5, behavior, speed: 1 })];
    game.enemies[0].attackDelay = 0;
    updateGame(game, { forward: false, backward: false, left: false, right: false }, 0.02, false);
    expect(game.projectiles).toHaveLength(1);
    if (behavior === 'stationary' || behavior === 'patrol-stop') expect(game.enemies[0].x).toBe(4.5);
    if (behavior === 'chase') expect(game.enemies[0].x).toBeLessThan(4.5);
  },
);
it('rush closes in but never shoots', () => {
  const game = createGame();
  game.enemies = [createEnemy({ x: 4.5, y: 1.5, behavior: 'rush', speed: 1 })];
  game.enemies[0].attackDelay = 0;
  updateGame(game, { forward: false, backward: false, left: false, right: false }, 0.02, false);
  expect(game.enemies[0].x).toBeLessThan(4.5);
  expect(game.projectiles).toHaveLength(0);
});
