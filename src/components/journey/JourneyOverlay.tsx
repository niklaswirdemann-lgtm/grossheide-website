"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type { Station } from "@/lib/content/types";
import { activeStationIndex, panelOpacity, panelSide, stationCenter } from "@/lib/journey-math";
import { scrollToProgress } from "@/lib/journey-scroll";
import { journeyStore } from "@/lib/journey-store";

/**
 * HTML-Panels über der Foto-Bühne, synchron zum Scroll-Fortschritt.
 * Alle Panels stehen in der richtigen Reihenfolge im DOM und bleiben
 * fokussierbar; Tab in ein Panel scrollt zur Station.
 * Deckkraft und Versatz werden direkt am Element gesetzt (keine React-Renders pro Frame).
 */
export function JourneyOverlay({
  stations,
  panels,
  heroPhoto,
}: {
  stations: Station[];
  panels: ReactNode[];
  /** Startbild vorhanden: erstes Panel als weißer Text direkt auf dem Foto, sonst als Karte wie die übrigen */
  heroPhoto: boolean;
}) {
  const ranges = useMemo(() => stations.map((s) => s.scrollBereich), [stations]);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  // Zuletzt per Tastatur fokussiertes Panel: bleibt während der Fahrt dorthin sichtbar.
  const focusBoost = useRef<{ index: number; until: number }>({ index: -1, until: 0 });

  useEffect(() => {
    const apply = (p: number) => {
      refs.current.forEach((el, i) => {
        if (!el) return;
        const boosted =
          focusBoost.current.index === i && performance.now() < focusBoost.current.until && el.contains(document.activeElement);
        const o = boosted ? 1 : panelOpacity(ranges, i, p);
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${(1 - o) * 18}px, 0)`;
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
        el.dataset.visible = o > 0.5 ? "true" : "false";
      });
      const idx = activeStationIndex(ranges, p);
      if (journeyStore.getState().activeIndex !== idx) journeyStore.getState().set({ activeIndex: idx });
    };
    apply(journeyStore.getState().progress);
    return journeyStore.subscribe((s, prev) => {
      if (s.progress !== prev.progress) apply(s.progress);
    });
  }, [ranges]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // Tastatur: Fokus in einem (noch unsichtbaren) Panel → zur Station scrollen.
    const onFocus = (e: FocusEvent) => {
      const panel = (e.target as HTMLElement).closest<HTMLElement>("[data-panel-index]");
      if (!panel) return;
      const i = Number(panel.dataset.panelIndex);
      if (journeyStore.getState().activeIndex !== i || panel.dataset.visible !== "true") {
        focusBoost.current = { index: i, until: performance.now() + 2200 };
        // andere Panels sofort ausblenden, dieses sofort zeigen
        refs.current.forEach((p, k) => {
          if (!p) return;
          p.style.opacity = k === i ? "1" : "0";
          p.style.pointerEvents = k === i ? "auto" : "none";
        });
        scrollToProgress(stationCenter(ranges, i), journeyStore.getState().calmMotion);
      }
    };
    el.addEventListener("focusin", onFocus);
    return () => el.removeEventListener("focusin", onFocus);
  }, [ranges]);

  return (
    <div ref={root} className="gh-overlay pointer-events-none absolute inset-0">
      {stations.map((s, i) => {
        const side = panelSide(i);
        const first = i === 0;
        const onPhoto = first && heroPhoto;
        return (
          <div
            key={s.id}
            className={`absolute inset-x-3 bottom-3 lg:inset-x-auto lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 ${
              side === "left" ? "lg:left-10" : "lg:right-24"
            } ${first ? "lg:w-[38rem]" : "lg:w-[30rem]"}`}
          >
            <div
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-panel-index={i}
              className={`gh-panel max-h-[56svh] overflow-y-auto will-change-[opacity,transform] lg:max-h-[78svh] ${
                onPhoto
                  ? "gh-hero-text px-2 pb-6 sm:px-4"
                  : "rounded-lg bg-surface/95 p-5 shadow-2xl ring-1 ring-border backdrop-blur-md sm:p-7"
              }`}
              style={{ opacity: first ? 1 : 0 }}
            >
              {panels[i]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
