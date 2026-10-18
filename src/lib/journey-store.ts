"use client";

import { createStore, useStore } from "zustand";

/**
 * Gemeinsamer Zustand der Foto-Reise: Bühne, Panels und Steuerung lesen hier
 * mit. Der Scroll-Fortschritt wird per subscribe gelesen, nicht über React-Renders.
 */

export type JourneyMode = "pending" | "reise" | "static";
export type StaticReason = "user" | "reduced-motion" | "save-data" | "default" | null;
export type Preference = "auto" | "on" | "off";

export interface JourneyState {
  mode: JourneyMode;
  staticReason: StaticReason;
  preference: Preference;
  /** Scroll-Fortschritt 0–1 */
  progress: number;
  activeIndex: number;
  /**
   * Bewegung reduzieren (Systemeinstellung), auch wenn die Reise bewusst eingeschaltet
   * ist: Fotos blenden dann nur über, ohne Zoom und Flug.
   */
  calmMotion: boolean;
  set: (partial: Partial<JourneyState>) => void;
}

export const journeyStore = createStore<JourneyState>((set) => ({
  mode: "pending",
  staticReason: null,
  preference: "auto",
  progress: 0,
  activeIndex: 0,
  calmMotion: false,
  set: (partial) => set(partial),
}));

export function useJourney<T>(selector: (s: JourneyState) => T): T {
  return useStore(journeyStore, selector);
}
