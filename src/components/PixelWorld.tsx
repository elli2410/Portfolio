"use client";

import { useEffect, useRef } from "react";
import { CAM, createWorld, type CanvasFactory, type World } from "@/lib/pixel-world/scene";

/**
 * The fixed, full-screen rainy city behind the whole page.
 *
 * The world is drawn on a small canvas (about 2 screen pixels per art pixel)
 * that CSS scales up with `image-rendering: pixelated`. Scrolling the page
 * lowers the camera down the canyon, from the rooftops to the street. A second,
 * transparent canvas in front of the page carries the glass elevator and the
 * runner who steps out of it at the bottom.
 */
export default function PixelWorld() {
  const worldRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = worldRef.current;
    const front = frontRef.current;
    const ctx = canvas?.getContext("2d");
    const fctx = front?.getContext("2d");
    if (!canvas || !front || !ctx || !fctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motion.matches;

    const make: CanvasFactory = (w, h) => {
      const layer = document.createElement("canvas");
      layer.width = w;
      layer.height = h;
      return { canvas: layer, ctx: layer.getContext("2d") as CanvasRenderingContext2D };
    };

    let world: World | null = null;
    let showCab = true;
    let raf = 0;
    let resizeTimer = 0;
    let last = 0;
    let t = 3.5;
    let cam = 0;
    let target = 0;
    let walk = 0;
    let walkMoving = false;
    let walkDir: 1 | -1 = -1;
    let stride = 0;
    // scroll position -> camera height, piecewise linear through each section's centre
    let stops: { s: number; c: number }[] = [{ s: 0, c: 0 }];

    const buildStops = () => {
      if (!world) return;
      const vh = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      const sectionCentre = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return Math.min(max, Math.max(0, r.top + window.scrollY + r.height / 2 - vh / 2));
      };
      const raw: [number | null, number][] = [
        [0, 0],
        [sectionCentre("work"), world.anchors.work],
        [sectionCentre("skills"), world.anchors.skills],
        [sectionCentre("about"), world.anchors.about],
        [max, world.anchors.contact],
      ];
      const out: { s: number; c: number }[] = [];
      for (const [s, c] of raw) {
        if (s == null) continue;
        const prev = out[out.length - 1];
        out.push({ s: prev ? Math.max(s, prev.s + 1) : s, c });
      }
      stops = out;
    };

    const readScroll = () => {
      const y = window.scrollY;
      let c = stops[stops.length - 1].c;
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        if (y <= b.s) {
          c = a.c + ((b.c - a.c) * Math.max(0, y - a.s)) / (b.s - a.s);
          break;
        }
      }
      target = Math.max(0, Math.min(CAM, c));
    };

    const draw = () => {
      if (!world) return;
      world.render(ctx, { t, cam });
      world.front.render(fctx, {
        t,
        cam,
        walk,
        moving: walkMoving,
        frame: Math.floor(stride) % 4,
        dir: walkDir,
        showCab,
      });
    };

    const setup = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = 2;
      const W = Math.ceil(vw / scale);
      const H = Math.ceil(vh / scale);
      for (const cv of [canvas, front]) {
        cv.width = W;
        cv.height = H;
        cv.style.width = `${W * scale}px`;
        cv.style.height = `${H * scale}px`;
      }
      showCab = vw >= 1100;
      world = createWorld(W, H, make);
      buildStops();
      readScroll();
      if (reduced) cam = target;
      draw();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 33) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;

      cam += (target - cam) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - cam) < 0.05) cam = target;

      // she steps out once the cab has docked, and hurries back in if you scroll up
      const docked = cam >= CAM - 2;
      const before = walk;
      if (docked) walk = Math.min(1, walk + dt * 0.22);
      else walk = Math.max(0, walk - dt * 1.4);
      walkMoving = Math.abs(walk - before) > 0.0004 && walk > 0 && (walk < 1 || before < 1);
      if (walk !== before) walkDir = walk > before ? -1 : 1;
      if (walkMoving) stride += dt * 7;
      draw();
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced) {
        walkMoving = false;
        cam = target;
        draw();
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      readScroll();
      if (reduced) {
        cam = target;
        draw();
      }
    };
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(setup, 150);
    };
    const onLayout = () => {
      buildStops();
      readScroll();
    };
    const onMotionChange = () => {
      reduced = motion.matches;
      start();
    };

    setup();
    start();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onLayout);
    motion.addEventListener("change", onMotionChange);
    const ro = new ResizeObserver(onLayout);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLayout);
      motion.removeEventListener("change", onMotionChange);
      ro.disconnect();
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div className="pixel-world">
        <canvas ref={worldRef} className="pixel-canvas" />
      </div>
      <canvas ref={frontRef} className="pixel-front" />
    </div>
  );
}
