import { describe, expect, it, vi } from 'vitest';

import { castRay } from './raycast';

vi.mock('./level', () => import('./test-level'));

describe('точные пересечения со стенами', () => {
  it('обрабатывает горизонтальный и вертикальный луч без деления на ноль в результате', () => {
    const player = { x: 1.5, y: 1.5, angle: 0 };
    expect(castRay(player, 1, 0).distance).toBeCloseTo(9.5);
    expect(castRay(player, -1, 0).distance).toBeCloseTo(0.5);
    expect(castRay(player, 0, -1).distance).toBeCloseTo(0.5);
    expect(castRay(player, 0, 1).distance).toBeCloseTo(4.5);
  });
  it('сохраняет точную координату текстуры при небольшом смещении камеры', () => {
    const a = castRay({ x: 1.5, y: 1.5, angle: 0 }, 1, 0);
    const b = castRay({ x: 1.5, y: 1.501, angle: 0 }, 1, 0);
    expect(a.side).toBe('x');
    expect(b.distance).toBe(a.distance);
    expect(b.textureX - a.textureX).toBeCloseTo(0.001, 8);
  });
});

it('orients the texture left-to-right on opposite wall faces', () => {
  const player = { x: 1.5, y: 1.5, angle: 0 };
  expect(castRay(player, 1, 0).flip).toBe(false);
  expect(castRay(player, -1, 0).flip).toBe(true);
  expect(castRay(player, 0, 1).flip).toBe(true);
  expect(castRay(player, 0, -1).flip).toBe(false);
});
