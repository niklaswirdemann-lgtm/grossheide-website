import localFont from "next/font/local";

// Schriften lokal eingebunden (DSGVO): keine Anfragen an externe Server.
// Lizenzen: src/fonts/LICENSE-*.txt (SIL Open Font License 1.1)
export const bodyFont = localFont({
  src: [{ path: "../fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2", style: "normal", weight: "200 800" }],
  variable: "--font-atkinson",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

// Kursiv wird kaum gebraucht: eigene Schrift ohne Vorladen, damit sie Fotos und Text beim
// ersten Laden keine Bandbreite wegnimmt (genutzt für em/i/cite, siehe globals.css).
export const bodyItalicFont = localFont({
  src: [{ path: "../fonts/atkinson-hyperlegible-next-latin-wght-italic.woff2", style: "italic", weight: "200 800" }],
  variable: "--font-atkinson-italic",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

// Überschriften: Plus Jakarta Sans, eine klare, moderne Grotesk (kräftig und eng gesetzt).
export const displayFont = localFont({
  src: [{ path: "../fonts/plus-jakarta-sans-latin-wght-normal.woff2", style: "normal", weight: "200 800" }],
  variable: "--font-jakarta",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});
