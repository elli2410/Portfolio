/**
 * Pixel-art toolkit for the diorama.
 *
 * Every prop is drawn on its own small canvas (1 canvas pixel = 1 art pixel).
 * CSS scales the canvas up with `image-rendering: pixelated`, so a 1x1
 * fillRect is one crisp pixel on screen.
 */

export type Ctx = CanvasRenderingContext2D;
export type Rng = () => number;

/** Small seeded random generator so the scene looks the same on every visit. */
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

/** The night palette: deep indigo walls, with neon and warm lamplight as the only bright notes. */
export const K = {
  ink: "#05041a",
  n0: "#0a0820",
  n1: "#100d2c",
  n2: "#171340",
  n3: "#211a56",
  n4: "#2f2570",
  n5: "#43358c",
  n6: "#5d4cae",
  mag: "#ff4fd8",
  pink: "#ff86e8",
  rose: "#ffc2f2",
  vio: "#a56bff",
  lav: "#c9b4ff",
  cyan: "#4ff3ff",
  ice: "#b8fbff",
  teal: "#23d3c0",
  tealD: "#117a78",
  amber: "#ffb347",
  warm: "#ffd98a",
  cream: "#fff0c8",
  red: "#ff3b4f",
  redD: "#a3162f",
  redDD: "#5c0d24",
  leaf: "#2f8f55",
  leafL: "#5ed27a",
  leafD: "#16542f",
  lime: "#b8f060",
  wood: "#6b3f2a",
  woodD: "#3b2018",
  woodL: "#a46a3c",
  white: "#f4f0ff",
} as const;

/* -------------------------------------------------------------- primitives */

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

/** 1px outline rectangle. */
export function frame(c: Ctx, x: number, y: number, w: number, h: number, col: string) {
  rect(c, x, y, w, 1, col);
  rect(c, x, y + h - 1, w, 1, col);
  rect(c, x, y, 1, h, col);
  rect(c, x + w - 1, y, 1, h, col);
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

export function ellipse(c: Ctx, cx: number, cy: number, rx: number, ry: number, col: string) {
  c.fillStyle = col;
  const x0 = Math.round(cx);
  const y0 = Math.round(cy);
  for (let dy = -ry; dy <= ry; dy++) {
    const hw = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.0001))) + 0.5);
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
export function sag(
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
  let py = Math.round(y0);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t + drop * 4 * t * (1 - t));
    const lo = Math.min(py, y);
    const hi = Math.max(py, y);
    for (let yy = lo; yy <= hi; yy++) c.fillRect(x, yy, 1, 1);
    py = y;
  }
}

/** Checkerboard fill: the pixel-art way to fake transparency. */
export function dither(
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

export function alphaRect(c: Ctx, x: number, y: number, w: number, h: number, col: string, a: number) {
  c.save();
  c.globalAlpha = a;
  rect(c, x, y, w, h, col);
  c.restore();
}

export function alphaDisc(c: Ctx, cx: number, cy: number, r: number, col: string, a: number) {
  c.save();
  c.globalAlpha = a;
  disc(c, cx, cy, r, col);
  c.restore();
}

function ditherDisc(c: Ctx, cx: number, cy: number, r: number, col: string, alpha: number, parity: number) {
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
  alphaDisc(c, cx, cy, Math.max(1, Math.round(r * 0.3)), col, 0.2 * strength);
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
  dither(c, x - pad, y - pad, w + pad * 2, h + pad * 2, col, 0.1 * strength, 0);
  const p2 = Math.round(pad * 0.55);
  dither(c, x - p2, y - p2, w + p2 * 2, h + p2 * 2, col, 0.16 * strength, 1);
  alphaRect(c, x - 1, y - 1, w + 2, h + 2, col, 0.14 * strength);
}

/** A light pool on a floor or wall: a squashed glow. */
export function pool(c: Ctx, cx: number, cy: number, rx: number, ry: number, col: string, strength = 1) {
  c.save();
  c.globalAlpha = 0.12 * strength;
  ellipse(c, cx, cy, rx, ry, col);
  c.globalAlpha = 0.14 * strength;
  ellipse(c, cx, cy, Math.round(rx * 0.66), Math.round(ry * 0.66), col);
  c.globalAlpha = 0.16 * strength;
  ellipse(c, cx, cy, Math.round(rx * 0.33), Math.round(ry * 0.33), col);
  c.restore();
}

/* --------------------------------------------------------------- sprites */

/**
 * Paint a string-map sprite. Each character maps to a colour through `pal`;
 * "." and " " are transparent.
 */
export function art(
  c: Ctx,
  rows: readonly string[],
  pal: Readonly<Record<string, string>>,
  x: number,
  y: number,
  flip = false,
) {
  const w = rows[0].length;
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) {
      const ch = row[flip ? w - 1 - i : i];
      const col = pal[ch];
      if (col) {
        c.fillStyle = col;
        c.fillRect(x + i, y + j, 1, 1);
      }
    }
  }
}

/* ----------------------------------------------------------------- text */

/** A tiny 3x5 bitmap font, for neon signs. Each glyph is 5 rows of 3 bits. */
const RAW: Record<string, string> = {
  A: "010,101,111,101,101",
  B: "110,101,110,101,110",
  C: "011,100,100,100,011",
  D: "110,101,101,101,110",
  E: "111,100,110,100,111",
  F: "111,100,110,100,100",
  G: "011,100,101,101,011",
  H: "101,101,111,101,101",
  I: "111,010,010,010,111",
  J: "001,001,001,101,010",
  K: "101,101,110,101,101",
  L: "100,100,100,100,111",
  M: "101,111,111,101,101",
  N: "111,101,101,101,101",
  O: "010,101,101,101,010",
  P: "110,101,110,100,100",
  Q: "010,101,101,110,011",
  R: "110,101,110,101,101",
  S: "011,100,010,001,110",
  T: "111,010,010,010,010",
  U: "101,101,101,101,111",
  V: "101,101,101,101,010",
  W: "101,101,111,111,101",
  X: "101,101,010,101,101",
  Y: "101,101,010,010,010",
  Z: "111,001,010,100,111",
  "0": "111,101,101,101,111",
  "1": "010,110,010,010,111",
  "2": "110,001,010,100,111",
  "3": "110,001,010,001,110",
  "4": "101,101,111,001,001",
  "5": "111,100,110,001,110",
  "6": "011,100,111,101,111",
  "7": "111,001,010,010,010",
  "8": "111,101,111,101,111",
  "9": "111,101,111,001,110",
  "-": "000,000,111,000,000",
  "/": "001,001,010,100,100",
  "!": "010,010,010,000,010",
  ".": "000,000,000,000,010",
  ":": "000,010,000,010,000",
  "?": "110,001,010,000,010",
  "@": "010,101,111,100,011",
  ">": "100,010,001,010,100",
  "<": "001,010,100,010,001",
  " ": "000,000,000,000,000",
};

const GLYPHS: Record<string, string> = Object.fromEntries(
  Object.entries(RAW).map(([k, v]) => [k, v.split(",").join("")]),
);

export function textW(text: string, scale = 1): number {
  return text.length * 4 * scale - scale;
}

export function text(c: Ctx, x: number, y: number, s: string, col: string, scale = 1) {
  let px = x;
  for (const ch of s.toUpperCase()) {
    const g = GLYPHS[ch];
    if (g) {
      for (let i = 0; i < 15; i++) {
        if (g[i] === "1") rect(c, px + (i % 3) * scale, y + Math.floor(i / 3) * scale, scale, scale, col);
      }
    }
    px += 4 * scale;
  }
}

/** A handful of hand-drawn kanji-like glyphs (7x7) for neon signs. */
export const GLYPH: Record<string, readonly string[]> = {
  中: ["...#...", ".#####.", ".#.#.#.", ".#.#.#.", ".#####.", "...#...", "...#..."],
  大: ["...#...", "#######", "...#...", "..#.#..", "..#.#..", ".#...#.", "#.....#"],
  日: [".#####.", ".#...#.", ".#...#.", ".#####.", ".#...#.", ".#...#.", ".#####."],
  月: [".#####.", ".#...#.", ".#####.", ".#...#.", ".#####.", ".#...#.", ".#..##."],
  田: [".#####.", ".#.#.#.", ".#.#.#.", ".#####.", ".#.#.#.", ".#.#.#.", ".#####."],
  火: ["...#...", "#..#..#", ".#.#.#.", "..###..", "...#...", "..#.#..", ".#...#."],
  水: ["...#...", "...#...", "#..#..#", ".#.#.#.", "..###..", ".#.#.#.", "#..#..#"],
  天: ["#######", "...#...", "#######", "...#...", "..#.#..", ".#...#.", "#.....#"],
  王: [".#####.", "...#...", ".#####.", "...#...", "...#...", "#######", "......."],
  口: [".#####.", ".#...#.", ".#...#.", ".#...#.", ".#...#.", ".#####.", "......."],
  山: ["...#...", "#..#..#", "#..#..#", "#..#..#", "#######", ".......", "......."],
  人: ["...#...", "...#...", "..#.#..", "..#.#..", ".#...#.", ".#...#.", "#.....#"],
  麺: ["#.#####.", "#.#.#.#.", "###.#.#.", "#.#####.", "#.#.#.#.", "###.#.#.", "#.#.#.#."],
};

export function glyph(c: Ctx, x: number, y: number, ch: string, col: string, flip = false) {
  const g = GLYPH[ch] ?? GLYPH["口"];
  art(c, g, { "#": col }, x, y, flip);
}

/* ------------------------------------------------------- reusable fixtures */

/** A neon plate: dark backing, glowing tube border, bright content area. */
export function plate(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string,
  bloom = 1,
  backing: string = K.n0,
) {
  glowRect(c, x, y, w, h, col, 6, bloom);
  rect(c, x, y, w, h, backing);
  frame(c, x, y, w, h, mix(col, "#000000", 0.3));
  dot(c, x, y, col);
  dot(c, x + w - 1, y, col);
  dot(c, x, y + h - 1, col);
  dot(c, x + w - 1, y + h - 1, col);
}

/** A neon sign with a line of letters. Returns its width. */
export function neonText(c: Ctx, x: number, y: number, s: string, col: string, scale = 1, bloom = 1) {
  const w = textW(s, scale) + 5;
  const h = 5 * scale + 5;
  plate(c, x, y, w, h, col, bloom);
  text(c, x + 3, y + 3, s, shade(col, 0.45), scale);
  return w;
}

/** A wall air-conditioner: grey box, dark fan, a drip below. */
export function ac(c: Ctx, x: number, y: number, w = 13, h = 10) {
  rect(c, x, y, w, h, "#3a3a5e");
  rect(c, x, y, w, 1, "#5a5a86");
  rect(c, x, y + h - 1, w, 1, "#25253f");
  disc(c, x + Math.floor(w / 2) - (w > 11 ? 2 : 0), y + Math.floor(h / 2), Math.floor(h / 2) - 2, "#15152a");
  dot(c, x + Math.floor(w / 2) - (w > 11 ? 2 : 0), y + Math.floor(h / 2), "#3a3a5e");
  if (w > 11) {
    for (let j = 2; j < h - 2; j += 2) rect(c, x + w - 4, y + j, 3, 1, "#25253f");
  }
}

/** A hanging paper lantern. */
export function lantern(c: Ctx, x: number, y: number, col: string, size = 1) {
  const w = 5 * size;
  const h = 6 * size;
  glow(c, x + Math.floor(w / 2), y + Math.floor(h / 2), 6 * size, col, 0.9);
  rect(c, x + 1, y, w - 2, 1, "#1a1020");
  rect(c, x, y + 1, w, h - 2, col);
  rect(c, x + 1, y + 1, 1, h - 2, shade(col, 0.4));
  rect(c, x + w - 1, y + 1, 1, h - 2, shade(col, -0.35));
  rect(c, x + 1, y + h - 1, w - 2, 1, "#1a1020");
}

/** A potted plant. `s` is a size 1..3. */
export function plant(c: Ctx, x: number, baseY: number, s = 1, seed = 1, pot = "#b4503c", leaf = K.leaf) {
  const r = mulberry32(seed * 977);
  const pw = 5 + s * 2;
  const ph = 3 + s * 2;
  rect(c, x - Math.floor(pw / 2), baseY - ph, pw, ph, pot);
  rect(c, x - Math.floor(pw / 2), baseY - ph, pw, 1, shade(pot, 0.25));
  rect(c, x - Math.floor(pw / 2), baseY - 1, pw, 1, shade(pot, -0.3));
  const n = 4 + s * 3;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.5 + (r() - 0.5) * 0.3;
    const len = 4 + s * 3 + r() * 3;
    const ex = x + Math.cos(a) * len;
    const ey = baseY - ph - 1 + Math.sin(a) * len;
    line(c, x, baseY - ph, ex, ey, i % 3 === 0 ? K.leafD : leaf);
    dot(c, ex, ey, K.leafL);
    dot(c, ex + (r() > 0.5 ? 1 : -1), ey + 1, leaf);
  }
}

/** A string of hanging leaves. */
export function vine(c: Ctx, x: number, y: number, len: number, seed = 1, leaf: string = K.leaf) {
  const r = mulberry32(seed * 313);
  let px = x;
  for (let i = 0; i < len; i++) {
    if (i % 5 === 0) px += r() > 0.5 ? 1 : -1;
    dot(c, px, y + i, K.leafD);
    if (i % 2 === 0) {
      const side = r() > 0.5 ? 1 : -1;
      dot(c, px + side, y + i, leaf);
      if (r() > 0.55) dot(c, px + side * 2, y + i + 1, K.leafL);
    }
  }
}

/** Rough brick / panel texture. */
export function bricks(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  base: string,
  seed = 1,
  mortar?: string,
) {
  const r = mulberry32(seed * 7919);
  rect(c, x, y, w, h, mortar ?? shade(base, -0.35));
  for (let j = 0; j * 4 < h; j++) {
    const off = j % 2 ? 5 : 0;
    for (let i = -1; i * 10 < w; i++) {
      const bx = x + i * 10 + off;
      const x0 = Math.max(bx, x);
      const x1 = Math.min(bx + 9, x + w);
      if (x1 <= x0) continue;
      const col = shade(base, (r() - 0.5) * 0.14);
      rect(c, x0, y + j * 4, x1 - x0, Math.min(3, h - j * 4), col);
    }
  }
}
