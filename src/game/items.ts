import type { Game } from './combat';
import { CONFIG } from './config';
import { createEnemy } from './enemy-movement';
import { ITEMS, BOSS_SPAWN } from './level';

export interface Item {
  x: number;
  y: number;
  type: 'heal' | 'trophy' | 'laser';
  taken: boolean;
}
export function createItems(): Item[] {
  return ITEMS.map((item) => ({ ...item, taken: false }));
}
export function collectItems(game: Game): void {
  game.items.forEach((item) => {
    if (item.taken || Math.hypot(item.x - game.player.x, item.y - game.player.y) > 0.45) return;
    if (item.type === 'heal' && game.health >= CONFIG.playerHealth) return;
    item.taken = true;
    game.sounds.push(item.type === 'laser' ? 'weapon' : item.type);
    if (item.type === 'heal') {
      game.health = Math.min(CONFIG.playerHealth, game.health + CONFIG.healAmount);
      game.message = 'Пакет обновлений: защита восстановлена.';
    } else if (item.type === 'trophy') {
      game.score += 200;
      game.message = 'Трофей: «Это не баг, это недокументированный троян». +200 очков!';
    } else {
      game.laser = true;
      game.score += 50;
      game.message = 'Лазер получен: 2 урона! Босс Madman проснулся в главном коридоре.';
      game.enemies.push(createEnemy({ ...BOSS_SPAWN, kind: 3, boss: true }));
    }
  });
}
