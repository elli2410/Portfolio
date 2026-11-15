import { dot, glowRect, mix, rect, shade, type Ctx } from "./draw";
import { drawText, drawTextV, textW } from "./font";
import { PLATE } from "./palette";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A horizontal neon sign: dark plate, a thin glowing tube border, bright
 * letters, and a bloom around it. Returns its rectangle so the scene can
 * flicker it at runtime.
 */
export function neonH(
  c: Ctx,
  x: number,
  y: number,
  text: string,
  col: string,
  scale = 1,
  bloom = 1,
): Rect {
  const w = textW(text, scale) + 5;
  const h = 5 * scale + 5;
  glowRect(c, x, y, w, h, col, 7, bloom);
  rect(c, x, y, w, h, PLATE);
  const edge = mix(col, "#000000", 0.35);
  rect(c, x, y, w, 1, edge);
  rect(c, x, y + h - 1, w, 1, edge);
  rect(c, x, y, 1, h, edge);
  rect(c, x + w - 1, y, 1, h, edge);
  dot(c, x, y, col);
  dot(c, x + w - 1, y, col);
  dot(c, x, y + h - 1, col);
  dot(c, x + w - 1, y + h - 1, col);
  drawText(c, x + 3, y + 3, text, shade(col, 0.45), scale);
  return { x, y, w, h };
}

/** A vertical sign that sticks out from a building, letters stacked. */
export function neonV(c: Ctx, x: number, y: number, text: string, col: string, bloom = 1): Rect {
  const w = 7;
  const h = text.length * 6 + 3;
  glowRect(c, x, y, w, h, col, 7, bloom);
  rect(c, x, y, w, h, PLATE);
  const edge = mix(col, "#000000", 0.35);
  rect(c, x, y, w, 1, edge);
  rect(c, x, y + h - 1, w, 1, edge);
  rect(c, x, y, 1, h, edge);
  rect(c, x + w - 1, y, 1, h, edge);
  rect(c, x + 3, y - 3, 1, 3, "#1a1432"); // mounting arm
  drawTextV(c, x + 2, y + 2, text, shade(col, 0.45));
  return { x, y, w, h };
}
