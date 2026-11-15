/**
 * Tiny pixel-art drawing toolkit.
 *
 * Everything draws on a low-resolution canvas (about 2 screen pixels per art
 * pixel). CSS scales the canvas up with `image-rendering: pixelated`, so a 1x1
 * fillRect is one crisp pixel on screen.
 */

export type Ctx = CanvasRenderingContext2D;
export type Rng = () => number;

/** Small seeded random generator so the city looks the same on every visit. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cheap deterministic hash -> 0..1, for effects that don't need state. */
export function hash01(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export function rint(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/* ------------------------------------------------------------------ colour */

export function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(v: number) {
  return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
}

/** Blend a toward b by t (0..1). */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `#${toHex(r1 + (r2 - r1) * t)}${toHex(g1 + (g2 - g1) * t)}${toHex(b1 + (b2 - b1) * t)}`;
}

/** k > 0 lightens, k < 0 darkens. */
export function shade(h: string, k: number): string {
  return k >= 0 ? mix(h, "#ffffff", k) : mix(h, "#000000", -k);
}

/* ------------------------------------------------------------- primitives */

export function rect(c: Ctx, x: number, y: number, w: number, h: number, col: string) {
  const rw = Math.round(w);
  const rh = Math.round(h);
  if (rw <= 0 || rh <= 0) return;
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), rw, rh);
}

export function dot(c: Ctx, x: number, y: number, col: string) {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), 1, 1);
}

export function disc(c: Ctx, cx: number, cy: number, r: number, col: string) {
  c.fillStyle = col;
  const x0 = Math.round(cx);
  const y0 = Math.round(cy);
  for (let dy = -r; dy <= r; dy++) {
    const hw = Math.floor(Math.sqrt(r * r - dy * dy + 0.5));
    c.fillRect(x0 - hw, y0 + dy, hw * 2 + 1, 1);
  }
}

/** Bresenham line. */
export function line(c: Ctx, x0: number, y0: number, x1: number, y1: number, col: string) {
  c.fillStyle = col;
  let x = Math.round(x0);
  let y = Math.round(y0);
  const ex = Math.round(x1);
  const ey = Math.round(y1);
  const dx = Math.abs(ex - x);
  const dy = -Math.abs(ey - y);
  const sx = x < ex ? 1 : -1;
  const sy = y < ey ? 1 : -1;
  let err = dx + dy;
  for (let guard = 0; guard < 4000; guard++) {
    c.fillRect(x, y, 1, 1);
    if (x === ex && y === ey) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

/** A hanging cable: a parabola sagging `drop` pixels below the straight line. */
export function sagLine(
  c: Ctx,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  drop: number,
  col: string,
) {
  c.fillStyle = col;
  const n = Math.max(2, Math.ceil(Math.abs(x1 - x0)));
  let px = Math.round(x0);
  let py = Math.round(y0);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t + drop * 4 * t * (1 - t));
    // fill vertical gaps so steep sections stay connected
    const lo = Math.min(py, y);
    const hi = Math.max(py, y);
    for (let yy = lo; yy <= hi; yy++) c.fillRect(x, yy, 1, 1);
    px = x;
    py = y;
  }
  void px;
}

/** Checkerboard fill: the pixel-art way to fake transparency. */
export function ditherRect(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string,
  alpha = 1,
  parity = 0,
) {
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = col;
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if (((i + j + parity) & 1) === 0) c.fillRect(x0 + i, y0 + j, 1, 1);
    }
  }
  c.restore();
}

export function ditherDisc(
  c: Ctx,
  cx: number,
  cy: number,
  r: number,
  col: string,
  alpha: number,
  parity = 0,
) {
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = col;
  const x0 = Math.round(cx);
  const y0 = Math.round(cy);
  for (let dy = -r; dy <= r; dy++) {
    const hw = Math.floor(Math.sqrt(r * r - dy * dy + 0.5));
    for (let dx = -hw; dx <= hw; dx++) {
      if (((dx + dy + parity) & 1) === 0) c.fillRect(x0 + dx, y0 + dy, 1, 1);
    }
  }
  c.restore();
}

/** Soft light: dithered rings, denser toward the middle. */
export function glow(c: Ctx, cx: number, cy: number, r: number, col: string, strength = 1) {
  ditherDisc(c, cx, cy, r, col, 0.14 * strength, 0);
  ditherDisc(c, cx, cy, Math.round(r * 0.62), col, 0.18 * strength, 1);
  c.save();
  c.globalAlpha = 0.2 * strength;
  disc(c, cx, cy, Math.max(1, Math.round(r * 0.3)), col);
  c.restore();
}

/** Rectangular bloom around a neon sign. */
export function glowRect(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string,
  pad = 6,
  strength = 1,
) {
  ditherRect(c, x - pad, y - pad, w + pad * 2, h + pad * 2, col, 0.1 * strength, 0);
  ditherRect(c, x - Math.round(pad * 0.55), y - Math.round(pad * 0.55), w + Math.round(pad * 1.1), h + Math.round(pad * 1.1), col, 0.16 * strength, 1);
  c.save();
  c.globalAlpha = 0.14 * strength;
  c.fillStyle = col;
  c.fillRect(Math.round(x - 1), Math.round(y - 1), Math.round(w + 2), Math.round(h + 2));
  c.restore();
}

/** Banded vertical fog: five steps, with a dithered seam between bands. */
export function fogBands(
  c: Ctx,
  x: number,
  y0: number,
  y1: number,
  w: number,
  col: string,
  maxAlpha: number,
  steps = 5,
  rising = true,
) {
  const h = y1 - y0;
  if (h <= 0) return;
  for (let i = 0; i < steps; i++) {
    const t = (i + 1) / steps;
    const a = maxAlpha * t;
    const by0 = rising ? y0 + Math.round((h * i) / steps) : y0 + Math.round((h * (steps - 1 - i)) / steps);
    const by1 = rising ? y0 + Math.round((h * (i + 1)) / steps) : y0 + Math.round((h * (steps - i)) / steps);
    c.save();
    c.globalAlpha = a;
    c.fillStyle = col;
    c.fillRect(Math.round(x), by0, Math.round(w), by1 - by0);
    c.restore();
    if (i < steps - 1) {
      const seam = rising ? by1 : by0;
      ditherRect(c, x, rising ? seam : seam - 2, w, 2, col, maxAlpha * Math.min(1, t + 1 / steps), 0);
    }
  }
}
