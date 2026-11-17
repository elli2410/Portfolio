import {
  K,
  alphaDisc,
  alphaRect,
  art,
  disc,
  dither,
  dot,
  ellipse,
  frame,
  glow,
  glowRect,
  line,
  mix,
  mulberry32,
  rect,
  shade,
  type Ctx,
} from "./px";
import { W } from "./layout";

/* -------------------------------------------------------- the sky backdrop */

const SKY_BANDS = [
  "#04031a",
  "#060421",
  "#0a0630",
  "#100a3c",
  "#180f4d",
  "#22145e",
  "#2f1a6e",
  "#3d217c",
  "#4c2a8a",
];

export const STARS = (() => {
  const r = mulberry32(42);
  const out: { x: number; y: number; big: boolean; ph: number; col: string }[] = [];
  for (let i = 0; i < 150; i++) {
    out.push({
      x: Math.floor(r() * W),
      y: Math.floor(Math.pow(r(), 1.5) * 112),
      big: r() > 0.9,
      ph: r() * 6.28,
      col: r() > 0.7 ? K.rose : r() > 0.5 ? K.ice : K.white,
    });
  }
  return out;
})();

function cloud(c: Ctx, x: number, y: number, w: number, col: string, lit: string, seed: number) {
  const r = mulberry32(seed);
  const n = Math.floor(w / 9);
  for (let i = 0; i < n; i++) {
    const cx = x + (i / (n - 1)) * w;
    const ry = 3 + Math.floor(r() * 4);
    const rx = 8 + Math.floor(r() * 5);
    ellipse(c, cx, y - Math.sin((i / (n - 1)) * Math.PI) * 3, rx, ry, col);
  }
  // lit top edge, from the moon
  for (let i = 0; i < n; i++) {
    const cx = x + (i / (n - 1)) * w;
    rect(c, cx - 5, y - 6 - Math.round(Math.sin((i / (n - 1)) * Math.PI) * 3), 10, 1, lit);
  }
  rect(c, x - 6, y + 2, w + 12, 3, col);
}

function tower(
  c: Ctx,
  x: number,
  top: number,
  w: number,
  base: number,
  col: string,
  rng: () => number,
  lit: readonly string[],
  density = 0.2,
) {
  rect(c, x, top, w, base - top, col);
  rect(c, x, top, 1, base - top, shade(col, 0.1));
  rect(c, x, top, w, 1, shade(col, 0.16));
  for (let wy = top + 4; wy < base - 2; wy += 4) {
    for (let wx = x + 2; wx < x + w - 2; wx += 3) {
      if (rng() < density) dot(c, wx, wy, lit[Math.floor(rng() * lit.length)]);
    }
  }
  if (rng() > 0.55) {
    line(c, x + Math.floor(w / 2), top, x + Math.floor(w / 2), top - 3 - Math.floor(rng() * 6), shade(col, 0.2));
  }
}

export function drawSky(c: Ctx) {
  const r = mulberry32(7);

  // gradient with dithered seams
  const bandH = Math.ceil(150 / SKY_BANDS.length);
  SKY_BANDS.forEach((col, i) => {
    rect(c, 0, i * bandH, W, bandH, col);
    if (i > 0) dither(c, 0, i * bandH - 1, W, 2, col, 1, 0);
  });
  // behind the street: a deep violet haze
  rect(c, 0, 150, W, 150, "#2b1a60");
  dither(c, 0, 150, W, 14, SKY_BANDS[8], 1, 0);
  for (let i = 0; i < 6; i++) rect(c, 0, 164 + i * 24, W, 24, mix("#2b1a60", "#0f0b2a", i / 5));

  // stars
  for (const s of STARS) {
    dot(c, s.x, s.y, s.col);
    if (s.big) {
      dot(c, s.x - 1, s.y, mix(s.col, "#000000", 0.5));
      dot(c, s.x + 1, s.y, mix(s.col, "#000000", 0.5));
      dot(c, s.x, s.y - 1, mix(s.col, "#000000", 0.5));
      dot(c, s.x, s.y + 1, mix(s.col, "#000000", 0.5));
    }
  }
  // shooting star
  line(c, 296, 36, 318, 24, "#6f5ac0");
  line(c, 318, 24, 326, 20, K.white);

  // the moon
  const mx = 398;
  const my = 56;
  glow(c, mx, my, 50, "#9d8bff", 1);
  glow(c, mx, my, 34, "#cbbcff", 0.9);
  disc(c, mx, my, 22, "#cfc4f7");
  disc(c, mx - 1, my - 1, 21, "#e9e2ff");
  disc(c, mx - 3, my - 3, 17, "#f6f1ff");
  // craters
  for (const [dx, dy, rr] of [
    [-8, 4, 5],
    [7, -8, 4],
    [8, 9, 3],
    [-10, -9, 3],
    [0, 14, 2],
    [14, 0, 2],
  ] as const) {
    disc(c, mx + dx, my + dy, rr, "#d6ccf6");
    disc(c, mx + dx - 1, my + dy - 1, Math.max(1, rr - 1), "#c3b6ee");
  }
  // shade the lower right of the moon
  for (let dy = -22; dy <= 22; dy++) {
    for (let dx = -22; dx <= 22; dx++) {
      if (dx * dx + dy * dy <= 484 && dx + dy > 18) alphaRect(c, mx + dx, my + dy, 1, 1, "#7a68c8", 0.35);
    }
  }

  // far cloud banks
  cloud(c, 262, 96, 120, "#2a1a63", "#6c55c8", 3);
  cloud(c, 420, 84, 140, "#321f70", "#7a62d6", 5);
  cloud(c, 120, 128, 90, "#26175a", "#5a45b0", 9);

  // distant skyline: back row (hazy), then front row (dark, windows)
  const lit = [K.pink, K.cyan, K.warm, K.warm, K.lav];
  for (let x = 300; x < W; x += 10 + Math.floor(r() * 8)) {
    const w = 9 + Math.floor(r() * 10);
    tower(c, x, 90 + Math.floor(r() * 50), w, 230, "#2b1d66", r, lit, 0.06);
    x += w - 8;
  }
  for (let x = 292; x < W; x += 8 + Math.floor(r() * 8)) {
    const w = 8 + Math.floor(r() * 12);
    tower(c, x, 70 + Math.floor(r() * 60), w, 230, "#160f3c", r, lit, 0.22);
    x += w - 6;
  }
  // the tall tower, with pink neon edges
  const tx = 504;
  rect(c, tx, 38, 16, 200, "#120c33");
  rect(c, tx + 6, 14, 4, 28, "#120c33");
  line(c, tx + 8, 14, tx + 8, 3, K.lav);
  dot(c, tx + 8, 2, K.red);
  glowRect(c, tx - 1, 40, 2, 170, K.mag, 4, 0.7);
  rect(c, tx - 1, 40, 1, 170, K.mag);
  rect(c, tx + 16, 40, 1, 170, K.pink);
  rect(c, tx + 7, 20, 2, 60, K.pink);
  glowRect(c, tx + 3, 84, 10, 6, K.cyan, 5, 0.9);
  rect(c, tx + 3, 84, 10, 6, K.cyan);
  rect(c, tx + 5, 86, 6, 2, "#0c1a40");
  for (let y = 100; y < 200; y += 6) rect(c, tx + 3, y, 10, 1, "#241a58");
  // a billboard on a lower tower
  rect(c, 446, 104, 18, 14, "#0e0a28");
  glowRect(c, 447, 105, 16, 12, K.mag, 4, 0.8);
  rect(c, 447, 105, 16, 12, "#3a1070");
  rect(c, 449, 108, 12, 2, K.pink);
  rect(c, 449, 112, 8, 2, K.cyan);

  // mid-distance blocks that fill the gaps between the shops (street level)
  const dark = ["#1b1244", "#150e38", "#211650"];
  for (let x = 0; x < W; x += 14 + Math.floor(r() * 14)) {
    const top = 150 + Math.floor(r() * 50);
    const w = 18 + Math.floor(r() * 16);
    tower(c, x, top, w, 300, dark[Math.floor(r() * 3)], r, [K.warm, K.amber, K.pink, K.cyan], 0.18);
    x += w - 12;
  }
}

/* ------------------------------------------- elevated platform & bonsai */

const BANNER = [
  ".....##.....",
  "....####....",
  "...##..##...",
  "..##.##.##..",
  ".##.#..#.##.",
  "..##.##.##..",
  "...##..##...",
  "....####....",
  ".....##.....",
];

export const BONSAI = { x: 122, top: 52 };

export function drawPlatform(c: Ctx) {
  const r = mulberry32(21);

  // steel tower on the far left
  const steel = "#1a1844";
  const steelL = "#2e2a66";
  rect(c, 4, 0, 5, 126, steel);
  rect(c, 4, 0, 1, 126, steelL);
  rect(c, 40, 0, 5, 126, steel);
  rect(c, 40, 0, 1, 126, steelL);
  for (let y = 0; y < 118; y += 18) {
    line(c, 9, y, 40, y + 18, "#241f55");
    line(c, 40, y, 9, y + 18, "#241f55");
    rect(c, 9, y, 31, 1, steel);
  }
  // hanging banner
  rect(c, 14, 62, 20, 2, "#3b2f80");
  rect(c, 16, 64, 16, 28, "#5b21b6");
  rect(c, 16, 64, 1, 28, "#7c3aed");
  rect(c, 31, 64, 1, 28, "#3b1380");
  glowRect(c, 16, 64, 16, 28, K.vio, 5, 0.6);
  rect(c, 16, 64, 16, 28, "#5b21b6");
  art(c, BANNER, { "#": K.lav }, 18, 70);
  rect(c, 20, 82, 8, 1, K.lav);
  rect(c, 22, 92, 4, 5, "#7c3aed");

  // purple blossom bushes behind the railing
  const bush = ["#4b1f8a", "#6a2fb4", "#8a45d6", "#a566ee"];
  for (let i = 0; i < 28; i++) {
    const bx = 46 + r() * 150;
    const by = 96 + r() * 16;
    const br = 4 + Math.floor(r() * 7);
    disc(c, bx, by, br, bush[Math.floor(r() * 2)]);
  }
  for (let i = 0; i < 60; i++) {
    const bx = 44 + r() * 156;
    const by = 88 + r() * 28;
    dot(c, bx, by, bush[2 + Math.floor(r() * 2)]);
  }
  glow(c, 120, 100, 46, K.vio, 0.5);

  // deck
  rect(c, 0, 118, 206, 5, "#2d2766");
  rect(c, 0, 118, 206, 1, "#5b4ec0");
  for (let x = 4; x < 206; x += 9) rect(c, x, 119, 1, 4, "#1c1848");
  rect(c, 0, 123, 206, 3, "#14113a");
  for (let x = 10; x < 200; x += 30) {
    line(c, x, 126, x + 14, 142, "#1c1848");
    line(c, x + 28, 126, x + 14, 142, "#1c1848");
  }
  // railing
  for (let x = 46; x < 206; x += 14) {
    rect(c, x, 104, 2, 14, "#241f55");
    rect(c, x, 104, 1, 14, "#3d3590");
  }
  rect(c, 46, 104, 160, 2, "#3d3590");
  rect(c, 46, 111, 160, 1, "#241f55");
  // ramp going down to the shop roofs on the right
  line(c, 206, 118, 232, 140, "#241f55");
  line(c, 206, 122, 232, 144, "#14113a");
  line(c, 206, 104, 232, 126, "#3d3590");
  // hanging lantern
  rect(c, 190, 123, 1, 10, "#14113a");
  rect(c, 187, 133, 7, 9, "#2b2060");
  rect(c, 188, 134, 5, 7, K.amber);
  rect(c, 189, 135, 3, 5, K.cream);
  glow(c, 190, 137, 14, K.amber, 1);

  // stone planter
  const px = BONSAI.x;
  rect(c, px - 16, 108, 32, 10, "#3b3470");
  rect(c, px - 16, 108, 32, 2, "#6a5fc4");
  rect(c, px - 14, 116, 28, 2, "#1c1848");
  for (let x = px - 12; x < px + 12; x += 6) rect(c, x, 111, 1, 5, "#2a2358");
  rect(c, px - 15, 106, 30, 3, "#2e6a45");
  dot(c, px - 8, 105, K.leafL);
  dot(c, px + 6, 105, K.leafL);

  drawBonsai(c);

  // little lamp on the planter
  rect(c, px + 22, 112, 3, 6, "#241f55");
  rect(c, px + 21, 108, 5, 4, K.amber);
  glow(c, px + 23, 110, 9, K.amber, 0.8);
}

function pad(c: Ctx, cx: number, cy: number, rx: number, ry: number, seed: number) {
  const r = mulberry32(seed);
  // underside, body, light
  ellipse(c, cx, cy + 2, rx, ry, "#8a1f78");
  ellipse(c, cx, cy, rx, ry, "#d2389f");
  ellipse(c, cx - 1, cy - 1, rx - 2, ry - 2, "#ff5fcb");
  ellipse(c, cx - 3, cy - 2, Math.max(2, rx - 8), Math.max(2, ry - 4), "#ff8ee0");
  // scalloped edge
  for (let i = 0; i < rx; i++) {
    const a = r() * Math.PI * 2;
    const ex = cx + Math.cos(a) * rx;
    const ey = cy + Math.sin(a) * ry;
    disc(c, ex, ey, 2, a > 0 && a < Math.PI ? "#d2389f" : "#ff5fcb");
  }
  // blossoms
  for (let i = 0; i < rx * 1.6; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const x = cx + Math.cos(a) * (rx - 2) * d;
    const y = cy + Math.sin(a) * (ry - 1) * d;
    dot(c, x, y, r() > 0.5 ? "#ffd2f6" : "#ffb0ec");
    if (r() > 0.8) dot(c, x + 1, y, "#fff0fb");
  }
  for (let i = 0; i < rx * 0.9; i++) {
    const a = r() * Math.PI * 2;
    dot(c, cx + Math.cos(a) * (rx - 4) * r(), cy + 2 + Math.sin(a) * (ry - 2) * r(), "#a62a8e");
  }
}

function drawBonsai(c: Ctx) {
  const px = BONSAI.x;
  // pink halo behind the whole tree
  glow(c, px + 4, 80, 66, K.mag, 1.1);
  glow(c, px + 4, 76, 40, K.pink, 0.9);

  // trunk: a thick curve with a darker core and a lit edge
  const trunk: [number, number][] = [
    [px, 108],
    [px - 4, 100],
    [px + 1, 93],
    [px - 6, 86],
    [px - 10, 78],
  ];
  for (let i = 0; i < trunk.length - 1; i++) {
    for (let o = -2; o <= 2; o++) {
      line(c, trunk[i][0] + o, trunk[i][1], trunk[i + 1][0] + o, trunk[i + 1][1], o < 0 ? "#6d4129" : o === 0 ? "#4a2a1b" : "#2c180f");
    }
  }
  line(c, px - 2, 106, px - 6, 99, "#a5683d");
  // branches
  line(c, px - 4, 98, px + 22, 90, "#4a2a1b");
  line(c, px - 4, 99, px + 22, 91, "#2c180f");
  line(c, px + 1, 92, px + 30, 80, "#4a2a1b");
  line(c, px - 8, 82, px - 30, 86, "#4a2a1b");
  line(c, px - 10, 78, px - 6, 62, "#4a2a1b");

  // canopy pads, back to front
  pad(c, px - 34, 84, 20, 8, 11);
  pad(c, px + 34, 76, 24, 9, 12);
  pad(c, px + 2, 62, 28, 10, 13);
  pad(c, px - 14, 76, 22, 8, 14);
  pad(c, px + 24, 90, 19, 7, 15);
  pad(c, px - 10, 56, 14, 6, 16);
}

/* ------------------------------------------------------ animated overlays */

/** Twinkling stars: a transparent overlay redrawn a few times a second. */
export function drawTwinkle(c: Ctx, t: number) {
  c.clearRect(0, 0, W, 120);
  for (const s of STARS) {
    const a = 0.5 + 0.5 * Math.sin(t * 1.6 + s.ph);
    if (a > 0.72) {
      alphaRect(c, s.x - 1, s.y, 3, 1, s.col, (a - 0.6) * 1.4);
      alphaRect(c, s.x, s.y - 1, 1, 3, s.col, (a - 0.6) * 1.4);
    } else if (a < 0.18) {
      alphaRect(c, s.x, s.y, 1, 1, K.n1, 0.9);
    }
  }
}

const PETALS = (() => {
  const r = mulberry32(99);
  return Array.from({ length: 46 }, () => ({
    x0: BONSAI.x - 40 + r() * 90,
    y0: 62 + r() * 40,
    vy: 6 + r() * 9,
    sway: 4 + r() * 10,
    ph: r() * 6.28,
    drift: 2 + r() * 5,
    big: r() > 0.7,
    life: 110 + r() * 80,
  }));
})();

/** Soft pink petals drifting down from the bonsai. */
export function drawPetals(c: Ctx, t: number, w: number, h: number) {
  c.clearRect(0, 0, w, h);
  for (const p of PETALS) {
    const fall = (p.vy * t + p.y0 - 62) % p.life;
    const y = p.y0 + fall;
    const x = p.x0 + Math.sin(t * 0.9 + p.ph) * p.sway + fall * (p.drift / 40);
    const fade = fall < 16 ? fall / 16 : fall > p.life - 40 ? Math.max(0, (p.life - fall) / 40) : 1;
    if (fade <= 0.02) continue;
    c.save();
    c.globalAlpha = 0.2 * fade;
    disc(c, x, y, p.big ? 3 : 2, K.mag);
    c.globalAlpha = 0.95 * fade;
    rect(c, x, y, p.big ? 2 : 1, 1, K.pink);
    if (p.big) {
      dot(c, x + 1, y + 1, K.rose);
      dot(c, x - 1, y, K.mag);
    }
    c.restore();
  }
}

/* shared for the stair-head sign etc. */
export function lampPost(c: Ctx, x: number, y: number, h: number, col: string) {
  rect(c, x, y, 2, h, "#1c1848");
  rect(c, x - 3, y - 2, 8, 3, "#2e2a66");
  rect(c, x - 2, y + 1, 6, 1, col);
  glow(c, x + 1, y + 3, 12, col, 0.9);
  frame(c, x - 3, y - 2, 8, 3, "#14113a");
}

export { alphaDisc };
