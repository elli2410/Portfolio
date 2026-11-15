import { rect, type Ctx } from "./draw";

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
  " ": "000,000,000,000,000",
};

const GLYPHS: Record<string, string> = Object.fromEntries(
  Object.entries(RAW).map(([k, v]) => [k, v.split(",").join("")]),
);

/** Width in pixels of a string at the given scale (1px gap between letters). */
export function textW(text: string, scale = 1): number {
  return text.length * 4 * scale - scale;
}

export function drawText(c: Ctx, x: number, y: number, text: string, col: string, scale = 1) {
  let px = x;
  for (const ch of text.toUpperCase()) {
    const g = GLYPHS[ch];
    if (g) {
      for (let i = 0; i < 15; i++) {
        if (g[i] === "1") rect(c, px + (i % 3) * scale, y + Math.floor(i / 3) * scale, scale, scale, col);
      }
    }
    px += 4 * scale;
  }
}

/** Draw text top-to-bottom, one letter per row. */
export function drawTextV(c: Ctx, x: number, y: number, text: string, col: string) {
  let py = y;
  for (const ch of text.toUpperCase()) {
    const g = GLYPHS[ch];
    if (g) {
      for (let i = 0; i < 15; i++) {
        if (g[i] === "1") rect(c, x + (i % 3), py + Math.floor(i / 3), 1, 1, col);
      }
    }
    py += 6;
  }
}
