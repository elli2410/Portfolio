"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import PixelCanvas, { reducedMotion, subscribe } from "./PixelCanvas";
import Dialogue from "./Dialogue";
import Nav from "./Nav";
import Panels, { type PanelId } from "./Panels";
import {
  BOX,
  CHAR,
  H,
  INTERACTIVE,
  W,
  walkerAt,
  type Interactive,
  type PropId,
  type Rect,
} from "@/lib/diorama/layout";
import { drawPetals, drawPlatform, drawSky, drawTwinkle } from "@/lib/diorama/skyArt";
import {
  drawAquarium,
  drawLamp,
  drawMainShop,
  drawOrange,
  drawRamen,
  drawShaftHead,
  drawTree,
  drawTreeFront,
  drawVendoSkills,
} from "@/lib/diorama/streetArt";
import {
  drawBed,
  drawCabinet,
  drawDog,
  drawPcDesk,
  drawRain,
  drawRoomBack,
  drawRoomFront,
  drawRobot,
  drawShaft,
  drawSlab,
  drawTable,
  drawWindow,
} from "@/lib/diorama/roomArt";

/** The camera moves this much slower than the scroll, so the descent feels unhurried. */
const SCROLL_K = 1.5;
const MIN_SCALE = 1.6;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type Walk = { moving: boolean; flip: boolean };

type PropHandlers = {
  onPointerEnter: (e: SyntheticEvent<HTMLElement>) => void;
  onFocus: (e: SyntheticEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  onBlur: () => void;
};

/* ------------------------------------------------------------ the sprites */

function boxStyle(b: Rect, S: number, z: number): CSSProperties {
  return {
    position: "absolute",
    left: b.x * S,
    top: b.y * S,
    width: b.w * S,
    height: b.h * S,
    zIndex: z,
  };
}

/** The character, drawn from the supplied sprite with a breathing idle and a waddling walk. */
function paintWalker(
  c: CanvasRenderingContext2D,
  t: number,
  img: HTMLImageElement | null,
  walk: Walk,
) {
  c.clearRect(0, 0, CHAR.w + 4, CHAR.h + 4);
  if (!img || !img.complete || !img.naturalWidth) return;
  const upper = 32;
  const ox = 2;
  const oy = 2;
  let lift = 0;
  let shift = 0;
  if (walk.moving) {
    // a four-beat waddle: the body bobs and the legs shuffle side to side
    const f = Math.floor(t * 8) % 4;
    lift = f % 2;
    shift = f === 1 ? -1 : f === 3 ? 1 : 0;
  } else {
    // idle: a slow breath, the chest rising one pixel
    lift = Math.sin(t * 1.7) > 0.55 ? 1 : 0;
  }
  c.drawImage(img, 0, 0, CHAR.w, upper, ox, oy - lift, CHAR.w, upper + lift);
  c.drawImage(img, 0, upper, CHAR.w, CHAR.h - upper, ox + shift, oy + upper, CHAR.w, CHAR.h - upper);
}

/** The world is as wide as the screen, but never smaller than this, so props stay legible on phones. */
function computeScale(): number {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  return Math.max(vw / W, MIN_SCALE, (vh * 1.3) / H);
}
function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
const noopSubscribe = () => () => {};

/** A pixel arrow that bobs slowly above something clickable. */
function Arrow({ style }: { style: CSSProperties }) {
  return (
    <span className="dio-arrow" style={style} aria-hidden="true">
      <svg viewBox="0 0 9 8" shapeRendering="crispEdges">
        <path d="M2 0h5v4h2v1H8v1H7v1H6v1H3V7H2V6H1V5H0V4h2z" fill="#14113a" />
        <path d="M3 1h3v3h2v1H7v1H6v1H3V6H2V5H1V4h2z" fill="#ffd98a" />
        <path d="M3 1h3v1H3z" fill="#fff6d8" />
      </svg>
    </span>
  );
}

/** The little patrol robot: its own tiny loop, independent of the scroll. */
function Robot({ S }: { S: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const dir = useRef<1 | -1>(1);
  const draw = useCallback((c: CanvasRenderingContext2D, t: number) => drawRobot(c, t, dir.current), []);
  useEffect(() => {
    if (reducedMotion()) return;
    const min = 34;
    const max = 440;
    const speed = 13;
    const span = max - min;
    return subscribe(30, (t) => {
      const el = wrap.current;
      if (!el) return;
      const d = (t * speed) % (span * 2);
      const fwd = d < span;
      dir.current = fwd ? 1 : -1;
      const x = min + (fwd ? d : span * 2 - d);
      el.style.transform = `translate3d(${x * S}px, 0, 0)`;
    });
  }, [S]);
  return (
    <div
      ref={wrap}
      style={{
        position: "absolute",
        left: 0,
        top: 520 * S,
        width: 22 * S,
        height: 16 * S,
        zIndex: 6,
        transform: `translate3d(${34 * S}px,0,0)`,
        willChange: "transform",
      }}
    >
      <PixelCanvas w={22} h={16} draw={draw} fps={10} className="dio-px" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/* ------------------------------------------------------------- the scene */

type PanelState = { id: PanelId; ox: number; oy: number; delay: number } | null;

export default function Diorama() {
  const S = useSyncExternalStore(subscribeResize, computeScale, () => 2.4);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [hover, setHover] = useState<{ id: PropId; side: "left" | "right" } | null>(null);
  const [panel, setPanel] = useState<PanelState>(null);
  const [section, setSection] = useState<"home" | "projects" | "contact">("home");
  const [hint, setHint] = useState(true);

  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const walkerRef = useRef<HTMLButtonElement>(null);
  const walkRef = useRef<Walk>({ moving: false, flip: false });
  const metrics = useRef({ vh: 800, travel: 0 });
  const sectionRef = useRef<"home" | "projects" | "contact">("home");
  const hintRef = useRef(true);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [spriteReady, setSpriteReady] = useState(false);

  useEffect(() => {
    const im = new Image();
    im.onload = () => {
      imgRef.current = im;
      setSpriteReady(true);
    };
    im.src = "/diorama/elli.png";
  }, []);

  /* sizing: scroll length follows the world's height */
  const measure = useCallback(() => {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const s = computeScale();
    const travel = Math.max(0, H * s - vh);
    metrics.current = { vh, travel };
    if (outerRef.current) outerRef.current.style.height = `${vh + travel * SCROLL_K}px`;
    if (stageRef.current) {
      const over = W * s - vw;
      if (over > 0 && !stageRef.current.dataset.centred) {
        stageRef.current.scrollLeft = over / 2;
        stageRef.current.dataset.centred = "1";
      }
    }
  }, []);

  /* the per-scroll update: camera, walker, section label. No React renders. */
  const sRef = useRef(S);
  const update = useCallback(() => {
    const { travel } = metrics.current;
    const s = sRef.current;
    const total = travel * SCROLL_K;
    const p = total > 0 ? clamp(window.scrollY / total, 0, 1) : 0;
    const world = worldRef.current;
    if (world) world.style.transform = `translate3d(0, ${-p * travel}px, 0)`;
    const wk = walkerAt(p);
    walkRef.current = { moving: wk.moving, flip: wk.flip };
    const el = walkerRef.current;
    if (el) {
      el.style.transform = `translate3d(${(wk.x - CHAR.w / 2) * s}px, ${(wk.y - CHAR.h) * s}px, 0)`;
      el.dataset.flip = wk.flip ? "1" : "0";
    }
    const next = p < 0.4 ? "home" : p < 0.9 ? "projects" : "contact";
    if (next !== sectionRef.current) {
      sectionRef.current = next;
      setSection(next);
    }
    const showHint = p < 0.03;
    if (showHint !== hintRef.current) {
      hintRef.current = showHint;
      setHint(showHint);
    }
  }, []);

  // whenever the scale changes: re-measure and re-place the camera and the walker
  useLayoutEffect(() => {
    sRef.current = S;
    measure();
    update();
  }, [S, measure, update]);

  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      on();
    };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", onResize);
    on();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", onResize);
    };
  }, [measure, update]);

  /* scroll to a place in the world; 0 = sky, 1 = underground room */
  const goTo = useCallback((p: number) => {
    const total = metrics.current.travel * SCROLL_K;
    window.scrollTo({ top: total * p, behavior: reducedMotion() ? "auto" : "smooth" });
  }, []);

  const open = useCallback((id: PanelId, e?: MouseEvent<HTMLElement>, delay = 0) => {
    let ox = window.innerWidth / 2;
    let oy = window.innerHeight / 2;
    if (e) {
      const r = e.currentTarget.getBoundingClientRect();
      ox = r.left + r.width / 2;
      oy = r.top + r.height / 2;
    }
    setHover(null);
    setPanel({ id, ox, oy, delay });
  }, []);

  const close = useCallback(() => setPanel(null), []);
  const openPlain = useCallback((id: PanelId) => open(id), [open]);

  const navTo = useCallback(
    (target: "home" | "about" | "projects" | "contact") => {
      if (target === "home") {
        setPanel(null);
        goTo(0);
      } else if (target === "about") {
        goTo(0.02);
        open("about", undefined, 500);
      } else if (target === "projects") {
        goTo(1);
        open("projects", undefined, 900);
      } else {
        goTo(1);
        open("contact", undefined, 900);
      }
    },
    [goTo, open],
  );

  const sayFor = (id: PropId | null): string | null =>
    id ? (INTERACTIVE.find((i) => i.id === id)?.say ?? null) : null;

  // Elli pops up from the bottom corner farthest from the prop, so she never covers it.
  const handlers = (id: PropId, say: string | null): PropHandlers => {
    const show = (e: SyntheticEvent<HTMLElement>) => {
      if (!say) return;
      const r = e.currentTarget.getBoundingClientRect();
      const side = (r.left + r.width / 2) / window.innerWidth < 0.55 ? "right" : "left";
      setHover({ id, side });
    };
    const hide = () => setHover((h) => (h?.id === id ? null : h));
    return { onPointerEnter: show, onFocus: show, onPointerLeave: hide, onBlur: hide };
  };

  const hits = INTERACTIVE.filter((i) => i.id !== "hero");
  const walkDraw = useCallback(
    (c: CanvasRenderingContext2D, t: number) => paintWalker(c, t, imgRef.current, walkRef.current),
    [],
  );

  return (
    <>
      <Nav
        section={section}
        onNav={navTo}
      />

      <div ref={outerRef} className="dio-outer" style={{ height: "300vh" }}>
        <div ref={stageRef} className="dio-stage">
          <div
            ref={worldRef}
            className="dio-world"
            style={{
              width: W * S,
              height: H * S,
              visibility: mounted ? "visible" : "hidden",
            }}
          >
            {/* sky, platform and bonsai */}
            <PixelCanvas
              w={BOX.sky.w}
              h={BOX.sky.h}
              draw={(c) => {
                drawSky(c);
                drawPlatform(c);
              }}
              className="dio-px"
              style={boxStyle(BOX.sky, S, 1)}
            />
            <PixelCanvas
              w={W}
              h={120}
              draw={(c, t) => drawTwinkle(c, t)}
              fps={4}
              className="dio-px"
              style={boxStyle({ x: 0, y: 0, w: W, h: 120 }, S, 2)}
            />

            {/* street-level buildings */}
            <PixelCanvas w={BOX.ramen.w} h={BOX.ramen.h} draw={drawRamen} className="dio-px" style={boxStyle(BOX.ramen, S, 4)} />
            <PixelCanvas w={BOX.mainShop.w} h={BOX.mainShop.h} draw={drawMainShop} className="dio-px" style={boxStyle(BOX.mainShop, S, 4)} />
            <PixelCanvas w={BOX.tree.w} h={BOX.tree.h} draw={drawTree} className="dio-px" style={boxStyle(BOX.tree, S, 4)} />
            <PixelCanvas
              w={20}
              h={70}
              draw={(c) => drawLamp(c, 70)}
              className="dio-px"
              style={boxStyle({ x: 380, y: 230, w: 20, h: 70 }, S, 5)}
            />

            {/* vending machines */}
            <PixelCanvas w={BOX.vendoSkills.w} h={BOX.vendoSkills.h} draw={drawVendoSkills} className="dio-px" style={boxStyle(BOX.vendoSkills, S, 6)} />
            <PixelCanvas w={BOX.aquarium.w} h={BOX.aquarium.h} draw={drawAquarium} fps={10} className="dio-px" style={boxStyle(BOX.aquarium, S, 6)} />
            <PixelCanvas w={BOX.orange.w} h={BOX.orange.h} draw={drawOrange} fps={10} className="dio-px" style={boxStyle(BOX.orange, S, 6)} />
            <PixelCanvas w={BOX.shaftHead.w} h={BOX.shaftHead.h} draw={drawShaftHead} className="dio-px" style={boxStyle(BOX.shaftHead, S, 6)} />

            {/* petals falling from the bonsai, in front of the buildings */}
            <PixelCanvas
              w={240}
              h={250}
              draw={(c, t) => {
                c.setTransform(1, 0, 0, 1, -40, -50);
                drawPetals(c, t, W, 300);
                c.setTransform(1, 0, 0, 1, 0, 0);
              }}
              fps={15}
              className="dio-px"
              style={boxStyle({ x: 40, y: 50, w: 240, h: 250 }, S, 7)}
            />

            {/* road slab and the stair shaft */}
            <PixelCanvas w={BOX.slab.w} h={BOX.slab.h} draw={drawSlab} className="dio-px" style={boxStyle(BOX.slab, S, 7)} />
            <PixelCanvas w={BOX.shaft.w} h={BOX.shaft.h} draw={drawShaft} className="dio-px" style={boxStyle(BOX.shaft, S, 5)} />

            {/* the underground room */}
            <PixelCanvas w={BOX.roomBack.w} h={BOX.roomBack.h} draw={drawRoomBack} className="dio-px" style={boxStyle(BOX.roomBack, S, 2)} />
            <PixelCanvas w={BOX.bed.w} h={BOX.bed.h} draw={drawBed} className="dio-px" style={boxStyle(BOX.bed, S, 3)} />
            <PixelCanvas w={BOX.window.w} h={BOX.window.h + 4} draw={drawWindow} className="dio-px" style={boxStyle({ ...BOX.window, h: BOX.window.h + 4 }, S, 3)} />
            <PixelCanvas w={BOX.window.w} h={BOX.window.h} draw={(c, t) => drawRain(c, t)} fps={12} className="dio-px" style={boxStyle(BOX.window, S, 4)} />
            <PixelCanvas w={BOX.pcDesk.w} h={BOX.pcDesk.h} draw={drawPcDesk} className="dio-px" style={boxStyle(BOX.pcDesk, S, 5)} />
            <PixelCanvas w={BOX.cabinet.w} h={BOX.cabinet.h} draw={drawCabinet} className="dio-px" style={boxStyle(BOX.cabinet, S, 5)} />
            <Robot S={S} />

            {/* the character */}
            <button
              ref={walkerRef}
              type="button"
              className="dio-walker"
              aria-label="Elli, the shop owner. Open the introduction"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: CHAR.w * S,
                height: CHAR.h * S,
                zIndex: 8,
                transform: `translate3d(${(222 - CHAR.w / 2) * S}px, ${(300 - CHAR.h) * S}px, 0)`,
              }}
              onClick={(e) => open("hero", e)}
            >
              <PixelCanvas
                key={spriteReady ? "ready" : "loading"}
                w={CHAR.w + 4}
                h={CHAR.h + 4}
                draw={walkDraw}
                fps={8}
                className="dio-px dio-walker-cv"
                style={{
                  position: "absolute",
                  left: -2 * S,
                  top: -2 * S,
                  width: (CHAR.w + 4) * S,
                  height: (CHAR.h + 4) * S,
                }}
              />
              <Arrow
                style={{
                  left: "50%",
                  top: -13 * S,
                  width: 9 * S,
                  height: 8 * S,
                  marginLeft: -4.5 * S,
                }}
              />
            </button>

            {/* things in front of the character */}
            <PixelCanvas w={BOX.tree.w} h={BOX.tree.h} draw={drawTreeFront} className="dio-px" style={boxStyle(BOX.tree, S, 9)} />
            <PixelCanvas w={BOX.table.w} h={BOX.table.h} draw={(c, t) => drawTable(c, t)} fps={4} className="dio-px" style={boxStyle(BOX.table, S, 10)} />
            <PixelCanvas w={BOX.dog.w} h={BOX.dog.h} draw={(c, t) => drawDog(c, t)} fps={8} className="dio-px" style={boxStyle(BOX.dog, S, 10)} />
            <PixelCanvas w={BOX.roomFront.w} h={BOX.roomFront.h} draw={drawRoomFront} className="dio-px" style={boxStyle({ ...BOX.roomFront, y: BOX.roomFront.y }, S, 11)} />

            {/* clickable props */}
            {hits.map((it: Interactive) => (
              <PropHit
                key={it.id}
                it={it}
                S={S}
                onOpen={(e) => open(it.id as PanelId, e)}
                handlers={handlers(it.id, it.say)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`dio-hint ${hint ? "is-on" : ""}`} aria-hidden="true">
        <span>SCROLL DOWN</span>
        <i />
      </div>

      <Dialogue text={panel ? null : sayFor(hover?.id ?? null)} side={hover?.side ?? "left"} />
      <Panels panel={panel} onClose={close} onOpen={openPlain} onGo={goTo} />

      {/* the same content as plain text, for search engines and screen readers */}
      <div className="sr-only">
        <h1>Elliah Rain Panopio — CS student portfolio</h1>
        <p>
          Hi, I&apos;m Elli. I turn ideas into software through web development, machine learning, and a
          curiosity for solving real-world problems. 4th-year Computer Science student at National
          University Laguna, looking for a software or frontend internship.
        </p>
      </div>
    </>
  );
}

function PropHit({
  it,
  S,
  onOpen,
  handlers,
}: {
  it: Interactive;
  S: number;
  onOpen: (e: MouseEvent<HTMLButtonElement>) => void;
  handlers: PropHandlers;
}) {
  return (
    <>
      <button
        type="button"
        className="dio-hit"
        aria-label={it.label}
        style={boxStyle(it.hit, S, 20)}
        onClick={onOpen}
        {...handlers}
      />
      <Arrow
        style={{
          left: (it.hit.x + it.hit.w / 2 - 4.5) * S,
          top: (it.hit.y - 12) * S,
          width: 9 * S,
          height: 8 * S,
          zIndex: 21,
        }}
      />
    </>
  );
}
