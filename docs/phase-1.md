# Phase 1: Zusammenfassung

Stand: 16. Oktober 2026, Commit „Phase 1: Setup, Design-Tokens, Layout und alle Unterseiten ohne 3D“.

## Was gebaut wurde

- **Setup:** Next.js 16.4 (App Router, statischer Export nach `out/`), React 19.3, TypeScript strict, Tailwind CSS 4. Alle Versionen exakt gepinnt.
  React bleibt bewusst auf 19.3, weil React Three Fiber 9 (ab Phase 2) nur React `>=19 <19.4` unterstützt. ESLint 9 statt 10, weil `eslint-plugin-react` ESLint 10 noch nicht unterstützt.
- **Design-Tokens** in `src/design/tokens.ts` (Küstenblau, Moorgrün, Sand, Abendlicht plus 3D-Szenenfarben). Die UI nutzt sie als CSS-Variablen, die 3D-Szene importiert dieselbe Datei. `npm run check:contrast` prüft 19 Farbpaare, alle über 4,5:1 (Text) bzw. 3:1 (Fokus).
- **Layout:** Skip-Links („Zum Inhalt“, „Zur Hauptnavigation“), Kopfzeile mit Platzhalter-Logo, Suche, Sprachumschalter (Plattdeutsch als „in Vorbereitung“), Hauptnavigation nach dem Disclosure-Muster (Tab, Enter, Escape, mobil als Menü), Footer mit Adresse, Telefon (tel:), E-Mail (mailto:), Öffnungszeiten, kompletter Navigation und Pflichtlinks.
- **Inhalte als JSON** mit TypeScript-Typen und einem einzigen Loader (`src/lib/content`), damit später Directus oder Strapi nur dort angebunden wird:
  `content/facts.json` (alle harten Fakten mit Quell-URL), Meldungen, Veranstaltungen, 26 Dienstleistungen A–Z, 10 Ortsteile, 8 Stationen, Navigation, UI-Texte Hochdeutsch und Plattdeutsch (Platt als TODO).
- **54 statische Seiten:** Startseite mit allen 8 Stationen als echtem HTML (diese Abschnitte werden in Phase 2 die Panels über der 3D-Szene), Aktuelles mit vier Rubriken, Meldungsseiten und Veranstaltungskalender (immer volles Datum mit Jahr), Rathaus & Service (A–Z, Online-Dienste, Ansprechpartner, Öffnungszeiten, Unsere Gemeinde), Leben & Lernen, Im Notfall, Freizeit & Tourismus, Bauen/Wohnen/Wirtschaft, Ortsteil-Übersicht plus eine Seite je Ortsteil aus einem Template, Kontakt, Impressum, Datenschutz, Erklärung zur Barrierefreiheit (mit Feedback-Kontakt), Leichte Sprache, Suche, eigene 404-Seite.
- **Suche** „Was möchtest du erledigen?“ läuft komplett lokal über einen beim Build erzeugten Index (findet z. B. bei „ausweis“ alle Pass- und Ausweisleistungen).
- **Externe Links** sind mit Symbol und Screenreader-Hinweis gekennzeichnet und öffnen im selben Fenster.
- **Datenschutz:** Schriften liegen lokal (Atkinson Hyperlegible Next, Fraunces, beide OFL), keine externen Dienste, keine Tracker.

## Geprüft

- `npm run typecheck`, `npm run lint` (inkl. jsx-a11y strict, 0 Warnungen) und `npm run build` laufen fehlerfrei, `npm run dev` startet.
- axe-core (WCAG 2.1 A/AA + Best Practices) über alle 54 Seiten: 0 Verstöße, 0 defekte interne Links.
- Tastatur-Stichprobe: Skip-Links, Navigation, Untermenü mit Enter öffnen und Escape schließen, mobiles Menü.

## Offen

- **Fehlende oder widersprüchliche Fakten** (in `content/facts.json` als „TODO: prüfen“ oder `note`): Einwohnerzahl, Fax, Bankverbindung, Aufsichtsbehörde und Inhaltsverantwortliche im Impressum, Träger der Kitas, Trauorte, Kontakt Seniorenbeirat, Unterkunftsverzeichnis, Wanderwege, Gebühren Stellplatz Kieselbucht, Texte je Ortsteil, Ortsgeschichte und Partnerstadt.
  Widersprüche auf grossheide.de: zwei verschiedene Adressen für den Schadensmelder; E-Mail mit und ohne Umlaut-Domain; Durchwahl -326 zugleich für Schulen und Museumsleitung.
- **Rechtstexte** (Impressum, Datenschutz, Barrierefreiheitserklärung) sind als Entwurf markiert und müssen von der Gemeinde geprüft werden.
- **Meldungen und Termine** sind ein Schnappschuss vom 16.10.2026 mit Kurzfassungen; Volltexte verlinken auf die bisherige Seite.
- Plattdeutsch: Struktur steht, Seiten werden erst gebaut, wenn Texte da sind (sonst stimmt `lang="nds"` nicht).
- Vor dem Livegang `noindex` entfernen und den Server laut `docs/hosting.md` einrichten (301 von `/` auf `/de/`, 404-Seite).
- `npm audit` meldet 5 „high“-Hinweise, alle in der Lint-Werkzeugkette (`eslint-config-next` → `fast-glob` → `braces`), nicht in der ausgelieferten Seite.

## So testest du es

```bash
# Quellcode liegt im Projektordner: grossheide-website/
npm install
npm run dev          # http://localhost:3000/de/
# oder wie im Betrieb:
npm run build && npm start   # http://localhost:3000/de/
```

Zum Ausprobieren: nur mit der Tastatur (Tab, Enter, Escape) durch die Seite gehen, auf dem Handy-Format das Menü öffnen, oben „ausweis“ oder „wohnmobil“ suchen, und die gelb markierten „TODO: prüfen“-Stellen ansehen.
Optional: `npm run audit` (braucht `npx playwright install chromium` und einen laufenden `npm start`).
