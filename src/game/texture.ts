import { getImage } from './images';

let texture: HTMLCanvasElement | null = null;

export function getWallTexture(): HTMLCanvasElement | HTMLImageElement {
  const custom = getImage('/textures/walls/wall.png');
  if (custom) return custom;
  if (texture) return texture;
  texture = document.createElement('canvas');
  texture.width = 128;
  texture.height = 128;
  const context = texture.getContext('2d');
  if (!context) return texture;
  context.fillStyle = '#103d3b';
  context.fillRect(0, 0, 128, 128);
  context.fillStyle = '#1b5650';
  context.fillRect(4, 4, 120, 120);
  context.fillStyle = '#15443f';
  context.fillRect(8, 8, 112, 112);
  context.font = 'bold 12px monospace';
  for (let row = 0; row < 7; row++) {
    for (let column = 0; column < 10; column++) {
      context.fillStyle = (row + column) % 5 === 0 ? '#67c8a9' : '#327c69';
      context.fillText((row * 3 + column * 7) % 5 > 2 ? '1' : '0', 14 + column * 10, 25 + row * 14);
    }
  }
  context.fillStyle = '#00c89d';
  context.fillRect(12, 112, 42, 3);
  return texture;
}
