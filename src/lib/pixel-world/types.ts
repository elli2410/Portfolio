import type { Ctx } from "./draw";
import type { Rect } from "./neon";

/** How far (in art pixels) the camera descends from the rooftops to the street. */
export const CAM = 1500;

export interface Layer {
  canvas: CanvasImageSource & { width: number; height: number };
  ctx: Ctx;
}

export type CanvasFactory = (w: number, h: number) => Layer;

export function makeLayer(make: CanvasFactory, w: number, h: number): Layer {
  const l = make(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h)));
  l.ctx.imageSmoothingEnabled = false;
  return l;
}

/** Things that animate at runtime, collected while the static layers are painted. */
export interface Fx {
  /** windows that flicker */
  wins: (Rect & { col: string })[];
  /** red aircraft-warning lights */
  blink: { x: number; y: number; col: string }[];
  /** neon signs that sputter */
  flick: Rect[];
  /** steam vents */
  steam: { x: number; y: number }[];
  /** animated billboards */
  ads: (Rect & { a: string; b: string; /** a still picture with a scan line, not colour bars */ scan?: boolean })[];
  /** street lamps (for a gentle light flicker) */
  lamps: { x: number; y: number; col: string }[];
}

export function newFx(): Fx {
  return { wins: [], blink: [], flick: [], steam: [], ads: [], lamps: [] };
}
