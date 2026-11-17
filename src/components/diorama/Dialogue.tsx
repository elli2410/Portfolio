"use client";

import { useEffect, useState } from "react";

/** Reveals a line one character at a time. Remounted (via key) for each new line. */
function Typewriter({ text, active }: { text: string; active: boolean }) {
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (!active || typed >= text.length) return;
    const id = window.setTimeout(() => setTyped((n) => n + 1), 22);
    return () => window.clearTimeout(id);
  }, [active, typed, text]);

  return (
    <>
      <p className="dlg-text">
        {text.slice(0, typed)}
        {/* the unread part stays in the layout, invisible, so the box doesn't grow as it types */}
        <span className="dlg-ghost">{text.slice(typed)}</span>
      </p>
      <span className={`dlg-more ${typed >= text.length ? "is-done" : ""}`} aria-hidden="true" />
    </>
  );
}

/**
 * When the pointer rests on a clickable prop, Elli's sprite slides up from a
 * bottom corner of the screen and says, RPG-style, what the prop holds.
 */
export default function Dialogue({ text, side }: { text: string | null; side: "left" | "right" }) {
  // Remember the last line and side so the box doesn't change while it slides away.
  const [last, setLast] = useState({ text: "", side });
  if (text && (text !== last.text || side !== last.side)) setLast({ text, side });

  const on = text !== null;

  return (
    <div className={`dlg dlg-${last.side} ${on ? "is-on" : ""}`} role="status" aria-live="polite">
      <div className="dlg-sprite" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/diorama/elli.png" alt="" width={20} height={54} />
      </div>
      <div className="dlg-box">
        <span className="dlg-name">ELLI</span>
        <Typewriter key={last.text} text={last.text} active={on} />
      </div>
    </div>
  );
}
