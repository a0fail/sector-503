import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.mock('./sketch-art', () => ({ getSketchArt: () => 'fallback' }));

const created: FakeImage[] = [];
class FakeImage {
  complete = false;
  naturalWidth = 0;
  src = '';
  onerror = vi.fn();
  constructor() {
    created.push(this);
  }
}
beforeEach(() => {
  created.length = 0;
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubGlobal('Image', FakeImage);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('retries missing PNGs after five seconds instead of keeping the fallback forever', async () => {
  const { getImage } = await import('./images');
  expect(getImage('./textures/enemies/boss-idle.png')).toBeNull();
  created[0].onerror();
  vi.advanceTimersByTime(4999);
  getImage('./textures/enemies/boss-idle.png');
  expect(created).toHaveLength(1);
  vi.advanceTimersByTime(1);
  getImage('./textures/enemies/boss-idle.png');
  expect(created).toHaveLength(2);
  created[1].complete = true;
  created[1].naturalWidth = 2234;
  expect(getImage('./textures/enemies/boss-idle.png')).toBe(created[1]);
});
it('uses both custom boss PNG frames instead of procedural art once loaded', async () => {
  const { getEnemyImage } = await import('./images');
  getEnemyImage(3, false);
  expect(created.map((image) => image.src)).toEqual([
    './textures/enemies/boss-idle.png?assets=console-v1',
    './textures/enemies/boss-shoot.png?assets=console-v1',
  ]);
  created.forEach((image) => {
    image.complete = true;
    image.naturalWidth = 2234;
  });
  expect(getEnemyImage(3, false)).toBe(created[0]);
  expect(getEnemyImage(3, true)).toBe(created[1]);
});
