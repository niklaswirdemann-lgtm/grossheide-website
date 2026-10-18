# Gemeinde Großheide – neue Website

Ersatz für www.grossheide.de (Gemeinde Großheide, Ostfriesland, Landkreis Aurich).
Vision: Eine moderne, schnelle, barrierefreie Gemeinde-Website mit Hell- und Dunkelmodus. Startseite (seit 18.10.2026):
großes Foto-Startbild mit Suche, „Häufig gesucht“, „Unsere Bereiche“ als Karten, Zahlen, Fotogalerie, Meldungen, mit
dezenten Effekten. Die bewegte Foto-Reise ist auf Wunsch des Chefs ganz entfernt (Git-Historie bis 9495456).

## Oberste Regel
BITV 2.0 / WCAG 2.1 AA, in Hell und Dunkel. Effekte sind Schmuck, nie Träger von Inhalt; bei „Bewegung reduzieren“
steht alles still. Jede Information ist über die normale Navigation in höchstens 2 Klicks erreichbar. Im Zweifel
gewinnt Barrierefreiheit.

## Stack
- Next.js 16.4 (App Router, Turbopack, `output: "export"`, `trailingSlash: true`), React 19.3, TypeScript 5.9 strict
- Tailwind CSS 4 (Tokens als CSS-Variablen, siehe unten)
- Keine Animationsbibliothek: Effekte sind CSS (Scroll-Animationen, View Transitions) plus kleine Client-Komponenten in
  `src/components/effects/`. 3D-Szene (bis 4d348ea) und Foto-Reise (bis 9495456) stehen nur noch in der Git-Historie.
- Keine externen Dienste zur Laufzeit: Schriften lokal (`src/fonts`, OFL), keine Tracker, keine Google-Dienste, kein CDN.
- Next 16 weicht von älterem Wissen ab: vor API-Nutzung `node_modules/next/dist/docs/` lesen (siehe AGENTS.md).

## Befehle
| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver (http://localhost:3000/de/) |
| `npm run build` | Statischer Export nach `out/` + eigene `out/404.html` |
| `npm start` | `out/` lokal ausliefern (http://localhost:3000) |
| `npm run lint` | ESLint inkl. jsx-a11y (strict), 0 Warnungen erlaubt |
| `npm run typecheck` | Routentypen erzeugen + `tsc --noEmit` |
| `npm run check:contrast` | Kontraste der Design-Tokens gegen WCAG AA |
| `npm run audit` | axe-core (WCAG 2.1 A/AA) + interne Links auf allen Seiten, hell und dunkel; braucht laufenden `npm start` (`AUDIT_BASE` setzen, falls anderer Port) und `npx playwright install chromium` |
| `npm run check` | Kontrast, Typecheck, Lint, Build |
| `npm run check:chat` | Chat-Widget und Plattdeutsch-Rahmen im Browser (Dialog mit axe, Tastatur, Antworten der Probe-Version, keine fremden Anfragen, 390 px, `lang`-Attribute); braucht laufenden Server (`CHAT_BASE`) |
| `npm run check:a11y` | Alle Seiten: Tastatur (Sprunglink, Fokusrahmen sichtbar und nicht verdeckt, Reihenfolge), reduzierte Bewegung, Umbruch bei 320/640 px, Textabstände nach WCAG 1.4.12; braucht laufenden Server (`A11Y_BASE`), dauert lange |
| `npm run check:lighthouse` | Lighthouse (Handy + Desktop) auf 9 Seiten, Grenzen Leistung ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 90; braucht laufenden Server (`LH_BASE`) und `CHROME_PATH`; Berichte nach `lighthouse-reports/` |
| `npm run check:theme` | Hell/Dunkel im Browser (folgt dem System, Schalter mit Maus und Tastatur, Speicherung ohne Aufblitzen), keine Reise mehr, Zähler, reduzierte Bewegung, 390 px dunkel; braucht laufenden Server (`THEME_BASE`) |
| `npm run check:mobile` | Alle Seiten bei 390 px (kein Querscrollen, Tippflächen ≥ 24 px, Eingabefelder ≥ 16 px), Startseite ohne JavaScript, Ladezeit gedrosselt (LCP, CLS, TBT, Median aus 3 Läufen); braucht laufenden Server (`MOBILE_BASE`) |

Öffentliche Vorschau: `VORSCHAU=1 BASE_PATH=/<repository> npm run build` (ohne ungeklärte Fotos, mit Hinweis-Streifen,
Unterordner für GitHub Pages; Workflow `.github/workflows/vorschau.yml`, Details in docs/hosting.md). Pfade außerhalb von
`next/link` immer über `withBase()` aus `src/lib/links.ts`. Fotos und die Historie dieses Repositorys nie in ein
öffentliches Repository.

Eine Phase ist fertig, wenn `npm run build` und `npm run lint` fehlerfrei laufen und die Seite lokal startet.

## Struktur
- `content/facts.json` – alle harten Fakten mit Quell-URL. Unbelegtes = `"TODO: prüfen"` mit `source: null`. **Nichts erfinden.**
- `content/stations.json` – einzige Quelle der 8 Stationen (Texte, Links, Farbe, Scroll-Bereich), siehe unten.
- `content/fotos.json` – Fotos mit Alt-Text, Urheber, Herkunft, Rechte-Status; `station`/`ortsteil`/`seite` sagt, wo es erscheint.
- `content/de/*.json` – Meldungen, Termine, Leistungen A–Z, Ortsteile, Navigation, UI-Texte
- `content/nds/ui.json` – Plattdeutsch (Rahmen: Kopf, Menü, Fußzeile), fehlende Texte = `"TODO: Plattdeutsch"` → Fallback Hochdeutsch
- `content/nds/navigation.json` – Platt-Beschriftungen je href; fehlende bleiben Hochdeutsch mit `lang="de"`
- `content/de/chat.json` – Texte, Vorschläge und Muster des Chat-Widgets (Probe-Version)
- `src/lib/content/` – Typen + Loader. Einziger Ort, der `/content` liest (später Directus/Strapi hier anbinden).
- `src/lib/i18n.ts` – Sprachen `de`/`nds`, beide gebaut (`enabledLocales`). `contentLocales` = Sprachen, in denen die
  Seiteninhalte vorliegen (nur `de`); `contentLocale(locale)` liefert die Sprache für alles in `<main>`.
- `src/design/tokens.ts` – Design-Tokens (Palette Küstenblau, Moorgrün, Sand, Abendlicht). UI liest sie als `--gh-*`-Variablen
  (Root-Layout), Tailwind-Namen in `globals.css`.
- `src/app/[lang]/…` – Routen; `[lang]/layout.tsx` ist das Root-Layout (setzt `<html lang>`).
  `src/app/(weiterleitung)` leitet `/` auf `/de/` (Server sollte das per 301 tun, siehe docs/hosting.md).
- `src/components/home/HomeHero.tsx` – Startbild (dunkle Bühne, h1, Suche in Glasfläche, drei Fotos mit `Parallax`).
- `src/components/effects/` – `Spotlight` (Lichtschein unter der Maus auf `.gh-spot`), `Parallax` (Fotos folgen der Maus),
  `CountUp` (Zahlen zählen hoch, Screenreader lesen den Endwert). Gezeichnet wird in globals.css, Abschnitt „Startbild und Effekte“.
- `src/components/layout/ThemeToggle.tsx` – Schalter „Dunkel“ in der Kopfleiste (role=switch), View-Transition als Kreis.
- `src/components/chat/ChatWidget.tsx` – Knopf „Frag den Chat“ + modaler `<dialog>`; `src/lib/chat/` (Typen, Probe-Version
  `mock.ts`, Wissen `knowledge.ts` → `/{lang}/chat-wissen.json`, `client.ts` schaltet per `NEXT_PUBLIC_CHAT_ENDPOINT` auf einen
  echten Dienst). Schnittstelle: docs/chat-api.md.

## Plattdeutsch
- `/nds/…` gibt es für jede Seite. Plattdeutsch ist bisher nur der Rahmen (Kopfzeile, Menü, Fußzeile, Sprachwahl), als
  ungeprüfter Entwurf. `<main>` trägt `lang="de"`, darin oben `PlattNotice` mit „TODO: Plattdeutsch prüfen“.
- Komponenten in `<main>` holen Texte mit `getDictionary(contentLocale(locale))`, Links aber mit `locale` (bleiben unter /nds/).
- Rahmen-Komponenten nehmen `getDictionary(locale)`; Fakten darin (Öffnungszeiten) und nicht übersetzte Menüpunkte
  bekommen `lang="de"`. Sprachwahl (`LanguageLink`) führt zur selben Seite in der anderen Sprache.
- Platt-Texte nie als geprüft ausgeben: vor dem Livegang von einer Plattdeutsch-Sprecherin oder einem -Sprecher aus der
  Region prüfen lassen. Eine Seite wird übersetzt, indem ihre Inhalte pro Sprache aus dem CMS kommen und `nds` in
  `contentLocales` aufgenommen wird (dann für alle Seiten zugleich, also erst wenn alle übersetzt sind).

## Chat (Probe-Version)
- Läuft ganz im Browser, keine KI, nichts wird gesendet. Antwortet nur mit Inhalten der Website (Suchindex + facts.json),
  sonst Verweis aufs Rathaus. Notfall-Fragen bekommen immer zuerst 112/110. Eingaben mit E-Mail oder IBAN werden nicht
  bearbeitet und nie weitergegeben.
- Ohne JavaScript kein Knopf. Hinweis-Schritt vor dem ersten Gespräch
  (sessionStorage `gh-chat-hinweis`), dort kommt beim echten Dienst die Datenschutz-Zustimmung hin.

## Hell und Dunkel
- Tokens in `src/design/tokens.ts`: `color` (hell) und `colorDark` (dunkel, gleiche Namen), dazu `paletteDark` (nebel und
  ink kehren sich um). `themeCss` schreibt beides als CSS-Variablen ins Root-Layout: hell Standard, dunkel per
  `prefers-color-scheme`, eigene Wahl über `data-theme` am html-Element (localStorage `gh-farbmodus`, gesetzt von
  `themeScript` vor dem ersten Zeichnen). Kontraste beider Modi prüft `check:contrast`.
- Komponenten nehmen semantische Farben (`text-text`, `text-muted`, `text-link`, `text-brand-text`, `bg-surface`,
  `bg-brand-soft` …). Rohe Palettenfarben nur dort, wo eine Fläche in beiden Modi gleich bleibt (dunkle Bühne,
  Fußzeile: `kuestenblau-900`, weiße Knöpfe darauf mit `text-kuestenblau-900`).
- Schatten über `rgb(var(--gh-schatten) / …)`, damit sie im Dunkeln passen.

## Startseite
- `content/stations.json`: erster Eintrag = Begrüßung im Startbild, die übrigen = Karten „Unsere Bereiche“.
  Foto je Bereich über `station` in `content/fotos.json`.
- Startbild: großes Foto = `startbild` (derzeit Badesee, 1000 px), Mühle und Rathaus klein. Die Fotos sind klein
  (274–1000 px breit): `FotoBild` zeigt ein Foto nie größer als echt (Rest weichgezeichnet), große Rahmen nur mit großen Fotos.
- Effekte (nur mit `prefers-reduced-motion: no-preference`, Parallax und Lichtschein nur mit Maus): wanderndes Licht und
  Punkteraster auf der Bühne, Begrüßung mit Farbverlauf (`.gh-glanz`, jede Stelle ≥ 4,5:1, in `forced-colors` normal),
  leuchtender Ring hinter den Fotos, schwebende Fotos, Lichtschein auf Karten, Glanz über Hauptknöpfen, Zähler,
  Lesefortschritt am oberen Rand (Scroll-Animation), Karten gleiten beim Hereinscrollen.

## Gestaltung (seit 17.10.2026 „modern“)

Überschriften Plus Jakarta Sans 800 mit enger Laufweite, Fließtext Atkinson Hyperlegible Next. Flächen kühl
(`nebel` in tokens.ts), Rundungen groß (`radius.lg/xl`), Karten mit weichem Schatten (`.gh-card`, Link-Karten heben sich).
Dunkle Leiste oben im Kopf (`.gh-topbar`), Navigation als Pillen. `.gh-eyebrow` für die kleine Zeile über Überschriften.

## Konventionen
- Texte auf Deutsch, Du-Ansprache wie auf der Startseite gewünscht („Was möchtest du erledigen?“). Leichte Sprache siezt.
- Datum immer voll mit Jahr (`formatDate` → „Sonntag, 18. Oktober 2026“), `<time datetime>` setzen.
- Links nur über `SmartLink`: extern = Symbol + Screenreader-Hinweis, gleiches Fenster. tel:/mailto: für Telefon/E-Mail.
- Genau eine `h1` pro Seite (`PageHeader`), Abschnitte über `Section` (h2 + Anker). Keine Überschriftensprünge.
- Plattdeutsche Textstellen in deutschen Seiten mit `lang="nds"` auszeichnen.
- Keine Logos/Wappen: `Placeholder` / `LogoPlaceholder` verwenden.
- Fotos: Datei unter `public/fotos/`, Eintrag in `content/fotos.json` (Alt-Text, Urheber, Herkunft, `rechteGeklaert`), Anzeige
  nur über `Photo` (zeigt „Foto: …“). Solange `rechteGeklaert` false ist, steht sichtbar „TODO: Bildrechte prüfen“ darunter
  und `postbuild` warnt. Vor einer Veröffentlichung jedes Foto klären oder ersetzen. Originale liegen im Projektordner
  `grossheide-referenz/`.
- Tippflächen: Bedienelemente mindestens 24 × 24 px (WCAG 2.5.8); einzeln stehende Links bekommen das über eine
  Base-Regel in `globals.css`, Buttons über `gh-button`. Notrufnummern 44 px. `check:mobile` prüft das auf allen Seiten.
- Schriften: nur Atkinson normal und Fraunces werden vorgeladen; kursiv (`em`, `i`, `cite`) lädt erst bei Bedarf.
- Quellenhinweise via `SourceLink` (zentral abschaltbar: `SHOW_SOURCES`).
- Vor Livegang: `robots: noindex` im Root-Layout entfernen, Impressum/Datenschutz/Barrierefreiheit rechtlich prüfen lassen.

## Phasen (Stopp nach jeder Phase, Zusammenfassung, auf OK warten)
1. ✅ Setup, Tokens, Layout, Navigation, Inhalte als JSON, alle Unterseiten
2. ✅ 3D-Grundszene, Kamerapfad (ScrollTrigger), Stationen als Platzhalter, synchrone HTML-Panels, Stations-Navigation
3. ✅ Stationen ausmodellieren, Postprocessing, Tageszeitverlauf, Ladeanimation; danach auf Wunsch ersetzt durch die
   Foto-Reise mit echten Fotos (17.10.2026, siehe docs/phase-3.md)
4. ✅ Ruhige Fassung ohne JavaScript, Schalter „Bewegte Reise“, Ladezeit, Handy (ohne 3D, siehe docs/phase-4.md)
5. ✅ Chat-Widget mit Mock + docs/chat-api.md, Plattdeutsch-Grundgerüst (siehe docs/phase-5.md)
6. ✅ Prüfung: Lighthouse, axe, Tastatur, reduzierte Bewegung, Mobile; Liste offener Punkte (docs/phase-6.md, docs/offene-punkte.md)
