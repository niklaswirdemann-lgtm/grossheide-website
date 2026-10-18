/**
 * Design-Tokens der Gemeinde-Website Großheide.
 *
 * Einzige Quelle für Farben, Radien, Abstände und Bewegung. Die UI nutzt die
 * Tokens als CSS-Variablen (siehe `themeCss` → Root-Layout, Tailwind-Theme
 * in globals.css).
 *
 * Kontraste werden mit `npm run check:contrast` geprüft (WCAG 2.1 AA).
 */

export const palette = {
  kuestenblau: {
    50: "#EEF4FB",
    100: "#DCE8F6",
    300: "#93B8E3",
    500: "#2F74C0",
    700: "#15569C",
    900: "#0A2540",
  },
  moorgruen: {
    50: "#EFF4EC",
    100: "#DDE8D7",
    300: "#9DBB8E",
    500: "#5A8549",
    700: "#33582F",
    900: "#1B3220",
  },
  sand: {
    50: "#FBF8F1",
    100: "#F4ECDC",
    300: "#E3D3B2",
    500: "#C2A673",
    700: "#7D643A",
  },
  abendlicht: {
    100: "#FDEBCB",
    300: "#F6C979",
    500: "#E8A33D",
    700: "#A0570F",
    900: "#6B3608",
  },
  /** Kühle Grautöne für Flächen und Linien (moderne, helle Grundfläche) */
  nebel: {
    50: "#F6F8FB",
    100: "#EDF1F6",
    200: "#E1E7EF",
    300: "#C9D3DE",
  },
  ink: {
    900: "#0F1B26",
    700: "#3B4856",
    500: "#5B6876",
  },
  white: "#FFFFFF",
} as const;

/** Semantische Farben: Diese Namen verwenden Komponenten, nie die Rohpalette. */
export const color = {
  bg: palette.nebel[50],
  bgSubtle: palette.nebel[100],
  surface: palette.white,
  text: palette.ink[900],
  textMuted: palette.ink[700],
  border: palette.nebel[200],
  brand: palette.kuestenblau[700],
  brandStrong: palette.kuestenblau[900],
  brandSoft: palette.kuestenblau[50],
  accent: palette.moorgruen[700],
  accentSoft: palette.moorgruen[50],
  warm: palette.abendlicht[500],
  warmText: palette.abendlicht[700],
  warmSoft: palette.abendlicht[100],
  /** Kräftige Markenschrift (Daten, aktive Navigation); im Dunkelmodus hell */
  brandText: palette.kuestenblau[900],
  link: palette.kuestenblau[700],
  linkHover: palette.kuestenblau[900],
  focus: palette.abendlicht[500],
  focusInner: palette.kuestenblau[900],
  onBrand: palette.white,
  todoBg: "#FFF3BF",
  todoText: "#5C4400",
} as const;

/**
 * Dunkelmodus: dieselben Namen, andere Werte. Flächen dunkel-blau statt schwarz, Schrift
 * hell; `brand` bleibt ein Blau, auf dem weiße Schrift AA erreicht, Links werden hell.
 */
export const colorDark: Record<keyof typeof color, string> = {
  bg: "#0B1520",
  bgSubtle: "#0F1C2A",
  surface: "#132436",
  text: "#EAF0F6",
  textMuted: "#A9B8C8",
  border: "#243951",
  brand: "#2D6DBD",
  brandStrong: "#06101B",
  brandSoft: "#17304C",
  accent: palette.moorgruen[700],
  accentSoft: "#16291C",
  warm: palette.abendlicht[500],
  warmText: "#F3BC6B",
  warmSoft: "#3B2A12",
  brandText: "#CFE2F8",
  link: "#8EC1F5",
  linkHover: "#C2DEFB",
  focus: palette.abendlicht[500],
  focusInner: "#06101B",
  onBrand: palette.white,
  todoBg: "#FFF3BF",
  todoText: "#5C4400",
};

/** Graustufen kehren sich im Dunkelmodus um (Flächen, Linien, Schrift) */
export const paletteDark = {
  nebel: { 50: "#0F1C2A", 100: "#162839", 200: "#1F3349", 300: "#2F4762" },
  ink: { 900: "#EAF0F6", 700: "#A9B8C8", 500: "#7F92A7" },
} as const;

export const radius = {
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  pill: "999px",
} as const;

export const motion = {
  /** Dauer kurzer UI-Übergänge in ms. */
  fast: 150,
  base: 250,
  slow: 600,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const layout = {
  contentMax: "72rem",
  proseMax: "42rem",
} as const;

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function colorVars(c: Record<string, string>, p: Record<string, string | Record<string, string>>): string[] {
  const out = Object.entries(c).map(([name, value]) => `--gh-${kebab(name)}:${value}`);
  for (const [group, shades] of Object.entries(p)) {
    if (typeof shades === "string") continue;
    for (const [shade, value] of Object.entries(shades)) out.push(`--gh-${group}-${shade}:${value}`);
  }
  return out;
}

/**
 * Stylesheet mit allen Tokens als CSS-Variablen (`--gh-…`), im Root-Layout eingebunden.
 * Hell ist Standard; dunkel folgt der Systemeinstellung, außer jemand hat im Kopf selbst
 * gewählt (`data-theme` am html-Element, gespeichert unter `gh-farbmodus`).
 */
export const themeCss: string = (() => {
  const base = colorVars(color, palette);
  for (const [name, value] of Object.entries(radius)) base.push(`--gh-radius-${name}:${value}`);
  // Farbe der Schatten (RGB-Kanäle); im Dunkeln schwarz
  base.push(
    `--gh-schatten:15 27 38`,
    `--gh-ease:${motion.easing}`,
    `--gh-content-max:${layout.contentMax}`,
    `--gh-prose-max:${layout.proseMax}`,
  );
  const dark = [...colorVars(colorDark, paletteDark), "--gh-schatten:0 0 0", "color-scheme:dark"].join(";");
  return (
    `:root{${base.join(";")};color-scheme:light}` +
    `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${dark}}}` +
    `:root[data-theme="dark"]{${dark}}`
  );
})();

/** Setzt die gespeicherte Wahl vor dem ersten Zeichnen (kein Aufblitzen im falschen Modus). */
export const themeScript =
  'try{var t=localStorage.getItem("gh-farbmodus");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}';
