import {
  K,
  ac,
  alphaDisc,
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
  lantern,
  line,
  mix,
  mulberry32,
  neonText,
  plant,
  plate,
  pool,
  rect,
  sag,
  shade,
  text,
  vine,
  type Ctx,
} from "./px";
import { BOX } from "./layout";

/* ------------------------------------------------------------ small parts */

/** A tiled roof with an upturned eave. */
function eave(c: Ctx, x0: number, x1: number, y: number, h: number, tile = "#232a63", lit = "#4a54b0") {
  rect(c, x0, y, x1 - x0, h, tile);
  rect(c, x0 + 2, y, x1 - x0 - 4, 1, lit);
  for (let x = x0 + 3; x < x1 - 2; x += 4) rect(c, x, y + 1, 1, h - 2, shade(tile, -0.3));
  rect(c, x0, y + h - 1, x1 - x0, 1, "#0b0c28");
  // upturned ends
  rect(c, x0 - 2, y - 1, 3, 2, tile);
  rect(c, x1 - 1, y - 1, 3, 2, tile);
  dot(c, x0 - 2, y - 2, lit);
  dot(c, x1 + 1, y - 2, lit);
  // shadow under the eave
  dither(c, x0 + 2, y + h, x1 - x0 - 4, 3, "#000000", 0.6, 0);
}

function shoji(c: Ctx, x: number, y: number, w: number, h: number, glowCol: string = K.amber, frameCol = "#3a2418") {
  rect(c, x, y, w, h, glowCol);
  rect(c, x + 1, y + 1, w - 2, 2, shade(glowCol, 0.35));
  for (let i = x + 4; i < x + w - 1; i += 4) rect(c, i, y, 1, h, frameCol);
  for (let j = y + 4; j < y + h - 1; j += 5) rect(c, x, j, w, 1, frameCol);
  frame(c, x, y, w, h, frameCol);
}

function bowl(c: Ctx, x: number, y: number, col: string) {
  // a 9x6 noodle bowl with steam
  rect(c, x + 1, y + 2, 7, 1, col);
  rect(c, x, y + 2, 9, 1, col);
  rect(c, x + 1, y + 3, 7, 1, col);
  rect(c, x + 2, y + 4, 5, 1, col);
  rect(c, x + 3, y + 5, 3, 1, col);
  dot(c, x + 2, y, col);
  dot(c, x + 4, y - 1, col);
  dot(c, x + 6, y, col);
  dot(c, x + 3, y + 1, col);
  dot(c, x + 5, y + 1, col);
}

/* ---------------------------------------------------------------- ramen */

export function drawRamen(c: Ctx) {
  const r = mulberry32(5);
  const wall = "#2b1628";
  const beam = "#4d2638";
  const W0 = BOX.ramen.w;
  const G = BOX.ramen.h; // ground line (local)

  // back silhouette: a rooftop of the next block
  rect(c, 0, 118, W0, G - 118, "#150f30");

  // top lantern tower
  rect(c, 60, 28, 48, 26, wall);
  rect(c, 60, 28, 48, 1, beam);
  rect(c, 66, 30, 3, 22, "#ff3b4f");
  rect(c, 99, 30, 3, 22, "#ff3b4f");
  glowRect(c, 66, 30, 36, 22, K.red, 5, 0.6);
  disc(c, 84, 42, 11, "#5a0c22");
  disc(c, 84, 42, 9, "#e8263e");
  disc(c, 83, 41, 8, "#ff4b5f");
  bowl(c, 80, 40, "#fff0f0");
  glow(c, 84, 42, 22, K.red, 1);
  // cap roof + finial
  eave(c, 52, 116, 22, 7, "#1d2250", "#4a54b0");
  rect(c, 62, 16, 44, 6, "#1d2250");
  rect(c, 66, 12, 36, 4, "#1d2250");
  rect(c, 66, 12, 36, 1, "#4a54b0");
  rect(c, 83, 4, 2, 9, "#14163a");
  dot(c, 83, 3, K.red);
  dot(c, 84, 3, K.red);
  glow(c, 84, 3, 6, K.red, 0.8);

  // second tower tier
  rect(c, 40, 54, 88, 24, wall);
  shoji(c, 48, 60, 14, 14, "#5a3a30");
  shoji(c, 66, 60, 14, 14, "#8a5a30");
  shoji(c, 88, 60, 14, 14, "#5a3a30");
  rect(c, 106, 60, 14, 14, "#1a1030");
  ac(c, 108, 62, 11, 9);
  rect(c, 40, 74, 88, 2, beam);
  // railing
  for (let x = 40; x < 128; x += 4) rect(c, x, 78, 1, 4, "#3a2038");
  rect(c, 40, 78, 88, 1, "#3a2038");
  eave(c, 30, 138, 78, 7);

  // first tier
  rect(c, 22, 90, 124, 28, wall);
  for (let i = 0; i < 4; i++) shoji(c, 30 + i * 22, 96, 16, 16, i % 2 ? "#9a6a30" : "#6a4430");
  rect(c, 22, 114, 124, 3, beam);
  for (let x = 22; x < 146; x += 4) rect(c, x, 117, 1, 4, "#3a2038");
  rect(c, 22, 117, 124, 1, "#3a2038");
  eave(c, 12, 156, 118, 8);

  // base: the shop
  rect(c, 8, 128, 152, G - 128, wall);
  for (let x = 8; x < 160; x += 6) rect(c, x, 128, 1, G - 128, "#33192f");
  rect(c, 8, 128, 152, 2, beam);
  // awning
  for (let x = 14; x < 98; x += 6) {
    rect(c, x, 140, 3, 12, "#256b73");
    rect(c, x + 3, 140, 3, 12, "#c9ba90");
  }
  rect(c, 14, 140, 84, 1, "#3da0ab");
  for (let x = 14; x < 98; x += 6) {
    dot(c, x + 1, 152, "#256b73");
    dot(c, x + 4, 152, "#c9ba90");
  }
  dither(c, 14, 153, 84, 3, "#000000", 0.55, 0);
  // lit window with the cook
  rect(c, 18, 156, 76, 18, "#ffd04a");
  rect(c, 18, 156, 76, 3, "#ffe38a");
  for (let x = 18; x < 94; x += 19) rect(c, x, 156, 1, 18, "#7a4a18");
  frame(c, 18, 156, 76, 18, "#5a3418");
  glow(c, 56, 166, 36, K.amber, 1);
  // cook
  disc(c, 56, 161, 3, "#241328");
  rect(c, 52, 164, 9, 10, "#241328");
  rect(c, 51, 158, 11, 2, "#e8e0d0");
  // steam
  for (let i = 0; i < 3; i++) {
    dot(c, 66 + i, 160 - i * 2, "#fff0c0");
    dot(c, 67 + i, 158 - i * 2, "#ffe9a8");
  }
  // counter + bowls + stools
  rect(c, 18, 170, 76, 4, "#4a2418");
  rect(c, 18, 170, 76, 1, "#8a4a2a");
  for (let x = 24; x < 90; x += 11) {
    rect(c, x, 168, 5, 2, "#e8e0d0");
    dot(c, x + 1, 167, K.red);
  }
  for (let x = 24; x < 90; x += 16) {
    rect(c, x, 174, 6, 2, "#2a1424");
    rect(c, x + 2, 176, 2, 0, "#2a1424");
  }

  // door with a faint bowl logo
  rect(c, 104, 142, 24, G - 142, "#13263a");
  frame(c, 104, 142, 24, G - 142, "#3a2038");
  disc(c, 116, 158, 7, "#1c3a52");
  disc(c, 116, 158, 6, "#13263a");
  bowl(c, 112, 156, "#3b94ad");
  rect(c, 105, 143, 22, 2, "#1c3a52");
  // lanterns either side
  lantern(c, 98, 140, K.red);
  lantern(c, 130, 140, K.red);

  // sandwich board
  rect(c, 136, 160, 14, 14, "#c9ba90");
  frame(c, 136, 160, 14, 14, "#5a4a38");
  glyph(c, 139, 163, "麺", "#d12a3c");
  line(c, 136, 174, 133, 176, "#3a2038");
  line(c, 149, 174, 152, 176, "#3a2038");

  // the big circular sign + pill
  rect(c, 52, 96, 62, 20, "#2a0a16");
  frame(c, 51, 95, 64, 22, K.red);
  glowRect(c, 51, 95, 64, 22, K.red, 7, 1);
  rect(c, 52, 96, 62, 20, "#2a0a16");
  frame(c, 51, 95, 64, 22, K.red);
  glyph(c, 66, 101, "麺", "#ffd0d6");
  text(c, 76, 104, "RAMEN", "#ffd0d6");
  glowRect(c, 22, 90, 30, 30, K.red, 6, 0.9);
  disc(c, 40, 106, 15, "#a3162f");
  disc(c, 40, 106, 14, "#e8263e");
  disc(c, 39, 105, 12, "#ff4b5f");
  frame(c, 25, 91, 30, 30, "#00000000");
  bowl(c, 35, 103, "#ffffff");
  rect(c, 34, 109, 12, 1, "#ffffff");

  // tall vertical banner
  glowRect(c, 130, 66, 14, 44, K.red, 6, 0.9);
  rect(c, 130, 66, 14, 44, "#e8263e");
  rect(c, 131, 67, 12, 42, "#ff4b5f");
  for (let y = 70; y < 104; y += 3) {
    rect(c, 132, y, 3, 1, "#a3162f");
    rect(c, 138, y + 1, 3, 1, "#a3162f");
  }
  bowl(c, 133, 100, "#ffffff");
  glyph(c, 133, 74, "大", "#ffe0e4");
  rect(c, 136, 62, 1, 4, "#14163a");

  // antenna & power poles
  line(c, 30, 56, 30, 80, "#1b1d44");
  line(c, 24, 62, 36, 62, "#1b1d44");
  line(c, 26, 68, 34, 68, "#1b1d44");
  line(c, 22, 66, 22, 90, "#1b1d44");
  rect(c, 148, 78, 2, 40, "#1b1d44");

  // red string lights
  sag(c, 16, 84, 52, 56, 6, "#2a1428");
  for (let x = 20; x < 52; x += 6) {
    const y = 84 + (56 - 84) * ((x - 16) / 36) + 6 * 4 * ((x - 16) / 36) * (1 - (x - 16) / 36);
    dot(c, x, y + 1, K.red);
    dot(c, x, y + 2, "#7a1020");
  }
  sag(c, 116, 56, 158, 98, 6, "#2a1428");
  for (let x = 120; x < 158; x += 6) {
    const t = (x - 116) / 42;
    dot(c, x, 56 + 42 * t + 6 * 4 * t * (1 - t) + 1, K.red);
  }
  lantern(c, 28, 82, K.red);
  lantern(c, 118, 60, K.red);
  lantern(c, 126, 60, K.red);

  // little blue vending machine at the left
  rect(c, 0, 150, 12, 26, "#1b2c5a");
  rect(c, 1, 152, 10, 14, "#0d1a3e");
  rect(c, 2, 153, 8, 10, "#2a6a9a");
  for (let j = 0; j < 4; j++) rect(c, 3, 154 + j * 3, 6, 2, j % 2 ? K.cyan : "#7fd0ff");
  rect(c, 3, 167, 6, 4, K.cyan);
  glow(c, 6, 160, 10, K.cyan, 0.6);

  // torii gate in front of the right edge
  rect(c, 152, 128, 3, G - 128, "#120a1c");
  rect(c, 167, 128, 3, G - 128, "#120a1c");
  rect(c, 152, 128, 1, G - 128, "#3a1a2a");
  rect(c, 167, 128, 1, G - 128, "#3a1a2a");
  rect(c, 148, 126, 26, 4, "#120a1c");
  rect(c, 147, 124, 3, 2, "#120a1c");
  rect(c, 172, 124, 3, 2, "#120a1c");
  rect(c, 148, 126, 26, 1, "#4a2038");
  rect(c, 152, 136, 18, 2, "#120a1c");
  dot(c, 160, 133, K.red);
  dot(c, 161, 133, K.red);

  // ivy over the awning edge
  for (let i = 0; i < 6; i++) vine(c, 100 + i * 2, 128, 8 + Math.floor(r() * 6), i + 3);
  // ground shadow
  rect(c, 0, G - 2, W0, 2, "#0a0618");
  pool(c, 60, G - 2, 50, 4, K.amber, 0.8);
}

/* ------------------------------------------------------- skills vendo */

/** The red wave-pattern vending machine. Its glass shows nine coloured slots. */
export function drawVendoSkills(c: Ctx) {
  const h = BOX.vendoSkills.h;
  glow(c, 17, 34, 28, K.red, 0.8);
  // side panel
  rect(c, 30, 8, 7, h - 12, "#4a1230");
  rect(c, 36, 8, 1, h - 12, "#2a0a1a");
  for (let y = 12; y < 46; y += 4) {
    for (let x = 31; x < 36; x += 4) {
      rect(c, x, y, 3, 1, "#d08aa0");
      rect(c, x + 1, y + 1, 1, 1, "#d08aa0");
    }
  }
  // flap + cup
  rect(c, 31, 44, 6, 5, "#0a0610");
  rect(c, 33, 46, 3, 3, "#f0e8e0");
  dot(c, 34, 47, K.red);
  // front body
  rect(c, 3, 6, 28, h - 12, "#c91836");
  rect(c, 4, 5, 26, 1, "#c91836");
  rect(c, 5, 4, 22, 1, "#c91836");
  rect(c, 3, 6, 1, h - 12, "#ff4560");
  rect(c, 30, 6, 1, h - 12, "#7a0f26");
  frame(c, 3, 6, 28, h - 12, "#6a0c20");
  // header logo
  glyph(c, 9, 8, "麺", "#ffe9e9");
  rect(c, 18, 9, 9, 1, "#ffe9e9");
  rect(c, 18, 12, 6, 1, "#ffe9e9");
  // glass with 3x3 slots
  rect(c, 6, 17, 22, 21, "#ff9a3c");
  rect(c, 7, 18, 20, 19, "#3a0614");
  const slot = ["#ffd23f", "#4c6fff", "#2bd9a8", "#e8c040", "#9ad8ff", "#8a4ad0", "#38e0d0", "#ff4b7a", "#5fe070"];
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      const sx = 8 + i * 6 + (i === 2 ? 0 : 0);
      const sy = 19 + j * 6;
      rect(c, sx, sy, 5, 5, slot[j * 3 + i]);
      rect(c, sx, sy, 5, 1, shade(slot[j * 3 + i], 0.35));
      rect(c, sx, sy + 4, 5, 1, shade(slot[j * 3 + i], -0.3));
    }
  }
  // glass glint
  line(c, 9, 19, 14, 24, "#ffe0d0");
  // price strip + dots
  rect(c, 8, 39, 14, 2, "#ffe9e9");
  for (let i = 0; i < 5; i++) dot(c, 8 + i * 3, 43, i === 1 ? "#ffe9e9" : "#7a0f26");
  // green display + coin slot
  rect(c, 6, 45, 8, 5, "#13321c");
  rect(c, 7, 46, 6, 3, "#6bff8a");
  rect(c, 8, 47, 4, 1, "#13321c");
  rect(c, 20, 45, 8, 3, "#1a0a12");
  rect(c, 22, 46, 4, 1, "#ffb347");
  // wave arcs on the bottom
  for (let i = 0; i < 4; i++) {
    for (let a = 0; a < 7; a++) {
      dot(c, 7 + i * 6 + a, 49 + Math.round(Math.sin((a / 6) * Math.PI) * -2) + 2, "#e89aa6");
    }
  }
  // base
  rect(c, 2, h - 6, 36, 6, "#241f4a");
  rect(c, 2, h - 6, 36, 1, "#43398c");
  rect(c, 8, h - 4, 22, 2, "#0f0c26");
  pool(c, 19, h - 1, 22, 3, K.red, 1);
}

/* ------------------------------------------------------------ main shop */

export function drawMainShop(c: Ctx) {
  const r = mulberry32(11);
  const wall = "#2e1f45";
  const wall2 = "#382652";
  const G = BOX.mainShop.h;

  // roof terrace + upper rooms
  // top room
  rect(c, 24, 40, 60, 20, wall);
  bricks2(c, 24, 40, 60, 20, wall, 3);
  rect(c, 22, 36, 64, 4, "#4a3a78");
  rect(c, 22, 36, 64, 1, "#6c5ab8");
  shoji2(c, 32, 44, 20, 12, K.warm);
  shoji2(c, 58, 44, 18, 12, K.amber);
  // floor 3 block
  rect(c, 16, 60, 98, 42, wall2);
  bricks2(c, 16, 60, 98, 42, wall2, 5);
  rect(c, 14, 58, 102, 3, "#4a3a78");
  rect(c, 14, 58, 102, 1, "#6c5ab8");
  // terrace on the right at floor-3 height
  rect(c, 114, 98, 62, 4, "#3a2f6a");
  rect(c, 114, 98, 62, 1, "#6c5ab8");
  for (let x = 116; x < 176; x += 6) rect(c, x, 88, 1, 10, "#4a3a78");
  rect(c, 114, 88, 62, 1, "#4a3a78");
  rect(c, 114, 93, 62, 1, "#322a62");
  // floor 2 block
  rect(c, 16, 102, 160, 46, wall);
  bricks2(c, 16, 102, 160, 46, wall, 9);
  rect(c, 14, 100, 164, 3, "#4a3a78");
  rect(c, 14, 100, 164, 1, "#6c5ab8");
  // ground floor
  rect(c, 10, 148, 170, G - 148, "#25173c");
  bricks2(c, 10, 148, 170, G - 148, "#25173c", 13);
  rect(c, 8, 146, 174, 3, "#4a3a78");
  rect(c, 8, 146, 174, 1, "#6c5ab8");

  // floor-3 windows (little rooms)
  room(c, 22, 66, 26, 24, K.amber, 1);
  room(c, 56, 66, 26, 24, K.warm, 2);
  // teal vertical sign
  glowRect(c, 94, 64, 9, 33, K.teal, 5, 0.8);
  rect(c, 94, 64, 9, 33, "#04201f");
  frame(c, 94, 64, 9, 33, K.teal);
  for (let i = 0; i < 4; i++) text(c, 97, 67 + i * 7, "CAFE"[i], "#b8fff0");
  rect(c, 98, 61, 1, 3, "#14113a");

  // floor-2 windows
  room(c, 24, 108, 30, 24, K.amber, 3);
  room(c, 62, 108, 30, 24, "#ff86e8", 4);
  room(c, 100, 108, 30, 24, K.warm, 5);
  room(c, 138, 108, 30, 24, K.amber, 6);
  // AC units and pipes
  ac(c, 142, 136, 13, 9);
  ac(c, 70, 76, 13, 9);
  rect(c, 176, 36, 3, G - 36, "#3a3a5e");
  rect(c, 176, 36, 1, G - 36, "#5a5a86");
  for (let y = 50; y < G; y += 34) rect(c, 175, y, 5, 2, "#5a5a86");
  rect(c, 118, 144, 58, 2, "#3a3a5e");

  // fire escape on the left
  const fe = "#241d55";
  for (let f = 0; f < 3; f++) {
    const y0 = 62 + f * 44;
    rect(c, 0, y0 + 40, 16, 2, fe);
    line(c, 2, y0 + 40, 14, y0 + 82 - 44, fe);
    for (let x = 0; x < 16; x += 3) rect(c, x, y0 + 32, 1, 8, "#18133e");
    rect(c, 0, y0 + 32, 16, 1, fe);
  }
  rect(c, 0, 104, 2, G - 104, "#18133e");

  // ground floor: shop window, awning, door
  rect(c, 22, 166, 86, 28, "#0c2a3a");
  rect(c, 23, 167, 84, 26, "#ffe6b0");
  rect(c, 23, 167, 84, 3, "#fff5d8");
  // shelves with goods
  for (let s = 0; s < 3; s++) {
    rect(c, 23, 174 + s * 7, 84, 1, "#8a5a30");
    for (let x = 26; x < 104; x += 5) {
      const col = ["#ff86e8", "#4ff3ff", "#ffb347", "#a56bff", "#5ed27a"][Math.floor(r() * 5)];
      rect(c, x, 171 + s * 7 - (x % 3), 3, 3 + (x % 3), col);
    }
  }
  for (let x = 23; x < 107; x += 28) rect(c, x, 167, 1, 26, "#4a3418");
  frame(c, 22, 166, 86, 28, "#4a3418");
  glow(c, 66, 182, 44, K.warm, 1);
  // awning
  for (let x = 18; x < 112; x += 8) {
    rect(c, x, 154, 4, 12, "#ffb347");
    rect(c, x + 4, 154, 4, 12, "#fff0c8");
  }
  rect(c, 18, 154, 94, 1, "#ffd98a");
  for (let x = 18; x < 112; x += 8) {
    rect(c, x, 166, 4, 1, "#ffb347");
    dot(c, x + 1, 167, "#ffb347");
    rect(c, x + 4, 166, 4, 1, "#fff0c8");
  }
  dither(c, 18, 168, 94, 3, "#000000", 0.5, 0);
  // door
  rect(c, 120, 158, 24, G - 158, "#1c0f38");
  rect(c, 122, 160, 20, G - 162, "#ff86e8");
  rect(c, 122, 160, 20, 3, "#ffc2f2");
  rect(c, 131, 160, 2, G - 162, "#8a2a80");
  frame(c, 120, 158, 24, G - 158, "#4a3a78");
  glowRect(c, 122, 160, 20, 34, K.mag, 6, 0.7);
  rect(c, 122, 160, 20, 34, "#ff86e8");
  rect(c, 131, 160, 2, 34, "#8a2a80");
  rect(c, 134, 170, 7, 5, "#2a0a2a");
  text(c, 135, 171, "ON", "#ffe9a8");
  // kiosk on the right
  rect(c, 150, 160, 22, G - 160, "#161036");
  rect(c, 152, 162, 18, 16, "#0c1a40");
  for (let j = 0; j < 4; j++) rect(c, 154, 164 + j * 3, 14, 2, j % 2 ? K.cyan : K.mag);
  rect(c, 152, 180, 18, 8, "#2a2058");
  for (let i = 0; i < 6; i++) rect(c, 154 + (i % 3) * 6, 182 + Math.floor(i / 3) * 3, 4, 2, ["#ff4b7a", "#ffd23f", "#4ff3ff"][i % 3]);
  glow(c, 160, 170, 16, K.cyan, 0.6);

  // the ABOUT ME neon sign (clickable)
  const sx = 42;
  const sy = 130;
  glowRect(c, sx, sy, 68, 16, K.mag, 8, 1.1);
  rect(c, sx, sy, 68, 16, "#2a0838");
  frame(c, sx, sy, 68, 16, K.mag);
  frame(c, sx + 2, sy + 2, 64, 12, "#7a1a8a");
  text(c, sx + 5, sy + 4, "ABOUT", "#ffd6f6", 1);
  text(c, sx + 30, sy + 4, "ME", "#ffe9a8", 1);
  glyph(c, sx + 49, sy + 4, "人", "#ffd6f6");
  dot(c, sx + 58, sy + 8, K.cyan);
  dot(c, sx + 60, sy + 8, K.cyan);
  dot(c, sx + 62, sy + 8, K.cyan);
  rect(c, sx + 8, sy + 16, 1, 3, "#14113a");
  rect(c, sx + 58, sy + 16, 1, 3, "#14113a");

  // second pink kanji sign on the left wall
  glowRect(c, 6, 100, 9, 36, K.mag, 5, 0.9);
  rect(c, 6, 100, 9, 36, "#2a0838");
  frame(c, 6, 100, 9, 36, K.pink);
  glyph(c, 7, 103, "天", K.rose);
  glyph(c, 7, 111, "水", K.pink);
  glyph(c, 7, 119, "口", K.rose);
  rect(c, 10, 96, 1, 4, "#14113a");

  // hanging planters with vines and pink flowers along the floor-2 sill
  for (const px of [26, 124, 152, 168]) {
    rect(c, px - 5, 130, 11, 5, "#7a3a2a");
    rect(c, px - 5, 130, 11, 1, "#b4503c");
    for (let i = 0; i < 6; i++) {
      dot(c, px - 5 + i * 2, 129, i % 2 ? K.leafL : K.leaf);
      dot(c, px - 5 + i * 2, 128, "#ff6fd0");
    }
    for (let k = 0; k < 3; k++) {
      const vx = px - 4 + k * 4;
      const len = 12 + Math.floor(r() * 18);
      vine(c, vx, 135, len, px + k, K.leaf);
      if (len > 18) dot(c, vx + 1, 135 + len, "#ff6fd0");
      dot(c, vx, 135 + Math.floor(len / 2), "#ff6fd0");
    }
  }

  // roof garden: shrubs spilling over the terrace and top room
  for (let i = 0; i < 26; i++) {
    const bx = 24 + r() * 58;
    const by = 30 + r() * 8;
    disc(c, bx, by, 3 + Math.floor(r() * 3), [K.leafD, K.leaf, K.leafL][Math.floor(r() * 3)]);
  }
  for (const [px, py, s] of [
    [120, 94, 2],
    [136, 94, 1],
    [168, 94, 2],
    [30, 36, 1],
    [78, 36, 1],
  ] as const) {
    plant(c, px, py, s, px + py);
  }
  // water tank + orange rooftop sign
  rect(c, 142, 62, 18, 26, "#3a3a5e");
  rect(c, 142, 62, 18, 2, "#5a5a86");
  for (let y = 66; y < 88; y += 4) rect(c, 142, y, 18, 1, "#25253f");
  rect(c, 144, 88, 2, 8, "#25253f");
  rect(c, 156, 88, 2, 8, "#25253f");
  glowRect(c, 118, 46, 44, 14, K.amber, 7, 1);
  rect(c, 118, 46, 44, 14, "#2a1404");
  frame(c, 118, 46, 44, 14, K.amber);
  glyph(c, 122, 49, "中", "#ffe3a8");
  glyph(c, 132, 49, "大", "#ffe3a8");
  glyph(c, 142, 49, "天", "#ffe3a8");
  glyph(c, 152, 49, "水", "#ffe3a8");
  rect(c, 124, 60, 2, 8, "#14113a");
  rect(c, 154, 60, 2, 8, "#14113a");
  // antenna
  line(c, 70, 36, 70, 18, "#3a3a5e");
  line(c, 64, 24, 76, 24, "#3a3a5e");
  line(c, 66, 20, 74, 20, "#3a3a5e");
  dot(c, 70, 17, K.red);

  // ground plants
  plant(c, 16, G, 2, 71, "#b4503c");
  plant(c, 112, G, 2, 72, "#7a3a8a");
  plant(c, 146, G, 1, 73);
  plant(c, 174, G, 2, 74, "#3a7a8a");
  // cables off the roofs
  sag(c, 14, 62, -6, 80, 3, "#1a1430");
  sag(c, 176, 40, 188, 60, 3, "#1a1430");
  rect(c, 0, G - 2, BOX.mainShop.w, 2, "#0a0618");
}

function bricks2(c: Ctx, x: number, y: number, w: number, h: number, base: string, seed: number) {
  const r = mulberry32(seed * 31);
  for (let j = 0; j < h; j += 4) {
    for (let i = 0; i < w; i += 7) {
      if (r() > 0.55) dot(c, x + i + (j % 8 ? 3 : 0), y + j + 1, shade(base, r() > 0.5 ? 0.1 : -0.15));
    }
  }
}

function shoji2(c: Ctx, x: number, y: number, w: number, h: number, col: string) {
  rect(c, x, y, w, h, col);
  rect(c, x, y, w, 2, shade(col, 0.4));
  rect(c, x + Math.floor(w / 2), y, 1, h, "#4a3418");
  frame(c, x, y, w, h, "#4a3418");
  glow(c, x + Math.floor(w / 2), y + Math.floor(h / 2), Math.floor(w * 0.9), col, 0.6);
}

/** A lit apartment window with a lamp, a shelf and a sleeper-shaped shadow. */
function room(c: Ctx, x: number, y: number, w: number, h: number, col: string, seed: number) {
  const r = mulberry32(seed * 17);
  glowRect(c, x, y, w, h, col, 4, 0.6);
  rect(c, x, y, w, h, shade(col, -0.25));
  rect(c, x + 1, y + 1, w - 2, h - 2, col);
  rect(c, x + 1, y + 1, w - 2, 3, shade(col, 0.35));
  // furniture silhouettes
  const k = r();
  const dark = shade(col, -0.62);
  if (k < 0.35) {
    rect(c, x + 3, y + h - 8, w - 8, 5, dark);
    rect(c, x + 3, y + h - 12, 5, 4, dark);
  } else if (k < 0.7) {
    rect(c, x + w - 9, y + 5, 6, h - 7, dark);
    disc(c, x + 6, y + h - 7, 3, dark);
    rect(c, x + 5, y + h - 4, 2, 3, dark);
  } else {
    rect(c, x + 3, y + 6, 8, 1, dark);
    rect(c, x + 3, y + 11, 8, 1, dark);
    rect(c, x + 3, y + 6, 1, 10, dark);
    rect(c, x + 12, y + h - 7, w - 16, 4, dark);
  }
  // lamp
  rect(c, x + Math.floor(w / 2), y + 3, 3, 2, "#fff6d8");
  // mullions
  rect(c, x + Math.floor(w / 2), y + 1, 1, h - 2, "#3a2418");
  frame(c, x, y, w, h, "#3a2418");
  rect(c, x - 1, y + h, w + 2, 2, "#4a3a78");
}

/* ------------------------------------------------------------------ tree */

const CANOPY = ["#0c3a2c", "#14604a", "#1f8a52", "#3fb85c", "#7fdb5e", "#c8f06a", "#f0f57a"];

export function drawTree(c: Ctx) {
  const r = mulberry32(33);
  const G = BOX.tree.h;
  const tx = 100; // trunk centre

  // far branches
  for (const [x0, y0, x1, y1] of [
    [tx, 130, 20, 84],
    [tx, 124, 170, 76],
    [tx - 4, 150, 36, 124],
    [tx + 4, 146, 160, 116],
  ] as const) {
    for (let o = -1; o <= 1; o++) line(c, x0 + o, y0, x1 + o, y1, o < 0 ? "#6a4a32" : "#2c1a12");
  }
  // trunk
  for (let y = 118; y < G; y++) {
    const t = (y - 118) / (G - 118);
    const half = 6 + t * 5 + (y > G - 14 ? (y - (G - 14)) * 0.9 : 0);
    const sway = Math.sin(y / 14) * 2.4;
    const x0 = Math.round(tx + sway - half);
    const x1 = Math.round(tx + sway + half);
    rect(c, x0, y, x1 - x0, 1, "#2e1b14");
    rect(c, x0, y, Math.max(2, Math.round(half * 0.7)), 1, "#5a3a28");
    rect(c, x0, y, 1, 1, "#8a5a3c");
    if ((y + Math.floor(x0)) % 5 === 0) dot(c, x0 + Math.round(half), y, "#1c100c");
    // moss
    if (r() > 0.7) dot(c, x0 + Math.floor(r() * (x1 - x0)), y, K.leaf);
  }
  // roots
  for (const side of [-1, 1]) {
    line(c, tx + side * 10, G - 6, tx + side * 20, G - 1, "#2e1b14");
    line(c, tx + side * 9, G - 6, tx + side * 18, G - 2, "#5a3a28");
  }
  // ivy running up the trunk
  for (let i = 0; i < 40; i++) {
    const y = 130 + r() * 120;
    dot(c, tx - 8 + Math.sin(y / 12) * 2 + r() * 14, y, [K.leafD, K.leaf, K.leafL][Math.floor(r() * 3)]);
  }

  // canopy mass: shape first (dark), then lighter blobs toward the upper left
  const blobs: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < 95; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const x = 96 + Math.cos(a) * 82 * d;
    const y = 74 + Math.sin(a) * 58 * d * (a > 0 ? 0.92 : 1);
    blobs.push({ x, y, r: 6 + Math.floor(r() * 9) });
  }
  blobs.forEach((b) => disc(c, b.x, b.y, b.r, CANOPY[0]));
  blobs.forEach((b) => disc(c, b.x - 1, b.y - 2, b.r - 2, CANOPY[1]));
  blobs.forEach((b) => {
    if (r() > 0.25) disc(c, b.x - 2, b.y - 3, Math.max(2, b.r - 4), CANOPY[2]);
  });
  blobs.forEach((b) => {
    const lit = (96 - b.x) * 0.35 + (74 - b.y) * 0.6;
    if (lit > -8 && r() > 0.3) disc(c, b.x - 3, b.y - 4, Math.max(2, b.r - 6), CANOPY[3]);
  });
  // leaf texture: many small leaf shapes, brighter on top-left
  for (let i = 0; i < 900; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const x = 96 + Math.cos(a) * 84 * d;
    const y = 74 + Math.sin(a) * 60 * d;
    const lit = (96 - x) * 0.012 + (74 - y) * 0.02 + r() * 0.6;
    const col = lit > 1.35 ? CANOPY[6] : lit > 1.05 ? CANOPY[5] : lit > 0.7 ? CANOPY[4] : lit > 0.4 ? CANOPY[3] : CANOPY[2];
    dot(c, x, y, col);
    if (r() > 0.6) dot(c, x + 1, y + 1, shade(col, -0.2));
  }
  // dark gaps so it reads as foliage and not a blob
  for (let i = 0; i < 110; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const gx = 96 + Math.cos(a) * 80 * d;
    const gy = 74 + Math.sin(a) * 56 * d;
    rect(c, gx, gy, 2 + Math.floor(r() * 3), 1 + Math.floor(r() * 2), r() > 0.4 ? CANOPY[0] : CANOPY[1]);
  }
  // pink/teal neon spill on the underside of the leaves
  for (let i = 0; i < 80; i++) {
    const x = 18 + r() * 160;
    const y = 96 + r() * 32;
    if (((x - 96) / 82) ** 2 + ((y - 74) / 58) ** 2 < 0.95) dot(c, x, y, r() > 0.5 ? "#2dd4bf" : "#ff6fd0");
  }
  glow(c, 120, 140, 40, K.teal, 0.4);
  glow(c, 40, 130, 26, K.mag, 0.4);

  // low branches with leaves in front
  for (let i = 0; i < 40; i++) {
    const x = 20 + r() * 150;
    const y = 112 + r() * 30;
    disc(c, x, y, 2 + Math.floor(r() * 2), r() > 0.5 ? CANOPY[1] : CANOPY[3]);
  }
  void alphaDisc;
  void alphaRect;
}

/** Vines and hanging leaves that sit in front of everything. */
export function drawTreeFront(c: Ctx) {
  const r = mulberry32(61);
  // three long vines
  for (const [x, len, s] of [
    [34, 92, 1],
    [96, 118, 2],
    [152, 100, 3],
  ] as const) {
    let px = x;
    for (let i = 0; i < len; i++) {
      if (i % 6 === 0) px += r() > 0.5 ? 1 : -1;
      dot(c, px, 110 + i, "#0f4a2a");
      dot(c, px + 1, 110 + i, "#1c7a45");
      if (i % 3 === 0) {
        const side = i % 6 === 0 ? -1 : 1;
        disc(c, px + side * 2, 110 + i, 1, K.leaf);
        dot(c, px + side * 3, 110 + i + 1, K.leafL);
        if (r() > 0.6) dot(c, px + side * 2, 110 + i - 1, K.lime);
      }
    }
    // bud at the tip
    disc(c, px, 110 + len, 2, K.leafL);
    dot(c, px, 110 + len, "#ff6fd0");
    void s;
  }
  // smaller trailing strands
  for (let i = 0; i < 9; i++) {
    const x = 24 + r() * 150;
    vine(c, x, 118, 8 + Math.floor(r() * 16), i + 20, K.leaf);
  }
}

/* -------------------------------------------------- animated vending machines */

const FISH = [
  { body: "#ff8a2a", fin: "#ffd23f", sp: 0.55, amp: 8, y: 7, ph: 0, len: 8 },
  { body: "#ffd23f", fin: "#ff8a2a", sp: 0.8, amp: 7, y: 15, ph: 2.1, len: 7 },
  { body: "#ff4b5f", fin: "#ffffff", sp: 0.42, amp: 6, y: 22, ph: 4.0, len: 9 },
];

/** The cyan aquarium machine. `t` is seconds. */
export function drawAquarium(c: Ctx, t: number) {
  c.clearRect(0, 0, 48, 60);
  glow(c, 24, 30, 30, K.teal, 0.7);
  // body
  rect(c, 2, 12, 44, 46, "#0d3b3c");
  rect(c, 2, 12, 44, 1, "#2a8a86");
  rect(c, 2, 12, 1, 46, "#1b6a66");
  rect(c, 45, 12, 1, 46, "#062222");
  // top sign with a fish
  glowRect(c, 6, 1, 36, 10, K.cyan, 4, 0.8);
  rect(c, 6, 1, 36, 10, "#052a38");
  frame(c, 6, 1, 36, 10, K.cyan);
  rect(c, 10, 4, 3, 4, K.cyan);
  rect(c, 14, 4, 3, 4, K.cyan);
  ellipse(c, 28, 6, 8, 3, "#3be0b0");
  rect(c, 34, 4, 5, 5, "#3be0b0");
  dot(c, 24, 5, "#052a38");
  // tank
  rect(c, 4, 15, 26, 31, "#9ae8e0");
  for (let y = 0; y < 29; y++) {
    rect(c, 5, 16 + y, 24, 1, mix("#1a7a82", "#052a38", y / 28));
  }
  // light shafts
  for (let i = 0; i < 4; i++) dither(c, 8 + i * 6, 16, 3, 22, "#bff7ee", 0.25, i);
  // seaweed
  for (let i = 0; i < 4; i++) {
    const bx = 7 + i * 6;
    for (let y = 0; y < 9 + (i % 2) * 3; y++) {
      dot(c, bx + Math.round(Math.sin(t * 1.4 + i + y * 0.5)), 44 - y, i % 2 ? "#2fa84c" : "#7fdb5e");
    }
  }
  // fish
  for (const f of FISH) {
    const ph = t * f.sp + f.ph;
    const fx = 17 + Math.sin(ph) * f.amp;
    const dir = Math.cos(ph) >= 0 ? 1 : -1;
    const fy = 16 + f.y + Math.sin(t * 1.3 + f.ph) * 1.5;
    for (let i = 0; i < f.len - 2; i++) {
      rect(c, fx - dir * i, fy + (i < 2 || i > f.len - 4 ? 1 : 0), 1, i < 2 || i > f.len - 4 ? 2 : 3, f.body);
    }
    rect(c, fx - dir * (f.len - 2), fy - 1, 1, 4, f.fin);
    rect(c, fx - dir * (f.len - 1), fy - 1, 1, 1, f.fin);
    rect(c, fx - dir * (f.len - 1), fy + 2, 1, 1, f.fin);
    dot(c, fx + dir, fy + 1, "#05202a");
    dot(c, fx - dir * 3, fy, shade(f.body, 0.35));
  }
  // bubbles
  for (let i = 0; i < 4; i++) {
    const by = 44 - ((t * 7 + i * 9) % 28);
    dot(c, 8 + i * 6 + Math.round(Math.sin(t * 2 + i)), by, "#d6fffa");
  }
  frame(c, 4, 15, 26, 31, "#2a8a86");
  // menu panel
  rect(c, 32, 14, 13, 33, "#0f7a5a");
  rect(c, 32, 14, 13, 1, "#6bffc8");
  frame(c, 32, 14, 13, 33, "#064a38");
  disc(c, 38, 21, 5, "#052a24");
  rect(c, 35, 20, 7, 2, "#6bffc8");
  dot(c, 34, 21, "#6bffc8");
  dot(c, 42, 19, "#6bffc8");
  dot(c, 42, 23, "#6bffc8");
  for (let i = 0; i < 3; i++) {
    rect(c, 34, 29 + i * 6, 6, 3, "#052a24");
    rect(c, 35, 30 + i * 6, 4, 1, "#6bffc8");
    disc(c, 42, 30 + i * 6, 1, "#ffd23f");
  }
  // control base
  rect(c, 4, 47, 40, 10, "#06201f");
  rect(c, 6, 49, 14, 6, "#1a0810");
  rect(c, 7, 50, 12, 1, "#ff4b5f");
  rect(c, 24, 49, 5, 6, "#ffd23f");
  rect(c, 26, 51, 1, 2, "#7a5a10");
  disc(c, 36, 52, 3, "#1a0810");
  dot(c, 36, 52, K.red);
  rect(c, 0, 58, 48, 2, "#031414");
  pool(c, 24, 58, 28, 3, K.teal, 1);
}

/** The orange machine, with turning gears and a pumping piston. */
export function drawOrange(c: Ctx, t: number) {
  c.clearRect(0, 0, 38, 56);
  const o = "#e0731f";
  // antennae
  line(c, 8, 8, 8, 0, "#3a3a5e");
  line(c, 28, 8, 29, 1, "#3a3a5e");
  dot(c, 8, 0, K.red);
  // top plates
  rect(c, 8, 4, 22, 3, "#a8501a");
  rect(c, 6, 7, 26, 3, "#c46a20");
  rect(c, 6, 7, 26, 1, "#f59a3c");
  // body
  rect(c, 4, 10, 30, 44, o);
  rect(c, 4, 10, 3, 44, "#f59a3c");
  rect(c, 29, 10, 5, 44, "#a8501a");
  rect(c, 33, 10, 1, 44, "#6a3010");
  rect(c, 4, 10, 30, 1, "#ffb25c");
  for (let y = 14; y < 52; y += 6) rect(c, 7, y, 22, 1, "#c46a20");
  // porthole with a spinning gear
  disc(c, 14, 22, 10, "#8a3a10");
  disc(c, 14, 22, 9, "#f59a3c");
  disc(c, 14, 22, 8, "#13202e");
  const a = t * 2.4;
  for (let i = 0; i < 6; i++) {
    const ang = a + (i * Math.PI) / 3;
    line(c, 14, 22, 14 + Math.cos(ang) * 6, 22 + Math.sin(ang) * 6, "#6b8ab0");
    dot(c, 14 + Math.cos(ang) * 6.5, 22 + Math.sin(ang) * 6.5, "#9ac0e8");
  }
  disc(c, 14, 22, 2, "#9ac0e8");
  dot(c, 14, 22, "#13202e");
  // small second gear turning the other way
  const b = -t * 3.2;
  for (let i = 0; i < 4; i++) {
    const ang = b + (i * Math.PI) / 2;
    dot(c, 21 + Math.cos(ang) * 2.5, 28 + Math.sin(ang) * 2.5, "#9ac0e8");
  }
  // control panel
  rect(c, 22, 14, 10, 24, "#2a2a42");
  frame(c, 22, 14, 10, 24, "#13132a");
  rect(c, 24, 16, 6, 4, "#0a0a18");
  dot(c, 25, 17, "#6bff8a");
  dot(c, 27, 17, Math.floor(t * 3) % 2 ? "#6bff8a" : "#1c4a28");
  dot(c, 29, 17, "#6bff8a");
  rect(c, 24, 22, 2, 2, K.red);
  rect(c, 28, 22, 2, 2, Math.floor(t * 2) % 2 ? K.amber : "#6a4a10");
  for (let j = 0; j < 4; j++) rect(c, 25, 26 + j * 3, 5, 2, "#d8d8e8");
  // paper label + slot
  rect(c, 8, 34, 9, 7, "#fff0c8");
  for (let j = 0; j < 3; j++) rect(c, 9, 35 + j * 2, 7, 1, "#c9a878");
  rect(c, 8, 44, 14, 4, "#0e0a16");
  // piston on the side: pumps up and down
  const p = Math.round(Math.sin(t * 3) * 2 + 2);
  rect(c, 34, 16, 3, 22, "#3a3a5e");
  rect(c, 34, 16 + p, 3, 6, "#9a9ac0");
  rect(c, 35, 38, 2, 2, "#5a5a86");
  // stickers
  const st = ["#ff4b7a", "#4ff3ff", "#ffd23f", "#a56bff", "#5ed27a", "#ffffff", "#ff86e8"];
  for (let i = 0; i < 16; i++) {
    const sx = 5 + ((i * 7) % 28);
    const sy = 44 + ((i * 5) % 9);
    rect(c, sx, sy, 3, 3, st[i % st.length]);
  }
  rect(c, 2, 54, 34, 2, "#2a1408");
  pool(c, 19, 55, 20, 3, K.amber, 0.8);
}

/* ------------------------------------------------------------- stair head */

export function drawShaftHead(c: Ctx) {
  const w = BOX.shaftHead.w;
  const h = BOX.shaftHead.h;
  // posts + roof
  rect(c, 6, 22, 3, h - 22, "#1c1848");
  rect(c, 6, 22, 1, h - 22, "#3d3590");
  rect(c, w - 8, 22, 3, h - 22, "#1c1848");
  rect(c, 2, 16, w - 2, 6, "#2e2a66");
  rect(c, 2, 16, w - 2, 1, "#6c5ab8");
  dither(c, 4, 22, w - 6, 3, "#000000", 0.55, 0);
  // sign
  glowRect(c, 10, 2, 34, 12, K.cyan, 6, 1);
  rect(c, 10, 2, 34, 12, "#04203a");
  frame(c, 10, 2, 34, 12, K.cyan);
  text(c, 13, 5, "B1", "#c8fcff", 1);
  // down arrow
  rect(c, 26, 4, 3, 5, K.warm);
  line(c, 23, 8, 27, 12, K.warm);
  line(c, 32, 8, 28, 12, K.warm);
  text(c, 34, 5, "DN", "#c8fcff", 1);
  // railing at the opening
  rect(c, 8, h - 14, 38, 1, "#3d3590");
  for (let x = 10; x < 46; x += 5) rect(c, x, h - 14, 1, 14, "#241f55");
  // a lamp under the roof
  glow(c, 28, 28, 14, K.warm, 0.8);
  rect(c, 26, 25, 4, 3, K.cream);
}

/** the street lamps standing between zones */
export function drawLamp(c: Ctx, h = 70) {
  const w = 20;
  rect(c, 9, 10, 2, h - 10, "#1c1848");
  rect(c, 9, 10, 1, h - 10, "#3d3590");
  rect(c, 3, 8, 14, 3, "#2e2a66");
  rect(c, 5, 11, 10, 2, K.warm);
  glow(c, 10, 14, 18, K.warm, 1.1);
  rect(c, 6, h - 3, 8, 3, "#241f55");
  pool(c, 10, h - 1, 16, 3, K.warm, 1);
  void w;
  void art;
  void neonText;
  void plate;
}
