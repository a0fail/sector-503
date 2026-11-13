import type { Game } from './combat';
import { CONFIG } from './config';
import { isWall } from './world';

export interface Projectile {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
}

export function updateProjectiles(game: Game, delta: number): void {
  game.projectiles.forEach((shot) => {
    // Короткие подшаги не дают снаряду проскочить через угол стены.
    const steps = Math.max(1, Math.ceil((delta * 3) / 0.04));
    for (let step = 0; step < steps && shot.life > 0; step++) {
      shot.x += (shot.dx * delta * 3) / steps;
      shot.y += (shot.dy * delta * 3) / steps;
      shot.life -= delta / steps;
      if (isWall(shot.x, shot.y, game.level)) {
        shot.life = 0;
        break;
      }
      if (Math.hypot(shot.x - game.player.x, shot.y - game.player.y) < 0.25) {
        game.health = Math.max(0, game.health - CONFIG.enemyDamage);
        game.hurt = 0.2;
        shot.life = 0;
        if (game.health === 0) game.status = 'lost';
      }
    }
  });
  game.projectiles = game.projectiles.filter((shot) => shot.life > 0);
}
