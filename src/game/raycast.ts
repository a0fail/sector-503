import { isWall, LEVEL } from './world';
import type { Player } from './world';

export function castRay(player: Player, dx: number, dy: number, level = LEVEL) {
  const cell = { x: Math.floor(player.x), y: Math.floor(player.y) };
  const step = { x: dx < 0 ? -1 : 1, y: dy < 0 ? -1 : 1 };
  const delta = { x: Math.abs(1 / dx), y: Math.abs(1 / dy) };
  const next = {
    x: dx === 0 ? Infinity : (dx < 0 ? player.x - cell.x : cell.x + 1 - player.x) * delta.x,
    y: dy === 0 ? Infinity : (dy < 0 ? player.y - cell.y : cell.y + 1 - player.y) * delta.y,
  };
  let distance = 0;
  let side: 'x' | 'y' = 'x';
  // DDA: переходим сразу к ближайшей границе клетки, без приблизительных шагов.
  for (let count = 0; count < 64; count++) {
    side = next.x < next.y ? 'x' : 'y';
    distance = next[side];
    next[side] += delta[side];
    cell[side] += step[side];
    if (isWall(cell.x, cell.y, level)) break;
  }
  const along = side === 'x' ? player.y + dy * distance : player.x + dx * distance;
  return {
    cell,
    tile: level[cell.y]?.[cell.x],
    distance,
    side,
    textureX: along - Math.floor(along),
    flip: side === 'x' ? dx < 0 : dy > 0,
  };
}
