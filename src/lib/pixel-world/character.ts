import { dot, rect, type Ctx } from "./draw";

/**
 * The little wanderer: a pointed hat, a scarf, a teal cloak and a staff with a
 * glowing orb. Drawn from ASCII art so it's easy to tweak by hand.
 *
 * Legend:  o outline   h/H hat   g gold band   s/S skin   k hair   e eye
 *          r scarf     c/C/d cloak   b boots   t staff   y/z orb
 */
const PALETTE: Record<string, string> = {
  o: "#1b1230",
  h: "#4c3fb0",
  H: "#7468e0",
  g: "#f2c14e",
  s: "#f7d3ae",
  S: "#d9a47f",
  k: "#3b2547",
  e: "#1b1230",
  r: "#e8615b",
  c: "#2f7f96",
  C: "#55b9c8",
  d: "#22566b",
  b: "#5a3a2e",
  B: "#3a251f",
  t: "#8a5a2b",
  y: "#8ff7ff",
  z: "#ffffff",
};

// 13 columns wide, 17 rows. The feet centre is column 6.
const UPPER = [
  "...oo........",
  "..ohho.......",
  "..ohhho......",
  "...ohhho.....",
  "...ohHhho....",
  "..ohhhhhho...",
  ".ogggggggggo.",
  ".okkssssssso.",
  ".okkssssesso.",
  ".okssssSsso..",
  "..ossssssso..",
  "..orrrrrrro..",
  ".occcCCcccdo.",
  ".occcCcccccdo",
  ".occcccccccdo",
  ".odcccccccddo",
  "..oddddddddo.",
];

// Four walk frames, three rows each (legs + boots).
const LEGS = [
  ["...dd...dd...", "..dd.....dd..", ".bbb.....bbb."],
  ["....dd.dd....", "....dd.dd....", "....bb.bbb..."],
  ["...dd...dd...", "..dd.....dd..", "..bbb...bbb.."],
  ["....dd.dd....", "....dd.dd....", "...bbb.bb...."],
];
const IDLE_LEGS = ["....dd.dd....", "....dd.dd....", "...bbb.bbb..."];

export const CHAR_HEIGHT = 20;
export const ORB_OFFSET = { x: 5, y: -22 };

export interface CharacterState {
  /** Walk frame 0..3 */
  frame: number;
  moving: boolean;
  facing: 1 | -1;
  /** seconds */
  t: number;
}

function put(c: Ctx, cx: number, y: number, col: number, facing: 1 | -1, color: string) {
  const px = facing > 0 ? cx + (col - 6) : cx - (col - 6) - 1;
  dot(c, px, y, color);
}

export function drawCharacter(c: Ctx, cx: number, footY: number, s: CharacterState) {
  const top = footY - CHAR_HEIGHT;
  const bounce = s.moving && s.frame % 2 === 1 ? -1 : 0;
  // gentle breathing when standing still
  const breathe = !s.moving && Math.floor(s.t * 1.6) % 2 === 1 ? 1 : 0;
  const blink = (s.t * 1000) % 3400 < 150;

  // staff (behind the body edge, in the front hand)
  const sway = s.moving ? (s.frame % 2 === 0 ? 0 : -1) : 0;
  const sx = s.facing > 0 ? cx + 5 : cx - 6;
  rect(c, sx, top + 3 + bounce + sway, 1, 17, PALETTE.t);
  rect(c, sx, top + 3 + bounce + sway, 1, 1, "#b07a3a");

  // body
  for (let r = 0; r < UPPER.length; r++) {
    const row = UPPER[r];
    const headShift = r <= 10 ? breathe : 0;
    for (let col = 0; col < row.length; col++) {
      const ch = row[col];
      if (ch === ".") continue;
      let color = PALETTE[ch];
      if (blink && r === 8 && ch === "e") color = PALETTE.s;
      put(c, cx, top + r + bounce + headShift, col, s.facing, color);
    }
  }

  // when the body bobs up, extend the hem so it stays joined to the legs
  if (bounce !== 0) {
    const hem = UPPER[UPPER.length - 1];
    for (let col = 0; col < hem.length; col++) {
      if (hem[col] !== ".") put(c, cx, top + UPPER.length - 1, col, s.facing, PALETTE[hem[col]]);
    }
  }

  // cloak hem sways opposite to the stride
  if (s.moving) {
    const hemShift = s.frame < 2 ? 1 : -1;
    put(c, cx, top + 16 + bounce, hemShift > 0 ? 11 : 1, s.facing, PALETTE.d);
  }

  // legs
  const legs = s.moving ? LEGS[s.frame % 4] : IDLE_LEGS;
  for (let r = 0; r < legs.length; r++) {
    const row = legs[r];
    for (let col = 0; col < row.length; col++) {
      const ch = row[col];
      if (ch === ".") continue;
      put(c, cx, top + 17 + r, col, s.facing, PALETTE[ch]);
    }
  }

  // hand on the staff
  rect(c, sx - (s.facing > 0 ? 1 : 0), top + 11 + bounce + sway, 2, 2, PALETTE.s);

  // orb
  const ox = sx - 1;
  const oy = top + 3 + bounce + sway - 3;
  const pulse = Math.floor(s.t * 3) % 2 === 0;
  rect(c, ox, oy, 3, 3, PALETTE.y);
  dot(c, ox + 1, oy + 1, PALETTE.z);
  if (pulse) {
    dot(c, ox + 1, oy - 1, PALETTE.y);
    dot(c, ox - 1, oy + 1, PALETTE.y);
    dot(c, ox + 3, oy + 1, PALETTE.y);
  }
  return { orbX: ox + 1, orbY: oy + 1 };
}
