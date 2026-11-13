import { expect, it, vi } from 'vitest';

import { createGame } from './combat';
import { updateProjectiles } from './projectiles';

vi.mock('./level', () => import('./test-level'));

it('a wall stops a projectile before it can hit the player', () => {
  const game = createGame();
  game.player = { x: 3.5, y: 3.5, angle: 0 };
  game.projectiles = [{ x: 3.5, y: 1.5, dx: 0, dy: 1, life: 4 }];
  updateProjectiles(game, 1);
  expect(game.projectiles).toHaveLength(0);
  expect(game.health).toBe(100);
});

it('a projectile damages once and disappears', () => {
  const game = createGame();
  game.projectiles = [{ x: 2, y: 1.5, dx: -1, dy: 0, life: 4 }];
  updateProjectiles(game, 0.2);
  expect(game.health).toBe(90);
  expect(game.projectiles).toHaveLength(0);
  updateProjectiles(game, 0.2);
  expect(game.health).toBe(90);
});
