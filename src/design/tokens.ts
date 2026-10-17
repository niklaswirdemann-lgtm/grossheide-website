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
    50: "#EEF5FA",
    100: "#DCEAF4",
    300: "#8DB9D9",
    500: "#3C7FB0",
    700: "#1D5784",
    900: "#0C2D47",
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
  ink: {
    900: "#15222C",
    700: "#3A4A55",
    500: "#5E6E79",
  },
  white: "#FFFFFF",
} as const;

/** Semantische Farben: Diese Namen verwenden Komponenten, nie die Rohpalette. */
export const color = {
  bg: palette.sand[50],
  bgSubtle: palette.sand[100],
  surface: palette.white,
  text: palette.ink[900],
  textMuted: palette.ink[700],
  border: palette.sand[300],
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
  sm: "0.375rem",
  md: "0.75rem",
  lg: "1.25rem",
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
