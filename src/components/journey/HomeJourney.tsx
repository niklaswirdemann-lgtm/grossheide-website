"use client";

import { startTransition, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Foto, LightKeyframe, Station } from "@/lib/content/types";
import { decideMode, prefersReducedMotion, readPreference, writePreference } from "@/lib/journey-preference";
import { registerJourneyScroll } from "@/lib/journey-scroll";
import { journeyStore, useJourney } from "@/lib/journey-store";
import { JourneyOverlay } from "./JourneyOverlay";
import { JourneyProgress } from "./JourneyProgress";
import { JourneyToggle, TOGGLE_ID } from "./JourneyToggle";
import { PhotoStage } from "./PhotoStage";
import { SkipButton } from "./SkipButton";
import { StaticHero } from "./StaticHero";

/** Länge des Scrollwegs der Reise. */
const JOURNEY_HEIGHT = "800vh";

interface Props {
  stations: Station[];
  /** Foto je Station aus content/fotos.json (gleiche Reihenfolge wie stations) */
  fotos: (Foto | undefined)[];
  /** Fotos der Collage bei der Ankunft (das erste ist das Startbild) */
  heroFotos: Foto[];
  /** Tageszeit-Keyframes aus content/lighting.json */
  lighting: LightKeyframe[];
  /** Server-gerendertes HTML je Station (gleiche Reihenfolge wie stations) */
  panels: ReactNode[];
  skipLabel: string;
}

/**
 * Startseiten-Bühne. Ohne JavaScript, bei reduzierter Bewegung oder mit der Reise aus
 * zeigt sie den statischen Hero und die Stationen als normale Abschnitte. Sonst liegt
 * die Foto-Bühne in einem hohen Scroll-Container; die gleichen Abschnitte werden
 * zu Panels neben den Fotos.
 */
export function HomeJourney({ stations, fotos, heroFotos, lighting, panels, skipLabel }: Props) {
  const storeMode = useJourney((s) => s.mode);
  // Gezeigter Modus folgt dem Store als Transition: React rendert die Bühne dann in kleinen
  // Stücken, statt den Hauptthread direkt nach dem Laden lange zu blockieren.
  const [mode, setMode] = useState(storeMode);
  useEffect(() => {
    if (storeMode !== mode) startTransition(() => setMode(storeMode));
  }, [storeMode, mode]);
  const reason = useJourney((s) => s.staticReason);
  const wrapper = useRef<HTMLDivElement>(null);
  const focusToggleAfterSwitch = useRef(false);

  // Modus bestimmen (nur im Browser)
  const evaluate = useCallback(() => {
    const preference = readPreference();
    const { reise, reason } = decideMode(preference);
    journeyStore.getState().set({
      preference,
      mode: reise ? "reise" : "static",
      staticReason: reise ? null : reason,
      calmMotion: reise && prefersReducedMotion(),
      // progress nicht zurücksetzen: Nach „Zurück“ ist der Store noch im Reise-Modus,
      // die Scroll-Steuerung hat den Wert schon aus der Position gesetzt
    });
  }, []);

  useEffect(() => {
    evaluate();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => evaluate();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [evaluate]);

  const toggle = useCallback(
    (on: boolean) => {
      writePreference(on ? "on" : "off");
      focusToggleAfterSwitch.current = true;
      evaluate();
    },
    [evaluate],
  );

  // Fokus nach dem Umschalten auf dem Schalter halten (er wechselt den Ort im DOM)
  useEffect(() => {
    if (!focusToggleAfterSwitch.current || mode === "pending") return;
    focusToggleAfterSwitch.current = false;
    requestAnimationFrame(() => document.getElementById(TOGGLE_ID)?.focus({ preventScroll: true }));
  }, [mode]);

  // Scroll-Steuerung: Fortschritt aus der Scroll-Position (ein rAF je Frame), weiches Mausrad über Lenis
  useEffect(() => {
    if (mode !== "reise" || !wrapper.current) return;
    let disposed = false;
    let cleanup = () => {};
    const el = wrapper.current;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const top = el.getBoundingClientRect().top;
      const span = Math.max(1, el.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -top / span));
      if (progress !== journeyStore.getState().progress) journeyStore.getState().set({ progress });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    // Startwert aus der aktuellen Position (nach „Zurück“ stellt der Browser sie wieder her)
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    registerJourneyScroll(null, el);

    (async () => {
      if (journeyStore.getState().calmMotion) return;
      const { default: Lenis } = await import("lenis");
      if (disposed) return;
      const lenis = new Lenis({ autoRaf: true, lerp: 0.09, smoothWheel: true });
      registerJourneyScroll(lenis, el);
      cleanup = () => lenis.destroy();
    })();
    return () => {
      disposed = true;
      cleanup();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      registerJourneyScroll(null, null);
    };
  }, [mode]);

  if (mode !== "reise") {
    // Statische Ansicht (auch Server-Render und „pending“)
    return (
      <div data-journey-mode="static">
        <StaticHero
          fotos={fotos[0] ? heroFotos : []}
          controls={
            mode === "static" ? (
              <div className="gh-hero-toggle">
                <JourneyToggle on={false} reason={reason} onChange={toggle} showReason />
              </div>
            ) : null
          }
        >
          {panels[0]}
        </StaticHero>
        {/* Die übrigen Stationen stehen in der ruhigen Fassung kompakt als Karten auf der Seite (page.tsx, .gh-nur-ruhig) */}
      </div>
    );
  }

  return (
    <div data-journey-mode="reise">
      <div ref={wrapper} className="relative" style={{ height: JOURNEY_HEIGHT }}>
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-kuestenblau-100">
          <PhotoStage stations={stations} fotos={fotos} heroFotos={heroFotos} lighting={lighting} />

          <JourneyOverlay stations={stations} panels={panels} heroPhoto={!!fotos[0]} />

          {/* Oben, damit Skip und Schalter sofort sichtbar sind (die Bühne beginnt unter der Kopfzeile) */}
          <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2 lg:inset-x-auto lg:left-10 lg:top-6 lg:justify-start">
            <div className="pointer-events-auto flex flex-wrap gap-2">
              <SkipButton label={skipLabel} />
              <JourneyToggle on onChange={toggle} variant="overlay" />
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-[calc(56svh+1.25rem)] left-1/2 -translate-x-1/2 lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0">
            <JourneyProgress stations={stations} />
          </div>
        </div>
      </div>
    </div>
  );
}
