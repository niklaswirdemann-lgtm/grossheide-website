"use client";

import { useSyncExternalStore } from "react";
import { MOTION_KEY } from "@/lib/motion";

const REDUCE = "(prefers-reduced-motion: reduce)";
/** "on" | "off" | "system" (Gerät reduziert Bewegung: dann gibt es nichts abzuschalten) */
const state = () =>
  window.matchMedia(REDUCE).matches ? "system" : document.documentElement.dataset.motion === "off" ? "off" : "on";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCE);
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  mq.addEventListener("change", onChange);
  return () => {
    obs.disconnect();
    mq.removeEventListener("change", onChange);
  };
}

/**
 * Schalter „Bewegung“ in der Kopfleiste: hält alle Effekte an (Laufband, Lichter, schwebende
 * Fotos, Zähler), WCAG 2.2.2. Die Wahl wird gespeichert und gilt vor dem ersten Zeichnen.
 * Meldet das Gerät „Bewegung reduzieren“, steht ohnehin alles still und der Schalter (samt
 * Listenpunkt) entfällt.
 */
export function MotionToggle({ label, lang }: { label: string; lang?: string }) {
  const s = useSyncExternalStore(subscribe, state, () => "on");
  if (s === "system") return null;
  const on = s === "on";
  const toggle = () => {
    const root = document.documentElement;
    try {
      if (on) localStorage.setItem(MOTION_KEY, "off");
      else localStorage.removeItem(MOTION_KEY);
    } catch {}
    if (on) root.dataset.motion = "off";
    else delete root.dataset.motion;
  };
  return (
    <li lang={lang}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={toggle}
        className="gh-theme-toggle inline-flex min-h-6 items-center gap-2 rounded-full text-sm font-bold"
      >
        <span aria-hidden="true" className="gh-theme-icon">
          <svg viewBox="0 0 20 20" width="16" height="16">
            {on ? (
              <path fill="currentColor" d="M5 6h3v8H5V6Zm7 0h3v8h-3V6Z" />
            ) : (
              <path fill="currentColor" d="M6 4.5v11l9-5.5-9-5.5Z" />
            )}
          </svg>
        </span>
        {/* auf dem Handy nur das Symbol, der Name bleibt für Screenreader */}
        <span className="max-sm:sr-only">{label}</span>
      </button>
    </li>
  );
}
