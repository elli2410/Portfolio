"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Ctx } from "@/lib/diorama/px";

/**
 * One clock for every animated sprite. It runs only while something is
 * subscribed and the tab is visible, and does nothing at all for visitors who
 * prefer reduced motion (those get each sprite's first frame).
 */
type Sub = { every: number; last: number; run: (t: number) => void };
const subs = new Set<Sub>();
let raf = 0;
let t0 = 0;

function tick(now: number) {
  if (document.hidden) {
    raf = requestAnimationFrame(tick);
    return;
  }
  const t = (now - t0) / 1000;
  subs.forEach((s) => {
    if (now - s.last >= s.every) {
      s.last = now;
      s.run(t);
    }
  });
  raf = subs.size ? requestAnimationFrame(tick) : 0;
}

export function subscribe(fps: number, run: (t: number) => void): () => void {
  const s: Sub = { every: 1000 / fps - 2, last: 0, run };
  subs.add(s);
  if (!raf) {
    t0 = performance.now();
    raf = requestAnimationFrame(tick);
  }
  return () => {
    subs.delete(s);
  };
}

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Props = {
  w: number;
  h: number;
  /** Draws the sprite. `t` is seconds since start (0 for static sprites). */
  draw: (c: Ctx, t: number) => void;
  /** Redraw this many times a second; omit for a sprite drawn once. */
  fps?: number;
  className?: string;
  style?: CSSProperties;
};

export default function PixelCanvas({ w, h, draw, fps, className, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);

  // keep the newest draw function without re-subscribing the animation
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const c = cv.getContext("2d");
    if (!c) return;
    c.imageSmoothingEnabled = false;
    drawRef.current(c, 0);
    if (!fps || reducedMotion()) return;
    return subscribe(fps, (t) => drawRef.current(c, t));
  }, [fps]);

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
}
