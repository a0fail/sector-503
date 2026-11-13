import type { Game } from './combat';
import { EXIT } from './level';
import { castRay } from './raycast';
import { drawEnemies, drawWeapon } from './sprites';
import { getWallTexture } from './texture';

const FIELD_OF_VIEW = Math.PI / 3;
function drawWalls(context: CanvasRenderingContext2D, game: Game): number[] {
  const depths: number[] = [];
  const { width, height } = context.canvas;
  const { player } = game;
  const projection = width / (2 * Math.tan(FIELD_OF_VIEW / 2));
  for (let column = 0; column < width; column++) {
    const cameraX = (2 * (column + 0.5)) / width - 1;
    const rayAngle = player.angle + Math.atan(cameraX * Math.tan(FIELD_OF_VIEW / 2));
    const hit = castRay(player, Math.cos(rayAngle), Math.sin(rayAngle), game.level);
    const texture = getWallTexture();
    const depth = Math.max(0.05, hit.distance * Math.cos(rayAngle - player.angle));
    depths.push(depth);
    const wallHeight = projection / depth;
    const top = (height - wallHeight) / 2;
    context.drawImage(
      texture,
      Math.min(texture.width - 1, Math.floor((hit.flip ? 1 - hit.textureX : hit.textureX) * texture.width)),
      0,
      1,
      texture.height,
      column,
      top,
      1,
      wallHeight,
    );
    context.fillStyle = `rgba(0, 12, 18, ${Math.min(
      0.82,
      depth * 0.065 + (hit.side === 'x' ? 0.12 : 0) + (hit.tile === '2' ? 0.23 : 0),
    )})`;
    context.fillRect(column, top, 1, wallHeight);
  }
  return depths;
}

function drawMap(context: CanvasRenderingContext2D, game: Game): void {
  const { player, level } = game;
  const cell = 10;
  const margin = 12;
  context.fillStyle = '#080e14cc';
  context.fillRect(margin - 4, margin - 4, level[0].length * cell + 8, level.length * cell + 8);
  level.forEach((row, y) => {
    [...row].forEach((tile, x) => {
      context.fillStyle = tile !== '0' ? '#526467' : '#182529';
      context.fillRect(margin + x * cell, margin + y * cell, cell - 1, cell - 1);
    });
  });
  game.enemies
    .filter((enemy) => enemy.health > 0)
    .forEach((enemy) => {
      context.fillStyle = enemy.boss ? '#ff5cdf' : '#ff615d';
      context.fillRect(margin + enemy.x * cell - 2.5, margin + enemy.y * cell - 2.5, 5, 5);
    });
  context.fillStyle = '#65ffbb';
  context.fillRect(margin + (EXIT.x - 0.5) * cell, margin + (EXIT.y - 0.5) * cell, cell - 1, cell - 1);
  const x = margin + player.x * cell;
  const y = margin + player.y * cell;
  context.fillStyle = '#f2b85e';
  context.fillRect(x - 3, y - 3, 6, 6);
  context.strokeStyle = '#f2b85e';
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + Math.cos(player.angle) * 13, y + Math.sin(player.angle) * 13);
  context.stroke();
}

export function render(context: CanvasRenderingContext2D, game: Game): void {
  const { width, height } = context.canvas;
  context.fillStyle = '#071f24';
  context.fillRect(0, 0, width, height / 2);
  context.fillStyle = '#102c30';
  context.fillRect(0, height / 2, width, height / 2);
  const depths = drawWalls(context, game);
  drawEnemies(context, game, depths);
  drawWeapon(context, game);
  drawMap(context, game);
  context.fillStyle = '#e3e8dd';
  context.fillRect(width / 2 - 4, height / 2, 9, 1);
  context.fillRect(width / 2, height / 2 - 4, 1, 9);
}
