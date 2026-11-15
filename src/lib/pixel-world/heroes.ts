import {
  ditherRect,
  dot,
  glowRect,
  line,
  mix,
  pick,
  rect,
  rint,
  shade,
  type Ctx,
  type Rng,
} from "./draw";
import {
  acBig,
  brick,
  cable,
  cableBundle,
  corrugated,
  discPx,
  pipeH,
  pipeV,
  plate,
  poly,
  rust,
  slantRoof,
  slit,
  spill,
} from "./art";
import { drawGlyph } from "./kanji";
import { drawText, textW } from "./font";
import { kanjiV, roundSign } from "./kanji";
import { neonH } from "./neon";
import type { Pool } from "./city";
import type { Fx } from "./types";

export const RED = "#ff2a4a";
export const CYAN = "#38f0ff";
export const MAG = "#ff3fd0";
export const AMBER = "#ffb347";
const BLACK = "#04040a";
const WALL = ["#0b0b15", "#0e0e1a", "#101018", "#0a0f18"];

/* ------------------------------------------------------------------ billboard */

/** The silhouette on the screen: a runner in a high-collar jacket, one arm raised. */
function silhouette(c: Ctx, x: number, yb: number, s: number) {
  const P = (pts: [number, number][]) => pts.map(([px, py]) => [x + px * s, yb + py * s] as [number, number]);
  const ink = "#0a0206";
  // hair streaming back
  poly(c, P([[-12, -152], [10, -160], [26, -150], [22, -134], [12, -142], [-6, -138], [-34, -124], [-60, -108], [-48, -132]]), ink);
  poly(c, P([[-18, -134], [-52, -138], [-84, -122], [-100, -100], [-66, -118], [-40, -122]]), ink);
  // head, jaw and neck
  discPx(c, x + 2 * s, yb - 134 * s, Math.round(16 * s), ink);
  poly(c, P([[-10, -122], [14, -122], [12, -108], [-4, -106]]), ink);
  // shoulders and torso
  poly(c, P([[-46, 0], [-42, -66], [-32, -94], [-14, -106], [16, -106], [34, -96], [44, -68], [50, 0]]), ink);
  // high collar
  poly(c, P([[-14, -106], [-6, -122], [4, -108], [14, -122], [20, -106]]), ink);
  // raised arm and open hand
  poly(c, P([[30, -98], [60, -116], [72, -150], [82, -150], [72, -112], [52, -86]]), ink);
  discPx(c, x + 78 * s, yb - 152 * s, Math.max(2, Math.round(6 * s)), ink);
  // the visor, the only light on her
  rect(c, Math.round(x - 11 * s), Math.round(yb - 136 * s), Math.round(26 * s), Math.max(2, Math.round(2.5 * s)), CYAN);
  rect(c, Math.round(x - 11 * s), Math.round(yb - 134 * s), Math.round(26 * s), 1, "#dffcff");
  // jacket seam and a glowing patch
  rect(c, Math.round(x - 2 * s), Math.round(yb - 100 * s), 1, Math.round(100 * s), "#2a0a10");
  rect(c, Math.round(x + 22 * s), Math.round(yb - 70 * s), Math.round(10 * s), Math.round(3 * s), MAG);
}

/**
 * The huge ad that owns the top of the page: a red screen with a silhouette,
 * the name in white-hot letters, steel framing, a catwalk and flood lamps.
 */
export function billboard(c: Ctx, rng: Rng, fx: Fx, W: number, yc: number) {
  const bw = Math.min(Math.round(W * 0.7), 480);
  const bh = Math.round(bw * 0.56);
  const bx = Math.round((W - bw) / 2);
  const by = Math.round(yc - bh / 2 - 14);

  // steel legs, a catwalk and braces under the board
  const cwY = by + bh + 34;
  for (const lx of [bx + 18, bx + bw - 30]) {
    plate(c, rng, lx, by + bh, 12, 70, "#12121c");
    line(c, lx + 6, cwY + 6, lx + (lx < W / 2 ? 46 : -46), cwY + 64, "#0c0c16");
    line(c, lx + 7, cwY + 6, lx + (lx < W / 2 ? 47 : -45), cwY + 64, "#0c0c16");
  }
  rect(c, bx - 30, cwY, bw + 60, 5, "#14141e");
  rect(c, bx - 30, cwY, bw + 60, 1, "#3a3a50");
  rect(c, bx - 30, cwY + 5, bw + 60, 2, "#030308");
  for (let rx = bx - 30; rx < bx + bw + 30; rx += 6) rect(c, rx, cwY - 9, 1, 9, "#0a0a12");
  rect(c, bx - 30, cwY - 9, bw + 60, 1, "#2a2a3c");
  pipeH(c, bx - 60, bx + bw + 60, cwY + 12, 4, "#1a1a26");

  // the frame
  plate(c, rng, bx - 9, by - 9, bw + 18, bh + 18, "#14141e");
  rect(c, bx - 3, by - 3, bw + 6, bh + 6, "#020206");

  // the screen: deep red at the edges, hot in the middle, scanlines across
  for (let y = 0; y < bh; y++) {
    const t = y / bh;
    const col = t < 0.5 ? mix("#4a0414", "#e0243e", t * 2) : mix("#e0243e", "#6a0a1c", (t - 0.5) * 2);
    rect(c, bx, by + y, bw, 1, y % 3 === 2 ? shade(col, -0.22) : col);
  }
  // a skyline cut from the lower part of the screen
  let sx = bx;
  while (sx < bx + bw) {
    const w = rint(rng, 8, 22);
    const h = rint(rng, 16, Math.round(bh * 0.4));
    const ww = Math.min(w, bx + bw - sx);
    rect(c, sx, by + bh - h, ww, h, "#5a0818");
    for (let wy = by + bh - h + 3; wy < by + bh - 3; wy += 4) {
      for (let wx = sx + 2; wx < sx + ww - 2; wx += 4) if (rng() < 0.22) rect(c, wx, wy, 2, 2, "#ff8a7a");
    }
    sx += w + 1;
  }
  // slanting rain of light
  for (let i = 0; i < bw / 5; i++) {
    const rx = bx + rint(rng, 0, bw - 1);
    const ry = by + rint(rng, 0, bh - 20);
    line(c, rx, ry, rx - 6, ry + 16, "#ff7a8a");
  }
  silhouette(c, bx + Math.round(bw * 0.3), by + bh, bh / 270);

  // the name
  const tx = bx + Math.round(bw * 0.52);
  const ty = by + Math.round(bh * 0.2);
  const ts = bw > 300 ? 5 : 3;
  drawText(c, tx - 1, ty, "ELLI DEV", CYAN, ts);
  drawText(c, tx + 1, ty + 1, "ELLI DEV", MAG, ts);
  drawText(c, tx, ty, "ELLI DEV", "#fff6f2", ts);
  const sub = ty + ts * 7;
  rect(c, tx, sub - 4, textW("ELLI DEV", ts) - 1, 2, "#fff6f2");
  drawText(c, tx, sub + 2, "PORTFOLIO 2026", "#ffe9c8", bw > 300 ? 2 : 1);
  drawText(c, tx, sub + (bw > 300 ? 22 : 12), "OPEN TO INTERNSHIPS", AMBER, 1);
  drawText(c, bx + 8, by + 8, "ON AIR", "#fff6f2", 1);
  discPx(c, bx + 40, by + 10, 2, "#ffffff");
  fx.ads.push({ x: bx, y: by, w: bw, h: bh, a: "#000000", b: "#000000", scan: true });

  // flood lamps along the top, and light from the screen on everything around it
  for (let lx = bx + 16; lx < bx + bw - 10; lx += 46) {
    rect(c, lx, by - 20, 12, 7, "#0a0a12");
    rect(c, lx, by - 20, 12, 1, "#3a3a50");
    rect(c, lx + 2, by - 13, 8, 2, "#fff2d8");
    rect(c, lx + 5, by - 12, 2, 3, "#0a0a12");
  }
  glowRect(c, bx - 4, by - 4, bw + 8, bh + 8, RED, 12, 1.1);
  return { bx, by, bw, bh, cwY };
}

/* ------------------------------------------------------------------ the alley */

export type Side = "L" | "R";

export interface Slab {
  y0: number;
  y1: number;
  reach: number;
}

/**
 * One piece of wall. Every one is a different material, and every one is
 * crowded with the things that actually hang on walls: pipes, big AC units,
 * dark windows, cables.
 */
export function slab(c: Ctx, rng: Rng, fx: Fx, side: Side, W: number, s: Slab, light: string) {
  const w = s.reach + 12;
  const x = side === "L" ? -12 : W - s.reach;
  const h = s.y1 - s.y0;
  const base = pick(rng, WALL);
  const kind = rng();
  if (kind < 0.4) corrugated(c, rng, x, s.y0, w, h, shade(base, -0.05), 0.8);
  else if (kind < 0.75) brick(c, rng, x, s.y0, w, h, mix(base, "#3a1a14", 0.2));
  else {
    rect(c, x, s.y0, w, h, base);
    for (let py = s.y0 + 4; py < s.y1 - 30; py += 52) plate(c, rng, x + 4, py, w - 8, 46, shade(base, 0.02));
  }
  // dark with a lit edge toward the street
  const inner = side === "L" ? x + w - 2 : x;
  rect(c, inner, s.y0, 2, h, shade(base, 0.5));
  ditherRect(c, side === "L" ? x + w - 14 : x, s.y0, 14, h, "#000000", 0.35, 0);
  ditherRect(c, side === "L" ? x : x + w - 14, s.y0, 14, h, "#000000", 0.45, 1);

  // pipes
  for (let k = 0; k < rint(rng, 1, 3); k++) {
    pipeV(c, x + rint(rng, 6, w - 14), s.y0, s.y1, rint(rng, 4, 6), pick(rng, ["#1e2230", "#241c1c", "#1a2a2a"]), rng);
  }
  // big AC units
  for (let k = 0; k < rint(rng, 1, 3); k++) {
    const aw = rint(rng, 30, 44);
    const ay = s.y0 + rint(rng, 14, Math.max(16, h - 60));
    const ax = x + rint(rng, 4, Math.max(5, w - aw - 4));
    acBig(c, rng, ax, ay, aw, Math.round(aw * 0.72), pick(rng, [RED, CYAN, "#5bffb6"]));
  }
  // windows: big, dark, some lit
  for (let k = 0; k < rint(rng, 1, 2); k++) {
    const ww = rint(rng, 14, 22);
    const wy = s.y0 + rint(rng, 10, Math.max(12, h - 50));
    const wx = x + rint(rng, 6, Math.max(7, w - ww - 6));
    slit(c, rng, wx, wy, ww, rint(rng, 18, 26), rng() < 0.4 ? pick(rng, [AMBER, CYAN, RED]) : null);
  }
  rust(c, rng, x, s.y0, w, h, 0.4);
  // a roof lip so slabs read as separate buildings stacked in depth
  slantRoof(c, rng, side === "L" ? x : x - 14, s.y0 - 8, side === "L" ? x + w + 14 : x + w, s.y0 - 4, 6, shade(base, 0.25), light);
  void fx;
}

/** A tall vending machine, three-quarter view, bright against the dark. */
export function vendMachine(c: Ctx, rng: Rng, fx: Fx, x: number, yb: number, fw: number, h: number, col: string, pools: Pool[]) {
  const y = yb - h;
  const sideW = Math.round(fw * 0.2);
  // side face, darker, and a lit edge
  poly(c, [[x + fw, y + 3], [x + fw + sideW, y], [x + fw + sideW, yb - 3], [x + fw, yb]], "#07070e");
  rect(c, x + fw + sideW - 1, y, 1, h - 3, "#1a1a28");
  // front
  rect(c, x, y, fw, h, "#13131d");
  rect(c, x, y, fw, 2, "#34344a");
  rect(c, x, y, 1, h, "#2a2a3a");
  rect(c, x + fw - 1, y, 1, h, "#06060c");
  // lit header
  const hh = Math.round(h * 0.14);
  for (let i = 0; i < hh; i++) rect(c, x + 3, y + 4 + i, fw - 6, 1, mix(col, shade(col, -0.5), i / hh));
  drawText(c, x + Math.round((fw - textW("COLA", 2)) / 2), y + 4 + Math.round((hh - 10) / 2), "COLA", "#ffffff", 2);
  // product window
  const wx = x + 4;
  const wy = y + hh + 8;
  const ww = Math.round(fw * 0.72);
  const wh = Math.round(h * 0.56);
  rect(c, wx - 1, wy - 1, ww + 2, wh + 2, "#020207");
  for (let i = 0; i < wh; i++) rect(c, wx, wy + i, ww, 1, mix("#e8fbff", "#6ac8d8", i / wh));
  const rows = 4;
  const cols = 5;
  const cw = Math.floor(ww / cols);
  const ch = Math.floor(wh / rows);
  const tones = ["#ff3b5c", "#ffd23f", "#38f0ff", "#5bffb6", "#ff9a3d", "#b58cff", "#ff58d8"];
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const px = wx + k * cw + 2;
      const py = wy + r * ch + 3;
      const t = pick(rng, tones);
      rect(c, px, py, cw - 4, ch - 8, t);
      rect(c, px, py, 1, ch - 8, "#ffffff");
      rect(c, px + cw - 5, py, 1, ch - 8, shade(t, -0.4));
      rect(c, px, py, cw - 4, 1, shade(t, 0.35));
    }
    rect(c, wx, wy + (r + 1) * ch - 3, ww, 2, "#3a5a66");
  }
  // glass glint
  line(c, wx + 3, wy + wh - 3, wx + ww - 6, wy + 4, "#ffffff");
  // keypad column
  const kx = wx + ww + 3;
  rect(c, kx, wy, x + fw - 3 - kx, 10, "#020207");
  drawText(c, kx + 1, wy + 2, "120", AMBER, 1);
  for (let r = 0; r < 5; r++) {
    for (let k = 0; k < 2; k++) rect(c, kx + k * 4, wy + 14 + r * 5, 3, 3, r === 2 && k === 1 ? col : "#3a3a50");
  }
  rect(c, kx, wy + wh - 10, 3, 6, "#020207");
  // pickup flap and base
  rect(c, x + 4, yb - Math.round(h * 0.2), fw - 8, Math.round(h * 0.11), "#05050a");
  rect(c, x + 4, yb - Math.round(h * 0.2), fw - 8, 1, "#34344a");
  rect(c, x + 8, yb - Math.round(h * 0.14), fw - 16, 2, col);
  rect(c, x, yb - 4, fw, 4, "#08080e");
  rust(c, rng, x, y, fw, h, 0.3);
  // light on the wall and ground
  glowRect(c, wx, wy, ww, wh, col, 8, 0.9);
  rect(c, x - 1, y + 2, 1, h - 4, col);
  pools.push({ x: x + fw / 2, col, r: Math.round(fw * 1.1) });
  fx.flick.push({ x: x + 3, y: y + 4, w: fw - 6, h: hh });
}

/* ------------------------------------------------------------------- the stall */

function lantern(c: Ctx, x: number, y: number, fx: Fx) {
  rect(c, x + 4, y - 8, 1, 8, "#05050a");
  rect(c, x + 1, y, 8, 2, "#0a0a12");
  for (let i = 0; i < 12; i++) {
    const hw = i < 2 ? 3 : i > 9 ? 3 : 4;
    rect(c, x + 5 - hw, y + 2 + i, hw * 2, 1, i % 3 === 1 ? "#a01a2a" : "#e83a3a");
  }
  rect(c, x + 3, y + 4, 3, 7, "#ffcf6a");
  rect(c, x + 1, y + 14, 8, 2, "#0a0a12");
  rect(c, x + 4, y + 16, 1, 4, "#e83a3a");
  fx.lamps.push({ x: x + 5, y: y + 8, col: "#ffb36a" });
}

/** The cook, seen from the chest up behind the counter. */
function vendor(c: Ctx, x: number, yb: number, t: number) {
  const skin = "#e0aa88";
  rect(c, x - 9, yb - 20, 18, 20, "#eceaf4"); // apron and shirt
  rect(c, x - 9, yb - 20, 18, 2, "#ffffff");
  rect(c, x - 9, yb - 20, 3, 20, "#b8b6c8");
  rect(c, x - 1, yb - 20, 2, 20, "#c8c6d8");
  rect(c, x - 4, yb - 28, 8, 8, skin);
  rect(c, x - 5, yb - 30, 10, 3, "#0a0a12"); // hair
  rect(c, x - 5, yb - 27, 10, 2, "#c42a3a"); // headband
  rect(c, x + 5, yb - 27, 3, 4, "#c42a3a"); // knot
  rect(c, x - 3, yb - 24, 2, 1, "#0a0a12");
  rect(c, x + 1, yb - 24, 2, 1, "#0a0a12");
  rect(c, x - 2, yb - 21, 4, 1, "#9a5a4a");
  // arm with a ladle, stirring
  const sway = Math.round(Math.sin(t * 2.2) * 2);
  rect(c, x + 8, yb - 17, 4, 10, "#eceaf4");
  rect(c, x + 10 + sway, yb - 9, 3, 3, skin);
  line(c, x + 11 + sway, yb - 8, x + 18 + sway, yb - 2, "#6a6a7a");
}

/**
 * The close stall: a striped awning that tilts toward you, a lit interior
 * with a cook, shelves, lanterns and a neon sign.
 */
export function stall(c: Ctx, rng: Rng, fx: Fx, pools: Pool[], sx: number, sw: number, gy: number) {
  const top = gy - 124;
  const counter = gy - 30;

  // interior: warm and deep, planks and shelves
  rect(c, sx, top + 20, sw, counter - top - 20 + 2, "#1a0a08");
  for (let y = top + 20; y < counter; y++) rect(c, sx + 2, y, sw - 4, 1, mix("#ff9a4a", "#3a1408", Math.min(1, (y - top - 20) / 70)));
  for (let i = 0; i < sw - 4; i += 6) rect(c, sx + 2 + i, top + 20, 1, counter - top - 20, "#00000044");
  for (const sy of [top + 38, top + 56]) {
    rect(c, sx + 2, sy, sw - 4, 2, "#2a1408");
    rect(c, sx + 2, sy, sw - 4, 1, "#7a4a22");
    for (let bx = sx + 6; bx < sx + sw - 8; bx += 7) {
      if (rng() < 0.78) {
        const col = pick(rng, ["#38f0ff", "#ff3b5c", "#ffd23f", "#5bffb6", "#e8e8f8"]);
        rect(c, bx, sy - 10, 4, 10, col);
        rect(c, bx, sy - 10, 1, 10, "#ffffff");
        rect(c, bx + 1, sy - 13, 2, 3, shade(col, -0.3));
      }
    }
  }
  // menu boards with kanji
  for (const [mx, glyphs] of [
    [sx + 8, ["中", "大"]],
    [sx + sw - 30, ["火", "水"]],
  ] as const) {
    rect(c, mx, top + 66, 20, 22, "#0a0a12");
    rect(c, mx, top + 66, 20, 1, "#4a3a2a");
    glyphs.forEach((g, i) => drawGlyph(c, mx + 6, top + 68 + i * 9, g, "#ffe9a8", 1));
  }
  vendor(c, sx + Math.round(sw * 0.5), counter + 1, 0);
  fx.steam.push({ x: sx + Math.round(sw * 0.5) - 20, y: counter - 12 });
  fx.steam.push({ x: sx + Math.round(sw * 0.5) + 22, y: counter - 12 });

  // counter with a neon underline, bowls on top
  rect(c, sx - 4, counter, sw + 8, 5, "#3a2418");
  rect(c, sx - 4, counter, sw + 8, 1, "#9a6a40");
  rect(c, sx - 4, counter + 5, sw + 8, gy - counter - 5, "#0c0a10");
  corrugated(c, rng, sx - 2, counter + 6, sw + 4, gy - counter - 6, "#16161e", 0.5);
  rect(c, sx - 2, counter + 8, sw + 4, 1, CYAN);
  ditherRect(c, sx - 2, counter + 9, sw + 4, 3, CYAN, 0.3, 0);
  for (let bx = sx + 10; bx < sx + sw - 20; bx += 34) {
    rect(c, bx, counter - 5, 12, 5, "#f4f0ff");
    rect(c, bx, counter - 5, 12, 1, "#ffffff");
    rect(c, bx + 2, counter - 7, 8, 2, "#ff9a4a");
  }
  // stools in front
  for (const stx of [sx + 14, sx + Math.round(sw * 0.45), sx + sw - 34]) {
    rect(c, stx, gy - 15, 14, 4, "#6a2a2a");
    rect(c, stx, gy - 15, 14, 1, "#b04a4a");
    rect(c, stx + 2, gy - 11, 2, 11, "#0a0a12");
    rect(c, stx + 10, gy - 11, 2, 11, "#0a0a12");
    rect(c, stx + 2, gy - 5, 10, 1, "#0a0a12");
  }

  // the awning: red and cream stripes, narrow at the top and wide at the front
  const ay0 = top + 2;
  const ay1 = top + 24;
  const n = Math.max(8, Math.round(sw / 14));
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    const back0 = sx + 8 + (sw - 16) * t0;
    const back1 = sx + 8 + (sw - 16) * t1;
    const front0 = sx - 10 + (sw + 20) * t0;
    const front1 = sx - 10 + (sw + 20) * t1;
    poly(c, [[back0, ay0], [back1, ay0], [front1, ay1], [front0, ay1]], i % 2 ? "#e8e0d8" : "#b01a30");
  }
  // shade and shine on the awning, then the scalloped edge
  ditherRect(c, sx - 10, ay0, sw + 20, 8, "#000000", 0.45, 0);
  ditherRect(c, sx - 10, ay1 - 4, sw + 20, 4, "#ffffff", 0.12, 1);
  for (let i = 0; i < n; i++) {
    const cx = sx - 10 + ((sw + 20) * (i + 0.5)) / n;
    const r = Math.max(3, Math.round((sw + 20) / n / 2));
    discPx(c, cx, ay1, r, i % 2 ? "#e8e0d8" : "#b01a30");
    discPx(c, cx, ay1, Math.max(1, r - 3), i % 2 ? "#cfc6bc" : "#8a1226");
  }
  rect(c, sx - 10, ay1 - 1, sw + 20, 1, "#ff6a7a");
  rect(c, sx + 6, ay0 - 2, sw - 12, 2, "#2a0a10");
  // rain dripping off the front edge
  for (let i = 0; i < 14; i++) {
    const dx = sx - 8 + Math.round(((sw + 16) * (i + 0.5)) / 14);
    dot(c, dx, ay1 + 8 + (i % 3) * 5, "#9ab0ff");
  }
  // lanterns under the awning
  const ln = Math.max(2, Math.round(sw / 70));
  for (let i = 0; i < ln; i++) lantern(c, sx + Math.round((sw * (i + 0.5)) / ln) - 5, ay1 + 2, fx);

  // neon: big RAMEN and a vertical kanji blade
  const sc = sw > 190 ? 3 : 2;
  const tw = textW("RAMEN", sc) + 5;
  fx.flick.push(neonH(c, sx + Math.round((sw - tw) / 2), top - 24 - sc * 3, "RAMEN", RED, sc, 1.3));
  fx.flick.push(kanjiV(c, sx + sw + 14, top - 6, "火中", MAG, 1.2, 2));
  rect(c, sx - 11, ay0, 1, ay1 - ay0 + 2, "#2a0a10");
  pools.push({ x: sx + sw / 2, col: "#ff8a3a", r: Math.round(sw * 0.7) });
  pools.push({ x: sx + sw / 2, col: RED, r: Math.round(sw * 0.45) });
}

/** The shop across the alley: a half-open shutter, a slanted roof, signs, units, cables. */
export function shop(c: Ctx, rng: Rng, fx: Fx, pools: Pool[], x: number, w: number, gy: number) {
  const top = gy - 170;
  brick(c, rng, x, top, w, gy - top, "#2a1818");
  ditherRect(c, x, top, w, gy - top, "#000000", 0.4, 0);
  // the roof juts toward the viewer
  slantRoof(c, rng, x - 6, top - 22, x + w + 20, top - 6, 8, "#1c1c2a", CYAN);
  poly(c, [[x - 6, top - 22], [x + 14, top - 40], [x + w + 36, top - 24], [x + w + 20, top - 6]], "#0e0e18");
  rect(c, x - 6, top - 22, w + 26, 1, "#34344a");
  // shutter, half rolled up, lit from inside
  const shx = x + 12;
  const shw = Math.min(w - 24, 96);
  const shy = gy - 92;
  rect(c, shx, shy, shw, 92, "#020207");
  for (let i = 0; i < 56; i++) rect(c, shx + 2, shy + 36 + i, shw - 4, 1, mix("#1e6a78", "#2ad0e8", i / 56));
  for (let bx = shx + 8; bx < shx + shw - 14; bx += 12) rect(c, bx, shy + 62, 5, 20, "#06161c");
  corrugated(c, rng, shx, shy, shw, 36, "#2a2a38", 0.9);
  rect(c, shx, shy + 35, shw, 2, "#0a0a12");
  rect(c, shx + 4, shy + 34, 6, 4, "#4a4a60");
  glowRect(c, shx, shy + 36, shw, 56, CYAN, 8, 0.8);
  // vertical neon and a sake sign
  fx.flick.push(kanjiV(c, x + w - 30, top + 16, "大火", CYAN, 1.3, 2));
  fx.flick.push(roundSign(c, x + 40, top + 40, 22, MAG));
  // units, pipes, cables
  acBig(c, rng, x + w - 62, top + 70, 36, 26, RED);
  pipeV(c, x + 4, top, gy, 5, "#1e2230", rng);
  pipeV(c, x + w - 12, top, gy, 5, "#241c1c", rng);
  pools.push({ x: shx + shw / 2, col: CYAN, r: Math.round(shw * 0.8) });
}

/* ------------------------------------------------------------------ the wall above the street */

export function backWall(c: Ctx, rng: Rng, fx: Fx, W: number, y0: number, y1: number) {
  // dark mass across the whole width behind the stall, with a pipe run and cables
  corrugated(c, rng, -4, y0, W + 8, y1 - y0, "#0d0d18", 0.7);
  ditherRect(c, 0, y0, W, y1 - y0, "#000000", 0.35, 0);
  pipeH(c, -4, W + 4, y0 + 40, 5, "#1a1a26");
  pipeH(c, -4, W + 4, y0 + 52, 3, "#241818");
  for (let k = 0; k < 3; k++) {
    acBig(c, rng, rint(rng, 6, Math.max(8, W - 50)), y0 + rint(rng, 70, 100), rint(rng, 30, 40), 26, pick(rng, [RED, CYAN]));
  }
  void fx;
  void cable;
  void cableBundle;
}
