import { dot, glowRect, mix, rect, shade, type Ctx } from "./draw";
import { PLATE } from "./palette";
import type { Rect } from "./neon";

/**
 * A handful of hand-drawn kanji, 7 columns wide, for the neon signs. They
 * are chosen for how they look on a sign (and what they say) rather than
 * for completeness.
 */
const G: Record<string, string[]> = {
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
  山: ["...#...", "#..#..#", "#..#..#", "#..#..#", "#######", "......."  , "......."],
  人: ["...#...", "...#...", "..#.#..", "..#.#..", ".#...#.", ".#...#.", "#.....#"],
};

/** 酒 (sake): water radical on the left, the jar on the right. 10 wide, 9 tall. */
const SAKE = [
  "...#.#....",
  "#..#######",
  ".#.#.....#",
  "...#.#.#.#",
  ".#.#######",
  "#..#.....#",
  "...#.....#",
  ".#.#######",
  "#.........",
];

export const KANJI = Object.keys(G);

export function glyph(ch: string): string[] {
  return ch === "酒" ? SAKE : G[ch] ?? G["口"];
}

export function glyphW(ch: string, scale = 1): number {
  return glyph(ch)[0].length * scale;
}

export function glyphH(ch: string, scale = 1): number {
  return glyph(ch).length * scale;
}

export function drawGlyph(c: Ctx, x: number, y: number, ch: string, col: string, scale = 1) {
  const g = glyph(ch);
  c.fillStyle = col;
  for (let j = 0; j < g.length; j++) {
    for (let i = 0; i < g[j].length; i++) {
      if (g[j][i] === "#") c.fillRect(Math.round(x) + i * scale, Math.round(y) + j * scale, scale, scale);
    }
  }
}

/** Kanji stacked top to bottom, centred in a width of 7 * scale. */
export function drawGlyphsV(c: Ctx, x: number, y: number, chars: string, col: string, scale = 1) {
  let yy = y;
  for (const ch of chars) {
    drawGlyph(c, x, yy, ch, col, scale);
    yy += glyphH(ch, scale) + scale;
  }
}

/** A tall neon sign of stacked kanji, hung from an arm. */
export function kanjiV(c: Ctx, x: number, y: number, chars: string, col: string, bloom = 1, s = 1): Rect {
  const w = 7 * s + 4;
  const h = chars.length * 9 * s + 4;
  glowRect(c, x, y, w, h, col, 8, bloom);
  rect(c, x, y, w, h, PLATE);
  const edge = mix(col, "#000000", 0.3);
  rect(c, x, y, w, 1, edge);
  rect(c, x, y + h - 1, w, 1, edge);
  rect(c, x, y, 1, h, edge);
  rect(c, x + w - 1, y, 1, h, edge);
  dot(c, x, y, col);
  dot(c, x + w - 1, y, col);
  dot(c, x, y + h - 1, col);
  dot(c, x + w - 1, y + h - 1, col);
  rect(c, x + Math.floor(w / 2), y - 4, 1, 4, "#1a1432");
  drawGlyphsV(c, x + 2, y + 3, chars, shade(col, 0.4), s);
  return { x, y, w, h };
}

/** A wide neon sign of kanji side by side. */
export function kanjiH(c: Ctx, x: number, y: number, chars: string, col: string, bloom = 1, s = 1): Rect {
  const n = chars.length;
  const w = n * 9 * s + 4;
  const h = 7 * s + 8;
  glowRect(c, x, y, w, h, col, 8, bloom);
  rect(c, x, y, w, h, PLATE);
  const edge = mix(col, "#000000", 0.3);
  rect(c, x, y, w, 1, edge);
  rect(c, x, y + h - 1, w, 1, edge);
  rect(c, x, y, 1, h, edge);
  rect(c, x + w - 1, y, 1, h, edge);
  dot(c, x, y, col);
  dot(c, x + w - 1, y, col);
  dot(c, x, y + h - 1, col);
  dot(c, x + w - 1, y + h - 1, col);
  let xx = x + 3;
  for (const ch of chars) {
    drawGlyph(c, xx, y + 4, ch, shade(col, 0.4), s);
    xx += 9 * s;
  }
  return { x, y, w, h };
}

/** The round sake sign with a tilted bottle, straight out of the street at night. */
export function roundSign(c: Ctx, cx: number, cy: number, r: number, col: string): Rect {
  glowRect(c, cx - r, cy - r, r * 2, r * 2, col, 10, 1);
  for (let dy = -r; dy <= r; dy++) {
    const hw = Math.floor(Math.sqrt(r * r - dy * dy + 0.5));
    rect(c, cx - hw, cy + dy, hw * 2, 1, "#0a0618");
  }
  // neon ring
  for (let a = 0; a < 360; a += 3) {
    const rad = (a * Math.PI) / 180;
    dot(c, cx + Math.cos(rad) * (r - 1), cy + Math.sin(rad) * (r - 1), col);
  }
  for (let a = 0; a < 360; a += 6) {
    const rad = (a * Math.PI) / 180;
    dot(c, cx + Math.cos(rad) * (r - 3), cy + Math.sin(rad) * (r - 3), mix(col, "#0a0618", 0.6));
  }
  const s = Math.max(1, Math.floor((r * 1.1) / 10));
  drawGlyph(c, cx - Math.floor((10 * s) / 2), cy - Math.floor((9 * s) / 2), "酒", shade(col, 0.35), s);
  return { x: cx - r, y: cy - r, w: r * 2, h: r * 2 };
}

/** The signs we choose from. */
export const KANJI_SIGNS = ["酒", "大火", "中", "天水", "月日", "王田", "山人", "大口", "水月", "火山", "日中"] as const;
