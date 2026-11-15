import {
  ditherDisc,
  ditherRect,
  dot,
  fogBands,
  glow,
  glowRect,
  hash01,
  line,
  mix,
  mulberry32,
  pick,
  rect,
  rint,
  sagLine,
  shade,
  type Ctx,
  type Rng,
} from "./draw";
import { neonH, neonV } from "./neon";
import { drawTextV } from "./font";
import { INK, NEON, SIGNS_H, SIGNS_V, WALLS, WIN_LIT } from "./palette";
import { textW } from "./font";
import { newFx, type Fx } from "./types";

const SHOP_H = 44;
const NEONS = [NEON.mag, NEON.cyan, NEON.yel, NEON.org, NEON.grn, NEON.mag, NEON.cyan] as const;
const PRODUCTS = ["#ff5a8a", "#ffd23f", "#5bffb6", "#38f0ff", "#ff9a3d", "#b58cff"] as const;

/** Run a painting step so that it only tints pixels that already exist (never the empty sky). */
function atop(c: Ctx, fn: () => void) {
  c.save();
  c.globalCompositeOperation = "source-atop";
  fn();
  c.restore();
}

/** Spots on the ground that should glow with reflected neon. */
export interface Pool {
  x: number;
  col: string;
  r: number;
}

/* ------------------------------------------------------------------ pieces */

export function windowAt(
  c: Ctx,
  rng: Rng,
  fx: Fx,
  x: number,
  y: number,
  w: number,
  h: number,
  wall: string,
  litP: number,
  detail: number,
  cols: readonly string[] = WIN_LIT,
) {
  const r = rng();
  rect(c, x - 1, y - 1, w + 2, h + 2, shade(wall, -0.5));
  if (r < litP) {
    const col = pick(rng, cols);
    rect(c, x, y, w, h, col);
    rect(c, x, y, w, 2, shade(col, 0.35));
    rect(c, x + Math.floor(w / 2), y, 1, h, shade(col, -0.45));
    rect(c, x, y + Math.floor(h / 2), w, 1, shade(col, -0.4));
    if (detail > 0.5 && rng() < 0.2) {
      // someone is home
      rect(c, x + 1, y + h - 4, 2, 3, "#1a0f2a");
      rect(c, x + 1, y + h - 5, 2, 1, "#1a0f2a");
    }
    if (detail > 0.5 && rng() < 0.2) glow(c, x + w / 2, y + h / 2, 8, col, 0.7);
    if (rng() < 0.1) fx.wins.push({ x, y, w, h, col });
  } else if (r < litP + 0.12) {
    // a screen glowing behind a curtain
    const col = mix(pick(rng, [NEON.cyan, NEON.mag, NEON.vio]), wall, 0.62);
    rect(c, x, y, w, h, col);
    rect(c, x, y, w, 1, shade(col, 0.25));
  } else {
    rect(c, x, y, w, h, shade(wall, -0.55));
    rect(c, x, y, w, 1, shade(wall, 0.18));
    if (rng() < 0.35) rect(c, x + 1, y + 2, 1, 3, shade(wall, 0.14));
  }
  rect(c, x - 1, y + h + 1, w + 2, 1, shade(wall, 0.2));
}

export function acUnit(c: Ctx, x: number, y: number) {
  rect(c, x + 1, y, 5, 3, "#2d2858");
  rect(c, x + 1, y, 5, 1, "#4a4284");
  rect(c, x + 2, y + 1, 3, 1, "#15102e");
}

export function pipe(c: Ctx, x: number, y0: number, y1: number) {
  rect(c, x, y0, 2, y1 - y0, "#0c0a1c");
  rect(c, x, y0, 1, y1 - y0, "#3b3566");
  for (let y = y0 + 6; y < y1; y += 14) rect(c, x - 1, y, 4, 2, "#241d48");
}

export function vine(c: Ctx, rng: Rng, x: number, y: number, len: number) {
  let vx = x;
  for (let i = 0; i < len; i++) {
    dot(c, vx, y + i, i % 2 ? "#0f5a45" : "#1c8a62");
    if (i % 4 === 1) dot(c, vx + (rng() < 0.5 ? -1 : 1), y + i, "#2fd08a");
    if (rng() < 0.12) vx += rng() < 0.5 ? -1 : 1;
  }
  dot(c, vx, y + len, pick(rng, [NEON.mag, NEON.cyan, NEON.yel]));
}

export function plantPot(c: Ctx, rng: Rng, x: number, y: number) {
  rect(c, x, y - 3, 4, 3, "#5a2a48");
  rect(c, x, y - 3, 4, 1, "#7a3a60");
  for (let k = 0; k < 9; k++) {
    dot(c, x - 1 + rng() * 6, y - 4 - rng() * 5, pick(rng, ["#0f5a45", "#1c8a62", "#2fd08a"]));
  }
  if (rng() < 0.6) dot(c, x + rint(rng, 0, 3), y - 8 - rint(rng, 0, 2), pick(rng, [NEON.mag, NEON.cyan]));
}

export function balcony(c: Ctx, rng: Rng, x: number, y: number, w: number, wall: string) {
  rect(c, x, y, w, 2, shade(wall, 0.25));
  rect(c, x, y + 2, w, 1, shade(wall, -0.5));
  rect(c, x, y - 6, w, 1, "#2d2858");
  for (let rx = x; rx < x + w; rx += 3) rect(c, rx, y - 6, 1, 6, "#241d48");
  const n = rint(rng, 1, 3);
  for (let i = 0; i < n; i++) plantPot(c, rng, x + 2 + Math.floor(rng() * Math.max(1, w - 8)), y);
  for (let i = 0; i < 3; i++) {
    if (rng() < 0.7) vine(c, rng, x + 1 + Math.floor(rng() * (w - 2)), y + 3, rint(rng, 8, 30));
  }
}

export function roofGear(c: Ctx, rng: Rng, fx: Fx, x: number, w: number, top: number, wall: string, detail: number) {
  rect(c, x - 1, top - 2, w + 2, 2, shade(wall, 0.2));
  rect(c, x - 1, top - 2, w + 2, 1, shade(wall, 0.38));
  if (detail < 0.5) return;
  if (rng() < 0.35 && w > 20) {
    const tx = x + rint(rng, 3, w - 13);
    rect(c, tx, top - 12, 9, 8, "#2a2450");
    rect(c, tx, top - 12, 9, 1, "#4a4284");
    rect(c, tx + 1, top - 14, 7, 2, "#352d62");
    rect(c, tx + 1, top - 4, 1, 2, "#15102e");
    rect(c, tx + 7, top - 4, 1, 2, "#15102e");
  }
  if (rng() < 0.55) {
    const ax = x + rint(rng, 2, w - 3);
    const ah = rint(rng, 10, 26);
    rect(c, ax, top - ah, 1, ah, "#2d2858");
    rect(c, ax - 2, top - ah + 4, 5, 1, "#2d2858");
    rect(c, ax - 1, top - ah + 8, 3, 1, "#2d2858");
    dot(c, ax, top - ah - 1, NEON.red);
    fx.blink.push({ x: ax, y: top - ah - 1, col: NEON.red });
  }
  if (rng() < 0.3) {
    // vent pipe with a plume of steam
    const vx = x + rint(rng, 3, Math.max(4, w - 5));
    rect(c, vx, top - 6, 3, 4, "#241d48");
    rect(c, vx - 1, top - 7, 5, 1, "#3b3566");
    fx.steam.push({ x: vx + 1, y: top - 8 });
  }
  if (rng() < 0.22 && w >= 30) {
    // rooftop billboard
    const bw = Math.min(w - 8, rint(rng, 22, 36));
    const bx = x + 4;
    const by = top - 20;
    const a = pick(rng, [NEON.mag, NEON.cyan, NEON.yel]);
    const b = pick(rng, [NEON.vio, NEON.org, NEON.cyan]);
    glowRect(c, bx, by, bw, 14, a, 8, 0.8);
    rect(c, bx - 1, by - 1, bw + 2, 16, "#0a0618");
    rect(c, bx, by, bw, 14, mix(a, "#000000", 0.5));
    rect(c, bx + 3, top - 6, 2, 4, "#15102e");
    rect(c, bx + bw - 5, top - 6, 2, 4, "#15102e");
    fx.ads.push({ x: bx, y: by, w: bw, h: 14, a, b });
  }
}

/* ----------------------------------------------------------------- facades */

function facade(
  c: Ctx,
  rng: Rng,
  fx: Fx,
  x: number,
  w: number,
  y0: number,
  y1: number,
  wall: string,
  detail: number,
  litP: number,
  shopH: number,
) {
  const h = y1 - y0;
  rect(c, x, y0, w, h, wall);
  rect(c, x, y0, 2, h, shade(wall, 0.08));
  rect(c, x + w - 2, y0, 2, h, shade(wall, -0.3));
  rect(c, x, y0, w, 2, shade(wall, 0.1));

  const winW = 6;
  const winH = 9;
  const gap = 5;
  const margin = 4;
  const cols = Math.max(1, Math.floor((w - margin * 2 + gap) / (winW + gap)));
  const used = cols * (winW + gap) - gap;
  const startX = x + Math.floor((w - used) / 2);
  const floorH = rint(rng, 17, 20);
  const bottom = y1 - shopH;

  let floorIndex = 0;
  for (let fy = y0 + 5; fy + floorH <= bottom + 1; fy += floorH) {
    const ly = fy + floorH - 2;
    rect(c, x, ly, w, 1, shade(wall, 0.12));
    rect(c, x, ly + 1, w, 1, shade(wall, -0.35));
    for (let i = 0; i < cols; i++) {
      const wx = startX + i * (winW + gap);
      windowAt(c, rng, fx, wx, fy + 3, winW, winH, wall, litP, detail);
      if (detail > 0.5 && rng() < 0.14) acUnit(c, wx, fy + 3 + winH + 2);
    }
    if (detail > 0.5 && floorIndex > 0 && rng() < 0.28 && w >= 36) {
      balcony(c, rng, startX + rint(rng, 0, Math.max(0, used - 24)), ly, Math.min(used, 24), wall);
    }
    floorIndex++;
  }
  if (detail > 0.5) {
    for (let i = 0; i < 2; i++) {
      if (rng() < 0.55) pipe(c, x + rint(rng, 2, w - 4), y0 + 4, bottom);
    }
  }
}

interface ShopStyle {
  a: string;
  b: string;
}
const SHOPS: ShopStyle[] = [
  { a: "#ffb347", b: "#3a1f4a" },
  { a: "#38f0ff", b: "#0e2a44" },
  { a: "#ff58d8", b: "#2a1040" },
  { a: "#ffd23f", b: "#3a2210" },
];

export function shopfront(c: Ctx, rng: Rng, fx: Fx, pools: Pool[], x: number, w: number, base: number, wall: string) {
  const sh = SHOP_H;
  const top = base - sh;
  const style = pick(rng, SHOPS);
  const neon = pick(rng, NEONS);
  rect(c, x, top, w, sh, "#0b0720");
  rect(c, x, top, w, 1, shade(wall, 0.2));

  const doorW = 9;
  const doorLeft = rng() < 0.5;
  const doorX = doorLeft ? x + 3 : x + w - doorW - 3;
  const winX = doorLeft ? x + doorW + 6 : x + 3;
  const winW = w - doorW - 9;
  const winY = top + 12;
  const winH = 28;

  if (winW > 8) {
    rect(c, winX - 1, winY - 1, winW + 2, winH + 2, "#05020f");
    for (let i = 0; i < winH; i++) rect(c, winX, winY + i, winW, 1, mix(style.a, style.b, (i / winH) * 1.1));
    // shelves with goods, a counter, and the odd silhouette
    rect(c, winX, winY + 8, winW, 1, "#150b25");
    for (let gx = winX + 1; gx < winX + winW - 1; gx += 3) {
      if (rng() < 0.8) rect(c, gx, winY + 6, 2, 2, pick(rng, PRODUCTS));
      if (rng() < 0.6) rect(c, gx, winY + 15, 2, 2, pick(rng, PRODUCTS));
      if (rng() < 0.3) dot(c, gx, winY + 1, "#fff6d8"); // ceiling lights
    }
    rect(c, winX, winY + 16, winW, 1, "#150b25");
    rect(c, winX, winY + winH - 5, winW, 5, "#120a22");
    rect(c, winX, winY + winH - 5, winW, 1, shade(style.b, 0.4));
    if (rng() < 0.7) {
      const px = winX + rint(rng, 2, Math.max(3, winW - 7));
      rect(c, px, winY + winH - 12, 4, 3, "#0a0516");
      rect(c, px - 1, winY + winH - 9, 6, 4, "#0a0516");
    }
    // diagonal glass glints
    for (let k = 0; k < 3; k++) line(c, winX + 3 + k * 7, winY + winH - 2, winX + 9 + k * 7, winY + 2, shade(style.a, 0.5));
    glowRect(c, winX, winY, winW, winH, style.a, 6, 0.9);
    pools.push({ x: winX + winW / 2, col: style.a, r: Math.max(10, winW) });
  }

  // door
  rect(c, doorX, top + 10, doorW, sh - 10, "#05020f");
  rect(c, doorX + 1, top + 11, doorW - 2, sh - 12, mix(style.a, "#000000", 0.6));
  rect(c, doorX + 1, top + 11, doorW - 2, 1, shade(style.a, 0.2));
  dot(c, doorX + (doorLeft ? doorW - 3 : 2), top + 26, "#f2e8ff");

  // striped awning
  const c1 = mix(neon, "#000000", 0.4);
  const c2 = mix(neon, "#000000", 0.78);
  for (let i = 0; i < w; i++) {
    const col = Math.floor(i / 3) % 2 ? c1 : c2;
    rect(c, x + i, top + 3, 1, 6, col);
    if (i % 3 === 1) dot(c, x + i, top + 9, col);
  }
  rect(c, x, top + 3, w, 1, shade(neon, -0.1));

  // sign above the awning
  let text = pick(rng, SIGNS_H);
  const big = rng() < 0.55;
  const scale = big ? 2 : 1;
  let guard = 0;
  while (textW(text, scale) + 5 > w - 4 && guard++ < 30) text = pick(rng, SIGNS_H);
  const useScale = textW(text, scale) + 5 > w - 4 ? 1 : scale;
  const sw = textW(text, useScale) + 5;
  const r = neonH(c, x + Math.floor((w - sw) / 2), top - (useScale === 2 ? 19 : 13), text, neon, useScale, 1.1);
  fx.flick.push(r);
  pools.push({ x: x + w / 2, col: neon, r: Math.max(12, Math.round(w * 0.45)) });
}

/** A whole building: body, windows, rooftop gear, signs, shop. */
export function tenement(
  c: Ctx,
  rng: Rng,
  fx: Fx,
  pools: Pool[],
  o: { x: number; w: number; top: number; base: number; wall: string; detail: number; litP: number; shop: boolean },
) {
  const { x, w, top, base, wall, detail, litP, shop } = o;
  const h = base - top;
  const setback = detail > 0.5 && w > 44 && rng() < 0.35;
  const sbH = setback ? Math.round(h * 0.2) : 0;
  const inset = setback ? rint(rng, 5, 9) : 0;

  facade(c, rng, fx, x, w, top + sbH, base, wall, detail, litP, shop ? SHOP_H : 0);
  if (setback) {
    facade(c, rng, fx, x + inset, w - inset * 2, top, top + sbH + 3, shade(wall, -0.05), detail, litP, 0);
    roofGear(c, rng, fx, x + inset, w - inset * 2, top, wall, detail);
  } else {
    roofGear(c, rng, fx, x, w, top, wall, detail);
  }
  if (shop) shopfront(c, rng, fx, pools, x, w, base, wall);

  // edge lighting from the street: magenta on one side, cyan on the other
  const rimA = rng() < 0.5 ? NEON.mag : NEON.cyan;
  const rimB = rimA === NEON.mag ? NEON.cyan : NEON.mag;
  ditherRect(c, x, top + sbH, 2, base - top - sbH, rimA, 0.5);
  ditherRect(c, x + w - 2, top + sbH, 2, base - top - sbH, rimB, 0.35, 1);

  if (detail > 0.5) {
    // a vertical neon blade sign sticking out from a corner
    if (rng() < 0.55) {
      const text = pick(rng, SIGNS_V);
      const col = pick(rng, NEONS);
      const sy = top + sbH + rint(rng, 14, Math.max(16, Math.round(h * 0.4)));
      const sx = rng() < 0.5 ? x - 4 : x + w - 3;
      fx.flick.push(neonV(c, sx, sy, text, col, 1));
    }
    // vines spilling from the roof edge
    for (let i = 0; i < 3; i++) {
      if (rng() < 0.55) vine(c, rng, x + rint(rng, 1, w - 2), top + sbH, rint(rng, 10, 46));
    }
  }
}

/* ------------------------------------------------------------ street gear */

export function vending(c: Ctx, rng: Rng, pools: Pool[], x: number, fy: number) {
  const w = 13;
  const h = 21;
  const col = pick(rng, [NEON.cyan, NEON.mag, NEON.red, NEON.yel]);
  rect(c, x, fy - h, w, h, "#171233");
  rect(c, x, fy - h, w, 1, "#3b3566");
  rect(c, x + 1, fy - h + 2, w - 5, h - 8, mix(col, "#000000", 0.5));
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 3; k++) rect(c, x + 2 + k * 2, fy - h + 4 + r * 4, 1, 2, pick(rng, PRODUCTS));
  }
  rect(c, x + w - 3, fy - h + 3, 2, 9, "#0a0618");
  for (let k = 0; k < 3; k++) dot(c, x + w - 3, fy - h + 4 + k * 3, pick(rng, PRODUCTS));
  rect(c, x + 2, fy - 5, w - 5, 2, "#05020f");
  rect(c, x + 1, fy - 1, 2, 1, "#0a0618");
  rect(c, x + w - 3, fy - 1, 2, 1, "#0a0618");
  glowRect(c, x + 1, fy - h + 2, w - 5, h - 8, col, 7, 1);
  pools.push({ x: x + w / 2, col, r: 11 });
}

export function lamp(c: Ctx, fx: Fx, pools: Pool[], x: number, fy: number, col: string) {
  rect(c, x, fy - 38, 2, 38, "#241d48");
  rect(c, x, fy - 38, 1, 38, "#3b3566");
  rect(c, x - 1, fy - 3, 4, 3, "#1a1432");
  rect(c, x, fy - 39, 8, 2, "#241d48");
  rect(c, x + 5, fy - 38, 7, 2, "#0a0618");
  rect(c, x + 6, fy - 37, 5, 1, shade(col, 0.5));
  const lx = x + 8;
  for (let y = 0; y < 36; y++) {
    const hw = 2 + Math.floor(y * 0.2);
    ditherRect(c, lx - hw, fy - 36 + y, hw * 2 + 1, 1, col, 0.1, y);
  }
  glowRect(c, lx - 4, fy - 38, 9, 3, col, 7, 0.9);
  pools.push({ x: lx, col, r: 16 });
  fx.lamps.push({ x: lx, y: fy - 36, col });
}

export function pole(c: Ctx, x: number, fy: number, top: number) {
  rect(c, x, top, 3, fy - top, "#14102c");
  rect(c, x, top, 1, fy - top, "#352d62");
  rect(c, x - 1, fy - 3, 5, 3, "#0f0a24");
  rect(c, x - 9, top + 6, 21, 2, "#14102c");
  rect(c, x - 6, top + 15, 15, 2, "#14102c");
  for (const px of [x - 9, x - 4, x + 6, x + 11]) rect(c, px, top + 4, 1, 2, "#6a5fb0");
  for (const px of [x - 6, x + 8]) rect(c, px, top + 13, 1, 2, "#6a5fb0");
  rect(c, x + 3, top + 24, 6, 10, "#1d1740");
  rect(c, x + 3, top + 24, 6, 1, "#3b3566");
}

export function cart(c: Ctx, rng: Rng, fx: Fx, pools: Pool[], x: number, fy: number) {
  const w = 36;
  rect(c, x, fy - 27, w, 23, "#1a1030");
  // warm interior
  rect(c, x + 3, fy - 24, w - 6, 13, "#4a2236");
  for (let i = 0; i < 13; i++) rect(c, x + 3, fy - 24 + i, w - 6, 1, mix("#ffb36a", "#4a2236", i / 13));
  // chef
  rect(c, x + 14, fy - 22, 5, 5, "#e8b896");
  rect(c, x + 13, fy - 27, 7, 3, "#f4f0ff");
  rect(c, x + 12, fy - 17, 9, 6, "#f4f0ff");
  dot(c, x + 15, fy - 20, "#2a1030");
  dot(c, x + 17, fy - 20, "#2a1030");
  // shelf of bottles
  for (let k = 0; k < 5; k++) rect(c, x + 4 + k * 2, fy - 22, 1, 3, pick(rng, PRODUCTS));
  // counter
  rect(c, x - 1, fy - 12, w + 2, 3, "#4a2f3a");
  rect(c, x - 1, fy - 12, w + 2, 1, "#8a6070");
  for (let k = 0; k < 3; k++) {
    rect(c, x + 5 + k * 9, fy - 14, 4, 2, "#f4f0ff");
    dot(c, x + 6 + k * 9, fy - 15, "#ffb36a");
  }
  rect(c, x, fy - 9, w, 6, "#12091f");
  rect(c, x + 2, fy - 4, 2, 4, "#0a0618");
  rect(c, x + w - 4, fy - 4, 2, 4, "#0a0618");
  // noren curtain
  for (let k = 0; k < 6; k++) {
    rect(c, x + 2 + k * 6, fy - 27, 4, 8, mix(NEON.cyan, "#000000", 0.55));
    rect(c, x + 2 + k * 6, fy - 27, 4, 1, NEON.cyan);
  }
  // red awning
  for (let i = 0; i < w + 4; i++) {
    const col = Math.floor(i / 3) % 2 ? "#c42a5a" : "#f4e8ff";
    rect(c, x - 2 + i, fy - 32, 1, 5, col);
    if (i % 3 === 1) dot(c, x - 2 + i, fy - 27, col);
  }
  // lanterns
  for (const lx of [x - 3, x + w + 1]) {
    rect(c, lx, fy - 27, 3, 5, "#ff5a3a");
    rect(c, lx + 1, fy - 26, 1, 3, "#ffd36a");
    glow(c, lx + 1, fy - 25, 9, "#ff7a4a", 0.9);
  }
  // stools
  for (const sx of [x + 6, x + 22]) {
    rect(c, sx, fy - 5, 5, 2, "#6a3a2a");
    rect(c, sx + 1, fy - 3, 1, 3, "#2a1a1a");
    rect(c, sx + 3, fy - 3, 1, 3, "#2a1a1a");
  }
  fx.flick.push(neonH(c, x + 5, fy - 46, "RAMEN", NEON.red, 1, 1));
  fx.steam.push({ x: x + 16, y: fy - 28 });
  pools.push({ x: x + w / 2, col: "#ff8a4a", r: 20 });
}

export function bin(c: Ctx, x: number, fy: number) {
  rect(c, x, fy - 8, 7, 8, "#1b1538");
  rect(c, x - 1, fy - 9, 9, 2, "#2d2858");
  rect(c, x, fy - 8, 1, 8, "#3b3566");
  rect(c, x + 2, fy - 5, 3, 1, "#0a0618");
}

export function crates(c: Ctx, rng: Rng, x: number, fy: number) {
  for (let i = 0; i < 3; i++) {
    const w = rint(rng, 6, 8);
    rect(c, x + i * 7, fy - w, w, w, "#3a2a4a");
    rect(c, x + i * 7, fy - w, w, 1, "#5a4a72");
    rect(c, x + i * 7, fy - 1, w, 1, "#1a1030");
    rect(c, x + i * 7 + 1, fy - w + 2, w - 2, 1, "#241a38");
  }
  rect(c, x + 3, fy - 15, 7, 7, "#3a2a4a");
  rect(c, x + 3, fy - 15, 7, 1, "#5a4a72");
}

/* ------------------------------------------------------------------ ground */

export function drawGround(c: Ctx, rng: Rng, pools: Pool[], NW: number, H: number, gy: number) {
  // sidewalk
  rect(c, 0, gy, NW, 8, "#14102a");
  rect(c, 0, gy + 8, NW, 7, "#19133a");
  rect(c, 0, gy, NW, 1, "#352d62");
  for (let x = -((gy * 3) % 18); x < NW; x += 18) {
    rect(c, x, gy + 1, 1, 7, "#1f1842");
    rect(c, x + 9, gy + 9, 1, 6, "#231b4a");
  }
  rect(c, 0, gy + 8, NW, 1, "#201946");
  // wet sheen
  for (let i = 0; i < NW / 26; i++) {
    const px = rng() * NW;
    const py = gy + 3 + rng() * 10;
    ditherRect(c, px, py, rint(rng, 8, 22), 2, "#4a3d9a", 0.35, i);
  }
  // curb
  rect(c, 0, gy + 15, NW, 1, "#5a4a98");
  rect(c, 0, gy + 16, NW, 2, "#241c48");
  rect(c, 0, gy + 18, NW, 1, "#05020f");
  // road
  rect(c, 0, gy + 19, NW, H - gy - 19, "#0c081e");
  rect(c, 0, gy + 19, NW, 6, "#100a26");
  for (let x = 6; x < NW; x += 28) rect(c, x, gy + 37, 13, 1, "#b8962e");
  // crosswalks
  for (const cx of [380, 1320, 2380]) {
    for (let k = 0; k < 9; k++) rect(c, cx + k * 7, gy + 21, 4, 16, "#4a4178");
  }
  // puddles and manholes
  for (let i = 0; i < NW / 90; i++) {
    const px = rng() * NW;
    const py = gy + 26 + rng() * (H - gy - 30);
    ditherRect(c, px, py, rint(rng, 14, 38), rint(rng, 2, 4), "#2a2160", 0.5, i);
  }
  for (let x = 70; x < NW; x += 190 + rint(rng, 0, 60)) {
    const my = gy + 30;
    rect(c, x, my, 8, 3, "#05020f");
    rect(c, x + 1, my, 6, 1, "#2a2150");
  }
  // light pools: neon spilling onto the pavement
  for (const p of pools) {
    for (let dy = -4; dy <= 4; dy++) {
      const hw = Math.round(p.r * Math.sqrt(Math.max(0, 1 - (dy / 4.5) ** 2)));
      ditherRect(c, p.x - hw, gy + 8 + dy, hw * 2, 1, p.col, 0.16, dy);
    }
    for (let dy = -2; dy <= 2; dy++) {
      const hw = Math.round(p.r * 0.5 * Math.sqrt(Math.max(0, 1 - (dy / 2.5) ** 2)));
      ditherRect(c, p.x - hw, gy + 8 + dy, hw * 2, 1, p.col, 0.22, dy + 1);
    }
  }
}
