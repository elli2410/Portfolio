/**
 * Tiny pixel-art drawing toolkit.
 *
 * Everything here draws on a low-resolution canvas (roughly 320x180 "logical"
 * pixels). The canvas is scaled up with CSS `image-rendering: pixelated`, so a
 * 1x1 fillRect becomes one chunky pixel on screen.
 */

export type Ctx = CanvasRenderingContext2D;
export type Rng = () => number;

/** Small seeded random generator so the village looks the same on every visit. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cheap deterministic hash -> 0..1, used for flicker that doesn't need state. */
export function hash01(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function rect(c: Ctx, x: number, y: number, w: number, h: number, col: string) {
  const rw = Math.round(w);
  const rh = Math.round(h);
  if (rw <= 0 || rh <= 0) return;
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), rw, rh);
}

export function dot(c: Ctx, x: number, y: number, col: string) {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), 1, 1);
}

/** Filled pixel circle. */
export function disc(c: Ctx, cx: number, cy: number, r: number, col: string) {
  c.fillStyle = col;
  const x0 = Math.round(cx);
  const y0 = Math.round(cy);
  for (let dy = -r; dy <= r; dy++) {
    const hw = Math.floor(Math.sqrt(r * r - dy * dy + 0.5));
    c.fillRect(x0 - hw, y0 + dy, hw * 2 + 1, 1);
  }
}

/** Checkerboard-dithered circle: the pixel-art way to fake a soft glow. */
export function ditherDisc(
  c: Ctx,
  cx: number,
  cy: number,
  r: number,
  col: string,
  alpha: number,
  parity = 0,
) {
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = col;
  const x0 = Math.round(cx);
  const y0 = Math.round(cy);
  for (let dy = -r; dy <= r; dy++) {
    const hw = Math.floor(Math.sqrt(r * r - dy * dy + 0.5));
    for (let dx = -hw; dx <= hw; dx++) {
      if (((dx + dy + parity) & 1) === 0) c.fillRect(x0 + dx, y0 + dy, 1, 1);
    }
  }
  c.restore();
}

/** Soft light: dithered rings, denser toward the middle. */
export function glow(c: Ctx, cx: number, cy: number, r: number, col: string, strength = 1) {
  ditherDisc(c, cx, cy, r, col, 0.16 * strength, 0);
  ditherDisc(c, cx, cy, Math.round(r * 0.62), col, 0.2 * strength, 1);
  c.save();
  c.globalAlpha = 0.22 * strength;
  disc(c, cx, cy, Math.max(1, Math.round(r * 0.3)), col);
  c.restore();
}

export interface StonePalette {
  base: string;
  light: string;
  dark: string;
  mortar: string;
}

/** Stone brick wall with mortar lines, random tone variation and edge shading. */
export function brickWall(
  c: Ctx,
  rng: Rng,
  x: number,
  y: number,
  w: number,
  h: number,
  p: StonePalette,
) {
  rect(c, x, y, w, h, p.base);
  for (let row = 0; row * 4 < h; row++) {
    const ry = y + row * 4;
    if (ry + 3 < y + h) rect(c, x, ry + 3, w, 1, p.mortar);
    const off = (row % 2) * 4;
    for (let bx = -off; bx < w; bx += 8) {
      if (bx > 0) rect(c, x + bx, ry, 1, Math.min(3, y + h - ry), p.mortar);
      const sx = Math.max(bx + 1, 0);
      const ex = Math.min(bx + 8, w);
      const roll = rng();
      if (ex > sx) {
        const bh = Math.min(3, y + h - ry);
        if (roll < 0.17) rect(c, x + sx, ry, ex - sx, bh, p.light);
        else if (roll < 0.3) rect(c, x + sx, ry, ex - sx, bh, p.dark);
      }
    }
  }
  rect(c, x, y, 1, h, p.light);
  rect(c, x + w - 1, y, 1, h, p.dark);
}

export interface RoofPalette {
  a: string;
  b: string;
  c: string;
}

/** Stepped gable roof. (x, y) is the top-left of its bounding box. */
export function roof(c: Ctx, x: number, y: number, w: number, h: number, p: RoofPalette) {
  const cx = x + w / 2;
  for (let i = 0; i < h; i++) {
    const rowW = Math.max(2, Math.round((w * (i + 1)) / h));
    const left = Math.round(cx - rowW / 2);
    const tileLine = i % 3 === 2;
    rect(c, left, y + i, rowW, 1, tileLine ? p.b : p.a);
    if (!tileLine) {
      // scale pattern
      for (let px = left + ((i % 2) * 2); px < left + rowW; px += 4) dot(c, px, y + i, p.b);
    }
    dot(c, left, y + i, p.c);
    dot(c, left + 1, y + i, p.c);
  }
  rect(c, x - 1, y + h, w + 2, 1, p.b);
  rect(c, x - 1, y + h + 1, w + 2, 1, '#00000055');
}

/** Roof surface y at a given x, so chimneys sit on the slope. */
export function roofSurfaceY(x: number, w: number, apexY: number, h: number, px: number) {
  const cx = x + w / 2;
  const k = Math.min(1, Math.abs(px - cx) / (w / 2));
  return Math.round(apexY + h * k);
}

export function windowLit(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  frame = '#2a1a2e',
  top = '#ffe28f',
  bot = '#ffb04a',
) {
  rect(c, x - 1, y - 1, w + 2, h + 2, frame);
  const half = Math.ceil(h / 2);
  rect(c, x, y, w, half, top);
  rect(c, x, y + half, w, h - half, bot);
  rect(c, x + Math.floor(w / 2), y, 1, h, frame);
  rect(c, x, y + Math.floor(h / 2), w, 1, frame);
  rect(c, x - 2, y + h + 1, w + 4, 1, '#a39cc4');
}

export function archWindow(c: Ctx, x: number, y: number, w: number, h: number, frame = '#2a1a2e') {
  rect(c, x - 1, y, w + 2, h, frame);
  rect(c, x, y + 1, w, h - 1, '#ffd470');
  rect(c, x + 1, y - 1, w - 2, 1, frame);
  rect(c, x, y + 2, w, 1, '#ffe9a8');
  rect(c, x + Math.floor(w / 2), y + 1, 1, h - 1, frame);
  rect(c, x - 2, y + h, w + 4, 1, '#a39cc4');
}

export function door(c: Ctx, x: number, y: number, w: number, h: number) {
  rect(c, x - 1, y + 1, w + 2, h - 1, '#2b1c24');
  rect(c, x, y + 2, w, h - 2, '#6b4535');
  rect(c, x + 1, y, w - 2, 2, '#6b4535');
  rect(c, x + 1, y - 1, w - 2, 1, '#2b1c24');
  for (let px = x + 2; px < x + w - 1; px += 3) rect(c, px, y + 2, 1, h - 2, '#4d3025');
  rect(c, x, y + Math.round(h * 0.3), w, 1, '#2a2a3c');
  rect(c, x, y + Math.round(h * 0.7), w, 1, '#2a2a3c');
  dot(c, x + w - 3, y + Math.round(h * 0.55), '#f2c14e');
  rect(c, x - 2, y + h, w + 4, 1, '#8d86b0');
}

const IVY_DARK = '#1f5a3a';
const IVY_MID = '#2f8a4c';
const IVY_LIGHT = '#6ccf6c';
const IVY_FLOWERS = ['#ff9fc4', '#ffffff', '#ffd470', '#b9a2ff'];

/**
 * Ivy crawling up a wall: a handful of random-walk vines with leaf clumps and
 * the occasional tiny flower.
 */
export function ivy(
  c: Ctx,
  rng: Rng,
  x: number,
  yBottom: number,
  yTop: number,
  w: number,
  count: number,
) {
  for (let v = 0; v < count; v++) {
    let vx = x + 1 + Math.floor(rng() * Math.max(1, w - 2));
    let vy = yBottom - 1;
    const len = Math.round((yBottom - yTop) * (0.35 + rng() * 0.65));
    for (let s = 0; s < len; s++) {
      dot(c, vx, vy, rng() < 0.5 ? IVY_DARK : IVY_MID);
      if (s % 3 === 0 && rng() < 0.8) {
        const lx = vx + (rng() < 0.5 ? -1 : 0);
        rect(c, lx, vy - 1, 2, 2, IVY_MID);
        dot(c, lx + (rng() < 0.5 ? 0 : 1), vy - 1, IVY_LIGHT);
      }
      if (rng() < 0.05) dot(c, vx + (rng() < 0.5 ? -1 : 1), vy, IVY_FLOWERS[Math.floor(rng() * 4)]);
      const r = rng();
      if (r < 0.25 && vx > x + 1) vx--;
      else if (r < 0.5 && vx < x + w - 2) vx++;
      vy--;
    }
  }
}

/** Moss and leaves spilling over a roof edge or wall top. */
export function moss(c: Ctx, rng: Rng, x: number, y: number, w: number, hang = 4) {
  for (let px = x; px < x + w; px++) {
    if (rng() < 0.45) {
      const len = 1 + Math.floor(rng() * hang);
      for (let i = 0; i < len; i++) dot(c, px, y + i, i === len - 1 ? IVY_LIGHT : rng() < 0.5 ? IVY_MID : IVY_DARK);
    }
  }
}

export interface TreePalette {
  dark: string;
  mid: string;
  light: string;
  trunk: string;
  trunkDark: string;
}

export type Blob = [number, number, number];

/** Is a point inside any canopy blob? Handy for scattering blossoms. */
export function insideBlobs(blobs: Blob[], cx: number, cy: number, px: number, py: number) {
  return blobs.some(([bx, by, br]) => (px - cx - bx) ** 2 + (py - cy - by) ** 2 <= br * br);
}

/** Broadleaf tree: gnarled trunk, three-tone clumpy canopy with leaf texture. */
export function broadleafTree(
  c: Ctx,
  rng: Rng,
  x: number,
  gy: number,
  trunkH: number,
  crownR: number,
  p: TreePalette,
) {
  // roots + trunk
  rect(c, x - 4, gy - 2, 9, 2, p.trunkDark);
  rect(c, x - 2, gy - trunkH, 5, trunkH, p.trunk);
  rect(c, x + 1, gy - trunkH, 2, trunkH, p.trunkDark);
  for (let i = 0; i < trunkH; i += 3) dot(c, x - 1, gy - i - 2, p.trunkDark);
  // branches
  rect(c, x - 5, gy - trunkH - 2, 3, 2, p.trunk);
  rect(c, x + 3, gy - trunkH - 3, 3, 2, p.trunk);

  const cy = gy - trunkH - Math.round(crownR * 0.55);
  const blobs: Blob[] = [
    [0, 0, crownR],
    [-crownR * 0.75, crownR * 0.3, crownR * 0.72],
    [crownR * 0.75, crownR * 0.25, crownR * 0.76],
    [-crownR * 0.2, -crownR * 0.55, crownR * 0.7],
    [crownR * 0.35, -crownR * 0.4, crownR * 0.6],
  ];
  for (const [bx, by, br] of blobs) disc(c, x + bx + 1, cy + by + 1, Math.round(br), p.dark);
  for (const [bx, by, br] of blobs) disc(c, x + bx, cy + by, Math.round(br), p.mid);
  for (const [bx, by, br] of blobs) {
    disc(c, x + bx - br * 0.22, cy + by - br * 0.3, Math.round(br * 0.62), p.light);
  }
  // leaf texture
  const inside = (px: number, py: number) => insideBlobs(blobs, x, cy, px, py);
  for (let i = 0; i < crownR * 14; i++) {
    const px = Math.round(x + (rng() - 0.5) * crownR * 3.4);
    const py = Math.round(cy + (rng() - 0.65) * crownR * 2.6);
    if (inside(px, py)) {
      const r = rng();
      rect(c, px, py, 2, 1, r < 0.5 ? p.dark : p.light);
    }
  }
  return { cx: x, cy, blobs };
}

/** Two-tone pine with stacked tiers. */
export function pine(c: Ctx, x: number, gy: number, h: number, a: string, b: string) {
  rect(c, x - 1, gy - 4, 2, 4, '#3b2a2a');
  const tiers = Math.max(3, Math.round(h / 8));
  const tierH = Math.round((h - 4) / tiers) + 3;
  for (let t = 0; t < tiers; t++) {
    const y0 = gy - 4 - h + 4 + t * Math.round((h - 4) / tiers);
    const bw = 5 + t * 3;
    for (let i = 0; i < tierH; i++) {
      const rowW = Math.max(1, Math.round((bw * (i + 1)) / tierH));
      const left = x - Math.floor(rowW / 2);
      const half = Math.ceil(rowW / 2);
      rect(c, left, y0 + i, half, 1, a);
      rect(c, left + half, y0 + i, rowW - half, 1, b);
    }
  }
}

/** Lumpy bush with optional flowers. */
export function bush(
  c: Ctx,
  rng: Rng,
  x: number,
  gy: number,
  w: number,
  h: number,
  flowers = true,
) {
  const r = Math.max(3, Math.round(h * 0.55));
  const n = Math.max(2, Math.round(w / (r * 1.3)));
  const discs: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    discs.push([x + Math.round((i / Math.max(1, n - 1)) * (w - r * 2)) + r, gy - r + 1 - Math.round(rng() * 2)]);
  }
  for (const [dx, dy] of discs) disc(c, dx + 1, dy + 1, r, '#14402f');
  for (const [dx, dy] of discs) disc(c, dx, dy, r, '#1f6a47');
  for (const [dx, dy] of discs) disc(c, dx - 1, dy - 1, Math.max(2, r - 2), '#2e9a5c');
  for (let i = 0; i < w * 1.5; i++) {
    const px = x + Math.floor(rng() * w);
    const py = gy - Math.floor(rng() * h);
    dot(c, px, py, rng() < 0.5 ? '#175a3d' : '#59c27a');
  }
  if (flowers) {
    const cols = ['#ff9fc4', '#ffffff', '#ffd470', '#b9a2ff', '#ff7a7a'];
    for (let i = 0; i < Math.round(w / 5); i++) {
      dot(c, x + Math.floor(rng() * w), gy - 1 - Math.floor(rng() * (h - 1)), cols[Math.floor(rng() * cols.length)]);
    }
  }
}

/** Paper lantern with a warm halo. */
export function lantern(c: Ctx, x: number, y: number, col = '#ff6b3d', haloR = 11) {
  glow(c, x + 2, y + 3, haloR, '#ffb347', 0.9);
  rect(c, x + 2, y - 3, 1, 3, '#3a2a2a');
  rect(c, x + 1, y, 3, 1, '#3b2a2a');
  rect(c, x, y + 1, 5, 5, col);
  rect(c, x + 1, y + 2, 3, 3, '#ffd470');
  dot(c, x + 2, y + 3, '#fff3c4');
  rect(c, x + 1, y + 6, 3, 1, '#3b2a2a');
}

/** Wooden barrel. */
export function barrel(c: Ctx, x: number, gy: number, w = 8, h = 9) {
  rect(c, x, gy - h, w, h, '#6b4535');
  rect(c, x + 1, gy - h - 1, w - 2, 1, '#8a5a43');
  rect(c, x, gy - h + 2, w, 1, '#2f2a44');
  rect(c, x, gy - 3, w, 1, '#2f2a44');
  rect(c, x + 1, gy - h + 1, 1, h - 2, '#8a5a43');
  rect(c, x + w - 2, gy - h + 1, 1, h - 2, '#4d3025');
}

export function crate(c: Ctx, x: number, gy: number, s = 7) {
  rect(c, x, gy - s, s, s, '#8a5a43');
  rect(c, x, gy - s, s, 1, '#a8704f');
  rect(c, x, gy - 1, s, 1, '#4d3025');
  rect(c, x, gy - s, 1, s, '#4d3025');
  rect(c, x + s - 1, gy - s, 1, s, '#4d3025');
  rect(c, x + 1, gy - s + 1, s - 2, 1, '#6b4535');
  rect(c, x + 1, gy - 2, s - 2, 1, '#6b4535');
}
