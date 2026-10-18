/** Speicherplatz für den Schalter „Bewegung“ in der Kopfleiste (nur „off“ wird gespeichert). */
export const MOTION_KEY = "gh-bewegung";

/**
 * Darf sich etwas bewegen? Nein, wenn das Gerät „Bewegung reduzieren“ meldet oder jemand
 * im Kopf „Bewegung“ ausgeschaltet hat (`data-motion="off"` am html-Element).
 */
export function bewegungErlaubt(): boolean {
  return (
    document.documentElement.dataset.motion !== "off" && window.matchMedia("(prefers-reduced-motion: no-preference)").matches
  );
}
