// Рисунки по эскизам автора игры. Координаты на сетке 128 × 128.
const cache = new Map<string, HTMLCanvasElement>();
const ink = '#090d12';
const white = '#f5f4e9';
type Brush = CanvasRenderingContext2D;

// У кисти отдельные цвет заливки, обводка и толщина линии.
// eslint-disable-next-line max-params
function shape(c: Brush, path: string, fill: string, stroke = ink, width = 2): void {
  const p = new Path2D(path);
  c.fillStyle = fill;
  c.fill(p);
  c.strokeStyle = stroke;
  c.lineWidth = width;
  c.lineJoin = 'round';
  c.stroke(p);
}
function eye(c: Brush, x: number, y: number, radius: number): void {
  shape(
    c,
    `M ${x - radius} ${y} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 ${-radius * 2} 0`,
    white,
  );
  c.fillStyle = ink;
  c.fillRect(x - radius / 3, y - radius / 2, radius / 2, radius);
}
function trojan(c: Brush, firing: boolean): void {
  shape(c, 'M58 73 L70 77 L58 125 L48 125 Z', '#86512f');
  shape(c, 'M55 83 L61 85 L52 121 L50 121 Z', '#bf8550', '#bf8550');
  const circuit = firing ? '#fa354b' : ink;
  for (let i = 0; i < 8; i++) {
    const y = 18 + i * 10;
    shape(c, `M77 ${y} L93 ${y + 3} L98 ${y - 2} L112 ${y - 2}`, 'transparent', circuit, 3);
    shape(c, `M110 ${y - 5} h6 v6 h-6 Z`, circuit, '#64727a', 1);
  }
  shape(
    c,
    'M73 11 L65 3 L61 22 L49 26 L36 44 L18 60 L17 73 L31 81 L47 74 L44 88 Q60 106 79 91 Q95 68 88 39 Z',
    '#b5c5c7',
  );
  shape(
    c,
    'M66 13 L62 28 L49 32 L38 48 L21 63 L21 71 L32 75 L50 64 L55 74 L49 87 Q63 98 74 86 Q85 58 79 38 Z',
    white,
    '#cbd5d4',
    1,
  );
  shape(c, firing ? 'M23 73 L54 57 L43 84 L29 89 Z' : 'M22 72 L51 62 L39 78 L29 80 Z', firing ? '#8e172f' : ink);
  shape(
    c,
    firing
      ? 'M28 72 L35 69 L31 83 Z M40 66 L48 62 L40 79 Z M33 86 L39 78 L39 84 Z'
      : 'M28 72 L34 69 L31 78 Z M40 67 L45 65 L40 75 Z',
    white,
    white,
    1,
  );
  shape(c, 'M52 37 L61 35 L61 43 L53 45 Z', firing ? '#ff233e' : ink);
  shape(c, 'M24 62 L29 59 L29 64 Z', ink);
}
function lock(c: Brush, x: number, y: number, size: number): void {
  c.save();
  c.translate(x, y);
  c.scale(size, size);
  shape(c, 'M-7 0 V-7 Q-7 -17 0 -17 Q7 -17 7 -7 V0 L3 0 V-7 Q3 -12 0 -12 Q-3 -12 -3 -7 V0 Z', '#c5d1d4');
  shape(c, 'M-11 -2 H11 V17 H-11 Z', '#87969f');
  shape(c, 'M-8 1 H-4 V13 H-8 Z', '#dce4e5', '#dce4e5', 1);
  shape(c, 'M-2 4 H2 V8 H1 V12 H-1 V8 H-2 Z', ink, ink, 1);
  c.restore();
}
function ransomware(c: Brush, firing: boolean): void {
  if (firing) {
    [
      'M64 40 C27 33 36 0 62 3 C89 5 91 35 70 35',
      'M40 83 C4 56 -5 108 24 119 C55 130 63 93 40 92',
      'M87 83 C122 56 134 106 106 118 C78 131 67 99 87 93',
    ].forEach((p) => shape(c, p, 'transparent', '#46545c', 7));
    [
      'M64 40 C27 33 36 0 62 3 C89 5 91 35 70 35',
      'M40 83 C4 56 -5 108 24 119 C55 130 63 93 40 92',
      'M87 83 C122 56 134 106 106 118 C78 131 67 99 87 93',
    ].forEach((p) => shape(c, p, 'transparent', ink, 4));
  } else {
    shape(
      c,
      'M62 40 C35 13 72 2 91 20 M39 71 C-2 65 8 99 31 94 Q45 96 29 108 M87 70 C124 79 93 87 104 104',
      'transparent',
      '#53636a',
      7,
    );
    shape(
      c,
      'M62 40 C35 13 72 2 91 20 M39 71 C-2 65 8 99 31 94 Q45 96 29 108 M87 70 C124 79 93 87 104 104',
      'transparent',
      ink,
      4,
    );
  }
  shape(c, 'M64 30 L99 88 H29 Z', '#f33848');
  shape(c, 'M64 43 L87 80 H41 Z', white, white, 1);
  if (firing) shape(c, 'M61 53 H67 L66 67 H62 Z M61 71 H67 V76 H61 Z', ink, ink, 1);
  else eye(c, 64, 65, 8);
  lock(c, firing ? 64 : 95, firing ? 23 : 26, firing ? 1.1 : 0.8);
  lock(c, firing ? 27 : 29, firing ? 99 : 108, firing ? 1.1 : 0.8);
  lock(c, firing ? 101 : 104, firing ? 99 : 108, firing ? 1.1 : 0.8);
}
function worm(c: Brush, firing: boolean): void {
  shape(c, 'M42 83 C7 94 13 118 51 120 L39 113 C20 108 33 101 49 100 Z', '#738b84');
  shape(c, 'M27 99 L34 106 M24 109 L30 113 M37 115 L39 119', 'transparent', ink, 2);
  shape(c, 'M62 30 Q61 9 80 8 Q78 24 62 30 Z', '#12191e', '#6c8186');
  shape(
    c,
    firing
      ? 'M62 37 C23 15 14 49 21 74 C25 96 36 108 49 104 Q62 99 75 104 C91 110 103 90 106 67 C112 34 89 23 62 37 Z'
      : 'M62 37 C23 15 14 49 21 74 C25 96 36 108 49 104 Q60 99 70 105 Q86 112 100 86 C79 81 78 61 100 52 Q86 23 62 37 Z',
    ink,
    '#73858b',
  );
  shape(c, 'M31 45 Q23 64 32 81', 'transparent', '#29363d', 3);
  shape(c, firing ? 'M61 39 L60 27 L78 25 L81 42 Z' : 'M73 47 L85 26 L101 32 L90 54 Z', '#78958b');
  shape(c, firing ? 'M61 34 L79 32' : 'M80 37 L94 42', 'transparent', ink, 2);
  eye(c, firing ? 70 : 98, firing ? 21 : 24, firing ? 17 : 13);
  if (firing) {
    shape(c, 'M34 59 Q61 47 87 61 L84 83 Q60 104 36 83 Z', '#b41c38', '#ef4353', 2);
    shape(
      c,
      'M39 59 L49 57 L46 73 Z M72 57 L81 60 L74 74 Z M43 88 L47 75 L53 93 Z M69 93 L74 78 L79 88 Z',
      white,
      white,
      1,
    );
  }
}
function boss(c: Brush, firing: boolean): void {
  shape(c, 'M6 38 L15 29 H112 L123 39 V89 H5 Z', '#761b14', '#321213', 3);
  shape(
    c,
    'M13 38 H114 L119 52 L108 48 L102 75 L79 78 L68 64 L63 50 L57 64 L45 79 L22 75 L17 48 L9 56 Z',
    '#fb420e',
    '#c5280e',
    2,
  );
  shape(c, 'M12 45 L27 57 L49 61 L51 70 L37 76 L23 69 Z M116 45 L101 57 L79 61 L77 70 L91 76 L105 69 Z', ink, ink);
  shape(
    c,
    'M25 62 L36 67 L43 65 L38 71 L28 69 Z M103 62 L92 67 L85 65 L90 71 L100 69 Z',
    firing ? white : '#47150f',
    firing ? white : '#47150f',
    1,
  );
  shape(c, 'M58 44 V53 M69 44 V53 M63 55 V64 M20 79 H36 M92 79 H108', 'transparent', '#57130d', 3);
  shape(c, 'M15 33 H111', 'transparent', '#ff8240', 2);
}
function projectile(c: Brush): void {
  shape(
    c,
    'M64 7 L74 24 L94 14 L93 35 L116 42 L101 58 L121 75 L99 83 L103 108 L79 101 L67 121 L53 104 L30 115 L31 93 L9 83 L25 64 L8 44 L31 39 L31 17 L51 25 Z',
    '#a4112b',
    '#ff4754',
    3,
  );
  shape(c, 'M62 23 L80 35 L98 53 L93 79 L70 98 L47 91 L29 66 L40 42 Z', '#ef3248', '#ff6a69', 2);
  c.fillStyle = '#ffe6d9';
  c.font = 'bold 20px monospace';
  c.fillText('010', 42, 55);
  c.fillText('101', 36, 78);
}
function laser(c: Brush, firing: boolean): void {
  shape(c, 'M80 88 L112 94 L120 125 H93 Z', '#281c46', '#9175bd');
  shape(c, 'M42 57 L74 52 L117 76 L121 101 L88 105 L43 78 Z', '#563780', '#b28de4');
  shape(c, 'M44 58 L73 55 L110 77 L83 79 Z', '#8d5bb5', '#c59af0');
  shape(c, 'M35 52 L48 48 L67 63 L64 80 L49 84 L32 68 Z', '#211632', '#b594dc');
  shape(c, 'M38 55 L47 54 L55 63 L51 74 L40 71 Z', firing ? '#fff0ff' : '#ae58ec', '#e5b3ff');
  shape(c, 'M70 70 L107 87 M70 78 L107 95', 'transparent', '#df99ff', 3);
  shape(c, 'M93 108 L111 114 M96 116 L113 122', 'transparent', '#75538d', 3);
  if (firing) shape(c, 'M42 63 L12 17 L16 12 L48 60 Z', '#fceaff', '#c46bff', 4);
}

export function getSketchArt(name: string, firing = false): HTMLCanvasElement {
  const key = `${name}-${firing}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const c = canvas.getContext('2d')!;
  const artists: Record<string, (context: Brush, shooting: boolean) => void> = {
    worm,
    trojan,
    ransomware,
    boss,
    projectile,
    laser,
  };
  (artists[name] ?? worm)(c, firing);
  cache.set(key, canvas);
  return canvas;
}
