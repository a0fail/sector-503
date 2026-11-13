import { CONFIG } from './config';
import { TILES, PLAYER_SPAWN } from './level';

export const LEVEL = TILES;

export interface Player {
  x: number;
  y: number;
  angle: number;
}

export interface Controls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export function createPlayer(): Player {
  return { ...PLAYER_SPAWN };
}

export function isWall(x: number, y: number, level = LEVEL): boolean {
  return level[Math.floor(y)]?.[Math.floor(x)] !== '0';
}

function canStand(x: number, y: number, level: string[]): boolean {
  const radius = 0.2;
  return (
    !isWall(x - radius, y - radius, level) &&
    !isWall(x + radius, y - radius, level) &&
    !isWall(x - radius, y + radius, level) &&
    !isWall(x + radius, y + radius, level)
  );
}

export function movePlayer(player: Player, controls: Controls, delta: number, level = LEVEL): void {
  const turn = Number(controls.right) - Number(controls.left);
  const movement = Number(controls.forward) - Number(controls.backward);
  player.angle += turn * CONFIG.turnSpeed * delta;
  const step = movement * CONFIG.playerSpeed * delta;
  const nextX = player.x + Math.cos(player.angle) * step;
  const nextY = player.y + Math.sin(player.angle) * step;

  // Проверяем оси отдельно: у стены игрок может скользить вдоль неё.
  if (canStand(nextX, player.y, level)) player.x = nextX;
  if (canStand(player.x, nextY, level)) player.y = nextY;
}
