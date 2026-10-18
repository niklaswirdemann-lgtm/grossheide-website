"use client";

import type { Preference, StaticReason } from "./journey-store";

const STORAGE_KEY = "gh-bewegte-reise";

/** Gespeicherte Nutzerentscheidung lesen (localStorage kann blockiert sein). */
export function readPreference(): Preference {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "on" || v === "off" ? v : "auto";
  } catch {
    return "auto";
  }
}

export function writePreference(value: Preference): void {
  try {
    if (value === "auto") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Speichern nicht möglich (z. B. privater Modus) – Einstellung gilt nur für diesen Besuch.
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function saveData(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return nav.connection?.saveData === true;
}

/**
 * Entscheidet, ob die bewegte Foto-Reise läuft. Sie ist ein Angebot: Ohne ausdrückliches
 * Einschalten zeigt die Startseite die kompakte Fassung (seit 17.10.2026, auf Wunsch kürzer).
 */
export function decideMode(preference: Preference): {
  reise: boolean;
  reason: StaticReason;
} {
  if (preference === "off") return { reise: false, reason: "user" };
  if (preference === "auto") {
    if (prefersReducedMotion()) return { reise: false, reason: "reduced-motion" };
    if (saveData()) return { reise: false, reason: "save-data" };
    return { reise: false, reason: "default" };
  }
  return { reise: true, reason: null };
}
