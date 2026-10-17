/**
 * Design-Tokens der Gemeinde-Website Großheide.
 *
 * Einzige Quelle für Farben, Radien, Abstände und Bewegung. Die UI nutzt die
 * Tokens als CSS-Variablen (siehe `cssVariables` → Root-Layout, Tailwind-Theme
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
  link: palette.kuestenblau[700],
  linkHover: palette.kuestenblau[900],
  focus: palette.abendlicht[500],
  focusInner: palette.kuestenblau[900],
  onBrand: palette.white,
  todoBg: "#FFF3BF",
  todoText: "#5C4400",
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

/** CSS-Variablen für das Root-Element (`--gh-…`). */
export const cssVariables: Record<string, string> = (() => {
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(color)) vars[`--gh-${kebab(name)}`] = value;
  for (const [group, shades] of Object.entries(palette)) {
    if (typeof shades === "string") continue;
    for (const [shade, value] of Object.entries(shades)) vars[`--gh-${group}-${shade}`] = value;
  }
  for (const [name, value] of Object.entries(radius)) vars[`--gh-radius-${name}`] = value;
  vars["--gh-ease"] = motion.easing;
  vars["--gh-content-max"] = layout.contentMax;
  vars["--gh-prose-max"] = layout.proseMax;
  return vars;
})();
