"use client";

import type Lenis from "lenis";
import { clamp01 } from "./journey-math";

/**
 * Verbindung zwischen Steuerelementen (Fortschrittsleiste, Skip, Tastatur)
 * und dem Scrollweg der Reise. HomeJourney registriert den Container und (falls aktiv) Lenis.
 */
let lenis: Lenis | null = null;
let container: HTMLElement | null = null;

export function registerJourneyScroll(l: Lenis | null, el: HTMLElement | null) {
  lenis = l;
  container = el;
}

/** Scrollt zu einem Fortschritt (0–1) innerhalb des Reise-Containers. */
export function scrollToProgress(p: number, immediate = false) {
  if (!container) return;
  const top = container.getBoundingClientRect().top + window.scrollY;
  const distance = container.offsetHeight - window.innerHeight;
  const y = top + clamp01(p) * distance;
  if (lenis) lenis.scrollTo(y, { immediate, duration: 1.6 });
  else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}

/** Springt ohne Animation zu einem Element und setzt den Fokus darauf. */
export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  // Ziel selbst berechnen (inkl. scroll-margin); Lenis' Element-Ziel verrechnet sich am sticky Layer.
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const y = el.getBoundingClientRect().top + window.scrollY - margin;
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo({ top: y, behavior: "auto" });
  el.focus({ preventScroll: true });
}
