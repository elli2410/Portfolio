import { drawRunner, RUNNER_H } from "./runner";
import { drawText } from "./font";
import { glow, line, mix, rect, type Ctx } from "./draw";
import { NEON } from "./palette";
import { CAM } from "./types";

export interface FrontFrame {
  /** seconds */
  t: number;
  /** camera height, 0 .. CAM */
  cam: number;
  /** 0 = riding in the cab, 1 = out on the street, in between = walking */
  walk: number;
  moving: boolean;
  /** walk animation frame 0..3 */
  frame: number;
  /** which way she is walking: -1 away from the cab, 1 back toward it */
  dir: 1 | -1;
  /** draw the cab even while it is riding (off on phones, where it would cover the text) */
  showCab: boolean;
}

export interface Front {
  render(ctx: Ctx, f: FrontFrame): void;
}

const CAB_W = 24;
const CAB_H = 38;

const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/**
 * The glass elevator that carries the runner down the canyon, drawn on a
 * transparent canvas in front of the page, and the runner herself once she
 * steps out onto the street.
 */
export function createFront(W: number, H: number, streetY: number): Front {
  const cabX = W - CAB_W - 12;
  const footY = streetY + 14; // sidewalk
  const rideY = Math.round(H * 0.34);
  const dockY = footY + 2 - CAB_H;
  const walkDist = Math.round(Math.min(W * 0.36, 300));

  function cab(c: Ctx, x: number, y: number, floor: string, t: number, rider: boolean, cam: number) {
    // cable and hanger
    rect(c, x + 11, 0, 2, Math.max(0, y - 4), "#0b0919");
    rect(c, x + 11, 0, 1, Math.max(0, y - 4), "#3a3270");
    for (let k = 0; k < 20; k++) {
      const ly = ((k * 34 - cam * 0.9) % (34 * 20) + 34 * 20) % (34 * 20) - 34;
      if (ly < 0 || ly > y - 8) continue;
      rect(c, x + 9, ly, 6, 2, "#14102c");
      rect(c, x + 10, ly, 4, 1, NEON.cyan);
    }
    rect(c, x + 9, y - 4, 6, 4, "#14102c");
    // roof with the floor display
    rect(c, x - 1, y, CAB_W + 2, 7, "#1a1438");
    rect(c, x - 1, y, CAB_W + 2, 1, "#4b3a8a");
    rect(c, x + 6, y + 1, 12, 5, "#05020f");
    drawText(c, x + 12 - Math.floor((floor.length * 4 - 1) / 2), y + 1, floor, NEON.red, 1);
    // glass: deep teal with a warm light inside
    for (let i = 0; i < CAB_H - 10; i++) rect(c, x + 1, y + 7 + i, CAB_W - 2, 1, mix("#14385a", "#0a1a30", i / (CAB_H - 10)));
    // frame posts and floor plate
    rect(c, x - 1, y + 7, 2, CAB_H - 8, "#1a1438");
    rect(c, x + CAB_W - 1, y + 7, 2, CAB_H - 8, "#1a1438");
    rect(c, x - 1, y + CAB_H - 3, CAB_W + 2, 3, "#14102c");
    rect(c, x - 1, y + CAB_H - 3, CAB_W + 2, 1, "#3b3566");
    rect(c, x + 11, y + 7, 1, CAB_H - 10, "#1a1438");
    // glints on the glass
    line(c, x + 3, y + 22, x + 8, y + 10, "#5a8ab0");
    line(c, x + 15, y + 24, x + 19, y + 14, "#5a8ab0");
    // neon underglow
    glow(c, x + 12, y + CAB_H, 14, NEON.mag, 0.9);
    rect(c, x, y + CAB_H, CAB_W, 1, NEON.mag);
    if (rider) {
      drawRunner(c, x + 12, y + CAB_H - 3, { frame: 0, moving: false, facing: -1, t, drone: false });
    }
  }

  function render(ctx: Ctx, f: FrontFrame) {
    const { t, cam } = f;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);

    const near = clamp01((cam - (CAM - 150)) / 150);
    const showCab = f.showCab || near > 0;
    const y = Math.round(rideY + (dockY - rideY) * smooth(near));
    const sway = near > 0 ? 0 : Math.round(Math.sin(t * 1.1) * 1);
    const out = f.walk > 0.02;

    if (showCab) {
      const floor = near >= 1 ? "G" : String(Math.max(1, Math.round(88 * (1 - cam / CAM)))).padStart(2, "0");
      cab(ctx, cabX + sway, y, floor, t, !out, cam);
    }

    if (out) {
      const rx = Math.round(cabX + 12 - f.walk * walkDist);
      // soft shadow, then the runner, then her reflection in the wet pavement
      ctx.globalAlpha = 0.4;
      rect(ctx, rx - 5, footY, 11, 1, "#000000");
      ctx.globalAlpha = 1;
      drawRunner(ctx, rx, footY, {
        frame: f.frame,
        moving: f.moving,
        facing: f.dir < 0 ? -1 : 1,
        t,
      });
      for (let i = 0; i < RUNNER_H + 6; i++) {
        ctx.globalAlpha = 0.34 * (1 - i / (RUNNER_H + 6));
        ctx.drawImage(ctx.canvas, rx - 16, footY - 1 - i, 32, 1, rx - 16 + (i % 5 === 3 ? 1 : 0), footY + 3 + i, 32, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  return { render };
}
