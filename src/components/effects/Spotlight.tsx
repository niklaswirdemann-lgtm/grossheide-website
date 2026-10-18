"use client";

import { useEffect } from "react";
import { bewegungErlaubt } from "@/lib/motion";

/**
 * Lichtschein unter dem Mauszeiger auf Karten mit `.gh-spot`: setzt nur CSS-Variablen an der
 * Karte (--mx/--my in px für das Licht, --sx/--sy von −0,5 bis 0,5 für das leichte Kippen von
 * `.gh-tilt`), gezeichnet wird in globals.css. Nur bei Maus und erlaubter Bewegung.
 */
export function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    let prev: HTMLElement | null = null;
    const reset = (el: HTMLElement | null) => {
      el?.style.setProperty("--sx", "0");
      el?.style.setProperty("--sy", "0");
    };
    const paint = () => {
      frame = 0;
      const target = last?.target;
      const el = target instanceof Element ? target.closest<HTMLElement>(".gh-spot") : null;
      if (el !== prev) reset(prev);
      prev = el;
      if (!el || !last || !bewegungErlaubt()) return reset(el);
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${last.clientX - r.left}px`);
      el.style.setProperty("--my", `${last.clientY - r.top}px`);
      el.style.setProperty("--sx", ((last.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty("--sy", ((last.clientY - r.top) / r.height - 0.5).toFixed(3));
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
