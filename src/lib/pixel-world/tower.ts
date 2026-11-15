import { ditherRect, dot, line, mulberry32, pick, rect, rint, shade, type Ctx, type Rng } from "./draw";
import { acBig, brick, cableBundle, corrugated, discPx, pipeV, plate, poly, rust, slantRoof, slit, spill } from "./art";
import { AMBER, CYAN, MAG, RED, backWall, billboard, shop, slab, stall, vendMachine, type Slab } from "./heroes";
import { kanjiV, roundSign } from "./kanji";
import { neonH } from "./neon";
import type { Pool } from "./city";
import { CAM, makeLayer, newFx, type CanvasFactory, type Fx, type Layer } from "./types";

/** Rows from the bottom of the world to the top of the sidewalk. */
export const GROUND = 72;

/**
 * The camera height (art pixels from the top of the world) at which each
 * section of the page sits in the middle of the screen. The page maps its own
 * scroll positions onto these.
 */
export const ANCHORS = { work: 380, skills: 800, about: 1150 } as const;

export interface Tower {
  near: Layer;
  fx: Fx;
  refl: Layer;
  /** world y of the road's top edge, where reflections start */
  reflTop: number;
  /** world y of the top of the sidewalk */
  gy: number;
  /** world height in rows */
  WH: number;
  leftEdge: number;
  rightEdge: number;
}

/** Wet pavement: near-black, with tiles, a curb, and light pooled where the neon lands. */
function ground(c: Ctx, rng: Rng, pools: Pool[], W: number, WH: number, gy: number) {
  rect(c, 0, gy, W, 15, "#0a0a14");
  for (let x = -((gy * 5) % 22); x < W; x += 22) {
    rect(c, x, gy + 1, 1, 7, "#14141f");
    rect(c, x + 11, gy + 9, 1, 6, "#14141f");
  }
  rect(c, 0, gy, W, 1, "#2a2a3c");
  rect(c, 0, gy + 8, W, 1, "#0e0e18");
  rect(c, 0, gy + 15, W, 1, "#3a3a52");
  rect(c, 0, gy + 16, W, 2, "#161622");
  rect(c, 0, gy + 18, W, 1, "#020207");
  rect(c, 0, gy + 19, W, WH - gy - 19, "#05050b");
  for (let x = 8; x < W; x += 34) rect(c, x, gy + 38, 14, 1, "#6a5a22");
  for (let i = 0; i < W / 70; i++) {
    const px = rng() * W;
    const py = gy + 26 + rng() * (WH - gy - 30);
    ditherRect(c, px, py, rint(rng, 16, 44), rint(rng, 2, 3), "#1a1a3a", 0.5, i);
  }
  // pools of coloured light, flat to the ground
  for (const p of pools) {
    for (let dy = -5; dy <= 5; dy++) {
      const hw = Math.round(p.r * Math.sqrt(Math.max(0, 1 - (dy / 5.5) ** 2)));
      ditherRect(c, p.x - hw, gy + 9 + dy, hw * 2, 1, p.col, 0.2, dy);
    }
    for (let dy = -2; dy <= 2; dy++) {
      const hw = Math.round(p.r * 0.5 * Math.sqrt(Math.max(0, 1 - (dy / 2.5) ** 2)));
      ditherRect(c, p.x - hw, gy + 9 + dy, hw * 2, 1, p.col, 0.3, dy + 1);
    }
    for (let dy = 0; dy < 12; dy++) {
      const hw = Math.round(p.r * (0.9 - dy * 0.05));
      ditherRect(c, p.x - hw, gy + 20 + dy * 2, hw * 2, 1, p.col, 0.13, dy);
    }
  }
}

export function buildTower(make: CanvasFactory, W: number, H: number): Tower {
  const WH = H + CAM;
  const gy = WH - GROUND;
  const near = makeLayer(make, W, WH);
  const c = near.ctx;
  const fx = newFx();
  const pools: Pool[] = [];
  const rng = mulberry32(20261115);
  const narrow = W < 420;

  const yWork = ANCHORS.work + Math.round(H / 2);
  const ySk = ANCHORS.skills + Math.round(H / 2);
  const yAb = ANCHORS.about + Math.round(H / 2);
  const wallTop = yWork - 215;
  const wallEnd = gy - 270;

  /* ---- the walls of the alley: stacked slabs, each its own material ------- */
  const reachSet = narrow ? [0.24, 0.32, 0.4] : [0.14, 0.2, 0.26, 0.32];
  const slabs: Record<"L" | "R", Slab[]> = { L: [], R: [] };
  for (const side of ["L", "R"] as const) {
    let y = wallTop + (side === "R" ? 40 : 0);
    let prev = -1;
    while (y < wallEnd) {
      let reach = Math.round(W * pick(rng, reachSet));
      let g = 0;
      while (prev >= 0 && Math.abs(reach - prev) < W * 0.05 && g++ < 8) reach = Math.round(W * pick(rng, reachSet));
      const h = rint(rng, 150, 260);
      slabs[side].push({ y0: y, y1: Math.min(y + h + 14, wallEnd + 40), reach });
      prev = reach;
      y += h;
    }
  }
  const reachAt = (side: "L" | "R", y: number) => {
    let r = 0;
    for (const s of slabs[side]) if (y >= s.y0 && y <= s.y1) r = Math.max(r, s.reach);
    return r || Math.round(W * 0.2);
  };
  for (const side of ["L", "R"] as const) {
    for (const s of slabs[side]) slab(c, rng, fx, side, W, s, side === "L" ? RED : CYAN);
  }

  /* ---- hero 1: the billboard ------------------------------------------------ */
  const bb = billboard(c, rng, fx, W, yWork);
  // the red screen throws its light on the walls and the catwalk around it
  spill(c, 0, bb.by - 40, W, bb.bh + 150, RED, 0.34, "down", 6);
  spill(c, 0, bb.by - 40, bb.bx - 4, bb.bh + 150, RED, 0.3, "right", 4);
  spill(c, bb.bx + bb.bw + 4, bb.by - 40, W - bb.bx - bb.bw, bb.bh + 150, RED, 0.3, "left", 4);

  /* ---- cables crossing the alley ---------------------------------------------- */
  for (let y = bb.cwY + 60; y < wallEnd - 40; y += rint(rng, 120, 190)) {
    const xl = reachAt("L", y) - 2;
    const xr = W - reachAt("R", y + 30) + 2;
    if (xr - xl < 30) continue;
    rect(c, xl - 3, y - 2, 5, 6, "#0a0a14");
    rect(c, xr - 1, y + 28, 5, 6, "#0a0a14");
    cableBundle(c, rng, xl, y, xr, y + 30, rint(rng, 16, 34), "#3a3a50");
  }

  /* ---- hero 2: a vending machine on a ledge, for Skills ------------------------ */
  {
    const pw = Math.min(104, Math.max(72, Math.round(W * 0.16)));
    const px = W - pw + 6; // out at the right edge, clear of the page's own vending panel
    const py = ySk + 64;
    plate(c, rng, px, py, pw, 7, "#1a1a26");
    line(c, px + 6, py + 7, px + pw - 20, py + 46, "#0c0c16");
    line(c, px + 7, py + 7, px + pw - 19, py + 46, "#0c0c16");
    for (let rx = px; rx < px + pw; rx += 6) rect(c, rx, py - 8, 1, 8, "#0a0a12");
    rect(c, px, py - 8, pw, 1, "#2a2a3c");
    vendMachine(c, rng, fx, px + 10, py, 48, 90, CYAN, pools);
    fx.flick.push(neonH(c, px + 2, py - 124, "DRINK", MAG, 3, 1.3));
    rect(c, px + 34, py - 108, 1, 18, "#05050a");
  }
  // a big round sake sign on the left wall
  {
    const y = ySk - 150;
    const xl = reachAt("L", y);
    fx.flick.push(roundSign(c, xl - 6, y, 28, RED));
  }

  /* ---- hero 3: a balcony with a lit window, for About ------------------------- */
  {
    const xl = reachAt("L", yAb);
    const bw = Math.min(100, Math.max(64, Math.round(W * 0.18)));
    const bx = Math.max(-6, xl - bw + 14);
    const by = yAb + 44;
    plate(c, rng, bx, by, bw, 6, "#1a1a26");
    line(c, bx + 4, by + 6, bx + bw - 6, by + 40, "#0c0c16");
    for (let rx = bx; rx < bx + bw; rx += 5) rect(c, rx, by - 10, 1, 10, "#0a0a12");
    rect(c, bx, by - 10, bw, 1, "#2a2a3c");
    slit(c, rng, bx + 8, by - 48, 26, 38, AMBER);
    for (let k = 0; k < 3; k++) {
      const gx = bx + 40 + k * 14;
      rect(c, gx, by - 10 - 6, 8, 6, "#3a1a2a");
      for (let j = 0; j < 9; j++) dot(c, gx + rint(rng, -2, 9), by - 18 - rint(rng, 0, 9), pick(rng, ["#0f5a45", "#1c8a62", "#2fd08a"]));
    }
    acBig(c, rng, bx + 8, by - 84, 34, 24, AMBER);
    fx.flick.push(neonH(c, bx + bw + 8, by - 70, "OPEN", AMBER, 3, 1.2));
    kanjiV(c, bx + bw + 30, by - 36, "月", CYAN, 1.2, 2);
  }

  /* ---- the street ---------------------------------------------------------------- */
  const top = gy - 124;
  backWall(c, rng, fx, W, gy - 300, gy);
  if (!narrow) {
    shop(c, rng, fx, pools, Math.round(W * 0.58), W - Math.round(W * 0.58) + 10, gy);
  }
  const sw = narrow ? 116 : Math.min(250, Math.round(W * 0.36));
  const sx = narrow ? 10 : Math.round(W * 0.07);
  stall(c, rng, fx, pools, sx, sw, gy);
  const vx = sx + sw + (narrow ? 12 : 22);
  vendMachine(c, rng, fx, vx, gy + 2, narrow ? 36 : 50, narrow ? 72 : 100, CYAN, pools);
  if (!narrow) {
    // the alley between the machine and the shop: black, with one cold light at the far end
    const gx = vx + 70;
    const gw = Math.round(W * 0.58) - gx - 6;
    if (gw > 8) {
      rect(c, gx, top - 40, gw, gy - top + 40, "#020206");
      ditherRect(c, gx, gy - 40, gw, 40, CYAN, 0.1, 0);
      ditherRect(c, gx + Math.round(gw / 2) - 2, gy - 14, 4, 14, CYAN, 0.5, 0);
    }
  }
  void top;
  void corrugated;
  void brick;
  void pipeV;
  void poly;
  void rust;
  void slantRoof;
  void discPx;
  void kanjiV;
  void shade;

  ground(c, rng, pools, W, WH, gy);

  /* ---- reflections: a darkened, rippled mirror of the street -------------------- */
  const reflTop = gy + 19;
  const RH = WH - reflTop;
  const refl = makeLayer(make, W, RH);
  const rc = refl.ctx;
  for (let i = 0; i < RH; i++) {
    const sy = gy - 1 - i;
    if (sy < 0) break;
    const jitter = Math.round(Math.sin(i * 1.7) * 1.6);
    rc.save();
    rc.globalAlpha = 0.7 * Math.pow(1 - i / RH, 1.05);
    rc.drawImage(near.canvas, 0, sy, W, 1, jitter, i, W, 1);
    rc.restore();
  }
  // wet streaks: light smeared sideways along the road
  for (let i = 0; i < W / 10; i++) {
    ditherRect(rc, rng() * W, rint(rng, 0, RH - 1), rint(rng, 8, 30), 1, pick(rng, [RED, CYAN, MAG, "#8a9aff"]), 0.14, i);
  }

  return { near, fx, refl, reflTop, gy, WH, leftEdge: Math.round(W * 0.2), rightEdge: Math.round(W * 0.8) };
}

/* ---------------------------------------------------------------- foreground */

/** Pitch-black silhouettes close to the camera: rooftops, railings, tanks, cables. */
export function buildForeground(make: CanvasFactory, W: number, H: number): Layer {
  const layerH = H + Math.ceil(CAM * 1.35) + 4;
  const L = makeLayer(make, W, layerH);
  const c = L.ctx;
  const rng = mulberry32(31337);
  const INK = "#020207";
  // where on this layer a thing sits so that it appears at screen height `sy` when the camera is at `cam`
  const at = (cam: number, sy: number) => Math.round(cam * 1.35 + sy);

  const rim = (x: number, y: number, w: number, col: string) => {
    rect(c, x, y, w, 1, col);
    ditherRect(c, x, y + 1, w, 2, col, 0.35, 0);
  };

  // rooftop, bottom-left, for the first screen: a water tank, an antenna mast, an AC block
  {
    const y = at(0, H - 70);
    const w = Math.round(W * 0.34);
    rect(c, -4, y, w, 110, INK);
    rim(-4, y, w, RED);
    rect(c, 18, y - 38, 34, 38, INK); // tank
    rect(c, 18, y - 42, 34, 5, INK);
    for (const lx of [22, 46]) rect(c, lx, y - 2, 3, 3, INK);
    rim(18, y - 42, 34, RED);
    rect(c, 70, y - 80, 2, 80, INK); // mast
    rect(c, 62, y - 70, 18, 1, INK);
    rect(c, 64, y - 56, 14, 1, INK);
    dot(c, 71, y - 82, RED);
    rect(c, w - 50, y - 24, 40, 24, INK); // AC
    rim(w - 50, y - 24, 40, RED);
    // railing
    for (let rx = 0; rx < w; rx += 7) rect(c, rx, y - 16, 1, 16, INK);
    rect(c, 0, y - 16, w, 2, INK);
  }
  // rooftop, bottom-right
  {
    const y = at(0, H - 40);
    const w = Math.round(W * 0.3);
    const x = W - w;
    rect(c, x + 4, y, w + 4, 110, INK);
    rim(x + 4, y, w, RED);
    for (let k = 0; k < 3; k++) {
      rect(c, x + 14 + k * 30, y - 52 - k * 10, 3, 52 + k * 10, INK);
      dot(c, x + 15 + k * 30, y - 54 - k * 10, k === 1 ? CYAN : RED);
    }
    rect(c, x + 10, y - 22, 58, 22, INK);
    rim(x + 10, y - 22, 58, RED);
  }
  // a balcony railing with plants, in front of the billboard shot
  {
    const y = at(ANCHORS.work, H - 36);
    const w = Math.round(W * 0.28);
    rect(c, -4, y, w, 120, INK);
    for (let rx = 0; rx < w; rx += 5) rect(c, rx, y - 22, 1, 22, INK);
    rect(c, 0, y - 22, w, 2, INK);
    rim(0, y - 22, w, RED);
    for (let k = 0; k < 3; k++) {
      rect(c, 8 + k * 30, y - 30, 14, 8, INK);
      for (let j = 0; j < 16; j++) rect(c, 6 + k * 30 + rint(rng, 0, 16), y - 38 - rint(rng, 0, 12), rint(rng, 2, 5), 2, INK);
    }
  }
  // a water tower, right
  {
    const y = at(ANCHORS.work, H - 20);
    const x = W - Math.round(W * 0.2);
    rect(c, x, y - 70, 56, 52, INK);
    poly(c, [[x - 2, y - 70], [x + 28, y - 90], [x + 58, y - 70]], INK);
    rect(c, x + 6, y - 20, 3, 60, INK);
    rect(c, x + 46, y - 20, 3, 60, INK);
    line(c, x + 7, y - 18, x + 47, y + 30, INK);
    line(c, x + 47, y - 18, x + 7, y + 30, INK);
    rim(x, y - 70, 56, RED);
  }
  // cables sagging across, thick and black
  for (let y = 80; y < layerH - 40; y += rint(rng, 230, 340)) {
    const a = rint(rng, -40, 40);
    cableBundle(c, rng, -6, y, W + 6, y + a, rint(rng, 20, 44), "#1a1a28");
  }
  void slantRoof;
  void rust;
  void shade;
  void discPx;
  void brick;
  void corrugated;
  void pipeV;
  void kanjiV;
  void rect;
  return L;
}
