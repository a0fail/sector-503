import { useEffect, useRef, useState } from 'react';

import { createAudio } from '../../game/audio';
import type { Game } from '../../game/combat';
import { createGame, updateGame } from '../../game/combat';
import { CONFIG } from '../../game/config';
import { ENEMIES } from '../../game/level';
import { render } from '../../game/render';
import type { Controls } from '../../game/world';

import style from './App.module.less';
import { consolePosition } from './console-layout';
import { ConsoleControls } from './ConsoleControls';

const KEY_BINDINGS: Record<string, keyof Controls> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
};

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef(createGame());
  const firingRef = useRef(false);
  const firePointersRef = useRef(new Set<number>());
  const noticeRef = useRef({ text: '', until: 0 });
  const runningRef = useRef(false);
  const audioRef = useRef(createAudio());
  const soundRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio.close();
  }, []);
  const [hud, setHud] = useState({
    health: CONFIG.playerHealth,
    score: 0,
    remaining: ENEMIES.length,
    message: '',
    laser: false,
  });
  const [screen, setScreen] = useState('start');
  const keysRef = useRef(new Set<string>());
  const pointersRef = useRef(new Map<number, keyof Controls>());
  const [playing, setPlaying] = useState(false);

  function clearInput() {
    keysRef.current.clear();
    pointersRef.current.clear();
    firingRef.current = false;
    firePointersRef.current.clear();
  }
  function stopSimulation() {
    runningRef.current = false;
    gameRef.current.paused = true;
    audioRef.current.stop();
  }
  function pauseGame() {
    if (!runningRef.current) return;
    runningRef.current = false;
    gameRef.current.paused = true;
    clearInput();
    audioRef.current.stop();
    setScreen('paused');
    setPlaying(false);
  }
  function startGame(restart: boolean) {
    clearInput();
    if (restart) {
      gameRef.current = createGame();
      noticeRef.current = { text: '', until: 0 };
      setHud({ health: CONFIG.playerHealth, score: 0, remaining: ENEMIES.length, message: '', laser: false });
    }
    gameRef.current.paused = false;
    runningRef.current = true;
    if (soundRef.current) audioRef.current.unlock();
    setScreen('playing');
    setPlaying(true);
    canvasRef.current?.focus();
  }

  function getNotice(game: Game) {
    if (
      noticeRef.current.text !== game.message ||
      game.sounds.some((sound) => ['heal', 'trophy', 'weapon'].includes(sound))
    ) {
      noticeRef.current = { text: game.message, until: game.time + 5 };
    }
    return game.time < noticeRef.current.until ? noticeRef.current.text : '';
  }

  useEffect(() => {
    audioRef.current.music(soundEnabled && playing);
    return () => audioRef.current.music(false);
  }, [soundEnabled, playing]);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return undefined;
    let frame = 0;
    let previousTime = performance.now();

    function tick(time: number) {
      const delta = Math.min((time - previousTime) / 1000, 0.04);
      previousTime = time;
      const controls: Controls = { forward: false, backward: false, left: false, right: false };
      keysRef.current.forEach((key) => {
        if (KEY_BINDINGS[key]) controls[KEY_BINDINGS[key]] = true;
      });
      pointersRef.current.forEach((action) => {
        controls[action] = true;
      });
      if (runningRef.current && gameRef.current.status === 'playing') {
        const game = gameRef.current;
        const previousHealth = game.health;
        const previousShotDelay = game.shotDelay;
        updateGame(game, controls, delta, firingRef.current || keysRef.current.has('Space'));
        if (game.status !== 'playing') {
          stopSimulation();
        }
        if (soundRef.current) {
          if (game.shotDelay > previousShotDelay) audioRef.current.play('shot');
          if (game.health < previousHealth) audioRef.current.play('hurt');
          game.sounds.forEach((sound) => audioRef.current.play(sound));
          if (game.status === 'won') audioRef.current.play('win');
        }
        const message = getNotice(game);
        const remaining = game.enemies.filter((enemy) => enemy.health > 0).length;
        setHud((old) =>
          old.health === game.health &&
          old.score === game.score &&
          old.remaining === remaining &&
          old.message === message &&
          old.laser === game.laser
            ? old
            : { health: game.health, score: game.score, remaining, message, laser: game.laser },
        );
        if (game.status !== 'playing') {
          setScreen(game.status);
          setPlaying(false);
        }
      }
      if (context) render(context, gameRef.current);
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      if (event.code === 'Escape') pauseGame();
      if (!runningRef.current || (!KEY_BINDINGS[event.code] && event.code !== 'Space')) return;
      if ((event.target as HTMLElement).tagName === 'BUTTON') return;
      event.preventDefault();
      keysRef.current.add(event.code);
    }
    function keyUp(event: KeyboardEvent) {
      keysRef.current.delete(event.code);
    }
    function visibilityChange() {
      if (document.hidden) pauseGame();
    }
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', pauseGame);
    document.addEventListener('visibilitychange', visibilityChange);
    return () => {
      clearInput();
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', pauseGame);
      document.removeEventListener('visibilitychange', visibilityChange);
    };
  }, [playing]);

  return (
    <main className={style.app}>
      <header className={style.header}>
        <div>
          <span className={style.eyebrow}>SECTOR 503 / CYBER DEFENSE</span>
          <h1>Сектор 503</h1>
        </div>
      </header>
      <div className={style.console}>
        <img
          className={style.consoleBody}
          src="/textures/console/console.png"
          alt="Консоль Game Boy Advance"
          draggable={false}
        />
        <section
          className={style.screen}
          style={consolePosition(191.378, 151.29, 2882, 1796)}
          aria-label="Игровой экран"
        >
          <canvas
            ref={canvasRef}
            width={640}
            height={399}
            tabIndex={0}
            aria-label="Коридоры станции. WASD или стрелки — движение и поворот."
          />
          <div className={style.hud}>
            <span>
              ЗАЩИТА<b>{hud.health}</b>
            </span>
            <span>
              ОЧКИ<b>{hud.score}</b>
            </span>
            <span>
              УГРОЗЫ
              <b>
                {hud.remaining}/{gameRef.current.enemies.length}
              </b>
            </span>
            <span>
              {hud.laser ? 'ЛАЗЕР' : 'ИМПУЛЬС'}
              <b>{hud.laser ? '2 урона' : '1 урон'}</b>
            </span>
          </div>
          {hud.message && (
            <div className={style.notice} role="status">
              {hud.message}
            </div>
          )}
          {!playing && (
            <div className={style.overlay}>
              <h2>
                {
                  (
                    {
                      start: 'Запустить защиту',
                      paused: 'Пауза',
                      won: 'Система защищена',
                      lost: 'Защита взломана',
                    } as Record<string, string>
                  )[screen]
                }
              </h2>
              <p>
                {screen === 'start'
                  ? 'Обезвредь угрозы и дойди до зелёного выхода. Ищи тёмные стены и секреты.'
                  : `Очки: ${hud.score} · Защита: ${hud.health}`}
              </p>
              <button type="button" className={style.start} onClick={() => startGame(screen !== 'paused')}>
                {screen === 'paused' ? 'Продолжить · Start' : 'Начать игру'}
              </button>
              {screen === 'paused' && (
                <button type="button" className={style.sound} onClick={() => startGame(true)}>
                  Начать заново · Select
                </button>
              )}
            </div>
          )}
        </section>
        <ConsoleControls
          playing={playing}
          paused={screen === 'paused'}
          move={(action, pressed, id) => {
            if (pressed && runningRef.current) pointersRef.current.set(id, action);
            else pointersRef.current.delete(id);
          }}
          fire={(pressed, id) => {
            if (pressed && runningRef.current) firePointersRef.current.add(id);
            else firePointersRef.current.delete(id);
            firingRef.current = firePointersRef.current.size > 0;
          }}
          pause={pauseGame}
          start={() => {
            if (!runningRef.current) startGame(screen !== 'paused');
          }}
          restart={() => {
            if (screen === 'paused') startGame(true);
          }}
        />
      </div>
      <button
        type="button"
        className={style.sound}
        aria-pressed={soundEnabled}
        onClick={() => {
          soundRef.current = !soundRef.current;
          setSoundEnabled(soundRef.current);
          if (soundRef.current) audioRef.current.unlock();
          else audioRef.current.stop();
          canvasRef.current?.focus();
        }}
      >
        Музыка и звук: {soundEnabled ? 'вкл' : 'выкл'}
      </button>
      <footer className={style.footer}>
        <p>
          W / S — движение · A / D — поворот
          <br />
          Пробел — огонь · Esc — пауза
        </p>
        <p>
          Крестовина — движение и поворот
          <br />
          A — стрелять · B — пауза
          <br />
          Start — начать / продолжить игру · Select — начать заново только на паузе
        </p>
      </footer>
    </main>
  );
};
