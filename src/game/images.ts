import { ENEMY_TYPES } from './enemy-types';
import { getSketchArt } from './sketch-art';

const images = new Map<string, HTMLImageElement>();
const retries = new Map<string, number>();

// Готовые изображения кэшируются, неудачная загрузка повторяется через 5 секунд.
export function getImage(path: string): HTMLImageElement | null {
  let image = images.get(path);
  if (!image || (retries.has(path) && Date.now() >= retries.get(path)!)) {
    retries.delete(path);
    image = new Image();
    image.onerror = () => retries.set(path, Date.now() + 5000);
    image.src = `${path}?assets=console-v1`;
    images.set(path, image);
  }
  return image.complete && image.naturalWidth > 0 ? image : null;
}

export function getEnemyImage(kind: number, shooting: boolean): HTMLImageElement | HTMLCanvasElement | null {
  const name = ENEMY_TYPES[kind]?.texture ?? 'worm';
  const idle = getImage(`./textures/enemies/${name}-idle.png`);
  const shot = getImage(`./textures/enemies/${name}-shoot.png`);
  return (shooting ? shot ?? idle : idle) ?? getSketchArt(name, shooting);
}

export function getFrame(folder: string, name: string, second: boolean): HTMLImageElement | null {
  const first = getImage(`./textures/${folder}/${name}-idle.png`);
  const next = getImage(`./textures/${folder}/${name}-${folder === 'weapons' ? 'shoot' : '2'}.png`);
  return second ? next ?? first : first;
}
