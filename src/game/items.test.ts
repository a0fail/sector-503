import { expect, it, vi } from 'vitest';

import { createGame, shoot } from './combat';
import { collectItems } from './items';
import { isWall } from './world';

vi.mock('./level', () => import('./test-level'));

it('opens the secret wall with a shot and resets it in a new game', () => {
  const game = createGame();
  game.player = { x: 3.5, y: 9.5, angle: Math.PI / 2 };
  expect(isWall(3, 10, game.level)).toBe(true);
  shoot(game);
  expect(isWall(3, 10, game.level)).toBe(false);
  expect(isWall(3, 10, createGame().level)).toBe(true);
});
it('keeps a medkit at full health, then heals once without exceeding maximum', () => {
  const game = createGame();
  game.player.x = 1.5;
  game.player.y = 5.5;
  collectItems(game);
  expect(game.items[0].taken).toBe(false);
  expect(game.sounds).toEqual([]);
  game.health = 90;
  collectItems(game);
  expect(game.health).toBe(100);
  expect(game.sounds).toEqual(['heal']);
  game.health = 80;
  collectItems(game);
  expect(game.health).toBe(80);
});
it('laser pickup spawns exactly one boss and laser deals two damage', () => {
  const game = createGame();
  game.player = { x: 8.5, y: 11.5, angle: 0 };
  collectItems(game);
  collectItems(game);
  expect(game.laser).toBe(true);
  expect(game.sounds).toEqual(['weapon']);
  expect(game.enemies.filter((enemy) => enemy.boss)).toHaveLength(1);
  expect(game.enemies[5].health).toBe(12);
  game.player = { x: 1.5, y: 1.5, angle: 0 };
  shoot(game);
  expect(game.enemies[0].health).toBe(0);
});
it('trophy is awarded once and reset does not carry items or weapons over', () => {
  const game = createGame();
  game.player = { x: 3.5, y: 11.5, angle: 0 };
  collectItems(game);
  collectItems(game);
  expect(game.score).toBe(200);
  expect(game.sounds).toEqual(['trophy']);
  const fresh = createGame();
  expect(fresh.laser).toBe(false);
  expect(fresh.items.every((item) => !item.taken)).toBe(true);
  expect(fresh.enemies).toHaveLength(5);
});
