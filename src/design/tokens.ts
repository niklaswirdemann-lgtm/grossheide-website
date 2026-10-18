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
  /** Markenfarbe: tiefes Smaragdgrün (Moor, Wald) */
  smaragd: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    300: "#6EE7B7",
    500: "#10B981",
    700: "#047857",
    900: "#052E26",
    950: "#021A15",
  },
  /** Leuchtender Akzent, nur auf dunklen Flächen oder mit dunkler Schrift */
  limette: {
    200: "#D9F99D",
    300: "#BEF264",
    500: "#84CC16",
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
  /** Grautöne mit einem Hauch Grün für Flächen und Linien */
  nebel: {
    50: "#F4F8F6",
    100: "#E9F1ED",
    200: "#DAE5DF",
    300: "#C0D0C7",
  },
  ink: {
    900: "#0A1C16",
    700: "#33473F",
    500: "#56685F",
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
  brand: palette.smaragd[700],
  brandStrong: palette.smaragd[900],
  brandSoft: palette.smaragd[50],
  accent: palette.moorgruen[700],
  accentSoft: palette.moorgruen[50],
  warm: palette.abendlicht[500],
  warmText: palette.abendlicht[700],
  warmSoft: palette.abendlicht[100],
  /** Kräftige Markenschrift (Daten, aktive Navigation); im Dunkelmodus hell */
  brandText: palette.smaragd[900],
  link: palette.smaragd[700],
  linkHover: palette.smaragd[900],
  focus: palette.abendlicht[500],
  focusInner: palette.smaragd[950],
  onBrand: palette.white,
  todoBg: "#FFF3BF",
  todoText: "#5C4400",
} as const;

/**
 * Dunkelmodus: dieselben Namen, andere Werte. Flächen tiefgrün statt schwarz, Schrift hell;
 * `brand` bleibt ein Grün, auf dem weiße Schrift AA erreicht, Links werden mintgrün.
 */
export const colorDark: Record<keyof typeof color, string> = {
  bg: "#06120E",
  bgSubtle: "#0A1A15",
  surface: "#0F231C",
  text: "#E6F4EE",
  textMuted: "#A2BBB0",
  border: "#1F3D32",
  brand: palette.smaragd[700],
  brandStrong: "#021510",
  brandSoft: "#0D3328",
  accent: palette.moorgruen[700],
  accentSoft: "#13291C",
  warm: palette.abendlicht[500],
  warmText: "#F3BC6B",
  warmSoft: "#3B2A12",
  brandText: "#C8F7E1",
  link: palette.smaragd[300],
  linkHover: "#A7F3D0",
  focus: palette.abendlicht[500],
  focusInner: "#021510",
  onBrand: palette.white,
  todoBg: "#FFF3BF",
  todoText: "#5C4400",
};

/** Graustufen kehren sich im Dunkelmodus um (Flächen, Linien, Schrift) */
export const paletteDark = {
  nebel: { 50: "#0A1A15", 100: "#10261F", 200: "#19352B", 300: "#28493D" },
  ink: { 900: "#E6F4EE", 700: "#A2BBB0", 500: "#7A968B" },
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
    `--gh-schatten:6 30 24`,
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

/**
 * Setzt die gespeicherte Wahl vor dem ersten Zeichnen (kein Aufblitzen im falschen Modus),
 * ebenso „Bewegung aus“ (`gh-bewegung`, siehe src/lib/motion.ts).
 */
export const themeScript =
  'try{var d=document.documentElement,t=localStorage.getItem("gh-farbmodus");if(t==="dark"||t==="light")d.dataset.theme=t;' +
  'if(localStorage.getItem("gh-bewegung")==="off")d.dataset.motion="off"}catch(e){}';
