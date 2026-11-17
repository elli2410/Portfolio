import {
  K,
  alphaRect,
  art,
  disc,
  dither,
  dot,
  ellipse,
  frame,
  glow,
  glowRect,
  glyph,
  line,
  mix,
  mulberry32,
  plant,
  pool,
  rect,
  sag,
  shade,
  text,
  vine,
  type Ctx,
} from "./px";
import { BOX, BACK_FLOOR, ROOM_TOP, SHAFT, W, flights } from "./layout";

/* --------------------------------------------------------------- road slab */

export function drawSlab(c: Ctx) {
  const r = mulberry32(3);
  const w = SHAFT.x; // the shaft cuts through the slab on the right
  // street surface: sidewalk tiles under the shops
  rect(c, 0, 0, w, 7, "#34296a");
  rect(c, 0, 0, w, 1, "#7a68d0");
  rect(c, 0, 1, w, 1, "#4a3d9a");
  for (let x = 0; x < w; x += 14) rect(c, x, 2, 1, 5, "#241c52");
  rect(c, 0, 6, w, 1, "#1c1646");
  // wet reflections of neon on the pavement
  for (const [x, col, len] of [
    [60, K.red, 40],
    [112, K.amber, 40],
    [186, K.warm, 18],
    [250, K.mag, 50],
    [330, K.cyan, 24],
    [420, K.teal, 40],
    [470, K.amber, 28],
  ] as const) {
    dither(c, x - len / 2, 2, len, 3, col, 0.5, 0);
    rect(c, x - len / 4, 3, len / 2, 1, mix(col, "#000000", 0.2));
  }
  // concrete body of the slab
  rect(c, 0, 7, w, 24, "#1f1b4a");
  for (let i = 0; i < 160; i++) dot(c, r() * w, 8 + r() * 22, r() > 0.5 ? "#2a2560" : "#17143a");
  rect(c, 0, 18, w, 1, "#171436");
  rect(c, 0, 24, w, 1, "#171436");
  for (let x = 20; x < w; x += 46) {
    rect(c, x, 8, 2, 22, "#2e2866");
    dot(c, x, 10, "#4a3d9a");
    dot(c, x, 28, "#4a3d9a");
  }
  rect(c, 0, 30, w, 3, "#12102e");
  rect(c, 0, 30, w, 1, "#3d3590");

  // ceiling pipes of the room
  for (const [y, col, hi] of [
    [34, "#3d3a78", "#6a66b8"],
    [39, "#2f2d63", "#57539a"],
  ] as const) {
    rect(c, 0, y, w, 3, col);
    rect(c, 0, y, w, 1, hi);
    for (let x = 18; x < w; x += 54) {
      rect(c, x, y - 1, 3, 5, "#14113a");
      rect(c, x, y - 1, 3, 1, hi);
    }
  }
  // down-pipes
  for (const x of [186, 362]) {
    rect(c, x + 4, 36, 4, 30, "#2f2d63");
    rect(c, x + 4, 36, 1, 30, "#57539a");
  }
  // neon strip lights at the ends
  for (const [x, len] of [
    [18, 56],
    [440, 56],
  ] as const) {
    glowRect(c, x, 44, len, 3, K.mag, 6, 1);
    rect(c, x, 44, len, 3, K.pink);
    rect(c, x, 45, len, 1, "#ffe0f8");
    rect(c, x - 2, 43, 2, 5, "#14113a");
    rect(c, x + len, 43, 2, 5, "#14113a");
  }
  // hanging vines
  for (const [x, len] of [
    [8, 22],
    [40, 14],
    [150, 18],
    [210, 12],
    [272, 20],
    [330, 14],
    [388, 20],
    [470, 16],
    [500, 24],
  ] as const) {
    vine(c, x, 33, len, x, K.leaf);
    vine(c, x + 3, 33, Math.floor(len * 0.6), x + 5, K.leafL);
  }
  // warm hanging lamps
  for (const x of [110, 284, 440]) {
    rect(c, x, 33, 1, 8, "#14113a");
    rect(c, x - 5, 41, 11, 4, "#2e2a66");
    rect(c, x - 4, 45, 9, 2, K.warm);
    rect(c, x - 2, 45, 5, 1, "#ffffff");
    // light cone
    for (let j = 0; j < 40; j++) {
      const half = 4 + j * 0.7;
      c.save();
      c.globalAlpha = 0.07 * (1 - j / 46);
      c.fillStyle = K.amber;
      c.fillRect(Math.round(x - half), 47 + j, Math.round(half * 2), 1);
      c.restore();
    }
    glow(c, x, 48, 18, K.amber, 1);
  }
}

/* ------------------------------------------------------------- stair shaft */

export function drawShaft(c: Ctx) {
  const w = SHAFT.w;
  const h = BOX.shaft.h;
  const ox = SHAFT.x;
  const oy = 300;
  const r = mulberry32(8);
  // back wall of the shaft
  rect(c, 0, 0, w, h, "#120e2e");
  for (let y = 0; y < h; y += 4) {
    for (let x = (y / 4) % 2 ? 0 : 5; x < w; x += 10) {
      rect(c, x, y, 9, 3, shade("#171238", (r() - 0.5) * 0.18));
    }
  }
  // shadow near the street
  dither(c, 0, 0, w, 14, "#000000", 0.5, 0);
  // left wall of the shaft with a doorway at the bottom
  rect(c, 0, 0, 4, 164, "#241f55");
  rect(c, 0, 0, 1, 164, "#4a3d9a");
  rect(c, 0, 160, 8, 5, "#3a3290");
  glowRect(c, 2, 154, 4, 3, "#6bff8a", 3, 0.9);
  rect(c, 2, 154, 4, 3, "#6bff8a");
  // right wall
  rect(c, w - 2, 0, 2, h, "#241f55");

  // stairs
  const st = flights();
  for (const [x0, y0, x1, y1] of st) {
    const dir = x1 > x0 ? 1 : -1;
    const n = SHAFT.steps;
    const run = Math.abs(x1 - x0) / n;
    const rise = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      const sx = Math.round(x0 + dir * i * run) - ox;
      const sw = Math.ceil(run);
      const left = dir > 0 ? sx : sx - sw + 0;
      const top = Math.round(y0 + i * rise + 4) - oy;
      rect(c, left, top, sw, 9, "#2b2566");
      rect(c, left, top, sw, 1, "#7a68d0");
      rect(c, left + (dir > 0 ? sw - 1 : 0), top + 1, 1, 8, "#18143f");
      rect(c, left, top + 8, sw, 1, "#12102e");
    }
    // handrail along the path, offset up
    line(c, x0 - ox, y0 - oy - 15, x1 - ox, y1 - oy - 15, "#5a4ec0");
    line(c, x0 - ox, y0 - oy - 14, x1 - ox, y1 - oy - 14, "#2f2870");
    for (let i = 0; i <= n; i += 2) {
      const px = Math.round(x0 + dir * i * run) - ox;
      const py = Math.round(y0 + i * rise) - oy;
      rect(c, px, py - 15, 1, 15, "#2f2870");
    }
  }
  // landing lamps
  for (const y of [56, 112, 168]) {
    rect(c, 22, y + 16, 4, 2, "#2e2a66");
    rect(c, 22, y + 18, 4, 2, K.warm);
    glow(c, 24, y + 20, 14, K.amber, 0.9);
  }
  // pipe along the right wall
  rect(c, w - 6, 0, 3, h, "#2f2d63");
  rect(c, w - 6, 0, 1, h, "#57539a");
  // floor line at the bottom
  rect(c, 0, h - 8, w, 8, "#1a1446");
  rect(c, 0, h - 8, w, 1, "#3d3590");
  // sign: floor number
  rect(c, 30, 214, 12, 8, "#04203a");
  frame(c, 30, 214, 12, 8, K.cyan);
  text(c, 32, 216, "B1", K.ice);
}

/* -------------------------------------------------------------- room back */

export function drawRoomBack(c: Ctx) {
  const r = mulberry32(17);
  const h = BOX.roomBack.h;
  const fy = BACK_FLOOR - ROOM_TOP; // floor line, local

  // back wall: dark painted concrete with a faint panel grid
  rect(c, 0, 0, W, fy, "#171238");
  for (let y = 0; y < fy; y += 4) {
    for (let x = (y / 4) % 2 ? 0 : 6; x < W; x += 12) {
      if (r() > 0.4) rect(c, x, y, 11, 3, shade("#171238", (r() - 0.5) * 0.12));
    }
  }
  // top shade
  dither(c, 0, 0, W, 18, "#000000", 0.55, 0);
  dither(c, 0, 18, W, 12, "#000000", 0.3, 1);
  // baseboard
  rect(c, 0, fy - 6, W, 6, "#0e0a26");
  rect(c, 0, fy - 6, W, 1, "#2f2870");

  // pillars
  for (const x of [186, 362]) {
    rect(c, x, 0, 12, fy, "#2a2360");
    rect(c, x, 0, 2, fy, "#4a3d9a");
    rect(c, x + 10, 0, 2, fy, "#17123c");
    for (let y = 10; y < fy; y += 30) {
      rect(c, x - 2, y, 16, 4, "#352d78");
      rect(c, x - 2, y, 16, 1, "#5a4ec0");
      dot(c, x, y + 2, "#8a7ae0");
      dot(c, x + 11, y + 2, "#8a7ae0");
    }
    // cables running down
    line(c, x + 4, 0, x + 4, fy, "#0f0c2a");
    line(c, x + 7, 0, x + 7, fy - 20, "#3a2f80");
  }
  // side walls
  rect(c, 0, 0, 6, fy, "#0e0a26");
  rect(c, 6, 0, 1, fy, "#2f2870");
  // vent on the left wall + a pipe
  rect(c, 14, 20, 24, 22, "#2a2560");
  frame(c, 14, 20, 24, 22, "#4a3d9a");
  for (let j = 0; j < 5; j++) rect(c, 17, 24 + j * 3, 18, 1, "#0f0c2a");
  dot(c, 16, 22, "#8a7ae0");
  dot(c, 36, 40, "#8a7ae0");
  rect(c, 8, 0, 4, 120, "#2f2d63");
  rect(c, 8, 0, 1, 120, "#57539a");
  rect(c, 6, 118, 8, 3, "#3d3a78");
  // vent glow: a little warm air
  dither(c, 16, 44, 20, 8, "#7a68d0", 0.2, 0);

  // floor: perspective tiles
  rect(c, 0, fy, W, h - fy, "#1a1446");
  const rows = [7, 8, 9, 11, 13, 15, 18, 22];
  let y = fy;
  const vx = 280;
  rows.forEach((rh, i) => {
    const yy = y + rh;
    rect(c, 0, yy - 1, W, 1, i % 2 ? "#251d5e" : "#2c2468");
    const tw = 22 + i * 5;
    for (let k = -20; k < 20; k++) {
      const x = vx + k * tw;
      if (x > 0 && x < W) rect(c, x, y, 1, rh, "#120e34");
    }
    // slight tone steps
    if (i % 2 === 0) dither(c, 0, y, W, rh, "#2f2672", 0.25, i);
    y = yy;
  });
  // reflections of neon and lamps on the wet floor
  const refl: [number, string, number, number][] = [
    [110, K.amber, 28, 0.4],
    [284, K.amber, 28, 0.35],
    [440, K.amber, 28, 0.4],
    [300, K.cyan, 60, 0.28],
    [60, K.mag, 20, 0.28],
    [510, K.mag, 20, 0.28],
  ];
  for (const [x, col, wd, a] of refl) {
    for (let j = 0; j < h - fy; j += 2) {
      const f = 1 - j / (h - fy);
      alphaRect(c, x - wd / 2 + (r() - 0.5) * 3, fy + j, wd * (0.5 + f * 0.5), 1, col, a * f);
    }
  }
  // soft shadow where the wall meets the floor
  dither(c, 0, fy, W, 6, "#000000", 0.5, 0);
  void ROOM_TOP;
}

/* ---------------------------------------------------------------- the bed */

export function drawBed(c: Ctx) {
  // posters
  rect(c, 10, 6, 24, 28, "#240a3c");
  frame(c, 10, 6, 24, 28, "#7a4ab8");
  text(c, 12, 9, "MECHX", K.cyan);
  rect(c, 19, 17, 8, 6, "#d040c0");
  rect(c, 21, 15, 4, 2, "#d040c0");
  rect(c, 17, 19, 2, 8, K.cyan);
  rect(c, 27, 19, 2, 8, K.cyan);
  rect(c, 19, 23, 3, 8, "#8a2a90");
  rect(c, 24, 23, 3, 8, "#8a2a90");
  dot(c, 22, 18, "#ffffff");
  dot(c, 24, 18, "#ffffff");
  rect(c, 40, 10, 22, 24, "#e8d8c8");
  frame(c, 40, 10, 22, 24, "#8a6a58");
  rect(c, 47, 16, 8, 7, "#e0903a");
  rect(c, 47, 14, 2, 3, "#e0903a");
  rect(c, 53, 14, 2, 3, "#e0903a");
  dot(c, 49, 19, "#2a1a10");
  dot(c, 53, 19, "#2a1a10");
  text(c, 43, 27, "LOFI", "#6a3a28");
  rect(c, 68, 18, 12, 16, "#0a0820");
  frame(c, 68, 18, 12, 16, K.pink);
  text(c, 70, 22, "NEO", K.pink);
  rect(c, 70, 29, 8, 2, K.cyan);
  // pinned note
  rect(c, 84, 8, 7, 8, "#fff0c8");
  dot(c, 87, 8, K.red);
  glowRect(c, 68, 18, 12, 16, K.pink, 3, 0.4);

  // shelf with bottles and a tiny monitor
  rect(c, 92, 54, 38, 3, "#6a3a22");
  rect(c, 92, 54, 38, 1, "#a46a3c");
  rect(c, 96, 57, 2, 4, "#3a2018");
  rect(c, 124, 57, 2, 4, "#3a2018");
  for (const [x, col] of [
    [96, "#ff86e8"],
    [101, K.cyan],
    [106, K.amber],
  ] as const) {
    rect(c, x, 46, 3, 8, col);
    rect(c, x + 1, 43, 1, 3, shade(col, 0.3));
  }
  rect(c, 112, 40, 16, 14, "#4a4a6a");
  rect(c, 113, 41, 14, 10, "#0b2a1c");
  rect(c, 115, 43, 8, 1, "#6bff8a");
  rect(c, 115, 45, 5, 1, "#6bff8a");
  rect(c, 115, 47, 9, 1, "#2f8a4a");
  glow(c, 120, 46, 12, "#6bff8a", 0.5);

  // wall plant
  plant(c, 124, 70, 1, 4, "#7a3a8a");

  // bed: frame, mattress, quilt, pillow
  const by = 70;
  rect(c, 4, by + 14, 100, 6, "#6b3f2a");
  rect(c, 4, by + 14, 100, 1, "#a46a3c");
  rect(c, 6, by + 20, 4, 8, "#3b2018");
  rect(c, 98, by + 20, 4, 8, "#3b2018");
  rect(c, 98, by - 4, 8, 28, "#6b3f2a");
  rect(c, 98, by - 4, 8, 1, "#a46a3c");
  rect(c, 98, by - 4, 1, 28, "#a46a3c");
  rect(c, 8, by + 4, 92, 11, "#d8d0f0");
  // quilt
  rect(c, 8, by + 2, 74, 13, "#5b3fb0");
  rect(c, 8, by + 2, 74, 2, "#8a6ae0");
  for (let x = 14; x < 80; x += 12) rect(c, x, by + 4, 1, 11, "#4a3298");
  for (let x = 8; x < 82; x += 12) {
    dot(c, x + 6, by + 8, "#8a6ae0");
    dot(c, x + 12, by + 11, "#8a6ae0");
  }
  rect(c, 8, by + 13, 74, 2, "#3a2570");
  // pillow
  rect(c, 80, by - 2, 18, 9, "#c9c0f0");
  for (let x = 82; x < 98; x += 4) rect(c, x, by - 2, 2, 9, "#8a7ad0");
  rect(c, 80, by - 2, 18, 1, "#ffffff");
  // under-bed shadow and floor shadow
  dither(c, 6, by + 28, 98, 6, "#000000", 0.55, 0);
  // small cassette stack beside the bed
  rect(c, 112, by + 18, 14, 10, "#2a2560");
  rect(c, 114, by + 20, 10, 6, "#7a68d0");
  rect(c, 116, by + 22, 6, 2, "#14113a");
  glow(c, 40, by + 6, 40, K.vio, 0.35);
}

/* -------------------------------------------------------- window + skyline */

export function drawWindow(c: Ctx) {
  const w = BOX.window.w;
  const h = BOX.window.h;
  const r = mulberry32(23);
  // glass: deep violet to pink at the horizon
  for (let y = 0; y < h; y++) {
    rect(c, 0, y, w, 1, mix("#0e0830", "#6a2a9a", Math.pow(y / h, 1.5)));
  }
  // distant tall towers
  for (let x = 4; x < w; x += 6 + Math.floor(r() * 8)) {
    const bw = 8 + Math.floor(r() * 12);
    const top = 16 + Math.floor(r() * 36);
    rect(c, x, top, bw, h - top, "#241058");
    for (let wy = top + 3; wy < h - 4; wy += 4)
      for (let wx = x + 2; wx < x + bw - 1; wx += 3)
        if (r() > 0.78) dot(c, wx, wy, [K.pink, K.cyan, K.warm][Math.floor(r() * 3)]);
    x += bw - 6;
  }
  for (let x = 0; x < w; x += 10 + Math.floor(r() * 10)) {
    const bw = 12 + Math.floor(r() * 16);
    const top = 38 + Math.floor(r() * 26);
    rect(c, x, top, bw, h - top, "#120a34");
    for (let wy = top + 3; wy < h - 4; wy += 4)
      for (let wx = x + 2; wx < x + bw - 1; wx += 3)
        if (r() > 0.6) dot(c, wx, wy, [K.amber, K.warm, K.mag][Math.floor(r() * 3)]);
    x += bw - 8;
  }
  // neon signs across the street
  glowRect(c, 8, 22, 34, 8, K.cyan, 4, 0.9);
  rect(c, 8, 22, 34, 8, "#04203a");
  text(c, 11, 24, "TECHNO", K.cyan);
  glowRect(c, 78, 14, 28, 8, K.mag, 4, 0.9);
  rect(c, 78, 14, 28, 8, "#2a0838");
  glyph(c, 82, 15, "月", K.pink);
  text(c, 91, 16, "BAR", K.pink);
  glowRect(c, 56, 44, 7, 22, K.amber, 3, 0.8);
  rect(c, 56, 44, 7, 22, "#2a1404");
  glyph(c, 56, 46, "口", "#ffe3a8");
  // frame: thick mullions
  const f = "#0e0a26";
  rect(c, 0, 0, w, 3, f);
  rect(c, 0, h - 3, w, 3, f);
  rect(c, 0, 0, 3, h, f);
  rect(c, w - 3, 0, 3, h, f);
  rect(c, Math.floor(w / 3) - 1, 0, 3, h, f);
  rect(c, Math.floor((2 * w) / 3) - 1, 0, 3, h, f);
  rect(c, 0, Math.floor(h / 2) - 1, w, 3, f);
  frame(c, 0, 0, w, h, "#4a3d9a");
  rect(c, 1, 1, w - 2, 1, "#2f2870");
  // sill
  rect(c, -4, h, w + 8, 4, "#3d3590");
  rect(c, -4, h, w + 8, 1, "#7a68d0");
}

export function drawRain(c: Ctx, t: number) {
  const w = BOX.window.w;
  const h = BOX.window.h;
  c.clearRect(0, 0, w, h);
  const r = mulberry32(5);
  for (let i = 0; i < 70; i++) {
    const x0 = r() * w;
    const sp = 40 + r() * 50;
    const y = (t * sp + r() * h * 3) % (h + 12);
    const x = x0 - y * 0.18;
    const len = 3 + Math.floor(r() * 4);
    alphaRect(c, x, y, 1, len, "#cfd6ff", 0.55);
    if (r() > 0.7) alphaRect(c, x, y + len, 1, 1, "#ffffff", 0.7);
  }
  // drops running down the glass
  for (let i = 0; i < 9; i++) {
    const x = Math.floor(r() * w);
    const y = (t * 4 + r() * h) % h;
    alphaRect(c, x, y, 1, 2, "#e8ecff", 0.5);
  }
}

/* ------------------------------------------------------------ the PC desk */

function screen(c: Ctx, x: number, y: number, w: number, h: number, seed: number, theme: "code" | "chat" | "art") {
  const r = mulberry32(seed);
  rect(c, x, y, w, h, "#0a1230");
  frame(c, x, y, w, h, "#1c2a5a");
  rect(c, x + 1, y + 1, w - 2, 3, "#16204a");
  dot(c, x + 3, y + 2, K.red);
  dot(c, x + 5, y + 2, K.amber);
  dot(c, x + 7, y + 2, "#6bff8a");
  if (theme === "code") {
    rect(c, x + 1, y + 4, 8, h - 5, "#0f1a40");
    for (let j = 0; j < Math.floor((h - 8) / 3); j++) {
      const ind = r() > 0.6 ? 3 : 0;
      const len = 6 + Math.floor(r() * (w - 22));
      rect(c, x + 12 + ind, y + 6 + j * 3, len, 1, [K.cyan, K.pink, K.amber, "#6bff8a", K.lav][Math.floor(r() * 5)]);
      dot(c, x + 10, y + 6 + j * 3, "#3a4a8a");
    }
    for (let j = 0; j < 5; j++) rect(c, x + 2, y + 6 + j * 4, 5, 1, "#3a4a8a");
  } else if (theme === "chat") {
    for (let j = 0; j < 5; j++) {
      rect(c, x + 3, y + 6 + j * 7, 3, 3, [K.amber, K.red, "#6bff8a", K.cyan, K.pink][j]);
      rect(c, x + 8, y + 6 + j * 7, w - 12, 1, "#5a6aaa");
      rect(c, x + 8, y + 8 + j * 7, w - 16, 1, "#3a4a8a");
    }
  } else {
    rect(c, x + 3, y + 6, w - 6, h - 12, "#2a1060");
    disc(c, x + Math.floor(w / 2), y + Math.floor(h / 2) - 1, 4, K.pink);
    rect(c, x + 3, y + h - 5, w - 6, 2, K.cyan);
  }
  rect(c, x + 1, y + h - 3, w - 2, 1, "#16204a");
}

export function drawPcDesk(c: Ctx) {
  const dt = 58; // desk top (local y)
  // glow from the screens on the wall
  glow(c, 74, 34, 60, K.cyan, 0.55);
  // shelves with plants over the desk
  rect(c, 6, 14, 34, 3, "#6b3f2a");
  rect(c, 6, 14, 34, 1, "#a46a3c");
  plant(c, 16, 14, 1, 31, "#c9a24a");
  rect(c, 26, 6, 8, 8, "#b4503c");
  rect(c, 112, 20, 32, 3, "#6b3f2a");
  rect(c, 112, 20, 32, 1, "#a46a3c");
  rect(c, 116, 10, 10, 10, "#4a8a4a");
  rect(c, 116, 10, 10, 2, "#6bd08a");
  plant(c, 136, 20, 1, 33, "#b4503c");
  // hanging fairy light
  sag(c, 2, 2, 146, 4, 5, "#14113a");
  for (let x = 8; x < 144; x += 9) dot(c, x, 4 + Math.round(Math.sin((x / 146) * Math.PI) * 4), x % 18 ? K.warm : K.pink);

  // desk legs and drawers
  rect(c, 2, dt, 144, 6, "#7a4a2a");
  rect(c, 2, dt, 144, 1, "#b87a44");
  rect(c, 2, dt + 5, 144, 1, "#3b2018");
  rect(c, 4, dt + 6, 4, 42, "#5a3420");
  rect(c, 140, dt + 6, 4, 42, "#5a3420");
  rect(c, 6, dt + 24, 136, 3, "#5a3420");
  for (const x of [8, 120]) {
    rect(c, x, dt + 8, 20, 36, "#2a3a6e");
    for (let j = 0; j < 3; j++) {
      rect(c, x + 1, dt + 9 + j * 12, 18, 11, "#3a4e8a");
      rect(c, x + 7, dt + 14 + j * 12, 6, 1, "#9ab0e8");
    }
    rect(c, x, dt + 8, 20, 1, "#5a6ea8");
  }
  // tower PC under the desk, with a cyan strip
  rect(c, 98, dt + 8, 18, 34, "#1c2250");
  rect(c, 98, dt + 8, 1, 34, "#3a4a8a");
  rect(c, 100, dt + 12, 14, 2, K.cyan);
  rect(c, 100, dt + 18, 14, 1, "#3a4a8a");
  disc(c, 107, dt + 30, 5, "#0a0f2a");
  disc(c, 107, dt + 30, 3, "#1a2a6a");
  dot(c, 107, dt + 30, K.cyan);
  glow(c, 107, dt + 30, 14, K.cyan, 0.5);
  // cables
  for (let i = 0; i < 4; i++) sag(c, 34 + i * 4, dt + 6, 100 + i * 3, dt + 16, 8 + i * 2, i % 2 ? "#0a0820" : "#3a2f80");

  // monitors: portrait left, wide centre, small right
  rect(c, 22, dt - 2, 10, 2, "#2a2a4a");
  rect(c, 26, dt - 6, 2, 4, "#2a2a4a");
  screen(c, 14, 24, 26, 30, 5, "chat");
  rect(c, 62, dt - 2, 12, 2, "#2a2a4a");
  rect(c, 66, dt - 6, 4, 4, "#2a2a4a");
  screen(c, 38, 28, 60, 26, 8, "code");
  // frame highlight on the centre monitor
  rect(c, 38, 28, 60, 1, "#5a6ea8");
  glowRect(c, 38, 28, 60, 26, K.cyan, 5, 0.6);
  screen(c, 38, 28, 60, 26, 8, "code");
  rect(c, 38, 28, 60, 1, "#5a6ea8");
  // small tablet with art on the right
  rect(c, 104, dt - 14, 26, 14, "#1c2250");
  screen(c, 105, dt - 13, 24, 12, 11, "art");
  rect(c, 114, dt - 2, 6, 2, "#2a2a4a");
  // keyboard, mouse, mug, lamp
  rect(c, 50, dt - 2, 34, 2, "#9a9ac0");
  rect(c, 50, dt - 2, 34, 1, "#d8d8f0");
  for (let x = 52; x < 82; x += 3) dot(c, x, dt - 1, "#3a3a6a");
  rect(c, 88, dt - 2, 5, 2, "#d8d8f0");
  rect(c, 134, dt - 5, 5, 5, "#b83a4a");
  rect(c, 139, dt - 4, 2, 3, "#b83a4a");
  dot(c, 136, dt - 6, "#ffffff");
  // desk lamp (warm)
  rect(c, 6, dt - 2, 7, 2, "#2a2a4a");
  line(c, 9, dt - 2, 12, dt - 13, "#2a2a4a");
  rect(c, 10, dt - 16, 8, 4, K.amber);
  glow(c, 14, dt - 12, 22, K.amber, 0.9);
  // sticky notes on the wall by the window
  rect(c, 0, 36, 7, 8, "#fff0c8");
  rect(c, 3, 44, 7, 7, "#ffd98a");
  // chair: mesh back, seat, stem and star base
  rect(c, 56, 70, 36, 30, "#1c2250");
  frame(c, 56, 70, 36, 30, "#3a4a8a");
  for (let y = 74; y < 98; y += 4) rect(c, 58, y, 32, 1, "#0f1438");
  for (let x = 62; x < 90; x += 5) rect(c, x, 72, 1, 26, "#0f1438");
  rect(c, 54, 100, 40, 4, "#2a3260");
  rect(c, 72, 104, 4, 6, "#14183a");
  // figure from behind: just the head and shoulders over the chair
  disc(c, 74, 64, 6, "#1a3a4a");
  rect(c, 66, 68, 16, 10, "#d8d8e8");
  rect(c, 66, 68, 16, 1, "#ffffff");
  // soft floor shadow
  dither(c, 0, 104, 148, 4, "#000000", 0.5, 0);
  // toy robot on the desk, a nod to the house robot
  rect(c, 98, dt - 6, 6, 5, "#6a6a8e");
  dot(c, 100, dt - 4, K.cyan);
  dot(c, 102, dt - 4, K.cyan);
}

/* ------------------------------------------------------------- the cabinet */

export function drawCabinet(c: Ctx) {
  // pinned papers on the wall
  rect(c, 56, 8, 22, 28, "#e8e0d0");
  frame(c, 56, 8, 22, 28, "#a8a090");
  for (let j = 0; j < 6; j++) rect(c, 59, 12 + j * 4, 16 - (j % 3) * 3, 1, "#6a6a80");
  dot(c, 66, 8, K.red);
  rect(c, 82, 12, 9, 10, "#ffd98a");
  rect(c, 94, 16, 9, 10, "#ff86e8");
  rect(c, 84, 26, 9, 9, "#9ae8e0");
  rect(c, 104, 8, 20, 12, "#e8e0d0");
  rect(c, 106, 11, 16, 1, "#6a6a80");
  rect(c, 106, 14, 12, 1, "#6a6a80");

  // shelf with plants and books
  rect(c, 52, 50, 78, 3, "#6b3f2a");
  rect(c, 52, 50, 78, 1, "#a46a3c");
  plant(c, 62, 50, 1, 41, "#b4503c");
  plant(c, 118, 50, 1, 42, "#c9a24a");
  for (let i = 0; i < 5; i++) rect(c, 86 + i * 4, 42, 3, 8, ["#b83a4a", "#3a7ab8", "#e0a030", "#5a9a5a", "#8a5ac8"][i]);
  vine(c, 56, 53, 22, 7, K.leaf);
  vine(c, 124, 53, 16, 8, K.leafL);

  // tall file cabinet
  rect(c, 6, 14, 34, 98, "#3a4078");
  rect(c, 6, 14, 34, 2, "#6a72b8");
  rect(c, 6, 14, 2, 98, "#5a62a8");
  rect(c, 38, 14, 2, 98, "#222a58");
  for (let i = 0; i < 4; i++) {
    const y = 18 + i * 23;
    rect(c, 9, y, 28, 20, "#4a528e");
    rect(c, 9, y, 28, 1, "#8a92d0");
    rect(c, 9, y + 19, 28, 1, "#222a58");
    rect(c, 17, y + 8, 12, 3, "#c0c8f0");
    rect(c, 19, y + 3, 8, 3, "#e8e0d0");
  }
  // plants and clutter on top of the cabinet
  plant(c, 16, 14, 1, 51, "#7a3a8a");
  rect(c, 26, 4, 12, 10, "#c9a878");
  rect(c, 26, 4, 12, 1, "#e8d0a0");
  rect(c, 30, 8, 4, 1, "#7a5a38");

  // counter (the short arm of the L)
  rect(c, 40, 68, 90, 5, "#7a4a2a");
  rect(c, 40, 68, 90, 1, "#b87a44");
  rect(c, 40, 72, 90, 1, "#3b2018");
  rect(c, 42, 73, 4, 39, "#5a3420");
  rect(c, 124, 73, 4, 39, "#5a3420");
  rect(c, 84, 73, 40, 39, "#2a3a6e");
  for (let j = 0; j < 3; j++) {
    rect(c, 86, 75 + j * 12, 36, 10, "#3a4e8a");
    rect(c, 98, 79 + j * 12, 12, 1, "#9ab0e8");
  }
  rect(c, 84, 73, 40, 1, "#5a6ea8");
  // things on the counter
  plant(c, 52, 68, 1, 61, "#b4503c");
  plant(c, 70, 68, 1, 62, "#3a7a8a");
  rect(c, 88, 62, 14, 6, "#e8e0d0");
  rect(c, 90, 58, 12, 4, "#d0c8b8");
  rect(c, 104, 60, 6, 8, "#b83a4a");
  rect(c, 110, 62, 2, 4, "#b83a4a");
  rect(c, 114, 64, 12, 4, "#3a7ab8");
  rect(c, 114, 64, 12, 1, "#7ab0f0");
  rect(c, 116, 60, 8, 4, "#5a9a5a");
  // scattered papers
  for (const [x, y, w] of [
    [56, 66, 10],
    [100, 67, 8],
    [74, 67, 9],
  ] as const) {
    rect(c, x, y, w, 2, "#f4f0e8");
    rect(c, x + 1, y, w - 3, 1, "#c8c0b0");
  }
  // papers on the floor and a box
  for (const [x, y, w] of [
    [48, 110, 12],
    [104, 109, 9],
    [64, 111, 7],
  ] as const) {
    rect(c, x, y, w, 2, "#f4f0e8");
    dot(c, x + 2, y, "#c8c0b0");
  }
  rect(c, 44, 96, 20, 14, "#a47a4a");
  rect(c, 44, 96, 20, 2, "#c9a06a");
  rect(c, 52, 100, 4, 6, "#7a5a32");
  dither(c, 4, 108, 126, 4, "#000000", 0.5, 0);
  glow(c, 90, 40, 46, K.amber, 0.3);
}

/* -------------------------------------------------- table + radio phone */

const PHONE_PAL: Record<string, string> = {
  a: "#2f3a2c",
  b: "#4a5a42",
  c: "#6a7a52",
  d: "#7a6a3a",
  e: "#a89a52",
  l: "#c3cc98",
  m: "#8a9468",
  k: "#161a14",
  g: "#c8c8c0",
  r: "#ff5a3a",
  o: "#ffb347",
  w: "#ffffff",
  y: "#e8d04a",
};

const PHONE = [
  "..kk................",
  "..kk................",
  "..kk.....kkk....rr..",
  "..kk....kbbbk..kooo.",
  ".kbbbbbbbbbbbbbkkook",
  ".kbbcbbbddbbbbbbbkk.",
  ".kbkkkkkkkkkkkbbbbk.",
  ".kbklllllllllkbbbbk.",
  ".kbkllmlklmlmkbbdbk.",
  ".kbklmlllklllkbbbbk.",
  ".kbkllllklllmkbbcbk.",
  ".kbklmlmklmlmkbbbbk.",
  ".kbkllllllllkkbbbbk.",
  ".kbkkkkkkkkkkbbbbbk.",
  ".kbbbbbbbbbbbbbbddbk",
  ".kbwwbbkgggkgggkbbbk",
  ".kbwwwbkgkgkgkgkbbbk",
  ".kbbwwbkgggkgggkbbbk",
  ".kbbbbbkgkgkgkgkbbck",
  ".kbbbbbkgggkgggkbbbk",
  ".kbbddbbkkkkkkkbbbbk",
  "..kbbbbbbbbbbbbbbbk.",
  "...kkkkkkkkkkkkkkk..",
];

export function drawTable(c: Ctx, t: number) {
  c.clearRect(0, 0, BOX.table.w, BOX.table.h);
  const top = 38;
  // legs + shadow
  rect(c, 10, top + 6, 4, 46, "#3b2018");
  rect(c, 98, top + 6, 4, 46, "#3b2018");
  rect(c, 12, top + 28, 88, 2, "#3b2018");
  dither(c, 6, top + 50, 100, 4, "#000000", 0.55, 0);
  // top
  rect(c, 4, top, 104, 6, "#7a4a2a");
  rect(c, 4, top, 104, 1, "#c98a50");
  rect(c, 4, top + 5, 104, 1, "#3b2018");
  // lamp
  rect(c, 14, top - 4, 8, 4, "#6a6a9a");
  rect(c, 14, top - 4, 8, 1, "#9a9ac8");
  rect(c, 17, top - 22, 2, 18, "#8a8ab8");
  rect(c, 11, top - 30, 14, 9, K.amber);
  rect(c, 12, top - 30, 12, 3, K.cream);
  rect(c, 11, top - 22, 14, 1, "#c98a30");
  glow(c, 18, top - 24, 26, K.amber, 1.1);
  // cassettes and a notebook
  rect(c, 76, top - 3, 12, 3, "#2a3a6e");
  rect(c, 78, top - 6, 10, 3, "#b83a4a");
  rect(c, 92, top - 2, 10, 2, "#e8e0d0");
  // the radio phone: antenna, body, LCD, keypad
  art(c, PHONE, PHONE_PAL, 42, top - 23);
  // the LCD shows a pulse that blinks
  const on = Math.floor(t * 2) % 2;
  rect(c, 47, top - 15, 8, 2, "#2a3a1c");
  if (on) dot(c, 49, top - 14, "#c3cc98");
  rect(c, 47, top - 12, 3, 1, "#2a3a1c");
  glow(c, 52, top - 13, 12, "#a8e07a", 0.35);
  // timer chip blinks red
  if (Math.floor(t * 1.5) % 2) dot(c, 58, top - 21, K.red);
  pool(c, 56, top + 8, 40, 4, K.amber, 0.7);
}

/* ------------------------------------------------------------ sleeping dog */

export function drawDog(c: Ctx, t: number) {
  const w = BOX.dog.w;
  const h = BOX.dog.h;
  c.clearRect(0, 0, w, h);
  const br = Math.sin(t * 1.6) > 0 ? 1 : 0; // breathing
  // pet bed
  ellipse(c, 48, 38, 44, 8, "#0e0a26");
  ellipse(c, 48, 35, 44, 8, "#2a7a8a");
  ellipse(c, 48, 33, 44, 7, "#3aa0b0");
  ellipse(c, 48, 35, 36, 5, "#1c4f5c");
  rect(c, 14, 30, 68, 1, "#6ad0e0");
  // body
  ellipse(c, 50, 25 - br, 25, 10 + br, "#c9c4e8");
  ellipse(c, 50, 24 - br, 24, 9 + br, "#f2f0ff");
  ellipse(c, 54, 22 - br, 16, 6, "#ffffff");
  // curled back + haunch shade
  ellipse(c, 68, 28, 11, 6, "#d8d2f0");
  ellipse(c, 70, 29, 8, 4, "#bfb8e0");
  // tail wrapped round the front
  line(c, 74, 30, 62, 34, "#f2f0ff");
  line(c, 75, 31, 62, 35, "#d8d2f0");
  rect(c, 60, 33, 4, 2, "#ffffff");
  // head resting on its paws, on the left
  ellipse(c, 24, 28, 9, 7, "#f2f0ff");
  ellipse(c, 24, 29, 8, 5, "#ffffff");
  // ears
  ellipse(c, 19, 22, 3, 5, "#b9a98e");
  ellipse(c, 29, 21, 3, 5, "#a89878");
  // closed eyes, nose, paws
  rect(c, 20, 27, 3, 1, "#3a3560");
  rect(c, 26, 27, 3, 1, "#3a3560");
  rect(c, 15, 30, 3, 2, "#3a3560");
  rect(c, 16, 34, 8, 3, "#ffffff");
  rect(c, 26, 34, 8, 3, "#e8e4f8");
  line(c, 16, 37, 33, 37, "#bfb8e0");
  // zzz
  const z = (t * 0.9) % 3;
  const zz: [string, number][] = [
    ["Z", 0],
    ["Z", 1],
    ["Z", 2],
  ];
  for (const [ch, i] of zz) {
    const phase = (z + i) % 3;
    const a = 1 - phase / 3;
    c.save();
    c.globalAlpha = Math.max(0, a);
    text(c, 10 + phase * 5 + i, 12 - phase * 4, ch, K.ice, phase > 1.5 ? 1 : 1);
    c.restore();
  }
  pool(c, 48, 42, 46, 3, K.vio, 0.6);
}

/* --------------------------------------------------------------- robot */

/** The little four-legged patrol bot. `dir` is 1 when moving right. */
export function drawRobot(c: Ctx, t: number, dir: 1 | -1) {
  c.clearRect(0, 0, 22, 16);
  const step = Math.floor(t * 6) % 2;
  const body = "#5a5a72";
  const dark = "#2e2e44";
  const lite = "#8a8aa8";
  // legs: two pairs alternating
  const legs = [3, 7, 12, 16];
  legs.forEach((lx, i) => {
    const up = (i + step) % 2 === 0 ? 1 : 0;
    rect(c, lx, 10, 2, 3 - up, dark);
    rect(c, lx - 1, 13 - up, 4, 1 + up, body);
    rect(c, lx - 1, 14 - up, 4, 1, "#14142a");
  });
  // body
  rect(c, 2, 2, 18, 9, body);
  rect(c, 2, 2, 18, 1, lite);
  rect(c, 2, 10, 18, 1, dark);
  rect(c, 2, 2, 1, 9, lite);
  rect(c, 19, 2, 1, 9, dark);
  // face plate with cyan eyes on the side it's walking toward
  const fx = dir > 0 ? 11 : 3;
  rect(c, fx, 4, 8, 5, "#101428");
  rect(c, fx + 1, 5, 2, 3, K.cyan);
  rect(c, fx + 5, 5, 2, 3, K.cyan);
  glow(c, fx + 4, 6, 8, K.cyan, 0.7);
  // side panel with a vent
  const px = dir > 0 ? 4 : 13;
  for (let j = 0; j < 3; j++) rect(c, px, 4 + j * 2, 5, 1, dark);
  // antenna
  rect(c, dir > 0 ? 6 : 15, 0, 1, 2, lite);
  dot(c, dir > 0 ? 6 : 15, 0, Math.floor(t * 3) % 2 ? K.red : "#5a1020");
}

/* ------------------------------------------------------ front foliage */

export function drawRoomFront(c: Ctx) {
  const r = mulberry32(77);
  const h = BOX.roomFront.h;
  const fronds = (x: number, y: number, dir: 1 | -1, n: number, len: number) => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + dir * (0.15 + (i / n) * 1.4) + (r() - 0.5) * 0.2;
      const l = len * (0.55 + r() * 0.5);
      let px = x;
      let py = y;
      for (let k = 0; k < l; k++) {
        const aa = a + dir * (k / l) * 0.9;
        px += Math.cos(aa);
        py += Math.sin(aa) + k * 0.012;
        const wdt = Math.max(1, Math.round(3 * Math.sin((k / l) * Math.PI)));
        rect(c, px - Math.floor(wdt / 2), py, wdt, 1, k % 5 === 0 ? K.leafL : i % 2 ? K.leaf : K.leafD);
      }
    }
  };
  // left corner: crate and big plant
  rect(c, 0, h - 34, 30, 30, "#6b3f2a");
  rect(c, 0, h - 34, 30, 2, "#a46a3c");
  for (let x = 0; x < 30; x += 10) rect(c, x, h - 32, 1, 28, "#3b2018");
  rect(c, 0, h - 20, 30, 1, "#3b2018");
  rect(c, 4, h - 48, 22, 14, "#a47a4a");
  rect(c, 4, h - 48, 22, 2, "#c9a06a");
  rect(c, 12, h - 44, 6, 8, "#7a5a32");
  fronds(34, h - 6, -1, 10, 44);
  fronds(8, h - 4, 1, 8, 36);
  rect(c, 22, h - 14, 22, 14, "#2a1830");
  rect(c, 22, h - 14, 22, 2, "#4a3a58");
  // right corner: stone steps and plant
  for (let i = 0; i < 3; i++) {
    rect(c, 520 + i * 10, h - 12 - i * 10, 40 - i * 10, 10 + i * 10, "#2e2866");
    rect(c, 520 + i * 10, h - 12 - i * 10, 40 - i * 10, 1, "#5a4ec0");
  }
  fronds(516, h - 4, -1, 10, 44);
  fronds(540, h - 24, 1, 7, 26);
  rect(c, 504, h - 14, 20, 14, "#2a1830");
  rect(c, 504, h - 14, 20, 2, "#4a3a58");
  // foreground glints
  for (let i = 0; i < 14; i++) dot(c, r() * 50, h - 6 - r() * 40, K.leafL);
  for (let i = 0; i < 14; i++) dot(c, 510 + r() * 50, h - 6 - r() * 40, K.leafL);
}
