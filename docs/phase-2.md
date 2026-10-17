# Phase 2: Zusammenfassung

Stand: 17. Oktober 2026, Commit „Phase 2: 3D-Grundszene, Kamerafahrt und Panels auf der Startseite“.

## Was gebaut wurde

- **3D-Landschaft nur auf der Startseite**, als zusätzliche Ebene. Die Unterseiten und die Navigation sind unverändert (das erzeugte HTML aller 53 Unterseiten ist identisch mit Phase 1).
- **Eine Quelle für die Stationen:** `content/stations.json` enthält je Station Texte, Links, Kameraposition, Blickziel, Objektposition, Platzhalterform, Farbe und Scroll-Bereich. Daraus entstehen die 3D-Szene, die HTML-Panels, die Fortschrittspunkte und die statische Ansicht.
- **Landschaft:** flaches Gelände mit leichtem Rauschen und Flat Shading, Feldraster mit Gräben, ein Sandweg. Ein Tief und Kanäle mit leicht spiegelndem, bewegtem Wasser (eigene Normal-Map, kein Download). Himmel als Shader (drei `Sky`), eigene weiche Wolken, Nebel über die ganze Szene und Bodennebel über dem Moor. Sonne als DirectionalLight mit Schatten (2048 px, folgt dem Blick) plus HemisphereLight.
- **Vegetation als Instancing:** mehrere hundert Bäume, Wallhecken und bis zu 1600 Grasbüschel in 5 Draw Calls. Bäume und Hecken halten die Sichtachse jeder Station frei.
- **Stationen als Platzhalter:** Rathaus (Haus), Dorfplatz (Litfaßsäule), Schule, Moor (Museum am Wald), Mühle mit drehenden Flügeln, Windpark mit vier Anlagen, Aussicht mit leuchtenden Punkten für die 10 Ortsteile (anklickbar, mit Maus; Lage ist stilisiert und „TODO: prüfen“).
- **Kamerafahrt:** CatmullRom-Kurve durch alle Kamerapunkte, Blick ebenso interpoliert. Scrollen über einen 800vh-Container mit GSAP ScrollTrigger und Lenis, gedämpftes Nachziehen, Haltezonen an jeder Station, leichtes Gehen auf Augenhöhe, Maus-Parallaxe bis 2° (nicht auf Touch).
- **Panels als echtes HTML:** jede Station ist eine `<section>` mit eigener Überschrift (Station 1 trägt die h1). Einblenden mit Deckkraft und kleinem Versatz. Desktop links oder rechts vom Objekt, mobil als Karte unten. Die Canvas ist `aria-hidden`.
- **Steuerung:** 8 Fortschrittspunkte (Klick fährt hin, Tooltip und `aria-label`, aktuelle Station mit `aria-current`), „Direkt zur Website“ immer sichtbar, Schalter „3D-Effekte“ (`role="switch"`, in localStorage gespeichert).
- **Fallbacks:** statischer Hero mit SVG-Landschaft bei reduzierter Bewegung, ohne WebGL, bei Software-Rendering, bei detect-gpu-Tier 0/1, im Datensparmodus und wenn 3D ausgeschaltet ist. Ohne JavaScript erscheint immer die statische Fassung.
- **Performance:** Canvas lädt nach der Seite (dynamischer Import und Ladeanzeige), dpr 1 bis 1,75, gerendert wird nur, solange die Bühne sichtbar ist. Kein Postprocessing.
- **Debug (nur `npm run dev`):** leva-Panel für Sonne, Nebel und Kamera-Versatz, fps-Anzeige, Taste **D** zeigt Kamerapfad und Stationspunkte. `/de/?perf` zeigt fps und Draw Calls.

## Geprüft

- `npm run typecheck`, `npm run lint` (0 Warnungen) und `npm run build` laufen fehlerfrei, `npm run dev` startet.
- `npm run check:contrast`: 23 Farbpaare, darunter neu die Panel-Texte im schlimmsten Fall (Panel über Schwarz), alle über 4,5:1.
- `npm run audit`: 54 Seiten, 0 axe-Verstöße, 0 defekte Links. Die Startseite zusätzlich im 3D-Modus an drei Scrollpositionen, Desktop und 390 px: 0 Verstöße.
- `npm run check:journey` (neu, Playwright): 34 von 34 Prüfungen bestanden.
  Fahrt vorwärts und rückwärts durch alle 8 Stationen in richtiger Reihenfolge, je Station genau das passende Panel sichtbar, Fortschrittspunkte, Skip mit Fokus, Schalter mit Speicherung über Neuladen, reduzierte Bewegung, kein WebGL, Software-GPU, Tab durch alle 8 Panels mit Kamera, sichtbarer Fokus, 390 px ohne horizontales Scrollen, keine Konsolenfehler.

## Messwerte

| Station | Draw Calls | Dreiecke |
|---|---|---|
| Ankunft | 72 | 120 k |
| Rathaus | 54 | 120 k |
| Dorfplatz | 43 | 120 k |
| Schule | 38 | 120 k |
| Moor | 48 | 120 k |
| Mühle | 62 | 120 k |
| Windpark | 72 | 120 k |
| Aussicht | 54 | 120 k |

Draw Calls inklusive Schattenpass: höchstens 72, Budget 100.
Die fps konnten hier nicht aussagekräftig gemessen werden: Der Testrechner hat keine Grafikkarte, Chromium rendert per Software (SwiftShader) und kommt bei 1440 × 900 auf 1 bis 3 fps. Echte Werte bitte am Laptop messen: `/de/?perf` öffnen, die Anzeige unten links zeigt fps und Draw Calls.

## Offen und Hinweise für Phase 3

- **fps auf echter Hardware messen**, besonders auf einem Mittelklasse-Handy. Falls nötig: Schatten mobil auf 1024 px, weniger Gras, dpr mobil auf 1,5.
- **Hochformat:** Die Kamerapunkte sind für Querformat gewählt. Auf dem Handy liegt das Objekt teils am Bildrand und die Karte deckt die untere Hälfte. Phase 3 sollte je Station einen optionalen mobilen Kamerapunkt in `stations.json` bekommen.
- **Platzhalter ausmodellieren:** Rathaus, Schule und Museum sind einfache Quader, Windräder sehr hell vor dem Himmel. Eine Tageszeitstimmung und Postprocessing (leichtes Bloom, Vignette) sind für Phase 3 vorgesehen.
- **Ladezustand:** Bis die Szene steht, zeigt die Bühne die SVG-Landschaft und „3D-Landschaft wird geladen …“. Eine echte Ladeanimation folgt in Phase 3.
- **Ortsteil-Punkte** bei der Aussicht sind nur per Maus anklickbar. Per Tastatur und Screenreader gibt es dieselben Links im Panel darunter. Die Lage der Punkte ist stilisiert und muss geprüft werden.
- **Mühle Südcoldinne** ist als Station angelegt, aber nicht belegt (`TODO: prüfen`).
- `?perf` funktioniert auch im Build, ist aber ohne den Parameter unsichtbar und lädt nichts nach.

## So testest du es

```bash
npm install
npm run dev                  # http://localhost:3000/de/  (mit Debug-Panel, Taste D)
# oder wie im Betrieb:
npm run build && npm start   # http://localhost:3000/de/
# Messwerte: http://localhost:3000/de/?perf
```

Zum Ausprobieren: langsam durchscrollen und zurück, die Punkte rechts anklicken, „Direkt zur Website“ drücken, den Schalter „3D-Effekte“ aus- und wieder einschalten und die Seite neu laden. Nur mit Tab durch die Seite gehen: die Kamera fährt zur Station, deren Link gerade fokussiert ist. In den Systemeinstellungen „Bewegung reduzieren“ einschalten: dann erscheint die statische Fassung.

## Kamerapositionen selbst anpassen

In `content/stations.json` hat jede Station `kameraPosition` (wo du stehst), `blickZiel` (wohin du schaust) und `objektPosition`, jeweils als `[x, Höhe, z]` in Metern, wobei x nach Osten und ein kleineres z nach Norden geht (Augenhöhe ist 1,7).
Ändere die Zahlen, speichere, und `npm run dev` zeigt die neue Fahrt sofort; mit der Taste **D** siehst du den Pfad, und im Debug-Panel kannst du die Kamera verschieben und den Versatz in die JSON übernehmen.
Die `scrollBereich`-Werte müssen lückenlos von 0 bis 1 laufen, sonst bricht der Build mit einer verständlichen Meldung ab.
