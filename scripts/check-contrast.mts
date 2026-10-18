/**
 * Prüft die Kontraste der verwendeten Text-/Hintergrund-Paare gegen WCAG 2.1 AA
 * (4,5:1 für Text, 3:1 für Fokusindikator und UI-Grenzen).
 * Aufruf: npm run check:contrast
 */
import { color, colorDark, palette, paletteDark } from "../src/design/tokens.ts";

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
      .map((i) =>
        Math.round(c(top, i) * alpha + c(under, i) * (1 - alpha))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
// Dunkle Bühne (.gh-dark-stage): hellste Stelle = Küstenblau-500 mit 55 % über Küstenblau-900
const stageLightest = over(palette.kuestenblau[500], 0.55, palette.kuestenblau[900]);
// Glasflächen im Startbild (Suche 7 %, Pille 8 % Weiß) über der hellsten Stelle der Bühne
const glas = over("#FFFFFF", 0.08, stageLightest);

const strongerRing = (c: Record<keyof typeof color, string>, bg: string) =>
  ratio(c.focus, bg) >= ratio(c.focusInner, bg) ? c.focus : c.focusInner;

/** Paare, die in Hell und Dunkel gleich gelten (dieselben Namen, andere Werte) */
function themePairs(
  name: string,
  c: Record<keyof typeof color, string>,
  ink: { 500: string },
): [string, string, string, number][] {
  const secondaryHover = over(c.link, 0.18, c.brandSoft);
  return [
    ["Text auf Hintergrund", c.text, c.bg, 4.5],
    ["Gedämpfter Text auf Hintergrund", c.textMuted, c.bg, 4.5],
    ["Gedämpfter Text auf bgSubtle", c.textMuted, c.bgSubtle, 4.5],
    ["Text auf Fläche", c.text, c.surface, 4.5],
    ["Gedämpfter Text auf Fläche", c.textMuted, c.surface, 4.5],
    ["Link auf Hintergrund", c.link, c.bg, 4.5],
    ["Link auf Fläche", c.link, c.surface, 4.5],
    ["Link auf brandSoft", c.link, c.brandSoft, 4.5],
    ["Markenschrift auf Fläche", c.brandText, c.surface, 4.5],
    ["Markenschrift auf brandSoft (Zweitknopf)", c.brandText, c.brandSoft, 4.5],
    ["Markenschrift auf Zweitknopf beim Zeigen", c.brandText, secondaryHover, 4.5],
    ["Weiß auf Marke (Knopf)", c.onBrand, c.brand, 4.5],
    ["Weiß auf Marke stark (Kopfleiste)", c.onBrand, c.brandStrong, 4.5],
    ["Weiß auf Moorgrün", c.onBrand, c.accent, 4.5],
    ["Warmer Text auf Hintergrund", c.warmText, c.bg, 4.5],
    ["Warmer Text auf Fläche", c.warmText, c.surface, 4.5],
    ["Text auf warmSoft (Hinweise)", c.text, c.warmSoft, 4.5],
    ["Text auf accentSoft", c.text, c.accentSoft, 4.5],
    ["TODO-Markierung", c.todoText, c.todoBg, 4.5],
    ["Fokusring außen gegen innen", c.focus, c.focusInner, 3],
    // Der Fokusrahmen ist zweifarbig: es reicht, wenn einer der beiden Ringe sich vom Untergrund abhebt
    ["Fokus (stärkerer Ring) auf Hintergrund", strongerRing(c, c.bg), c.bg, 3],
    ["Fokus (stärkerer Ring) auf Fläche", strongerRing(c, c.surface), c.surface, 3],
    ["Rahmen Eingabefeld (ink-500) auf Fläche", ink[500], c.surface, 3],
  ].map(([label, fg, bg, min]) => [`${name}: ${label}`, fg, bg, min] as [string, string, string, number]);
}

const pairs: [string, string, string, number][] = [
  ...themePairs("Hell", color, palette.ink),
  ...themePairs("Dunkel", colorDark, paletteDark.ink),
  ["Sand-100 auf Küstenblau-900 (Fußzeile)", palette.sand[100], palette.kuestenblau[900], 4.5],
  ["Küstenblau-100 auf Küstenblau-900 (Fußzeilen-Links)", palette.kuestenblau[100], palette.kuestenblau[900], 4.5],
  ["Dunkle Bühne: weißer Text (hellste Stelle)", "#FFFFFF", stageLightest, 4.5],
  ["Dunkle Bühne: Küstenblau-100 (hellste Stelle)", palette.kuestenblau[100], stageLightest, 4.5],
  ["Startbild: weißer Text auf Glas", "#FFFFFF", glas, 4.5],
  ["Startbild: Verlauf Abendlicht (#FFE2B8)", "#FFE2B8", stageLightest, 4.5],
  ["Startbild: Verlauf Himmelblau (#A9D0F7)", "#A9D0F7", stageLightest, 4.5],
  ["Startbild: Urhebernennung (70 % Dunkel über Weiß)", "#FFFFFF", over("#0A1218", 0.7, "#FFFFFF"), 4.5],
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
