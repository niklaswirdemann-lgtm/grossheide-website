# Gemeinde Großheide – neue Website

Ersatz für www.grossheide.de (Gemeinde Großheide, Ostfriesland, Landkreis Aurich).
Vision: Die Startseite ist kompakt (seit 17.10.2026 auf Wunsch des Chefs): großes Foto-Hero mit Suche, „Häufig gesucht“,
„Unsere Bereiche“ als Karten, Zahlen, Fotogalerie, Meldungen. Die Reise durch Großheide mit echten Fotos (8 Stationen)
gibt es weiter, aber nur noch auf Wunsch über den Schalter „Bewegte Reise“.

## Oberste Regel
BITV 2.0 / WCAG 2.1 AA. Die Foto-Reise ist Bühne, nie der einzige Weg zu Inhalten. Jede Information ist ohne
sie über die normale Navigation in höchstens 2 Klicks erreichbar. Im Zweifel gewinnt Barrierefreiheit.

## Stack
- Next.js 16.4 (App Router, Turbopack, `output: "export"`, `trailingSlash: true`), React 19.3, TypeScript 5.9 strict
- Tailwind CSS 4 (Tokens als CSS-Variablen, siehe unten)
- Foto-Reise: Lenis 1.3 (weiches Mausrad), zustand 5; Scroll-Fortschritt nativ (scroll-Listener + rAF), kein GSAP. Die 3D-Szene (three, R3F, drei) ist seit 17.10.2026
  entfernt; sie steht noch in der Git-Historie (Commit 4d348ea und davor).
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
| `npm run audit` | axe-core (WCAG 2.1 A/AA) + interne Links auf allen Seiten; braucht laufenden `npm start` (`AUDIT_BASE` setzen, falls anderer Port) und `npx playwright install chromium` |
| `npm run check` | Kontrast, Typecheck, Lint, Build |
| `npm run check:journey` | Browser-Test der Foto-Reise (Fahrt vor/zurück, Panels, Fotos mit Urheber, Skip, Schalter, reduzierte Bewegung, Tastatur, 390 px); braucht laufenden Server (`JOURNEY_BASE`), Screenshots nach `journey-shots/` |
| `npm run check:chat` | Chat-Widget und Plattdeutsch-Rahmen im Browser (Dialog mit axe, Tastatur, Antworten der Probe-Version, keine fremden Anfragen, 390 px, `lang`-Attribute); braucht laufenden Server (`CHAT_BASE`) |
| `npm run check:a11y` | Alle Seiten: Tastatur (Sprunglink, Fokusrahmen sichtbar und nicht verdeckt, Reihenfolge), reduzierte Bewegung, Umbruch bei 320/640 px, Textabstände nach WCAG 1.4.12; braucht laufenden Server (`A11Y_BASE`), dauert lange |
| `npm run check:lighthouse` | Lighthouse (Handy + Desktop) auf 9 Seiten, Grenzen Leistung ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 90; braucht laufenden Server (`LH_BASE`) und `CHROME_PATH`; Berichte nach `lighthouse-reports/` |
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
- `src/components/journey/` – Startseiten-Bühne (HTML, barrierefrei):
  `HomeJourney` (wählt Reise oder statisch, rendert den Wechsel als Transition, Lenis, 800vh-Container mit sticky Layer),
  `PhotoStage` (Bühne, `aria-hidden`: Foto rund gerahmt, dahinter dasselbe Foto unscharf, Tageszeit-Licht),
  `StationPanel` (eine Station als `<section>` mit h1/h2 – gleiches Markup für Panel und statische Ansicht),
  `JourneyOverlay` (Panels neben den Fotos, Deckkraft je Scroll-Bereich, Fokus scrollt zur Station),
  `JourneyProgress` (8 Punkte), `SkipButton` („Direkt zur Website“), `JourneyToggle` („Bewegte Reise“, localStorage
  `gh-bewegte-reise`), `StaticHero` (ruhige Fassung: dunkle Bühne mit `HeroCollage`, sonst SVG-Illustration).
- `src/lib/journey-store.ts` (zustand: Modus, Fortschritt, aktive Station), `journey-math.ts` (Haltezonen,
  Panel-Deckkraft, Panel-Seite), `journey-scroll.ts` (scrollen zu Fortschritt/Element), `journey-preference.ts` (Reise ja/nein).
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
- Ohne JavaScript kein Knopf; auf der Startseite erst nach der Foto-Reise. Hinweis-Schritt vor dem ersten Gespräch
  (sessionStorage `gh-chat-hinweis`), dort kommt beim echten Dienst die Datenschutz-Zustimmung hin.

## Foto-Reise (Startseite)
- Standard (auch ohne JS, bei `prefers-reduced-motion`, Datensparmodus oder Schalter „aus“): kompakte Startseite,
  statischer Hero mit Station 1, die übrigen Stationen als Karten „Unsere Bereiche“ (`.gh-nur-ruhig`, in der Reise
  ausgeblendet). Die Reise läuft nur mit `gh-bewegte-reise` = „on“ (Schalter); `decideMode` liefert sonst `default`.
  Tests schalten sie per Init-Script ein. Server-Render ist immer die statische Fassung. Wer die Reise ausdrücklich einschaltet,
  bekommt sie auch bei reduzierter Bewegung, dann ohne Lenis, Flug und Zoom (nur Überblenden).
- Stationen in `content/stations.json`; `scrollBereich` müssen lückenlos von 0 bis 1 laufen (sonst bricht der Build ab).
  Foto je Station über `station` in `content/fotos.json`; ohne Foto zeigt die Bühne die Illustration in `farbe` und
  einen Abzug „TODO: Foto ergänzen“.
- Bewegung: Station i liegt bei t = i (über `progressToT`, Haltezone = 44 % jedes Bereichs, dazwischen smoothstep).
  Das Foto fliegt beim Wechsel zur Seite und wird dabei etwas kleiner, der unscharfe Hintergrund blendet über und zoomt langsam.
  Werte werden per `journeyStore.subscribe` direkt am Element gesetzt, keine React-Renders pro Frame.
- Startseite: Station 1 zeigt auf dunkler Bühne (`.gh-dark-stage`, weiße Schrift, in `check:contrast` geprüft) eine Collage aus
  Startbild (`startbild` in `content/fotos.json`, derzeit das Rathaus), Mühle und Badesee (`HeroCollage`), Urheber darunter.
  Kein Vollbild mehr: die Fotos sind zu klein dafür. Auf dem Handy zeigt die Reise die Collage nicht, die ruhige Fassung schon.
- Panels abwechselnd links/rechts (`panelSide`), der Abzug steht gegenüber; unter `lg` liegt das Panel unten und der Abzug
  zwischen Schaltern und Panel. Panel-Fotos sind in der Reise nur für Screenreader da (Alt-Text, Urheber), sichtbar steht
  das Foto auf der Bühne.
- Panels: Hintergrund `bg-surface/95` + Blur; Kontrast im schlimmsten Fall (über Schwarz) in `check:contrast` geprüft.
- Tageszeit: `content/lighting.json` (Farbe + Stärke über den Fortschritt) legt sich als weiches Licht über den
  Hintergrund; die Fotos selbst bleiben unverändert.
- Die Fotos sind klein (274–1000 px breit); der Abzug wird höchstens auf die doppelte Breite vergrößert.

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
