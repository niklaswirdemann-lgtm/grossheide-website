"use client";

import { useEffect } from "react";

/**
 * Lichtschein unter dem Mauszeiger auf Karten mit `.gh-spot`: setzt nur zwei CSS-Variablen
 * (--mx, --my) an der Karte, gezeichnet wird in globals.css. Nur bei Maus und erlaubter Bewegung.
 */
export function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      const target = last?.target;
      const el = target instanceof Element ? target.closest<HTMLElement>(".gh-spot") : null;
      if (!el || !last) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${last.clientX - r.left}px`);
      el.style.setProperty("--my", `${last.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
