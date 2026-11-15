import { dot, glow, mix, rect, shade, type Ctx } from "./draw";
import { NEON } from "./palette";

/** Standing height of the runner in art pixels (head to boots). */
export const RUNNER_H = 27;

export interface RunnerState {
  /** Walk frame 0..3 */
  frame: number;
  moving: boolean;
  facing: 1 | -1;
  /** seconds */
  t: number;
  /** a little drone hovers at her shoulder (off inside the cab) */
  drone?: boolean;
}

const SKIN = "#f2c9a5";
const SKIN_D = "#c98f6e";
const HAIR = "#1a1030";
const JACKET = "#251a45";
const JACKET_L = "#3a2a6a";
const JACKET_D = "#170f30";
const PANTS = "#1d1a40";
const PANTS_D = "#12102c";
const BOOT = "#0b0716";

/**
 * An original cyberpunk runner: bomber jacket with magenta trim, a glowing
 * cyan visor, a streak of pink in her hair, and a little drone for company.
 * Drawn from rectangles so every limb can be animated. `cx` is the middle of
 * her feet, `fy` the ground.
 */
export function drawRunner(c: Ctx, cx: number, fy: number, s: RunnerState) {
  const f = s.facing;
  const R = (dx: number, dy: number, w: number, h: number, col: string) =>
    rect(c, f > 0 ? cx + dx : cx - dx - w, fy + dy, w, h, col);
  const D = (dx: number, dy: number, col: string) => dot(c, f > 0 ? cx + dx : cx - dx - 1, fy + dy, col);

  const stride = s.moving ? [3, 1, -3, -1][s.frame % 4] : 0;
  const bob = s.moving && s.frame % 2 === 1 ? -1 : 0;
  const breathe = !s.moving && Math.floor(s.t * 1.6) % 2 === 1 ? 1 : 0;
  const liftA = s.moving && s.frame === 3 ? 1 : 0;
  const liftB = s.moving && s.frame === 1 ? 1 : 0;
  const top = bob + breathe;

  // back arm (behind the body)
  const backArm = s.moving ? Math.round(stride * 0.6) : 0;
  R(-1 + backArm, -19 + top, 2, 7, JACKET_D);
  R(-1 + backArm, -12 + top, 2, 2, mix(SKIN, "#000000", 0.25));

  // back leg
  R(-1 - stride, -10 + bob, 3, 8 - liftA, PANTS_D);
  R(-2 - stride, -2 - liftA, 4, 2, BOOT);
  R(-2 - stride, -1 - liftA, 4, 1, mix(NEON.mag, "#000000", 0.45));

  // torso: bomber jacket
  R(-3, -20 + top, 7, 10, JACKET);
  R(-3, -20 + top, 7, 2, JACKET_L);
  R(-3, -11 + top, 7, 1, NEON.mag);
  R(-3, -10 + top, 7, 1, shade(NEON.mag, -0.35));
  R(2, -18 + top, 1, 1, NEON.cyan);
  R(2, -16 + top, 1, 1, NEON.cyan);
  R(-3, -18 + top, 1, 7, JACKET_D);
  R(-2, -17 + top, 2, 2, mix(NEON.cyan, JACKET, 0.5)); // glowing patch on the back
  R(-2, -17 + top, 2, 1, NEON.cyan);
  // high collar
  R(-1, -22 + top, 4, 2, JACKET_L);
  R(-1, -22 + top, 4, 1, NEON.mag);

  // front leg
  R(-1 + stride, -10 + bob, 3, 8 - liftB, PANTS);
  R(1 + stride, -10 + bob, 1, 8 - liftB, mix(NEON.cyan, PANTS, 0.45));
  R(-2 + stride, -2 - liftB, 4, 2, BOOT);
  R(-2 + stride, -1 - liftB, 4, 1, NEON.mag);

  // front arm
  const frontArm = s.moving ? -Math.round(stride * 0.6) : 0;
  R(0 + frontArm, -19 + top, 2, 7, JACKET);
  R(0 + frontArm, -19 + top, 2, 1, JACKET_L);
  R(1 + frontArm, -18 + top, 1, 5, mix(NEON.cyan, JACKET, 0.35));
  R(0 + frontArm, -12 + top, 2, 2, SKIN);

  // head
  R(-2, -26 + top, 5, 5, SKIN);
  R(-2, -22 + top, 5, 1, SKIN_D);
  R(-3, -28 + top, 7, 3, HAIR);
  R(-3, -26 + top, 2, 4, HAIR);
  R(1, -26 + top, 2, 1, HAIR); // fringe
  R(0, -28 + top, 1, 3, NEON.mag); // pink streak
  // visor
  const pulse = Math.floor(s.t * 2.2) % 5 === 0;
  R(0, -25 + top, 4, 1, pulse ? "#dffcff" : NEON.cyan);
  R(0, -24 + top, 4, 1, mix(NEON.cyan, SKIN, 0.4));
  D(3, -25 + top, "#ffffff");
  R(-1, -24 + top, 1, 1, NEON.yel); // earpiece

  glow(c, f > 0 ? cx + 2 : cx - 2, fy - 24 + top, 6, NEON.cyan, 0.4);

  // the drone
  if (s.drone === false) return { droneX: cx, droneY: fy };
  const dx = cx - f * 9;
  const dy = fy - 28 + Math.round(Math.sin(s.t * 2.4) * 2);
  rect(c, dx - 2, dy, 5, 2, "#2a2060");
  rect(c, dx - 2, dy, 5, 1, "#5a4ab0");
  rect(c, dx - 4, dy - 1, 2, 1, "#3a2d80");
  rect(c, dx + 3, dy - 1, 2, 1, "#3a2d80");
  rect(c, dx - 1, dy + 1, 3, 1, NEON.cyan);
  if (Math.floor(s.t * 3) % 2 === 0) dot(c, dx, dy - 1, NEON.red);
  glow(c, dx, dy + 2, 7, NEON.cyan, 0.5);
  return { droneX: dx, droneY: dy };
}
