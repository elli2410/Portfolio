import { buildSky, buildSkyline, buildViaduct, drawTrain, TRAIN_LEN } from "./skyline";
import { buildForeground, buildTower, ANCHORS, GROUND } from "./tower";
import { dot, fogBands, glow, hash01, mix, rect, type Ctx } from "./draw";
import { NEON } from "./palette";
import { createFront, type Front } from "./front";
import { CAM, makeLayer, type CanvasFactory, type Layer } from "./types";

export { CAM, GROUND };
export type { CanvasFactory };

export interface WorldFrame {
  /** seconds */
  t: number;
  /** camera height in art pixels, 0 (rooftops) .. CAM (street) */
  cam: number;
}

export interface World {
  /** size in art pixels */
  W: number;
  H: number;
  /** camera heights at which each section of the page is centred */
  anchors: { work: number; skills: number; about: number; contact: number };
  /** screen y of the top of the sidewalk once the camera has reached the street */
  streetY: number;
  /** the elevator and the runner, drawn on their own transparent canvas in front of the page */
  front: Front;
  render(ctx: Ctx, f: WorldFrame): void;
}

const wrap = (v: number, m: number) => ((v % m) + m) % m;

function makeHalo(make: CanvasFactory, r: number, col: string): Layer {
  const L = makeLayer(make, r * 2 + 1, r * 2 + 1);
  glow(L.ctx, r, r, r, col, 1.25);
  return L;
}

export function createWorld(W: number, H: number, make: CanvasFactory): World {
  const sky = buildSky(make, W, H);

  /* ---- three skylines, each a little nearer and a little faster -------- */
  const F_FAR = 0.1;
  const F_MID = 0.24;
  const F_RAIL = 0.42;
  const layerH = (f: number) => H + Math.ceil(CAM * f) + 2;

  const far = buildSkyline(make, W, layerH(F_FAR), {
    baseY: Math.round(H * 0.5),
    minH: Math.round(H * 0.04),
    maxH: Math.round(H * 0.34),
    wMin: 10,
    wMax: 26,
    body: "#060818",
    rim: "#1a2a70",
    haze: "#0a1030",
    hazeMax: 0.5,
    seed: 11,
    winP: 0.025,
    winCols: ["#b58cff", "#7ab0ff", "#38f0ff"],
    neonP: 0.2,
    antennaP: 0.35,
    panelP: 0,
  });
  const mid = buildSkyline(make, W, layerH(F_MID), {
    baseY: Math.round(H * 0.6),
    minH: Math.round(H * 0.05),
    maxH: Math.round(H * 0.4),
    wMin: 14,
    wMax: 34,
    body: "#07091a",
    rim: "#14507a",
    haze: "#0a1634",
    hazeMax: 0.36,
    seed: 23,
    winP: 0.03,
    winCols: ["#ffd36a", "#ff58d8", "#38f0ff", "#b58cff"],
    neonP: 0.12,
    antennaP: 0.45,
    panelP: 0,
    signP: 0,
    gapP: 0.22,
  });
  const rail = buildSkyline(make, W, layerH(F_RAIL), {
    baseY: Math.round(H * 0.7),
    minH: Math.round(H * 0.06),
    maxH: Math.round(H * 0.46),
    wMin: 18,
    wMax: 46,
    body: "#08060f",
    rim: "#6a1a4a",
    haze: "#1a0a22",
    hazeMax: 0.22,
    seed: 37,
    winP: 0.035,
    winCols: ["#ffd36a", "#ffb347", "#ff58d8", "#38f0ff", "#e9e4ff"],
    neonP: 0.18,
    antennaP: 0.5,
    panelP: 0,
    signP: 0,
    gapP: 0.32,
  });
  // an elevated rail crossing the canyon, in view between the work and about sections
  const deckY = Math.round(ANCHORS.skills * F_RAIL + H * 0.6);
  buildViaduct(rail.layer, W, rail.layer.canvas.height, deckY, 91);
  // the distance is almost black: only the odd window and a cold rim survive
  for (const [l, a] of [[far.layer, 0.45], [mid.layer, 0.55], [rail.layer, 0.6]] as const) {
    l.ctx.save();
    l.ctx.globalCompositeOperation = "source-atop";
    l.ctx.fillStyle = "#020207";
    l.ctx.globalAlpha = a;
    l.ctx.fillRect(0, 0, l.canvas.width, l.canvas.height);
    l.ctx.restore();
  }

  const tower = buildTower(make, W, H);
  const fore = buildForeground(make, W, H);
  const { fx, gy, reflTop } = tower;

  const halos = {
    cyan: makeHalo(make, 18, NEON.cyan),
    warm: makeHalo(make, 18, "#fff2c8"),
  };

  // light climbing the canyon from the street: a magenta shaft behind the near buildings
  const shaft = makeLayer(make, W, H);
  {
    const c = shaft.ctx;
    const cx = W / 2;
    // many thin nested bands, so the edge of the shaft is soft
    for (let i = 0; i < 12; i++) {
      const k = 0.4 - i * 0.032;
      c.save();
      c.globalAlpha = 0.02;
      c.fillStyle = i < 7 ? "#2a62d8" : NEON.mag;
      c.fillRect(Math.round(cx - W * k), 0, Math.round(W * k * 2), H);
      c.restore();
    }
  }

  // low fog hugging the street: magenta haze with a cyan band at kerb height
  const fogTop = gy - 90;
  const gfog = makeLayer(make, W, tower.WH - fogTop);
  {
    const c = gfog.ctx;
    fogBands(c, 0, 40, 109, W, "#2a1a4a", 0.22, 6);
    fogBands(c, 0, 76, 109, W, "#1a6a8a", 0.1, 4);
  }

  // a soft darkening of the screen edges
  const vig = makeLayer(make, W, H);
  {
    const c = vig.ctx;
    for (let i = 0; i < 26; i++) {
      c.save();
      c.globalAlpha = 0.5 * Math.pow(1 - i / 26, 2);
      c.fillStyle = "#03010a";
      c.fillRect(i, 0, 1, H);
      c.fillRect(W - 1 - i, 0, 1, H);
      c.restore();
    }
    for (let i = 0; i < 30; i++) {
      c.save();
      c.globalAlpha = 0.45 * Math.pow(1 - i / 30, 2);
      c.fillStyle = "#03010a";
      c.fillRect(0, i, W, 1);
      c.restore();
    }
  }

  const blitY = (ctx: Ctx, L: Layer, factor: number, cam: number) => {
    const sy = Math.max(0, Math.min(L.canvas.height - H, Math.round(cam * factor)));
    ctx.drawImage(L.canvas, 0, sy, W, H, 0, 0, W, H);
    return sy;
  };

  const blinkLights = (ctx: Ctx, list: { x: number; y: number; col: string }[], sy: number, t: number, k: number) => {
    for (const b of list) {
      const y = b.y - sy;
      if (y < 0 || y >= H) continue;
      if ((Math.floor(t * k + b.x * 0.013) & 1) === 0) {
        dot(ctx, b.x, y, b.col);
        ctx.globalAlpha = 0.35;
        dot(ctx, b.x - 1, y, b.col);
        dot(ctx, b.x + 1, y, b.col);
        dot(ctx, b.x, y - 1, b.col);
        ctx.globalAlpha = 1;
      }
    }
  };

  function render(ctx: Ctx, f: WorldFrame) {
    const { t } = f;
    const cam = Math.max(0, Math.min(CAM, f.cam));
    const sy = Math.round(cam);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;

    ctx.drawImage(sky.canvas, 0, 0);

    const fy = blitY(ctx, far.layer, F_FAR, cam);
    blinkLights(ctx, far.blink, fy, t, 1.2);
    const my = blitY(ctx, mid.layer, F_MID, cam);
    blinkLights(ctx, mid.blink, my, t, 1.2);
    const ry = blitY(ctx, rail.layer, F_RAIL, cam);
    blinkLights(ctx, rail.blink, ry, t, 1.4);

    // the train: comes and goes along the elevated rail
    {
      const cycle = 15;
      const k = Math.floor(t / cycle);
      const p = ((t % cycle) / cycle) * 1.5;
      const y = deckY - ry - 1;
      if (p < 1 && y > -20 && y < H + 12) {
        const dir: 1 | -1 = k % 2 ? -1 : 1;
        const span = W + TRAIN_LEN + 30;
        const tx = dir > 0 ? -TRAIN_LEN + p * span : W - p * span;
        drawTrain(ctx, Math.round(tx), y, dir, t);
      }
    }

    // magenta light climbing the canyon, brighter the nearer the street
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0;
    ctx.drawImage(shaft.canvas, 0, 0);
    ctx.restore();

    // the near buildings, in full detail
    ctx.drawImage(tower.near.canvas, 0, sy, W, H, 0, 0, W, H);

    // reflections and fog, once the street is on screen
    const rY = reflTop - sy;
    if (rY < H) ctx.drawImage(tower.refl.canvas, 0, rY);
    const fogY = fogTop - sy;
    if (fogY < H) ctx.drawImage(gfog.canvas, 0, fogY);

    // windows that flicker
    for (let i = 0; i < fx.wins.length; i++) {
      const w = fx.wins[i];
      const y = w.y - sy;
      if (y < -10 || y > H + 10) continue;
      if (hash01(Math.floor(t * 2) + i * 13.7) < 0.1) {
        rect(ctx, w.x, y, w.w, w.h, "#2a1f4a");
        rect(ctx, w.x + Math.floor(w.w / 2), y, 1, w.h, "#0a0618");
      }
    }

    // neon that sputters
    for (let i = 0; i < fx.flick.length; i++) {
      const r = fx.flick[i];
      const y = r.y - sy;
      if (y < -r.h || y > H) continue;
      if (hash01(Math.floor(t * 8) + i * 3.7) < 0.035) {
        ctx.globalAlpha = 0.72;
        rect(ctx, r.x + 1, y + 1, r.w - 2, r.h - 2, "#05020f");
        ctx.globalAlpha = 1;
      }
    }

    // animated billboards: scrolling colour bars with a glitch now and then
    for (let i = 0; i < fx.ads.length; i++) {
      const a = fx.ads[i];
      const ay = a.y - sy;
      if (ay < -a.h || ay > H) continue;
      const glitch = hash01(Math.floor(t * 5) + i * 9.1) < 0.06;
      const y0 = Math.max(0, -ay);
      const y1 = Math.min(a.h, H - ay);
      if (a.scan) {
        // a still picture: faint scanlines, a bright line sweeping down, a glitch now and then
        ctx.globalAlpha = 0.12;
        for (let y = y0 - (y0 % 3); y < y1; y += 3) rect(ctx, a.x, ay + y, a.w, 1, "#000000");
        const sweep = Math.floor(wrap(t * 30 + i * 70, a.h + 20)) - 10;
        ctx.globalAlpha = 0.2;
        for (let y = Math.max(y0, sweep); y < Math.min(y1, sweep + 3); y++) rect(ctx, a.x, ay + y, a.w, 1, "#ffffff");
        if (glitch || hash01(Math.floor(t * 3) + 5.5) < 0.05) {
          ctx.globalAlpha = 0.35;
          for (let k = 0; k < 3; k++) {
            const gy2 = Math.floor(hash01(Math.floor(t * 9) + k * 4.4) * a.h);
            if (gy2 >= y0 && gy2 < y1) rect(ctx, a.x, ay + gy2, a.w, 2 + k, k % 2 ? NEON.cyan : NEON.mag);
          }
        }
        ctx.globalAlpha = 1;
        continue;
      }
      for (let y = y0; y < y1; y++) {
        const k = (Math.sin((y + t * 7) / 2.6 + i) + 1) / 2;
        const col = mix(a.a, a.b, glitch ? 1 - k : k);
        ctx.globalAlpha = y % 3 === 2 ? 0.5 : 0.95;
        rect(ctx, a.x + (glitch && y % 4 === 0 ? 2 : 0), ay + y, a.w, 1, col);
      }
      ctx.globalAlpha = 1;
      // a bright bar that sweeps across, like a logo
      const bx = Math.floor(wrap(t * 9 + i * 13, a.w + 6)) - 3;
      for (let y = Math.max(3, y0); y < Math.min(a.h - 3, y1); y++) {
        for (let x = Math.max(0, bx); x < Math.min(a.w, bx + 4); x++) dot(ctx, a.x + x, ay + y, "#fff2ff");
      }
    }

    // lamp halos
    for (let i = 0; i < fx.lamps.length; i++) {
      const l = fx.lamps[i];
      const y = l.y - sy;
      if (y < -20 || y > H + 20) continue;
      ctx.globalAlpha = 0.5 + 0.32 * hash01(Math.floor(t * 6) + i * 5.1);
      ctx.drawImage(l.col === NEON.cyan ? halos.cyan.canvas : halos.warm.canvas, l.x - 18, y - 18);
      ctx.globalAlpha = 1;
    }

    blinkLights(ctx, fx.blink, sy, t, 1.4);

    // steam
    for (let i = 0; i < fx.steam.length; i++) {
      const s = fx.steam[i];
      const y = s.y - sy;
      if (y < -30 || y > H + 30) continue;
      for (let j = 0; j < 5; j++) {
        const age = (t * 0.32 + j / 5 + hash01(i * 7.7)) % 1;
        const size = 1 + Math.floor(age * 3);
        ctx.globalAlpha = (1 - age) * 0.5;
        rect(ctx, s.x + Math.sin(age * 5 + j) * 2 + age * 4, y - age * 26, size, size, "#cfc4ff");
      }
      ctx.globalAlpha = 1;
    }

    // rain splashing on the road
    if (rY < H) {
      for (let k = 0; k < 34; k++) {
        const phase = (t * 1.4 + hash01(k * 2.9)) % 1;
        const x = hash01(k * 5.1) * W;
        const y = reflTop + 3 + hash01(k * 9.9) * (tower.WH - reflTop - 5) - sy;
        if (y < 0 || y >= H) continue;
        const fr = Math.floor(phase * 3);
        ctx.globalAlpha = (1 - phase) * 0.8;
        const col = "#a898ff";
        if (fr === 0) dot(ctx, x, y, col);
        else if (fr === 1) rect(ctx, x - 1, y, 3, 1, col);
        else {
          dot(ctx, x - 2, y, col);
          dot(ctx, x + 2, y, col);
          dot(ctx, x, y - 1, col);
        }
      }
      ctx.globalAlpha = 1;
    }

    // foreground silhouettes: pipes, cables, leaves
    blitY(ctx, fore, 1.35, cam);

    // rain: far streaks drift slowly and dim, near streaks are long and fast.
    // The camera is falling, so the streaks also slide up the screen.
    const farN = Math.round((W * H) / 2600);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#8a7aff";
    for (let i = 0; i < farN; i++) {
      const sp = 0.8 + hash01(i * 2.3) * 0.5;
      const y = wrap(t * 95 * sp + hash01(i * 3.9) * (H + 12) - cam * 0.5, H + 12) - 6;
      const x = wrap(hash01(i * 1.7) * W + y * 0.14, W);
      ctx.fillRect(Math.round(x), Math.round(y), 1, 3);
    }
    const nearN = Math.round((W * H) / 7500);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#cdbdff";
    for (let i = 0; i < nearN; i++) {
      const sp = 0.9 + hash01(i * 4.1) * 0.5;
      const y = wrap(t * 240 * sp + hash01(i * 6.3) * (H + 20) - cam * 1.1, H + 20) - 10;
      const x = wrap(hash01(i * 8.9) * W + y * 0.26, W);
      ctx.fillRect(Math.round(x), Math.round(y), 1, 7 + (i % 4));
    }
    ctx.globalAlpha = 1;

    ctx.drawImage(vig.canvas, 0, 0);
  }

  return {
    W,
    H,
    anchors: { ...ANCHORS, contact: CAM },
    streetY: gy - CAM,
    front: createFront(W, H, gy - CAM),
    render,
  };
}
