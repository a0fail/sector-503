import { describe, expect, it, vi } from 'vitest';

import { createGame, hasSight, shoot, updateGame } from './combat';

vi.mock('./level', () => import('./test-level'));

const idle = { forward: false, backward: false, left: false, right: false };

describe('combat', () => {
  it('walls block sight and shots', () => {
    const game = createGame();
    game.player = { x: 3.5, y: 1.5, angle: Math.PI / 2 };
    game.enemies = [{ x: 3.5, y: 3.5, health: 2, attackDelay: 0 }];
    expect(hasSight(game.player, game.enemies[0])).toBe(false);
    shoot(game);
    expect(game.enemies[0].health).toBe(2);
  });
  it('hits only the nearest enemy and respects weapon cooldown', () => {
    const game = createGame();
    game.enemies = [3.5, 5.5].map((x) => ({ x, y: 1.5, health: 2, attackDelay: 0 }));
    shoot(game);
    shoot(game);
    expect(game.enemies.map((enemy) => enemy.health)).toEqual([1, 2]);
    expect(game.score).toBe(0);
  });
  it('awards a kill once and wins at the exit after clearing enemies', () => {
    const game = createGame();
    game.enemies = [{ x: 3.5, y: 1.5, health: 1, attackDelay: 0 }];
    shoot(game);
    expect(game.score).toBe(100);
    expect(game.sounds).toEqual(['kill']);
    expect(game.status).toBe('playing');
    game.player = { x: 10.5, y: 1.5, angle: 0 };
    updateGame(game, idle, 0.016, false);
    expect(game.status).toBe('won');
    shoot(game);
    expect(game.score).toBe(100);
  });
  it('loses at zero health and stops the simulation', () => {
    const game = createGame();
    game.health = 10;
    game.enemies = [{ x: 1.8, y: 1.5, health: 2, attackDelay: 0 }];
    updateGame(game, idle, 0.016, false);
    expect(game.health).toBe(0);
    expect(game.status).toBe('lost');
    updateGame(game, { ...idle, forward: true }, 0.04, true);
    expect(game.player.x).toBe(1.5);
    expect(game.enemies[0].health).toBe(2);
  });
});
