import type { Game } from './combat';
import { getEnemyImage, getFrame, getImage } from './images';
import { getSketchArt } from './sketch-art';

// Собственные пиксельные силуэты: червь, троян, шифровальщик.
const SPRITES = [
  [
    '    oooo    ',
    '   oyyyyoo  ',
    '   oyrryoo  ',
    '    oooo    ',
    '     oo     ',
    '   oooooo   ',
    '  ooyyyooo  ',
    '  oooo oooo ',
    '   oo   ooo ',
    '        oo  ',
  ],
  [
    '   ssssss   ',
    '  ssssssss  ',
    '  ssyssyss  ',
    '  sssrrsss  ',
    '  ssrrrrss  ',
    '  ssryyrss  ',
    '  ssrrrrss  ',
    '   ssssss   ',
    '  oo    oo  ',
    ' ooo    ooo ',
  ],
  [
    '    pppp    ',
    '   pp  pp   ',
    '   pp  pp   ',
    '  pppppppp  ',
    ' pppppppppp ',
    ' pppeeepppp ',
    ' ppp e pppp ',
    ' ppppeppppp ',
    '  pppppppp  ',
    '   pp  pp   ',
  ],
  ['  rr  ', ' ryy r', 'ryyyyr', ' ryy r', '  rr  '],
];
const COLORS: Record<string, string> = {
  s: '#d5e4e2',
  r: '#ff5656',
  y: '#ffdf79',
  o: '#dd8244',
  p: '#a263db',
  e: '#ffca6a',
};

const ITEM_SPRITES = {
  heal: [' ssssss ', 'ssssssss', 'sssrrsss', 'ssrrrrss', 'sssrrsss', 'ssssssss', ' ssssss '],
  trophy: [' yy  yy ', ' yyyyyy ', '  yyyy  ', '   yy   ', '   yy   ', ' yyyyyy ', ' yyyyyy '],
  laser: ['   yy   ', '   ss   ', ' oossoo ', ' ssssss ', '  ssss  ', '  oooo  ', '   ss   '],
};

export function drawEnemies(context: CanvasRenderingContext2D, game: Game, depths: number[]): void {
  const { width, height } = context.canvas;
  const projection = width / (2 * Math.tan(Math.PI / 6));
  const { player } = game;
  const entities = game.enemies
    .filter((enemy) => enemy.health > 0)
    .map((enemy) => ({
      ...enemy,
      size: enemy.boss ? 1 : 0.7,
      sprite: SPRITES[Math.min(enemy.kind ?? 0, 2)],
      image: getEnemyImage(enemy.boss ? 3 : enemy.kind ?? 0, (enemy.shotFlash ?? 0) > 0),
    }));
  entities.push(
    ...game.projectiles.map((shot) => ({
      ...shot,
      health: 1,
      attackDelay: 0,
      size: 0.16,
      sprite: SPRITES[3],
      image: getImage('./textures/effects/enemy-shot.png') ?? getSketchArt('projectile'),
    })),
  );
  entities.push(
    ...game.items
      .filter((item) => !item.taken)
      .map((item) => ({
        ...item,
        health: 1,
        attackDelay: 0,
        size: 0.4 + (Math.floor(game.time * 2) % 2) * 0.02,
        sprite: ITEM_SPRITES[item.type],
        image: getFrame('items', item.type, Math.floor(game.time * 2) % 2 === 1) as
          | HTMLImageElement
          | HTMLCanvasElement,
      })),
  );
  const visible = entities
    .map((enemy) => {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      return {
        sprite: enemy.sprite,
        image: enemy.image,
        size: enemy.size,
        depth: dx * Math.cos(player.angle) + dy * Math.sin(player.angle),
        side: dy * Math.cos(player.angle) - dx * Math.sin(player.angle),
      };
    })
    .filter((enemy) => enemy.depth > 0.1)
    .sort((a, b) => b.depth - a.depth);
  visible.forEach(({ depth, side, sprite, image, size: worldSize }) => {
    const size = (projection * worldSize) / depth;
    const left = width / 2 + (side / depth) * projection - size / 2;
    const top = height / 2 - size / 2;
    for (let x = Math.max(0, Math.floor(left)); x < Math.min(width, left + size); x++) {
      if (depth >= depths[x]) continue;
      if (image) {
        context.imageSmoothingEnabled = false;
        const sourceX = Math.max(0, Math.min(image.width - 1, Math.floor(((x - left) / size) * image.width)));
        context.drawImage(image, sourceX, 0, 1, image.height, x, top, 1, size);
        continue;
      }
      const spriteX = Math.floor(((x - left) / size) * sprite[0].length);
      sprite.forEach((row, y) => {
        const color = COLORS[row[spriteX]];
        if (color) {
          context.fillStyle = color;
          context.fillRect(x, top + (y * size) / sprite.length, 1, Math.ceil(size / sprite.length));
        }
      });
    }
  });
}

export function drawWeapon(context: CanvasRenderingContext2D, game: Game): void {
  const { width, height } = context.canvas;
  const center = width / 2;
  const image = getFrame('weapons', game.laser ? 'laser' : 'pistol', game.flash > 0);
  if (image) {
    context.imageSmoothingEnabled = false;
    context.drawImage(image, center - 100, height - 160, 200, 160);
  } else {
    drawDefaultWeapon(context, game);
  }
  if (game.flash > 0) drawShot(context, game);
  if (game.hurt > 0) {
    context.fillStyle = '#dc342b55';
    context.fillRect(0, 0, width, height);
  }
}

function drawDefaultWeapon(context: CanvasRenderingContext2D, game: Game): void {
  const { width, height } = context.canvas;
  const x = width / 2;
  const y = height + (game.flash > 0 ? 8 : 0);
  context.fillStyle = '#172f3b';
  context.fillRect(x - 42, y - 65, 84, 65);
  context.fillStyle = '#587980';
  context.fillRect(x - 20, y - 112, 40, 100);
  context.fillStyle = '#0b202b';
  context.fillRect(x - 12, y - 106, 24, 70);
  context.fillStyle = game.laser ? '#d593ff' : '#51ffcb';
  context.fillRect(x - 30, y - 88, 6, 60);
  context.fillRect(x + 24, y - 88, 6, 60);
  context.fillRect(x - 7, y - 104, 14, 10);
}

function drawShot(context: CanvasRenderingContext2D, game: Game): void {
  const { width, height } = context.canvas;
  const image = getImage(`./textures/effects/${game.laser ? 'laser-shot' : 'player-shot'}.png`);
  if (game.laser) {
    context.strokeStyle = '#e8b4ff';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(width / 2, height - 110);
    context.lineTo(width / 2, height / 2);
    context.stroke();
  }
  if (image) context.drawImage(image, width / 2 - 32, height / 2 - 32, 64, 64);
  else {
    context.fillStyle = game.laser ? '#f1ccff' : '#9fffe4';
    context.fillRect(width / 2 - 8, height - 126, 16, 22);
  }
}
