import {
  ditherRect,
  dot,
  fogBands,
  glowRect,
  hash01,
  line,
  mix,
  mulberry32,
  pick,
  rect,
  rint,
  shade,
  type Ctx,
} from "./draw";
import { neonV } from "./neon";
import { NEON, SIGNS_V, SKY, SKY_STOPS } from "./palette";
import { makeLayer, type CanvasFactory, type Layer } from "./types";

/* --------------------------------------------------------------------- sky */

export function buildSky(make: CanvasFactory, W: number, H: number): Layer {
  const L = makeLayer(make, W, H);
  const c = L.ctx;
  for (let i = 0; i < SKY.length; i++) {
    const y0 = Math.round(SKY_STOPS[i] * H);
    const y1 = i + 1 < SKY.length ? Math.round(SKY_STOPS[i + 1] * H) : H;
    rect(c, 0, y0, W, y1 - y0, SKY[i]);
  }
  // dithered seams between the colour bands
  for (let i = 0; i < SKY.length - 1; i++) {
    const y1 = Math.round(SKY_STOPS[i + 1] * H);
    for (let x = 0; x < W; x++) {
      if (x % 4 === 0) dot(c, x, y1 - 2, SKY[i + 1]);
      if (x % 2 === 0) dot(c, x, y1 - 1, SKY[i + 1]);
      if (x % 2 === 1) dot(c, x, y1, SKY[i]);
      if (x % 4 === 2) dot(c, x, y1 + 1, SKY[i]);
    }
  }
  const rng = mulberry32(8080);
  // a few stars poking through the smog
  for (let i = 0; i < Math.round((W * H) / 5200); i++) {
    dot(c, rng() * W, rng() * H * 0.34, rng() < 0.3 ? "#8a7fd0" : "#4a4290");
  }
  // low clouds lit from below by the city
  for (let i = 0; i < Math.max(8, Math.round(W / 45)); i++) {
    const cx = rng() * W;
    const cy = H * (0.3 + rng() * 0.32);
    const cw = 50 + rng() * 120;
    for (let k = 0; k < 4; k++) {
      const w = cw * (1 - k * 0.2);
      c.save();
      c.globalAlpha = 0.2 + k * 0.04;
      c.fillStyle = "#5a3a9a";
      c.fillRect(Math.round(cx + (cw - w) / 2), Math.round(cy + k * 2), Math.round(w), 2);
      c.restore();
      ditherRect(c, cx + (cw - w) / 2, cy + k * 2 - 1, w, 1, "#9a4ab0", 0.35, k);
    }
  }
  return L;
}

/* --------------------------------------------------------- distant skyline */

export interface SkylineOpts {
  minH: number;
  maxH: number;
  wMin: number;
  wMax: number;
  body: string;
  rim: string;
  haze: string;
  hazeMax: number;
  seed: number;
  winP: number;
  winCols: readonly string[];
  neonP: number;
  antennaP: number;
  /** chance, per ~150 rows, of a lit advert panel on a tower */
  panelP?: number;
  /** chance of leaving a gap after a tower, so the layer behind shows through */
  gapP?: number;
  /** chance, per ~150 rows, of a vertical neon blade sign */
  signP?: number;
  /** y (from top) at which the layer's buildings stand */
  baseY: number;
}

export interface SkylineResult {
  layer: Layer;
  blink: { x: number; y: number; col: string }[];
}

/**
 * A skyline for the vertical descent: towers whose tops sit near the top of
 * the layer and which run all the way down, so the city keeps going as the
 * camera drops. `layerH` is the full height of the layer.
 */
export function buildSkyline(
  make: CanvasFactory,
  W: number,
  layerH: number,
  o: SkylineOpts,
): SkylineResult {
  const L = makeLayer(make, W, layerH);
  const c = L.ctx;
  const rng = mulberry32(o.seed);
  const blink: SkylineResult["blink"] = [];

  let x = -6;
  while (x < W) {
    const w = rint(rng, o.wMin, o.wMax);
    const h = rint(rng, o.minH, o.maxH);
    const top = o.baseY - h;
    const body = mix(o.body, pick(rng, [NEON.vio, NEON.mag, NEON.cyan]), 0.04 + rng() * 0.06);
    drawTower(c, rng, x, top, w, layerH, body, o, blink);
    // sometimes a second, narrower tower hugs it for a stepped silhouette
    if (rng() < 0.35) {
      const w2 = Math.max(6, Math.round(w * (0.4 + rng() * 0.3)));
      const h2 = Math.round(h * (0.55 + rng() * 0.3));
      drawTower(c, rng, x + w - 2, o.baseY - h2, w2, layerH, shade(body, -0.08), o, blink);
      x += w2 - 2;
    }
    x += w - 1 + rint(rng, 0, 3);
    if (o.gapP && rng() < o.gapP) x += rint(rng, 8, 24);
  }

  // one even veil of distance haze over the whole layer
  fogBands(c, 0, 0, layerH, W, o.haze, o.hazeMax, 1);
  return { layer: L, blink };
}

function drawTower(
  c: Ctx,
  rng: () => number,
  x: number,
  top: number,
  w: number,
  H: number,
  body: string,
  o: SkylineOpts,
  blink: SkylineResult["blink"],
) {
  rect(c, x, top, w, H - top, body);
  // cool light from the street on one edge, a shadow on the other
  const litLeft = rng() < 0.5;
  rect(c, litLeft ? x : x + w - 1, top, 1, H - top, mix(body, o.rim, 0.55));
  rect(c, litLeft ? x + w - 2 : x, top, 2, H - top, shade(body, -0.35));
  rect(c, x, top, w, 1, mix(body, o.rim, 0.7));

  // floor ledges
  for (let ly = top + rint(rng, 16, 30); ly < H - 6; ly += rint(rng, 30, 52)) {
    rect(c, x, ly, w, 1, mix(body, o.rim, 0.22));
    rect(c, x, ly + 1, w, 1, shade(body, -0.25));
  }

  // windows, in runs of lit and dark floors so the tower reads as stacked storeys
  const bp = o.winP * (0.4 + rng() * 1.2);
  let on = rng() < 0.55;
  for (let wy = top + 5; wy < H - 4; wy += 5) {
    if (rng() < 0.16) on = !on;
    const p = on ? Math.min(0.85, bp * 2.6) : bp * 0.2;
    for (let wx = x + 3; wx < x + w - 3; wx += 3) {
      if (rng() < p) rect(c, wx, wy, 1, 2, pick(rng, o.winCols));
    }
  }

  // long glowing strips down a corner
  if (rng() < o.neonP) {
    for (let n = rint(rng, 1, 2); n > 0; n--) {
      const col = pick(rng, [NEON.cyan, NEON.mag, NEON.mag, NEON.yel]);
      const sy = top + rint(rng, 6, 80);
      const sh = rint(rng, 30, 110);
      const sx = litLeft ? x + 1 : x + w - 2;
      ditherRect(c, sx - 2, sy, 5, sh, col, 0.22);
      rect(c, sx, sy, 1, sh, col);
    }
  }

  // lit advert panels and blade signs, scattered all the way down
  if (o.panelP || o.signP) {
    for (let py = top + rint(rng, 20, 90); py < H - 70; py += rint(rng, 90, 210)) {
      if (o.panelP && w >= 14 && rng() < o.panelP) {
        const pw = Math.min(w - 6, rint(rng, 8, w - 6));
        const ph = rint(rng, 16, 44);
        const px = x + 3 + rint(rng, 0, w - 6 - pw);
        const col = pick(rng, [NEON.mag, NEON.cyan, NEON.yel, NEON.org, NEON.mag]);
        glowRect(c, px, py, pw, ph, col, 6, 0.8);
        rect(c, px - 1, py - 1, pw + 2, ph + 2, "#06030f");
        for (let i = 0; i < ph; i++) rect(c, px, py + i, pw, 1, mix(col, "#12071f", 0.3 + 0.55 * (i / ph)));
        rect(c, px, py, pw, 1, shade(col, 0.4));
        if (rng() < 0.6) rect(c, px + 2, py + Math.floor(ph / 2), Math.max(2, pw - 4), 2, shade(col, 0.55));
      } else if (o.signP && rng() < o.signP) {
        const sx = x + rint(rng, 1, Math.max(2, w - 8));
        neonV(c, sx, py, pick(rng, SIGNS_V), pick(rng, [NEON.mag, NEON.cyan, NEON.yel, NEON.org]), 0.8);
      }
    }
  }

  // roof gear
  if (rng() < o.antennaP) {
    const ah = rint(rng, 6, 18);
    const ax = x + Math.floor(w / 2);
    rect(c, ax, top - ah, 1, ah, mix(body, o.rim, 0.4));
    dot(c, ax, top - ah, NEON.red);
    blink.push({ x: ax, y: top - ah, col: NEON.red });
  }
  if (rng() < 0.18 && w > 12) {
    const bw = rint(rng, 4, 7);
    rect(c, x + 2, top - 3, bw, 3, shade(body, 0.08));
  }
}

/* ---------------------------------------------------- elevated rail + train */

export const TRAIN_LEN = 4 * 31;

export function buildViaduct(layer: Layer, width: number, H: number, deckY: number, seed: number) {
  const c = layer.ctx;
  const rng = mulberry32(seed);
  // pillars
  for (let x = 14; x < width; x += 58 + rint(rng, 0, 10)) {
    rect(c, x, deckY + 4, 5, H - deckY - 4, "#0f0a24");
    rect(c, x, deckY + 4, 1, H - deckY - 4, "#2c2358");
    rect(c, x - 2, deckY + 4, 9, 3, "#171034");
    line(c, x + 5, deckY + 8, x + 58, deckY + 40, "#120c2a");
  }
  // the deck: dark girder with a lit underside
  rect(c, 0, deckY, width, 5, "#150f30");
  rect(c, 0, deckY, width, 1, "#4b3a8a");
  rect(c, 0, deckY + 5, width, 1, "#0a0618");
  for (let x = 4; x < width; x += 9) dot(c, x, deckY + 3, hash01(x) < 0.5 ? NEON.cyan : "#7a5ad0");
  // rails and a catenary wire
  rect(c, 0, deckY - 1, width, 1, "#2c2358");
  for (let x = 0; x < width; x += 90) {
    rect(c, x, deckY - 14, 1, 14, "#1e1745");
    rect(c, x - 2, deckY - 14, 5, 1, "#1e1745");
  }
  for (let x = 0; x < width; x += 90) line(c, x, deckY - 13, x + 90, deckY - 13, "#2a2060");
}

/** One train: dark cars with a lit window band, a bright nose and a red tail. */
export function drawTrain(c: Ctx, x: number, y: number, dir: 1 | -1, t: number) {
  const carW = 30;
  const h = 10;
  for (let i = 0; i < 4; i++) {
    const cx = x + i * (carW + 1);
    rect(c, cx, y - h, carW, h, "#1b1338");
    rect(c, cx, y - h, carW, 1, "#4b3a8a");
    rect(c, cx, y - 2, carW, 2, "#0d0822");
    // window band
    for (let wx = cx + 2; wx < cx + carW - 3; wx += 6) {
      const lit = hash01(i * 7 + wx) < 0.8;
      rect(c, wx, y - h + 3, 5, 3, lit ? (hash01(wx * 3 + i) < 0.7 ? "#7ff3ff" : "#ffd36a") : "#241a48");
      if (lit) rect(c, wx, y - h + 3, 5, 1, "#dffcff");
    }
    // door lines and a magenta stripe
    rect(c, cx + carW - 1, y - h + 1, 1, h - 3, "#0d0822");
    rect(c, cx, y - 4, carW, 1, "#a8267f");
  }
  const noseX = dir > 0 ? x + 4 * (carW + 1) - 1 : x - 2;
  rect(c, noseX, y - 6, 2, 3, "#fff6c8");
  glowRect(c, noseX - (dir > 0 ? 0 : 3), y - 7, 5, 5, "#ffe9a8", 6, 0.8);
  const tailX = dir > 0 ? x : x + 4 * (carW + 1) - 2;
  rect(c, tailX, y - 6, 2, 2, Math.floor(t * 2) % 2 ? "#ff3b5c" : "#a8203a");
}
