import { ditherRect, dot, line, mix, rect, shade, type Ctx, type Rng } from "./draw";

/** Fill a polygon, one pixel row at a time. */
export function poly(c: Ctx, pts: readonly (readonly [number, number])[], col: string) {
  c.fillStyle = col;
  let lo = Infinity;
  let hi = -Infinity;
  for (const p of pts) {
    lo = Math.min(lo, p[1]);
    hi = Math.max(hi, p[1]);
  }
  for (let y = Math.floor(lo); y <= Math.ceil(hi); y++) {
    const yy = y + 0.5;
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yy && by > yy) || (by <= yy && ay > yy)) xs.push(ax + ((yy - ay) * (bx - ax)) / (by - ay));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.round(xs[k]);
      c.fillRect(x0, y, Math.max(1, Math.round(xs[k + 1]) - x0), 1);
    }
  }
}

/** Pixel disc. */
export function discPx(c: Ctx, cx: number, cy: number, r: number, col: string) {
  c.fillStyle = col;
  for (let dy = -r; dy <= r; dy++) {
    const hw = Math.floor(Math.sqrt(r * r - dy * dy + 0.5));
    c.fillRect(Math.round(cx) - hw, Math.round(cy) + dy, hw * 2 + 1, 1);
  }
}

/**
 * Light that falls on what is already drawn and nowhere else: bands that get
 * weaker away from the source, with a dithered seam between them.
 * `axis` is the direction the light travels.
 */
export function spill(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string,
  alpha: number,
  axis: "down" | "up" | "left" | "right",
  steps = 8,
) {
  alpha *= 0.55;
  c.save();
  c.globalCompositeOperation = "source-atop";
  c.fillStyle = col;
  const horizontal = axis === "left" || axis === "right";
  const len = horizontal ? w : h;
  for (let i = 0; i < steps; i++) {
    const a = alpha * Math.pow(1 - i / steps, 1.6);
    const s0 = Math.round((len * i) / steps);
    const s1 = Math.round((len * (i + 1)) / steps);
    let bx = x;
    let by = y;
    let bw = w;
    let bh = h;
    if (axis === "down") {
      by = y + s0;
      bh = s1 - s0;
    } else if (axis === "up") {
      by = y + h - s1;
      bh = s1 - s0;
    } else if (axis === "right") {
      bx = x + s0;
      bw = s1 - s0;
    } else {
      bx = x + w - s1;
      bw = s1 - s0;
    }
    c.globalAlpha = a;
    c.fillRect(Math.round(bx), Math.round(by), Math.round(bw), Math.round(bh));
    if (i < steps - 1) {
      if (horizontal) ditherRect(c, axis === "right" ? bx + bw - 2 : bx, by, 2, bh, col, a * 0.8, i);
      else ditherRect(c, bx, axis === "down" ? by + bh - 2 : by, bw, 2, col, a * 0.8, i);
    }
  }
  c.restore();
}

/** Rust: streaks and crusty patches, heavier along the bottom and near seams. */
export function rust(c: Ctx, rng: Rng, x: number, y: number, w: number, h: number, amount: number) {
  const tones = ["#4a1a0c", "#6a2a10", "#8a3a14", "#2a0e08"];
  const n = Math.round((w * h) / 500 * amount);
  for (let i = 0; i < n; i++) {
    const px = x + Math.floor(rng() * w);
    const py = y + Math.floor(Math.pow(rng(), 0.7) * h);
    const pw = 1 + Math.floor(rng() * 5);
    const ph = 1 + Math.floor(rng() * 3);
    c.save();
    c.globalAlpha = 0.55 + rng() * 0.3;
    rect(c, px, py, pw, ph, tones[Math.floor(rng() * tones.length)]);
    c.restore();
    if (rng() < 0.4) {
      // a streak running down from the patch
      const len = 4 + Math.floor(rng() * 18);
      ditherRect(c, px, py + ph, 1, len, "#5a2410", 0.7, i);
    }
  }
}

/** Sheets of corrugated metal: ridges, seams, rivets, grime and rust. */
export function corrugated(c: Ctx, rng: Rng, x: number, y: number, w: number, h: number, base: string, rustAmt = 0.6) {
  const tones = [shade(base, 0.12), shade(base, 0.03), shade(base, -0.16), shade(base, -0.04)];
  for (let i = 0; i < w; i++) rect(c, x + i, y, 1, h, tones[i % 4]);
  // sheet seams with rivets
  const sheet = 34 + Math.floor(rng() * 14);
  for (let sy = y + sheet; sy < y + h - 4; sy += sheet) {
    rect(c, x, sy, w, 1, shade(base, -0.45));
    rect(c, x, sy + 1, w, 1, shade(base, 0.2));
    for (let rx = x + 3; rx < x + w - 2; rx += 9) {
      dot(c, rx, sy - 1, shade(base, 0.3));
      dot(c, rx, sy + 2, shade(base, -0.5));
    }
  }
  // grime from the top, soot toward the bottom
  for (let k = 0; k < w / 5; k++) {
    const len = 10 + Math.floor(rng() * 50);
    ditherRect(c, x + Math.floor(rng() * w), y + Math.floor(rng() * Math.max(1, h - len)), 1, len, shade(base, -0.5), 0.55, k);
  }
  ditherRect(c, x, y + h - 14, w, 14, "#000000", 0.4, 0);
  rust(c, rng, x, y, w, h, rustAmt);
}

/** Brick, with mortar, chipped corners and uneven colour. */
export function brick(c: Ctx, rng: Rng, x: number, y: number, w: number, h: number, base: string) {
  rect(c, x, y, w, h, shade(base, -0.45));
  for (let by = 0; by < h; by += 4) {
    const off = (by / 4) % 2 ? 4 : 0;
    for (let bx = -off; bx < w; bx += 8) {
      const x0 = Math.max(0, bx);
      const bw = Math.min(7, w - x0, bx + 7 - x0);
      if (bw <= 0) continue;
      rect(c, x + x0, y + by, bw, 3, shade(base, (rng() - 0.55) * 0.35));
      if (rng() < 0.18) rect(c, x + x0, y + by, bw, 1, shade(base, 0.2));
    }
  }
  for (let k = 0; k < w / 6; k++) {
    const len = 8 + Math.floor(rng() * 40);
    ditherRect(c, x + Math.floor(rng() * w), y + Math.floor(rng() * Math.max(1, h - len)), 1, len, "#000000", 0.5, k);
  }
}

/** A riveted steel plate with a bevel. */
export function plate(c: Ctx, rng: Rng, x: number, y: number, w: number, h: number, base: string) {
  rect(c, x, y, w, h, base);
  rect(c, x, y, w, 1, shade(base, 0.3));
  rect(c, x, y, 1, h, shade(base, 0.18));
  rect(c, x, y + h - 1, w, 1, shade(base, -0.5));
  rect(c, x + w - 1, y, 1, h, shade(base, -0.4));
  for (const [rx, ry] of [
    [x + 3, y + 3],
    [x + w - 4, y + 3],
    [x + 3, y + h - 4],
    [x + w - 4, y + h - 4],
  ]) {
    dot(c, rx, ry, shade(base, 0.35));
    dot(c, rx, ry + 1, shade(base, -0.5));
  }
  ditherRect(c, x + 2, y + 2, w - 4, h - 4, shade(base, -0.4), 0.2, 1);
  rust(c, rng, x, y, w, h, 0.35);
}

/** A round pipe, shaded across its width, with collars and joints. */
export function pipeV(c: Ctx, x: number, y0: number, y1: number, w: number, base: string, rng: Rng) {
  const h = y1 - y0;
  for (let i = 0; i < w; i++) {
    const t = i / (w - 1);
    const k = t < 0.2 ? -0.3 : t < 0.4 ? 0.22 : t < 0.7 ? 0 : -0.32;
    rect(c, x + i, y0, 1, h, shade(base, k));
  }
  for (let y = y0 + 10 + Math.floor(rng() * 20); y < y1 - 4; y += 34 + Math.floor(rng() * 30)) {
    rect(c, x - 1, y, w + 2, 3, shade(base, -0.15));
    rect(c, x - 1, y, w + 2, 1, shade(base, 0.3));
    rect(c, x - 1, y + 3, w + 2, 1, shade(base, -0.6));
  }
  ditherRect(c, x, y0, w, h, "#000000", 0.18, 0);
}

export function pipeH(c: Ctx, x0: number, x1: number, y: number, w: number, base: string) {
  for (let i = 0; i < w; i++) {
    const t = i / (w - 1);
    const k = t < 0.2 ? 0.25 : t < 0.5 ? 0.05 : t < 0.8 ? -0.18 : -0.4;
    rect(c, x0, y + i, x1 - x0, 1, shade(base, k));
  }
  for (let x = x0 + 12; x < x1 - 6; x += 44) {
    rect(c, x, y - 1, 3, w + 2, shade(base, -0.1));
    rect(c, x, y - 1, 1, w + 2, shade(base, 0.3));
  }
}

/** A thick power cable that sags, with a lit top edge. */
export function cable(c: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, rim: string, th = 2) {
  const n = Math.max(2, Math.ceil(Math.abs(x1 - x0)));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t + sag * 4 * t * (1 - t));
    rect(c, x, y, 1, th, "#020207");
    if (th > 1) dot(c, x, y, rim);
  }
}

/** A bundle of tangled cables hanging between two points, 3 to 5 strands. */
export function cableBundle(c: Ctx, rng: Rng, x0: number, y0: number, x1: number, y1: number, sag: number, rim: string) {
  const n = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < n; i++) {
    cable(c, x0 + Math.floor(rng() * 4), y0 + i * 2, x1 - Math.floor(rng() * 4), y1 + i * 2 + Math.floor(rng() * 3), sag + (rng() - 0.5) * sag * 0.5, rim, i % 2 ? 1 : 2);
  }
  // clamps along the bundle
  for (const t of [0.25, 0.6]) {
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t + sag * 4 * t * (1 - t));
    rect(c, x - 1, y - 1, 3, n * 2 + 2, "#0a0a14");
  }
}

/** A big air-conditioning unit with a fan grille, slats and a rust drip. */
export function acBig(c: Ctx, rng: Rng, x: number, y: number, w: number, h: number, light: string) {
  const body = "#16161f";
  rect(c, x, y, w, h, body);
  rect(c, x, y, w, 2, "#3a3a4c");
  rect(c, x, y, 1, h, "#2c2c3a");
  rect(c, x + w - 1, y, 1, h, "#08080e");
  rect(c, x, y + h - 2, w, 2, "#08080e");
  const r = Math.floor(Math.min(w, h) * 0.32);
  const cx = x + Math.floor(w * 0.36);
  const cy = y + Math.floor(h / 2);
  discPx(c, cx, cy, r + 1, "#05050a");
  discPx(c, cx, cy, r, "#1e1e2a");
  discPx(c, cx, cy, Math.round(r * 0.66), "#0a0a12");
  discPx(c, cx, cy, Math.round(r * 0.28), "#2a2a3a");
  for (let a = 0; a < 6; a++) {
    const rad = (a * Math.PI) / 3 + 0.4;
    line(c, cx, cy, cx + Math.cos(rad) * r, cy + Math.sin(rad) * r, "#2c2c3c");
  }
  // slats on the right
  for (let sy = y + 4; sy < y + h - 4; sy += 3) {
    rect(c, x + Math.floor(w * 0.68), sy, Math.floor(w * 0.26), 1, "#05050a");
    rect(c, x + Math.floor(w * 0.68), sy + 1, Math.floor(w * 0.26), 1, "#242432");
  }
  // brackets and a drip stain
  line(c, x + 3, y + h, x - 6, y + h + 12, "#0a0a12");
  line(c, x + w - 4, y + h, x + w + 5, y + h + 12, "#0a0a12");
  ditherRect(c, x + 4 + Math.floor(rng() * (w - 10)), y + h, 2, 10 + Math.floor(rng() * 20), "#5a2a14", 0.7, 0);
  dot(c, x + w - 4, y + 4, light);
  rust(c, rng, x, y, w, h, 0.5);
}

/** A slanted roof or awning seen from the side: a parallelogram with ridges and a lit lip. */
export function slantRoof(
  c: Ctx,
  rng: Rng,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thick: number,
  base: string,
  lip: string,
) {
  // top surface: from the high back edge to the low front edge
  poly(c, [[x0, y0], [x1, y0 + (y1 - y0) * 0.0], [x1, y1], [x0, y1]], base);
  const w = x1 - x0;
  for (let i = 0; i < w; i += 3) {
    rect(c, x0 + i, Math.min(y0, y1), 1, Math.abs(y1 - y0) + thick, i % 6 === 0 ? shade(base, 0.12) : shade(base, -0.1));
  }
  rect(c, x0, y1, w, thick, shade(base, -0.5));
  rect(c, x0, y1, w, 1, lip);
  ditherRect(c, x0, y1 + 1, w, 2, lip, 0.35, 0);
  rust(c, rng, x0, Math.min(y0, y1), w, Math.abs(y1 - y0) + thick, 0.5);
}

/** A dark window, lit or not, with a frame, sill and bars. */
export function slit(c: Ctx, rng: Rng, x: number, y: number, w: number, h: number, light: string | null) {
  rect(c, x - 1, y - 1, w + 2, h + 2, "#020207");
  if (light) {
    for (let i = 0; i < h; i++) rect(c, x, y + i, w, 1, mix(light, shade(light, -0.6), i / h));
    for (let bx = x + 2; bx < x + w; bx += 4) rect(c, bx, y, 1, h, "#020207");
    if (rng() < 0.4) {
      // a figure behind the blinds
      rect(c, x + Math.floor(w / 2) - 1, y + h - 8, 3, 8, "#06060c");
      rect(c, x + Math.floor(w / 2) - 1, y + h - 11, 3, 3, "#06060c");
    }
  } else {
    rect(c, x, y, w, h, "#05050c");
    rect(c, x, y, w, 1, "#14141e");
    if (rng() < 0.4) for (let by = y + 2; by < y + h; by += 3) rect(c, x, by, w, 1, "#0a0a14");
  }
  rect(c, x - 2, y + h + 1, w + 4, 2, "#1c1c28");
  rect(c, x - 2, y + h + 1, w + 4, 1, "#34344a");
}

export { mix, shade };
