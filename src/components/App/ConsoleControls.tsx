import { useEffect, useRef, useState } from 'react';

import type { Controls } from '../../game/world';

import style from './App.module.less';
import { consolePosition } from './console-layout';

interface ButtonProps {
  label: string;
  texture?: string;
  enabled?: boolean;
  className?: string;
  onClick?: () => void;
  onHold?: (pressed: boolean, pointerId: number) => void;
}
function ConsoleButton({ label, texture, enabled = true, className = '', onClick, onHold }: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const held = useRef(new Set<number>());
  function release(id: number) {
    held.current.delete(id);
    setPressed(held.current.size > 0);
    onHold?.(false, id);
  }
  useEffect(() => {
    if (!enabled) {
      held.current.clear();
      setPressed(false);
    }
  }, [enabled]);
  return (
    <button
      type="button"
      className={`${style.consoleButton} ${className}`}
      aria-label={label}
      title={label}
      disabled={!enabled}
      data-pressed={pressed}
      onClick={onClick}
      onPointerDown={(event) => {
        if (onHold) event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        held.current.add(event.pointerId);
        setPressed(true);
        onHold?.(true, event.pointerId);
      }}
      onPointerUp={(event) => release(event.pointerId)}
      onPointerCancel={(event) => release(event.pointerId)}
      onLostPointerCapture={(event) => release(event.pointerId)}
      onBlur={() => {
        held.current.forEach((id) => onHold?.(false, id));
        held.current.clear();
        setPressed(false);
      }}
      onKeyDown={(event) => {
        if (event.code !== 'Space' && event.code !== 'Enter') return;
        held.current.add(-1);
        setPressed(true);
        if (onHold) {
          event.preventDefault();
          onHold(true, -1);
        }
      }}
      onKeyUp={(event) => {
        if (event.code === 'Space' || event.code === 'Enter') release(-1);
      }}
    >
      {texture && <img draggable={false} alt="" src={`/textures/console/${texture}${pressed ? '_pressed' : ''}.png`} />}
    </button>
  );
}
const DIRECTIONS: { action: keyof Controls; title: string }[] = [
  { action: 'forward', title: 'Вперёд' },
  { action: 'right', title: 'Повернуть направо' },
  { action: 'backward', title: 'Назад' },
  { action: 'left', title: 'Повернуть налево' },
];
interface Props {
  playing: boolean;
  paused: boolean;
  move: (action: keyof Controls, pressed: boolean, id: number) => void;
  fire: (pressed: boolean, id: number) => void;
  pause: () => void;
  start: () => void;
  restart: () => void;
}
export function ConsoleControls({ playing, paused, move, fire, pause, start, restart }: Props) {
  return (
    <>
      <div className={style.cross} style={consolePosition(74.476, 137.321, 858, 858)}>
        <img className={style.crossIdle} src="/textures/console/button_cross.png" alt="" draggable={false} />
        <img className={style.crossPressed} src="/textures/console/button_cross_pressed.png" alt="" draggable={false} />
        {DIRECTIONS.map(({ action, title }) => (
          <ConsoleButton
            key={action}
            label={title}
            className={style[action]}
            enabled={playing}
            onHold={(pressed, id) => move(action, pressed, id)}
          />
        ))}
      </div>
      <div className={style.consolePart} style={consolePosition(475.33, 147.535, 418, 418)}>
        <ConsoleButton label="A — стрелять" texture="button_a" enabled={playing} onHold={fire} />
      </div>
      <div className={style.consolePart} style={consolePosition(524.873, 130.584, 418, 418)}>
        <ConsoleButton label="B — пауза" texture="button_b" enabled={playing} onClick={pause} />
      </div>
      <div className={style.consolePart} style={consolePosition(138.822, 210.844, 204, 204)}>
        <ConsoleButton label="Start — начать или продолжить" texture="button_small" onClick={start} />
      </div>
      <div className={style.consolePart} style={consolePosition(138.822, 241.684, 204, 204)}>
        <ConsoleButton
          label="Select — начать заново (только на паузе)"
          texture="button_small"
          enabled={paused}
          onClick={restart}
        />
      </div>
    </>
  );
}
