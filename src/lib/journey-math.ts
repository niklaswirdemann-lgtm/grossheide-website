/**
 * Reine Rechenfunktionen der Foto-Reise, damit Bühne und Panels identisch rechnen.
 *
 * Begriffe:
 *  p = Scroll-Fortschritt 0–1 über den ganzen Reise-Container
 *  t = Position auf dem Reiseweg (0 = Station 1, 1 = Station N);
 *      Station i liegt exakt bei t = i / (N − 1).
 */

export type Range = readonly [number, number];

/** Anteil des Scroll-Bereichs, in dem das Foto der Station stillsteht (Mitte). */
export const HOLD_FRACTION = 0.44;
/** Anteil des Scroll-Bereichs, in dem das Panel ein- bzw. ausblendet (je Seite). */
export const PANEL_FADE_FRACTION = 0.14;

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function smoothstep(x: number): number {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
}

/** Haltezone einer Station im Scrollweg. Erste Station hält ab 0, letzte bis 1. */
export function holdZone(ranges: readonly Range[], i: number): Range {
  const [s, e] = ranges[i];
  const pad = ((e - s) * (1 - HOLD_FRACTION)) / 2;
  const start = i === 0 ? 0 : s + pad;
  const end = i === ranges.length - 1 ? 1 : e - pad;
  return [start, end];
}

/** Scroll-Fortschritt → Position auf dem Reiseweg, mit Haltezonen und weichem Übergang dazwischen. */
export function progressToT(ranges: readonly Range[], p: number): number {
  const n = ranges.length;
  if (n < 2) return 0;
  const step = 1 / (n - 1);
  for (let i = 0; i < n; i++) {
    const [h0, h1] = holdZone(ranges, i);
    if (p <= h1) {
      if (p >= h0 || i === 0) return i * step;
      // zwischen Haltezone i−1 und i
      const prevEnd = holdZone(ranges, i - 1)[1];
      const local = (p - prevEnd) / (h0 - prevEnd);
      return (i - 1 + smoothstep(local)) * step;
    }
  }
  return 1;
}

/** Sichtbarkeit (0–1) des Panels einer Station beim Fortschritt p. */
export function panelOpacity(ranges: readonly Range[], i: number, p: number): number {
  const [s, e] = ranges[i];
  const f = (e - s) * PANEL_FADE_FRACTION;
  const last = i === ranges.length - 1;
  const fadeIn = i === 0 ? 1 : smoothstep((p - s) / f);
  const fadeOut = last ? 1 : smoothstep((e - p) / f);
  return Math.min(fadeIn, fadeOut);
}

/** Fortschritt, bei dem die Station am besten zu sehen ist (Mitte der Haltezone). */
export function stationCenter(ranges: readonly Range[], i: number): number {
  if (i === 0) return 0;
  const [h0, h1] = holdZone(ranges, i);
  return (h0 + h1) / 2;
}

/** Index der Station, deren Scroll-Bereich p enthält. */
export function activeStationIndex(ranges: readonly Range[], p: number): number {
  for (let i = 0; i < ranges.length; i++) if (p < ranges[i][1]) return i;
  return ranges.length - 1;
}

/** Seite des Panels: abwechselnd links und rechts, das Foto steht gegenüber. */
export function panelSide(i: number): "left" | "right" {
  return i % 2 === 0 ? "left" : "right";
}
