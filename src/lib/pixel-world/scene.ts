import { drawCharacter } from "./character";
import {
  archWindow,
  barrel,
  brickWall,
  broadleafTree,
  bush,
  crate,
  disc,
  dot,
  door,
  glow,
  hash01,
  insideBlobs,
  ivy,
  lantern,
  moss,
  mulberry32,
  pine,
  rect,
  roof,
  roofSurfaceY,
  windowLit,
  type Ctx,
  type RoofPalette,
  type StonePalette,
  type TreePalette,
} from "./draw";

/** How far (in logical pixels) the camera travels from the top to the bottom of the page. */
export const TRAVEL = 1300;

/**
 * Rows at the bottom of the scene that are drawn a second time *in front of*
 * the page content, so the path and the walking character are never hidden
 * behind a card.
 */
export const STRIP_ROWS = 39;

export type CanvasFactory = (
  w: number,
  h: number,
) => { canvas: CanvasImageSource & { width: number; height: number }; ctx: Ctx };

export interface SceneFrame {
  /** seconds */
  t: number;
  /** camera x in logical pixels, 0..TRAVEL */
  cam: number;
  walkFrame: number;
  moving: boolean;
  facing: 1 | -1;
}

export interface Scene {
  W: number;
  H: number;
  render(ctx: Ctx, f: SceneFrame): void;
}

/* ------------------------------------------------------------------ palettes */

const STONE_COOL: StonePalette = { base: "#5b6288", light: "#6f77a3", dark: "#484e72", mortar: "#363b5a" };
const STONE_WARM: StonePalette = { base: "#7d7090", light: "#9387a8", dark: "#675b7a", mortar: "#483f5c" };
const ROOF_RED: RoofPalette = { a: "#a8453d", b: "#8a352f", c: "#cc6552" };
const ROOF_TEAL: RoofPalette = { a: "#2f7d86", b: "#256670", c: "#52a8ab" };
const WOOD = "#5a3a30";
const WOOD_D = "#3d2623";
const WOOD_L = "#8a5a43";
const TREE_GREEN: TreePalette = { dark: "#14402f", mid: "#1f6a47", light: "#3aa264", trunk: "#4a3040", trunkDark: "#33202f" };
const TREE_SPIRIT: TreePalette = { dark: "#174d55", mid: "#23808a", light: "#58c8b8", trunk: "#4a3040", trunkDark: "#33202f" };
const TREE_SAKURA: TreePalette = { dark: "#a8467c", mid: "#e275a6", light: "#ffc3dc", trunk: "#4a3040", trunkDark: "#33202f" };

const SKY = ["#06051c", "#0a0929", "#100e38", "#171348", "#201a5a", "#2c2070", "#3c2a85", "#53328f", "#733d96"];
const SKY_STOPS = [0, 0.2, 0.34, 0.46, 0.57, 0.66, 0.74, 0.81, 0.87];

/* ----------------------------------------------------------------- the world */

interface NearState {
  wins: { x: number; y: number; w: number; h: number }[];
  flames: { x: number; y: number }[];
  smoke: { x: number; y: number }[];
  mills: { x: number; y: number; len: number }[];
  water: { x: number; y: number; w: number; h: number }[];
  glows: { x: number; y: number }[];
  flags: { x: number; y: number }[];
  fire: { x: number; y: number } | null;
}

type Layer = { canvas: CanvasImageSource & { width: number; height: number }; ctx: Ctx };

function makeLayer(make: CanvasFactory, w: number, h: number): Layer {
  const l = make(w, h);
  l.ctx.imageSmoothingEnabled = false;
  return l;
}

function buildSky(make: CanvasFactory, W: number, H: number): Layer {
  const L = makeLayer(make, W, H);
  const c = L.ctx;
  for (let i = 0; i < SKY.length; i++) {
    const y0 = Math.round(SKY_STOPS[i] * H);
    const y1 = i + 1 < SKY.length ? Math.round(SKY_STOPS[i + 1] * H) : H;
    rect(c, 0, y0, W, y1 - y0, SKY[i]);
  }
  // ordered dithering between the colour bands
  for (let i = 0; i < SKY.length - 1; i++) {
    const y1 = Math.round(SKY_STOPS[i + 1] * H);
    for (let x = 0; x < W; x++) {
      if (x % 4 === 0) dot(c, x, y1 - 2, SKY[i + 1]);
      if (x % 2 === 0) dot(c, x, y1 - 1, SKY[i + 1]);
      if (x % 2 === 1) dot(c, x, y1, SKY[i]);
      if (x % 4 === 2) dot(c, x, y1 + 1, SKY[i]);
    }
  }
  // the moon
  const mx = W - 34;
  const my = 32;
  c.save();
  glow(c, mx, my, 30, "#b9a8ff", 0.7);
  c.restore();
  disc(c, mx, my, 13, "#e8d6a0");
  disc(c, mx - 1, my - 1, 12, "#fff3c8");
  for (const [dx, dy, s] of [[-5, -4, 3], [4, 2, 4], [-3, 6, 2], [6, -6, 2], [0, -1, 2]] as const) {
    rect(c, mx + dx, my + dy, s, s - 1, "#e2d097");
  }
  return L;
}

function ridge(width: number, base: number, amps: number[], rng: () => number) {
  const wl = [150, 74, 36, 17];
  const ph = wl.map(() => rng() * Math.PI * 2);
  const out: number[] = [];
  for (let x = 0; x < width; x++) {
    let h = base;
    for (let k = 0; k < amps.length; k++) h += amps[k] * Math.sin((2 * Math.PI * x) / wl[k] + ph[k]);
    out.push(Math.max(4, Math.round(h)));
  }
  return out;
}

function haze(c: Ctx, width: number, H: number, col: string, rows: number, max: number) {
  c.save();
  for (let i = 0; i < rows; i++) {
    c.globalAlpha = max * (1 - i / rows);
    c.fillStyle = col;
    c.fillRect(0, H - 1 - i - 34, width, 1);
  }
  c.restore();
}

function buildRidge(
  make: CanvasFactory,
  W: number,
  H: number,
  factor: number,
  o: { base: number; amps: number[]; fill: string; rim: string; seed: number; hazeCol?: string },
) {
  const width = W + Math.ceil(TRAVEL * factor) + 4;
  const L = makeLayer(make, width, H);
  const heights = ridge(width, o.base, o.amps, mulberry32(o.seed));
  for (let x = 0; x < width; x++) {
    const top = H - heights[x];
    rect(L.ctx, x, top, 1, heights[x], o.fill);
    dot(L.ctx, x, top, o.rim);
    if (x > 0 && heights[x] > heights[x - 1]) dot(L.ctx, x, top + 1, o.rim);
  }
  if (o.hazeCol) haze(L.ctx, width, H, o.hazeCol, 26, 0.35);
  return { L, heights, width };
}

function buildDistantVillage(make: CanvasFactory, W: number, H: number, factor: number) {
  const { L, heights, width } = buildRidge(make, W, H, factor, {
    base: 44,
    amps: [8, 4, 2, 1],
    fill: "#120f33",
    rim: "#2a2370",
    seed: 31,
  });
  const c = L.ctx;
  const rng = mulberry32(99);
  const sil = "#0b0925";
  const lit = ["#ffcf6b", "#ffb347", "#ffe9a8"];
  let x = 6;
  while (x < width - 24) {
    const kind = rng();
    const base = H - heights[Math.min(width - 1, x + 6)] + 1;
    if (kind < 0.12) {
      // tower with cone roof
      const w = 7;
      const h = 22 + Math.floor(rng() * 8);
      rect(c, x, base - h, w, h, sil);
      for (let i = 0; i < 9; i++) rect(c, x - 1 + Math.floor(i / 3), base - h - 1 - i, w + 2 - Math.floor(i / 3) * 2, 1, sil);
      dot(c, x + 3, base - h + 5, lit[0]);
      dot(c, x + 3, base - h + 12, lit[1]);
      x += w + 10;
    } else if (kind < 0.22) {
      // windmill silhouette
      const h = 20;
      rect(c, x, base - h, 8, h, sil);
      for (let i = 0; i < 5; i++) rect(c, x - 1 + i, base - h - 1 - i, 10 - i * 2, 1, sil);
      const hx = x + 4;
      const hy = base - h - 3;
      for (let i = 2; i < 13; i++) {
        dot(c, hx + i, hy + i, sil); dot(c, hx - i, hy - i, sil);
        dot(c, hx + i, hy - i, sil); dot(c, hx - i, hy + i, sil);
      }
      dot(c, x + 3, base - 8, lit[1]);
      x += 22;
    } else if (kind < 0.4) {
      // pines
      for (let k = 0; k < 3; k++) {
        const px = x + k * 5;
        const ph = 14 + Math.floor(rng() * 10);
        for (let i = 0; i < ph; i++) rect(c, px - Math.floor(i / 5), base - ph + i, 1 + Math.floor(i / 5) * 2, 1, sil);
      }
      x += 20;
    } else {
      // little house
      const w = 10 + Math.floor(rng() * 9);
      const h = 8 + Math.floor(rng() * 6);
      rect(c, x, base - h, w, h, sil);
      const rh = Math.round(w * 0.5);
      for (let i = 0; i < rh; i++) rect(c, x - 1 + i, base - h - 1 - i, w + 2 - i * 2, 1, sil);
      if (rng() < 0.75) dot(c, x + 2, base - h + 3, lit[Math.floor(rng() * 3)]);
      if (rng() < 0.5) dot(c, x + w - 3, base - h + 3, lit[Math.floor(rng() * 3)]);
      x += w + 4 + Math.floor(rng() * 10);
    }
  }
  haze(c, width, H, "#5a3a96", 22, 0.22);
  return L;
}

/* ------------------------------------------------------------- the near layer */

function buildNear(make: CanvasFactory, W: number, H: number, gy: number, charX: number) {
  const NW = W + TRAVEL + 4;
  const L = makeLayer(make, NW, H);
  const c = L.ctx;
  const rng = mulberry32(20261114);
  const S: NearState = { wins: [], flames: [], smoke: [], mills: [], water: [], glows: [], flags: [], fire: null };
  const late: (() => void)[] = [];
  const endX = TRAVEL + W;
  const campX = TRAVEL + charX + 48;

  const lit = (x: number, y: number, w: number, h: number) => {
    windowLit(c, x, y, w, h);
    glow(c, x + w / 2, y + h / 2, Math.max(8, w + 5), "#ffb347", 0.7);
    S.wins.push({ x, y, w, h });
  };

  const glowFlower = (x: number, y: number) => {
    rect(c, x, y, 1, 3, "#1f6a47");
    rect(c, x - 1, y - 1, 3, 2, "#7ff3ff");
    dot(c, x, y - 2, "#e6ffff");
    S.glows.push({ x, y: y - 1 });
  };

  const lamp = (x: number) => {
    rect(c, x, gy - 27, 2, 27, "#2b2842");
    rect(c, x - 1, gy - 4, 4, 4, "#2b2842");
    rect(c, x - 3, gy - 35, 8, 8, "#2b2842");
    rect(c, x - 2, gy - 34, 6, 6, "#ffd470");
    dot(c, x, gy - 32, "#fff3c4");
    rect(c, x - 4, gy - 37, 10, 2, "#2b2842");
    rect(c, x - 2, gy - 38, 6, 1, "#2b2842");
    S.flames.push({ x: x + 1, y: gy - 31 });
  };

  const fence = (x: number, len: number) => {
    rect(c, x, gy - 6, len, 1, WOOD_L);
    rect(c, x, gy - 3, len, 1, WOOD_L);
    for (let px = x; px < x + len; px += 6) {
      rect(c, px, gy - 8, 2, 8, WOOD);
      dot(c, px, gy - 8, WOOD_L);
    }
  };

  const stall = (x: number, a: string, b: string, goods: string[]) => {
    const w = 28;
    const top = gy - 34;
    rect(c, x + 1, gy - 28, w - 2, 26, "#221a3a");
    rect(c, x, top, 2, 34, WOOD);
    rect(c, x + w - 2, top, 2, 34, WOOD);
    rect(c, x + 2, gy - 10, w - 4, 10, WOOD_D);
    rect(c, x + 1, gy - 11, w - 2, 2, WOOD_L);
    for (let i = 0; i < 5; i++) {
      const gx = x + 4 + i * 4;
      const col = goods[i % goods.length];
      rect(c, gx, gy - 14, 3, 3, col);
      dot(c, gx, gy - 14, "#ffffff55");
    }
    for (let i = 0; i < w + 4; i++) {
      const stripe = Math.floor(i / 4) % 2 === 0 ? a : b;
      const scallop = i % 4 === 1 || i % 4 === 2 ? 1 : 0;
      rect(c, x - 2 + i, top - 1, 1, 7 + scallop, stripe);
      dot(c, x - 2 + i, top - 1, "#ffffff44");
    }
    lantern(c, x + 1, top + 8, "#ff6b3d", 12);
    lantern(c, x + w - 6, top + 8, "#ffb347", 12);
  };

  const lanternString = (x0: number, x1: number, y0: number) => {
    rect(c, x0, y0 - 2, 2, gy - y0 + 2, WOOD);
    rect(c, x1, y0 - 2, 2, gy - y0 + 2, WOOD);
    const cols = ["#ff6b3d", "#ffb347", "#ff5d8f", "#ffd470"];
    let k = 0;
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / (x1 - x0);
      const y = y0 + Math.round(6 * Math.sin(Math.PI * t));
      dot(c, x, y, "#3a2a2a");
      if ((x - x0) % 13 === 6) lantern(c, x - 2, y + 2, cols[k++ % cols.length], 10);
    }
  };

  const cottage = (
    x: number,
    w: number,
    wallH: number,
    roofH: number,
    stone: StonePalette,
    rp: RoofPalette,
    o: { ivy?: number; chimney?: boolean; attic?: boolean },
  ) => {
    const wy = gy - wallH;
    brickWall(c, rng, x, wy, w, wallH, stone);
    roof(c, x - 3, wy - roofH, w + 6, roofH, rp);
    const rows = wallH >= 44 ? [6, 26] : [6];
    for (const r of rows) {
      lit(x + 6, wy + r, 7, 9);
      lit(x + w - 13, wy + r, 7, 9);
    }
    door(c, x + Math.floor(w / 2) - 4, gy - 16, 9, 16);
    if (o.attic) lit(x + Math.floor(w / 2) - 3, wy - Math.round(roofH * 0.55), 6, 6);
    if (o.chimney) {
      const cxp = x + w - 12;
      const surf = roofSurfaceY(x - 3, w + 6, wy - roofH, roofH, cxp + 2);
      const top = surf - 10;
      rect(c, cxp, top, 5, surf - top + 4, stone.dark);
      rect(c, cxp, top, 1, surf - top + 4, stone.base);
      rect(c, cxp - 1, top - 1, 7, 2, stone.base);
      S.smoke.push({ x: cxp + 2, y: top - 2 });
    }
    if (o.ivy) {
      ivy(c, rng, x, gy, wy + 2, w, o.ivy);
      moss(c, rng, x - 3, wy + 1, w + 6, 5);
    }
  };

  /* --- back plane: hedge, bushes and pines in the gaps ------------------- */
  for (let pass = 0; pass < 3; pass++) {
    const cols = ["#0d2a28", "#133a31", "#1b4d3a"];
    for (let x = -4; x < NW + 4; x += 3) {
      const r = 3 + Math.floor(rng() * 3);
      disc(c, x, gy - 3 - pass + Math.floor(rng() * 2), r, cols[pass]);
    }
  }
  for (let x = 0; x < NW; x += 16 + Math.floor(rng() * 18)) {
    if (rng() < 0.45) pine(c, x + 6, gy, 26 + Math.floor(rng() * 22), "#1a5a45", "#12402f");
  }
  for (let x = 0; x < NW; x += 14 + Math.floor(rng() * 14)) {
    if (rng() < 0.7) bush(c, rng, x, gy, 10 + Math.floor(rng() * 8), 5 + Math.floor(rng() * 5));
  }

  /* --- the village, left to right ---------------------------------------- */
  lamp(10);
  cottage(24, 58, 36, 24, STONE_COOL, ROOF_RED, { ivy: 6, chimney: true, attic: true });
  bush(c, rng, 12, gy, 12, 8);
  fence(96, 30);
  stall(132, "#c9473f", "#f0e3c4", ["#ff6b6b", "#ffd470", "#8be28b"]);
  stall(170, "#3d5fc9", "#f0e3c4", ["#b9a2ff", "#7ff3ff", "#ff9fc4"]);
  stall(208, "#2f8a5a", "#ffd470", ["#ffb347", "#ff6b6b", "#ffd470"]);
  lanternString(128, 240, gy - 46);
  lamp(252);

  // watch tower
  {
    const x = 270;
    const w = 30;
    const h = 78;
    const wy = gy - h;
    brickWall(c, rng, x, wy, w, h, STONE_COOL);
    rect(c, x - 1, wy + 26, w + 2, 2, STONE_COOL.light);
    rect(c, x - 1, wy + 56, w + 2, 2, STONE_COOL.light);
    roof(c, x - 4, wy - 30, w + 8, 30, ROOF_TEAL);
    archWindow(c, x + 12, wy + 10, 6, 10);
    glow(c, x + 15, wy + 15, 10, "#ffb347", 0.6);
    archWindow(c, x + 12, wy + 40, 6, 10);
    glow(c, x + 15, wy + 45, 10, "#ffb347", 0.6);
    door(c, x + 10, gy - 17, 10, 17);
    ivy(c, rng, x, gy, wy + 6, w, 8);
    moss(c, rng, x - 1, wy + 1, w + 2, 6);
    const ax = x + w / 2;
    rect(c, ax, wy - 42, 1, 14, "#3b2a2a");
    S.flags.push({ x: ax + 1, y: wy - 42 });
  }

  // the spirit tree, with lanterns and glowing flowers
  {
    const x = 336;
    const t = broadleafTree(c, rng, x, gy, 24, 22, TREE_SPIRIT);
    for (let i = 0; i < 90; i++) {
      const px = Math.round(x + (rng() - 0.5) * 70);
      const py = Math.round(t.cy + (rng() - 0.6) * 60);
      if (insideBlobs(t.blobs, t.cx, t.cy, px, py)) {
        dot(c, px, py, rng() < 0.6 ? "#bff8ff" : "#ffffff");
        if (rng() < 0.3) dot(c, px + 1, py, "#7ff3ff");
      }
    }
    lantern(c, x - 17, gy - 38, "#ff8fb1", 12);
    lantern(c, x + 15, gy - 44, "#ffb347", 12);
    late.push(() => {
      for (const dx of [-14, -8, 9, 15]) glowFlower(x + dx, gy + 1);
    });
  }

  // windmill
  {
    const x = 394;
    const w = 30;
    const h = 46;
    const wy = gy - h;
    brickWall(c, rng, x, wy, w, h, STONE_WARM);
    rect(c, x - 2, wy, w + 4, 2, "#4a3050");
    roof(c, x - 3, wy - 18, w + 6, 18, ROOF_RED);
    rect(c, x - 3, wy + 20, w + 6, 2, WOOD);
    lit(x + 12, wy + 8, 6, 8);
    lit(x + 12, wy + 28, 6, 8);
    door(c, x + 10, gy - 14, 9, 14);
    ivy(c, rng, x, gy, wy + 12, w, 4);
    S.mills.push({ x: x + w / 2, y: wy - 8, len: 32 });
  }

  cottage(454, 60, 34, 24, STONE_WARM, ROOF_TEAL, { chimney: true, attic: true, ivy: 2 });
  bush(c, rng, 518, gy, 10, 7);
  lamp(522);

  // stream + stone bridge (drawn after the ground so it can cut through it)
  const bridgeX = 534;
  const bridgeW = 80;
  late.push(() => {
    const deckTop = gy + 2;
    c.clearRect(bridgeX, deckTop, bridgeW, H - deckTop);
    // wooden deck
    rect(c, bridgeX, deckTop, bridgeW, 12, "#7a5240");
    for (let px = bridgeX + 3; px < bridgeX + bridgeW; px += 6) rect(c, px, deckTop, 1, 12, "#4d3025");
    rect(c, bridgeX, deckTop, bridgeW, 1, "#a8704f");
    rect(c, bridgeX, deckTop + 11, bridgeW, 1, WOOD_D);
    // stone face with two arches
    brickWall(c, rng, bridgeX, gy + 14, bridgeW, H - gy - 14, STONE_COOL);
    rect(c, bridgeX, gy + 14, bridgeW, 1, STONE_COOL.light);
    for (const ax of [bridgeX + 22, bridgeX + 58]) {
      const r = 9;
      for (let dy = 0; dy <= r; dy++) {
        const hw = Math.floor(Math.sqrt(r * r - dy * dy));
        const col = dy < 3 ? "#2a5fb0" : dy < 6 ? "#1d4a8f" : "#12306a";
        rect(c, ax - hw, H - 1 - dy, hw * 2 + 1, 1, col);
      }
      rect(c, ax - 1, H - 1 - r - 1, 3, 2, "#8b86b8");
      S.water.push({ x: ax - 8, y: H - 8, w: 17, h: 7 });
    }
    // parapet along the back edge
    rect(c, bridgeX, gy - 3, bridgeW, 5, STONE_COOL.base);
    rect(c, bridgeX, gy - 4, bridgeW, 1, STONE_COOL.light);
    for (let px = bridgeX + 5; px < bridgeX + bridgeW; px += 10) rect(c, px, gy - 3, 1, 5, STONE_COOL.mortar);
    lamp(bridgeX + 2);
    lamp(bridgeX + bridgeW - 4);
  });

  // tavern
  {
    const x = 630;
    const w = 92;
    const wallH = 42;
    const roofH = 26;
    const wy = gy - wallH;
    brickWall(c, rng, x, wy, w, wallH, STONE_WARM);
    for (let bx = x; bx < x + w; bx += 23) rect(c, bx, wy, 2, wallH, "#4a2f2a");
    rect(c, x, wy + 19, w, 2, "#4a2f2a");
    roof(c, x - 5, wy - roofH, w + 10, roofH, ROOF_RED);
    lit(x + 20, wy - Math.round(roofH * 0.45), 7, 7);
    lit(x + w - 27, wy - Math.round(roofH * 0.45), 7, 7);
    lit(x + 9, wy + 6, 9, 10);
    lit(x + w - 18, wy + 6, 9, 10);
    lit(x + Math.floor(w / 2) - 4, wy + 6, 9, 10);
    lit(x + 8, wy + 25, 10, 11);
    lit(x + w - 18, wy + 25, 10, 11);
    door(c, x + Math.floor(w / 2) - 6, gy - 20, 12, 20);
    lantern(c, x + Math.floor(w / 2) - 17, gy - 26, "#ff6b3d", 12);
    lantern(c, x + Math.floor(w / 2) + 13, gy - 26, "#ff6b3d", 12);
    for (const cxp of [x + 14, x + w - 24]) {
      const surf = roofSurfaceY(x - 5, w + 10, wy - roofH, roofH, cxp + 2);
      const top = surf - 9;
      rect(c, cxp, top, 5, surf - top + 4, STONE_WARM.dark);
      rect(c, cxp - 1, top - 1, 7, 2, STONE_WARM.base);
      S.smoke.push({ x: cxp + 2, y: top - 2 });
    }
    ivy(c, rng, x, gy, wy + 4, 22, 4);
    moss(c, rng, x - 5, wy + 1, w + 10, 4);
    // hanging sign
    rect(c, x + w, wy + 22, 14, 1, "#2b2842");
    rect(c, x + w + 12, wy + 22, 1, 4, "#2b2842");
    rect(c, x + w + 5, wy + 26, 14, 11, WOOD_D);
    rect(c, x + w + 6, wy + 27, 12, 9, WOOD);
    rect(c, x + w + 9, wy + 30, 5, 5, "#f2c14e");
    rect(c, x + w + 9, wy + 29, 5, 1, "#ffffff");
    dot(c, x + w + 14, wy + 31, "#f2c14e");
    dot(c, x + w + 14, wy + 33, "#f2c14e");
    late.push(() => {
      barrel(c, x - 12, gy + 4);
      barrel(c, x - 3, gy + 4, 7, 8);
      crate(c, x + w + 2, gy + 4, 7);
    });
  }

  for (const [px, ph] of [[752, 42], [766, 54], [780, 46]] as const) pine(c, px, gy, ph, "#1a5a45", "#12402f");

  // gatehouse wall
  {
    const gx = 800;
    const gw = 70;
    const wh = 28;
    brickWall(c, rng, gx, gy - wh, gw, wh, STONE_COOL);
    for (let i = 0; i < gw; i += 10) {
      rect(c, gx + i, gy - wh - 4, 6, 4, STONE_COOL.base);
      rect(c, gx + i, gy - wh - 4, 6, 1, STONE_COOL.light);
    }
    const ax = gx + 27;
    rect(c, ax, gy - 17, 16, 17, "#0d0a22");
    disc(c, ax + 8, gy - 17, 8, "#0d0a22");
    lantern(c, ax + 6, gy - 22, "#ffb347", 11);
    ivy(c, rng, gx, gy, gy - wh + 2, gw, 6);
    moss(c, rng, gx, gy - wh - 3, gw, 5);
  }

  cottage(886, 52, 34, 22, STONE_COOL, ROOF_RED, { ivy: 4, chimney: true });
  cottage(946, 46, 48, 26, STONE_WARM, ROOF_TEAL, { ivy: 3, attic: true });
  lamp(1006);
  broadleafTree(c, rng, 1040, gy, 22, 18, TREE_GREEN);
  fence(1062, 30);

  // well
  {
    const x = 1104;
    brickWall(c, rng, x, gy - 9, 16, 9, STONE_COOL);
    rect(c, x - 1, gy - 10, 18, 2, STONE_COOL.light);
    rect(c, x + 1, gy - 26, 2, 17, WOOD);
    rect(c, x + 13, gy - 26, 2, 17, WOOD);
    roof(c, x - 3, gy - 34, 22, 8, ROOF_RED);
    rect(c, x + 8, gy - 26, 1, 7, "#3a2a2a");
    rect(c, x + 7, gy - 20, 3, 3, WOOD_L);
  }

  stall(1138, "#7a4fd1", "#f0e3c4", ["#ff9fc4", "#ffd470", "#7ff3ff"]);
  stall(1176, "#d19a2f", "#f0e3c4", ["#8be28b", "#ff6b6b", "#b9a2ff"]);
  lanternString(1134, 1212, gy - 46);
  late.push(() => {
    crate(c, 1214, gy + 4, 7);
    barrel(c, 1224, gy + 4);
  });
  cottage(1236, 56, 36, 24, STONE_WARM, ROOF_RED, { ivy: 7, chimney: true, attic: true });
  pine(c, 1304, gy, 40, "#1a5a45", "#12402f");
  pine(c, 1318, gy, 50, "#1a5a45", "#12402f");

  // signpost pointing the way
  {
    const x = 1336;
    rect(c, x, gy - 30, 2, 30, WOOD);
    rect(c, x - 12, gy - 29, 22, 8, WOOD_L);
    for (let i = 0; i < 4; i++) rect(c, x + 10 + i, gy - 29 + i, 1, 8 - i * 2, WOOD_L);
    rect(c, x - 12, gy - 29, 22, 1, "#a8704f");
    rect(c, x - 10, gy - 26, 14, 1, WOOD_D);
    rect(c, x - 10, gy - 24, 10, 1, WOOD_D);
  }

  broadleafTree(c, rng, 1380, gy, 20, 20, TREE_SAKURA);
  lamp(1420);
  cottage(Math.max(1470, endX - 70), 56, 34, 22, STONE_COOL, ROOF_TEAL, { ivy: 5, chimney: true });

  /* --- ground: cobbled path + grassy bank -------------------------------- */
  rect(c, 0, gy, NW, 2, "#173f33");
  for (let x = 0; x < NW; x++) if (rng() < 0.35) dot(c, x, gy - 1, "#2a7a4c");
  const pathTop = gy + 2;
  const tones = ["#5d5a80", "#686590", "#53506f"];
  for (let course = 0; course < 3; course++) {
    const y = pathTop + course * 4;
    let x = -((course * 5) % 9);
    while (x < NW) {
      const len = 6 + Math.floor(rng() * 5);
      rect(c, x, y, len - 1, 3, tones[Math.floor(rng() * 3)]);
      rect(c, x + len - 1, y, 1, 3, "#3a3760");
      x += len;
    }
    rect(c, 0, y + 3, NW, 1, "#3a3760");
  }
  for (let x = 0; x < NW; x++) if (rng() < 0.45) dot(c, x, pathTop, "#8b86b8");
  rect(c, 0, gy + 14, NW, 1, "#8b86b8");
  rect(c, 0, gy + 15, NW, H - gy - 15, "#17402f");
  rect(c, 0, gy + 15, NW, 1, "#2e7a4e");
  for (let x = 0; x < NW; x++) {
    if (rng() < 0.55) rect(c, x, gy + 16, 1, 1 + Math.floor(rng() * 3), "#2e7a4e");
    if (rng() < 0.12) dot(c, x, gy + 18 + Math.floor(rng() * (H - gy - 20)), "#245f43");
    if (rng() < 0.015) dot(c, x, gy + 17 + Math.floor(rng() * 6), ["#ff9fc4", "#ffffff", "#ffd470"][Math.floor(rng() * 3)]);
  }

  // things that sit on top of the ground
  for (const fn of late) fn();
  for (const gx of [28, 76, 262, 380, 520, 1068, 1196, 1346, 1404]) glowFlower(gx, gy + 1);

  // campfire (static parts)
  {
    const fy = gy + 10;
    S.fire = { x: campX, y: fy };
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const sx = campX + Math.round(Math.cos(a) * 9);
      const sy = fy + Math.round(Math.sin(a) * 3);
      rect(c, sx - 1, sy - 1, 3, 2, "#8b86b8");
      rect(c, sx - 1, sy, 3, 1, "#4a4770");
    }
    rect(c, campX - 6, fy - 2, 13, 3, "#6b4535");
    for (let i = 0; i < 8; i++) rect(c, campX - 5 + i, fy - 3 - (i >> 1), 3, 2, "#5a3a2e");
    rect(c, campX + 18, fy - 4, 16, 6, "#6b4535");
    rect(c, campX + 18, fy - 4, 3, 6, "#a8704f");
    rect(c, campX + 18, fy - 4, 16, 1, "#8a5a43");
  }

  return { L, S };
}

function buildForeground(make: CanvasFactory, W: number, H: number) {
  const width = W + Math.ceil(TRAVEL * 1.3) + 4;
  const L = makeLayer(make, width, H);
  const c = L.ctx;
  const rng = mulberry32(777);
  const greens = ["#102f26", "#17402f", "#1f5a3c", "#2e7a4e"];
  for (let x = 0; x < width; x++) {
    if (rng() < 0.42) {
      const blades = 2 + Math.floor(rng() * 3);
      for (let b = 0; b < blades; b++) {
        const h = 3 + Math.floor(rng() * 6);
        const bx = x + b;
        rect(c, bx, H - h, 1, h, greens[Math.min(3, Math.floor(h / 2.5))]);
        if (rng() < 0.5) dot(c, bx + (rng() < 0.5 ? -1 : 1), H - h, greens[2]);
      }
    }
    if (rng() < 0.012) {
      const h = 6 + Math.floor(rng() * 7);
      rect(c, x, H - h, 1, h, "#1f5a3c");
      const col = ["#ff9fc4", "#ffffff", "#ffd470", "#b9a2ff"][Math.floor(rng() * 4)];
      rect(c, x - 1, H - h - 1, 3, 2, col);
    }
    if (rng() < 0.006) {
      const h = 5 + Math.floor(rng() * 4);
      rect(c, x, H - h, 1, h, "#1f5a3c");
      glow(c, x, H - h - 1, 7, "#7ff3ff", 0.9);
      rect(c, x - 1, H - h - 2, 3, 2, "#7ff3ff");
      dot(c, x, H - h - 3, "#e6ffff");
    }
  }
  return L;
}

/* ------------------------------------------------------------------- scene */

export function createScene(W: number, H: number, make: CanvasFactory): Scene {
  const gy = H - 28;
  const charX = Math.max(26, Math.round(W * 0.3));
  const footY = gy + 10;

  const sky = buildSky(make, W, H);
  const far = buildRidge(make, W, H, 0.08, { base: 78, amps: [24, 11, 5, 2], fill: "#2a2366", rim: "#4a3f94", seed: 5, hazeCol: "#7a4a9e" }).L;
  const mid = buildRidge(make, W, H, 0.18, { base: 56, amps: [14, 7, 3, 1], fill: "#1a1550", rim: "#2f2878", seed: 17, hazeCol: "#5a3a96" }).L;
  const village = buildDistantVillage(make, W, H, 0.35);
  const { L: near, S } = buildNear(make, W, H, gy, charX);
  const fore = buildForeground(make, W, H);

  const halos = {
    lamp: makeHalo(make, 18, "#ffb347"),
    fire: makeHalo(make, 36, "#ff8a3d"),
    orb: makeHalo(make, 16, "#7ff3ff"),
    flower: makeHalo(make, 6, "#7ff3ff"),
  };

  // stars and fireflies live in screen space
  const srng = mulberry32(4242);
  const stars = Array.from({ length: Math.round((W * H) / 650) }, () => ({
    x: srng() * W,
    y: srng() * H * 0.62,
    sp: 0.6 + srng() * 2,
    ph: srng() * 6.28,
    big: srng() < 0.07,
  }));
  const flies = Array.from({ length: Math.max(22, Math.min(60, Math.round((W * H) / 1100))) }, () => ({
    bx: srng() * W,
    by: H * 0.3 + srng() * (H * 0.62),
    ph: srng() * 6.28,
    sp: 0.3 + srng() * 0.6,
    ax: 4 + srng() * 12,
    ay: 3 + srng() * 7,
    bs: 0.6 + srng() * 1.1,
    cyan: srng() < 0.18,
  }));

  const wrap = (v: number, m: number) => ((v % m) + m) % m;

  function render(ctx: Ctx, f: SceneFrame) {
    const { t, cam } = f;
    const camI = Math.round(cam);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
    ctx.drawImage(sky.canvas, 0, 0);

    // twinkling stars
    for (const s of stars) {
      const x = Math.floor(wrap(s.x - cam * 0.02, W));
      const y = Math.floor(s.y);
      const k = Math.sin(t * s.sp + s.ph);
      if (k > 0.55) {
        dot(ctx, x, y, "#ffffff");
        if (s.big) {
          dot(ctx, x - 1, y, "#b9bfff");
          dot(ctx, x + 1, y, "#b9bfff");
          dot(ctx, x, y - 1, "#b9bfff");
          dot(ctx, x, y + 1, "#b9bfff");
        }
      } else if (k > -0.45) dot(ctx, x, y, "#aab0f0");
      else dot(ctx, x, y, "#5a5fa8");
    }

    // shooting star every so often
    {
      const period = 17;
      const k = Math.floor(t / period);
      const p = (t % period) / period;
      if (p < 0.04) {
        const u = p / 0.04;
        const hx = W * (0.45 + 0.5 * hash01(k)) - u * 60;
        const hy = 6 + hash01(k + 9) * H * 0.18 + u * 30;
        for (let i = 0; i < 8; i++) {
          ctx.globalAlpha = 1 - i / 8;
          dot(ctx, hx + i * 1.4, hy - i * 0.7, i === 0 ? "#ffffff" : "#cfd4ff");
        }
        ctx.globalAlpha = 1;
      }
    }

    ctx.drawImage(far.canvas, -Math.round(cam * 0.08), 0);
    ctx.drawImage(mid.canvas, -Math.round(cam * 0.18), 0);
    ctx.drawImage(village.canvas, -Math.round(cam * 0.35), 0);

    // bats
    for (let i = 0; i < 2; i++) {
      const period = 23 + i * 9;
      const p = ((t + i * 7) % period) / period;
      if (p < 0.5) {
        const u = p / 0.5;
        const bx = W + 8 - u * (W + 30);
        const by = H * (0.4 + i * 0.07) + Math.sin(u * 14 + i) * 4;
        const up = Math.floor(t * 7) % 2 === 0;
        const col = "#08061c";
        dot(ctx, bx + 2, by + 1, col);
        if (up) { dot(ctx, bx, by, col); dot(ctx, bx + 1, by + 1, col); dot(ctx, bx + 3, by + 1, col); dot(ctx, bx + 4, by, col); }
        else { dot(ctx, bx, by + 1, col); dot(ctx, bx + 1, by + 2, col); dot(ctx, bx + 3, by + 2, col); dot(ctx, bx + 4, by + 1, col); }
      }
    }

    ctx.drawImage(near.canvas, -camI, 0);

    // window flicker
    S.wins.forEach((w, i) => {
      const sx = w.x - camI;
      if (sx < -12 || sx > W + 12) return;
      if (hash01(Math.floor(t * 2.2) + i * 13.7) < 0.1) {
        rect(ctx, sx, w.y, w.w, w.h, "#d98a2b");
        rect(ctx, sx + Math.floor(w.w / 2), w.y, 1, w.h, "#2a1a2e");
        rect(ctx, sx, w.y + Math.floor(w.h / 2), w.w, 1, "#2a1a2e");
      }
    });

    // lamp light
    S.flames.forEach((l, i) => {
      const sx = l.x - camI;
      if (sx < -24 || sx > W + 24) return;
      const fl = 0.62 + 0.3 * hash01(Math.floor(t * 9) + i * 5.1);
      ctx.globalAlpha = fl;
      ctx.drawImage(halos.lamp.canvas, sx - 18, l.y - 18);
      ctx.globalAlpha = 1;
    });

    // chimney smoke
    S.smoke.forEach((s, i) => {
      const sx = s.x - camI;
      if (sx < -20 || sx > W + 20) return;
      for (let j = 0; j < 5; j++) {
        const age = (t * 0.35 + j / 5 + i * 0.37) % 1;
        const px = sx + Math.sin(age * 6 + j + i) * 2 + age * 5;
        const py = s.y - age * 24;
        const size = 1 + Math.floor(age * 3);
        ctx.globalAlpha = (1 - age) * 0.55;
        rect(ctx, px, py, size, size, "#c9c4e6");
      }
      ctx.globalAlpha = 1;
    });

    // windmill sails
    for (const m of S.mills) {
      const hx = m.x - camI;
      if (hx < -40 || hx > W + 40) continue;
      const a0 = Math.floor(t * 0.5 * 8) / 8;
      for (let b = 0; b < 4; b++) {
        const a = a0 + (b * Math.PI) / 2;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        for (let r = 3; r <= m.len; r++) {
          rect(ctx, hx + Math.round(ca * r), m.y + Math.round(sa * r), 2, 2, "#5a3a2e");
          if (r >= 9) {
            for (let k = 2; k <= 5; k++) {
              dot(ctx, hx + Math.round(ca * r - sa * k), m.y + Math.round(sa * r + ca * k), (r + k) & 1 ? "#d8cfae" : "#bfb591");
            }
          }
        }
      }
      disc(ctx, hx + 1, m.y + 1, 2, "#3a251f");
      dot(ctx, hx + 1, m.y + 1, "#f2c14e");
    }

    // tower flag
    for (const fl of S.flags) {
      const sx = fl.x - camI;
      if (sx < -14 || sx > W + 14) continue;
      const wave = Math.floor(t * 3) % 2;
      for (let i = 0; i < 5; i++) {
        const len = 9 - i + ((i + wave) % 2);
        rect(ctx, sx, fl.y + i, len, 1, "#e8615b");
      }
      dot(ctx, sx + 1, fl.y + 1, "#ffd470");
    }

    // moonlit water under the bridge
    for (const w of S.water) {
      const sx = w.x - camI;
      if (sx < -20 || sx > W + 20) continue;
      for (let k = 0; k < 7; k++) {
        const px = sx + ((k * 5 + Math.floor(t * 5)) % w.w);
        const py = w.y + ((k * 3) % w.h);
        const mx = px - sx - w.w / 2;
        if (Math.abs(mx) < 7 - (w.y + w.h - py) * 0.3) dot(ctx, px, py, k % 2 ? "#9cc2ff" : "#cfe3ff");
      }
    }

    // glowing flowers
    for (const g of S.glows) {
      const sx = g.x - camI;
      if (sx < -8 || sx > W + 8) continue;
      ctx.globalAlpha = 0.45 + 0.4 * Math.sin(t * 2 + g.x);
      ctx.drawImage(halos.flower.canvas, sx - 6, g.y - 6);
      ctx.globalAlpha = 1;
    }

    // campfire
    if (S.fire) {
      const fx = S.fire.x - camI;
      if (fx > -40 && fx < W + 40) {
        const fy = S.fire.y;
        ctx.globalAlpha = 0.7 + 0.25 * hash01(Math.floor(t * 10));
        ctx.drawImage(halos.fire.canvas, fx - 36, fy - 40);
        ctx.globalAlpha = 1;
        const layers: [number, number, string][] = [[13, 9, "#d9482b"], [10, 6, "#ff8a2b"], [6, 3, "#ffd36a"]];
        layers.forEach(([h, w, col], k) => {
          const jit = Math.floor(hash01(Math.floor(t * 12) + k * 3.3) * 3) - 1;
          for (let i = 0; i < h; i++) {
            const rowW = Math.max(1, Math.round(w * (1 - i / h)) + (i < 3 ? 1 : 0));
            rect(ctx, fx - Math.floor(rowW / 2) + (i > h * 0.55 ? jit : 0), fy - 4 - i, rowW, 1, col);
          }
        });
        for (let k = 0; k < 6; k++) {
          const age = (t * 0.6 + k / 6) % 1;
          ctx.globalAlpha = 1 - age;
          dot(ctx, fx + Math.sin(k * 2.1 + age * 5) * 6, fy - 12 - age * 32, "#ffd36a");
        }
        ctx.globalAlpha = 1;
      }
    }

    // the wanderer
    const orbPulse = 0.8 + 0.2 * Math.sin(t * 3);
    ctx.globalAlpha = 0.35;
    rect(ctx, charX - 5, footY, 11, 1, "#000000");
    rect(ctx, charX - 3, footY + 1, 7, 1, "#000000");
    ctx.globalAlpha = 1;
    const orb = drawCharacter(ctx, charX, footY, {
      frame: f.walkFrame,
      moving: f.moving,
      facing: f.facing,
      t,
    });
    ctx.globalAlpha = orbPulse;
    ctx.drawImage(halos.orb.canvas, orb.orbX - 16, orb.orbY - 16);
    ctx.globalAlpha = 1;

    ctx.drawImage(fore.canvas, -Math.round(cam * 1.3), 0);

    // fireflies: the magic
    for (const fl of flies) {
      const x = Math.floor(wrap(fl.bx + Math.sin(t * fl.sp + fl.ph) * fl.ax - cam * 0.55, W));
      const y = Math.floor(fl.by + Math.cos(t * fl.sp * 0.8 + fl.ph) * fl.ay);
      const b = Math.pow((Math.sin(t * fl.bs + fl.ph * 2) + 1) / 2, 2);
      const core = fl.cyan ? "#d6fcff" : "#fff7a8";
      const halo = fl.cyan ? "#7ff3ff" : "#d4f55a";
      if (b > 0.75) {
        ctx.globalAlpha = 0.5;
        dot(ctx, x - 1, y, halo); dot(ctx, x + 1, y, halo); dot(ctx, x, y - 1, halo); dot(ctx, x, y + 1, halo);
        ctx.globalAlpha = 1;
        dot(ctx, x, y, core);
      } else if (b > 0.3) {
        ctx.globalAlpha = 0.85;
        dot(ctx, x, y, halo);
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 0.25;
        dot(ctx, x, y, halo);
        ctx.globalAlpha = 1;
      }
    }
  }

  return { W, H, render };
}

function makeHalo(make: CanvasFactory, r: number, col: string) {
  const L = makeLayer(make, r * 2 + 1, r * 2 + 1);
  glow(L.ctx, r, r, r, col, 1.2);
  return L;
}
