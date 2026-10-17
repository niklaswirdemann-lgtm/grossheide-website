/**
 * Prüft die Kontraste der verwendeten Text-/Hintergrund-Paare gegen WCAG 2.1 AA
 * (4,5:1 für Text, 3:1 für Fokusindikator und UI-Grenzen).
 * Aufruf: npm run check:contrast
 */
import { color, palette } from "../src/design/tokens.ts";

function lum(hex: string): number {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a: string, b: string): number {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Fläche mit Deckkraft `alpha` über `under` gemischt (Panels über der Foto-Bühne). */
function over(top: string, alpha: number, under: string): string {
  const c = (h: string, i: number) => parseInt(h.replace("#", "").slice(i, i + 2), 16);
  return (
    "#" +
    [0, 2, 4]
      .map((i) => Math.round(c(top, i) * alpha + c(under, i) * (1 - alpha)).toString(16).padStart(2, "0"))
      .join("")
  );
}
// Schlimmster Fall: Panel (bg-surface/95) über Schwarz. Die Szene ist nie dunkler.
const panelWorst = over(color.surface, 0.95, "#000000");
// Startbild: heller Text auf dem Foto, darunter mindestens 65 % Verlauf (.gh-hero-shade); schlimmster Fall: weißes Foto
const heroWorst = over("#0A1218", 0.65, "#FFFFFF");
const creditWorst = over("#0A1218", 0.7, "#FFFFFF");

const pairs: [string, string, string, number][] = [
  ["Text auf Hintergrund", color.text, color.bg, 4.5],
  ["Gedämpfter Text auf Hintergrund", color.textMuted, color.bg, 4.5],
  ["Gedämpfter Text auf Sand-100", color.textMuted, color.bgSubtle, 4.5],
  ["Text auf Fläche", color.text, color.surface, 4.5],
  ["Link auf Hintergrund", color.link, color.bg, 4.5],
  ["Link auf Fläche", color.link, color.surface, 4.5],
  ["Link auf Küstenblau-50", color.link, color.brandSoft, 4.5],
  ["Weiß auf Marke", color.onBrand, color.brand, 4.5],
  ["Weiß auf Marke stark", color.onBrand, color.brandStrong, 4.5],
  ["Weiß auf Moorgrün", color.onBrand, color.accent, 4.5],
  ["Warmer Text auf Hintergrund", color.warmText, color.bg, 4.5],
  ["Text auf Abendlicht-100", color.text, color.warmSoft, 4.5],
  ["Text auf Moorgrün-50", color.text, color.accentSoft, 4.5],
  ["TODO-Markierung", color.todoText, color.todoBg, 4.5],
  ["Sand-100 auf Küstenblau-900 (Footer)", palette.sand[100], palette.kuestenblau[900], 4.5],
  ["Küstenblau-100 auf Küstenblau-900 (Footer-Links)", palette.kuestenblau[100], palette.kuestenblau[900], 4.5],
  ["Fokusring außen (Abendlicht) gegen Fokusring innen", color.focus, color.focusInner, 3],
  ["Fokus innen auf Hintergrund", color.focusInner, color.bg, 3],
  ["Rahmen Eingabefeld (ink-500) auf Fläche", palette.ink[500], color.surface, 3],
  ["Reise-Panel: Text (Panel 95 % über Schwarz)", color.text, panelWorst, 4.5],
  ["Reise-Panel: gedämpfter Text (Panel 95 % über Schwarz)", color.textMuted, panelWorst, 4.5],
  ["Reise-Panel: Link (Panel 95 % über Schwarz)", color.link, panelWorst, 4.5],
  ["Reise-Panel: warmer Text (Panel 95 % über Schwarz)", color.warmText, panelWorst, 4.5],
  ["Startbild: weißer Text (65 % Verlauf über Weiß)", "#FFFFFF", heroWorst, 4.5],
  ["Startbild: Stationsname (65 % Verlauf über Weiß)", "#FFEBCC", heroWorst, 4.5],
  ["Startbild: Urhebernennung (70 % über Weiß)", "#FFFFFF", creditWorst, 4.5],
];

let failed = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} ${r.toFixed(2).padStart(5)}:1 (min ${min}) ${label}`);
}
if (failed) {
  console.error(`\n${failed} Paar(e) unter dem Mindestkontrast.`);
  process.exit(1);
}
