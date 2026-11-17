/**
 * The shape of the world, in art pixels.
 *
 * The page is a vertical cutaway: night sky and a row of street-level shops on
 * top, a road slab in the middle, and one underground room below. Scrolling
 * lowers the camera from the sky down into the room.
 */

export const W = 560;
export const H = 612;

export type Rect = { x: number; y: number; w: number; h: number };

/** Street surface: where building bases and the character's feet sit. */
export const GROUND = 300;
/** Underside of the road slab = ceiling of the room. */
export const ROOM_TOP = 340;
/** Where the back wall of the room meets the floor. */
export const BACK_FLOOR = 506;
/** Feet line for things that walk on the room floor. */
export const ROOM_WALK = 524;

/** The stair shaft cut through the slab on the right edge. */
export const SHAFT = {
  x: 512,
  w: 48,
  /** left and right ends of a flight (where the feet go) */
  xl: 516,
  xr: 556,
  flights: 4,
  rise: 56,
  steps: 8,
};

export const CHAR = { w: 20, h: 54 };

/* ----------------------------------------------------------- prop boxes */

export const BOX = {
  sky: { x: 0, y: 0, w: W, h: 300 },
  ramen: { x: 6, y: 124, w: 172, h: 176 },
  vendoSkills: { x: 150, y: 240, w: 38, h: 60 },
  mainShop: { x: 196, y: 104, w: 188, h: 196 },
  tree: { x: 372, y: 36, w: 188, h: 264 },
  aquarium: { x: 400, y: 240, w: 48, h: 60 },
  orange: { x: 452, y: 244, w: 38, h: 56 },
  shaftHead: { x: 506, y: 232, w: 54, h: 68 },
  slab: { x: 0, y: 300, w: SHAFT.x, h: 96 },
  shaft: { x: SHAFT.x, y: 300, w: SHAFT.w, h: 232 },
  roomBack: { x: 0, y: ROOM_TOP, w: W, h: H - ROOM_TOP },
  bed: { x: 22, y: 410, w: 134, h: 98 },
  window: { x: 222, y: 350, w: 120, h: 76 },
  pcDesk: { x: 206, y: 400, w: 148, h: 108 },
  cabinet: { x: 376, y: 396, w: 134, h: 112 },
  table: { x: 128, y: 514, w: 112, h: 92 },
  dog: { x: 330, y: 556, w: 96, h: 46 },
  robot: { x: 0, y: 0, w: 22, h: 16 },
  roomFront: { x: 0, y: 540, w: W, h: 72 },
} as const;

/* ---------------------------------------------------- interactive props */

export type PropId = "hero" | "about" | "skills" | "projects" | "contact";

export type Interactive = {
  id: PropId;
  /** clickable area, world coordinates */
  hit: Rect;
  /** what my character says on hover (null = say nothing) */
  say: string | null;
  label: string;
};

export const INTERACTIVE: Interactive[] = [
  {
    id: "skills",
    hit: { x: 152, y: 244, w: 34, h: 56 },
    say: "Check out the vending machine to see my tech stack!",
    label: "Skills vending machine",
  },
  {
    id: "about",
    hit: { x: 238, y: 232, w: 70, h: 20 },
    say: "Curious who built all this? Click the neon sign to read about me!",
    label: "About me neon sign",
  },
  {
    id: "projects",
    hit: { x: 220, y: 424, w: 88, h: 32 },
    say: "Boot up my PC to browse all of my projects!",
    label: "PC with my projects",
  },
  {
    id: "contact",
    hit: { x: 168, y: 526, w: 26, h: 30 },
    say: "Pick up the radio, that's the quickest way to reach me!",
    label: "Radio phone with my contact details",
  },
];

/* ------------------------------------------------ the walking character */

type Pt = { x: number; y: number };

/** Waypoints of the walk: shop -> stairwell -> down the flights -> across the room. */
function buildRoute(): { pts: Pt[]; street: number; stairs: number } {
  const pts: Pt[] = [
    { x: 222, y: GROUND },
    { x: SHAFT.xl, y: GROUND },
  ];
  let y = GROUND;
  for (let f = 0; f < SHAFT.flights; f++) {
    const goRight = f % 2 === 0;
    y += SHAFT.rise;
    pts.push({ x: goRight ? SHAFT.xr : SHAFT.xl, y });
  }
  pts.push({ x: 300, y: ROOM_WALK });
  return { pts, street: 1, stairs: SHAFT.flights + 1 };
}

const ROUTE = buildRoute();

const SEG = ROUTE.pts.slice(1).map((p, i) => {
  const a = ROUTE.pts[i];
  return { a, b: p, len: Math.hypot(p.x - a.x, p.y - a.y) };
});
const TOTAL = SEG.reduce((s, g) => s + g.len, 0);

/**
 * Scroll progress (0..1) -> where the character is, which way it faces, and
 * whether it is walking. It stands still at first, walks the street, takes
 * the stairs while the camera follows, then crosses the room and stops.
 */
export function walkerAt(p: number): { x: number; y: number; flip: boolean; moving: boolean } {
  // progress windows: [start, end] of each leg, in scroll fraction
  const streetLen = SEG[0].len;
  const stairLen = SEG.slice(1, 1 + SHAFT.flights).reduce((s, g) => s + g.len, 0);
  const roomLen = SEG[SEG.length - 1].len;
  const legs = [
    { t0: 0.04, t1: 0.38, len: streetLen },
    { t0: 0.38, t1: 0.78, len: stairLen },
    { t0: 0.78, t1: 0.97, len: roomLen },
  ];
  let d = 0;
  let done = 0;
  for (const leg of legs) {
    if (p >= leg.t1) {
      d += leg.len;
      done += 1;
    } else if (p > leg.t0) {
      d += ((p - leg.t0) / (leg.t1 - leg.t0)) * leg.len;
      break;
    } else break;
  }
  void done;
  d = Math.max(0, Math.min(TOTAL, d));
  let acc = 0;
  for (const g of SEG) {
    if (d <= acc + g.len + 0.001) {
      const t = g.len === 0 ? 0 : (d - acc) / g.len;
      const dx = g.b.x - g.a.x;
      return {
        x: g.a.x + dx * t,
        y: g.a.y + (g.b.y - g.a.y) * t,
        flip: dx < 0,
        moving: d > 0.01 && d < TOTAL - 0.01 && p > 0.04 && p < 0.97,
      };
    }
    acc += g.len;
  }
  const last = ROUTE.pts[ROUTE.pts.length - 1];
  return { x: last.x, y: last.y, flip: true, moving: false };
}

/** Rows of the stairs, for drawing: each flight as [x0, y0, x1, y1]. */
export function flights(): Array<[number, number, number, number]> {
  const out: Array<[number, number, number, number]> = [];
  let y = GROUND;
  for (let f = 0; f < SHAFT.flights; f++) {
    const right = f % 2 === 0;
    out.push([right ? SHAFT.xl : SHAFT.xr, y, right ? SHAFT.xr : SHAFT.xl, y + SHAFT.rise]);
    y += SHAFT.rise;
  }
  return out;
}

/** Camera focus for narrow screens: which world x to keep centred. */
export function focusX(p: number): number {
  const w = walkerAt(p);
  return Math.max(120, Math.min(W - 120, w.x));
}
