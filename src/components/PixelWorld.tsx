"use client";

import { useEffect, useRef } from "react";
import {
  createScene,
  STRIP_ROWS,
  TRAVEL,
  type CanvasFactory,
  type Scene,
} from "@/lib/pixel-world/scene";

/**
 * The fixed, full-screen pixel village behind the whole page.
 *
 * The world is drawn on a tiny canvas (about 320x180 "pixels") that CSS scales
 * up with `image-rendering: pixelated`. Scrolling the page walks the character
 * through the village: the world slides past while she stays put.
 */
export default function PixelWorld() {
  const ref = useRef<HTMLCanvasElement>(null);
  const stripRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const strip = stripRef.current;
    const ctx = canvas?.getContext("2d");
    const sctx = strip?.getContext("2d");
    if (!canvas || !strip || !ctx || !sctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motion.matches;

    const make: CanvasFactory = (w, h) => {
      const layer = document.createElement("canvas");
      layer.width = w;
      layer.height = h;
      return { canvas: layer, ctx: layer.getContext("2d") as CanvasRenderingContext2D };
    };

    let scene: Scene | null = null;
    let raf = 0;
    let resizeTimer = 0;
    let last = 0;
    let t = 3.5; // seconds of "world time"; starts mid-twinkle so a still frame looks alive
    let cam = 0;
    let target = 0;
    let walkPhase = 0;
    let facing: 1 | -1 = 1;
    let moving = false;
    let lastMoveAt = -10;

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      target = p * TRAVEL;
    };

    const draw = () => {
      scene?.render(ctx, {
        t,
        cam,
        walkFrame: Math.floor(walkPhase) % 4,
        moving,
        facing,
      });
      // Copy the ground strip to the canvas that sits in front of the content,
      // fading its top edge in with a few translucent rows.
      const rows = strip.height;
      const sy = canvas.height - rows;
      sctx.clearRect(0, 0, strip.width, rows);
      const FADE = 4;
      for (let i = 0; i < FADE; i++) {
        sctx.globalAlpha = (i + 1) / (FADE + 1);
        sctx.drawImage(canvas, 0, sy + i, canvas.width, 1, 0, i, canvas.width, 1);
      }
      sctx.globalAlpha = 1;
      sctx.drawImage(canvas, 0, sy + FADE, canvas.width, rows - FADE, 0, FADE, canvas.width, rows - FADE);
    };

    const setup = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = vw < 640 ? 3 : Math.max(3, Math.min(4, Math.round(vh / 190)));
      const W = Math.ceil(vw / scale);
      const H = Math.ceil(vh / scale);
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = `${W * scale}px`;
      canvas.style.height = `${H * scale}px`;
      const rows = Math.min(H, STRIP_ROWS);
      strip.width = W;
      strip.height = rows;
      strip.style.width = `${W * scale}px`;
      strip.style.height = `${rows * scale}px`;
      scene = createScene(W, H, make);
      readScroll();
      if (reduced) cam = target;
      draw();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 33) return; // ~30fps keeps the pixel-art feel and saves battery
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;

      const prev = cam;
      cam += (target - cam) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - cam) < 0.05) cam = target;
      const vel = cam - prev;
      if (Math.abs(vel) > 0.08) {
        moving = true;
        lastMoveAt = t;
        facing = vel > 0 ? 1 : -1;
        walkPhase += Math.min(0.5, Math.abs(vel) / 3);
      } else if (t - lastMoveAt > 0.18) {
        moving = false;
      }
      draw();
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced) {
        // Still world: no animation loop, just redraw when the page scrolls.
        moving = false;
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

    const onMotionChange = () => {
      reduced = motion.matches;
      start();
    };

    setup();
    start();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    motion.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div className="pixel-world">
        <canvas ref={ref} className="pixel-canvas" />
      </div>
      <canvas ref={stripRef} className="pixel-strip" />
    </div>
  );
}
