import { expect, it } from 'vitest';

import { TILES, PLAYER_SPAWN, EXIT, ENEMIES, ITEMS, BOSS_SPAWN } from './level';

function reachable(secrets: boolean): Set<string> {
  const queue = [[Math.floor(PLAYER_SPAWN.x), Math.floor(PLAYER_SPAWN.y)]];
  const seen = new Set<string>();
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    const key = `${x},${y}`;
    const tile = TILES[y]?.[x];
    if (seen.has(key) || (tile !== '0' && !(secrets && tile === '2'))) continue;
    seen.add(key);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return seen;
}
it('has a rectangular map enclosed by solid walls', () => {
  expect(TILES.length).toBeGreaterThan(2);
  TILES.forEach((row) => {
    expect(row.length).toBe(TILES[0].length);
    expect(row).toMatch(/^[012]+$/);
    expect(row[0]).toBe('1');
    expect(row[row.length - 1]).toBe('1');
  });
  expect(TILES[0]).toMatch(/^1+$/);
  expect(TILES[TILES.length - 1]).toMatch(/^1+$/);
});
it('places every actor, item and exit on a reachable floor tile', () => {
  const seen = reachable(true);
  [PLAYER_SPAWN, EXIT, BOSS_SPAWN, ...ENEMIES, ...ITEMS].forEach(({ x, y }) => {
    expect(TILES[Math.floor(y)]?.[Math.floor(x)]).toBe('0');
    expect(seen.has(`${Math.floor(x)},${Math.floor(y)}`)).toBe(true);
  });
});
it('allows reaching enemies and the exit without opening the optional secrets', () => {
  const seen = reachable(false);
  [EXIT, ...ENEMIES].forEach(({ x, y }) => {
    expect(seen.has(`${Math.floor(x)},${Math.floor(y)}`)).toBe(true);
  });
  ITEMS.filter((item) => item.type !== 'heal').forEach(({ x, y }) => {
    expect(seen.has(`${Math.floor(x)},${Math.floor(y)}`)).toBe(false);
  });
});
