# Phase 3: Zusammenfassung

Stand: 17. Oktober 2026, Commit „Phase 3: Stationen ausmodelliert, Tageszeit, Effekte, Ladebildschirm“.

> **Hinweis:** Die 3D-Szene ist inzwischen durch eine Foto-Reise ersetzt (siehe „Nachtrag: Foto-Reise statt 3D-Szene“ unten). Die Abschnitte davor beschreiben den 3D-Stand.

## Kurz

Die acht Platzhalter sind durch liebevoll gebaute Low-Poly-Dioramen ersetzt, alle prozedural (kein Download, keine Fotos, keine Logos).
Über die Fahrt läuft ein Tag: Morgendämmerung mit Nebel an der Ankunft, heller Mittag in der Mitte, goldener Abend mit leuchtenden Fenstern an Windpark und Aussicht.
Die Szene lebt leise (Möwen, Wolken, Gras, Radfahrer, Traktor, Wasser, Flügel), alles abschaltbar über die zentrale Option `ambientMotion`.
Kamerapfad, Scroll-Steuerung, HTML-Panels, Fallbacks und Unterseiten sind unverändert.

## Was gebaut wurde

- **Modelle** (`src/components/three/Models/`, je Station eine Datei, Zuordnung in `registry.ts`):
  - **Ankunft:** Ortstafel „Großheide / Landkreis Aurich“ am Weg, eingezäunte Schaf- und Kuhweide mit wandernden Tieren (Instancing), Heuballen, Morgennebel über den Feldern. Felder in Streifen und Gräben kommen weiter aus dem Gelände.
  - **Rathaus:** Backstein per Shader (keine Textur), Fenster, die abends leuchten, Fahnenmast mit wehender Fahne (Vertex-Shader, kein Wappen), Fahrradständer, Laternen. Seit dem Nachtrag nach Referenzfoto (siehe unten).
  - **Dorfplatz:** Litfaßsäule mit den echten nächsten drei Veranstaltungen als Plakate (CanvasTexture aus denselben Daten wie das Panel), Baum mit Rundbank, Bänke, Lichterkette.
  - **Schule & Kita:** Schulgebäude (seit dem Nachtrag nach Referenzfoto), Pausenhof, Fahrräder, bunte Kita mit Spielplatz und sanft schwingender Schaukel.
  - **Moor:** Wald- und Moormuseum (seit dem Nachtrag nach Referenzfoto), Bohlenweg, Moorwasser, Wollgras im Wind, Birken, dichter Bodennebel, Glühwürmchen am Abend, dahinter Wald.
  - **Mühle:** Galerieholländer (achteckiger Backstein-Unterbau, Galerie, Achtkant, Haube mit Steert, vier Gitterflügel, die sich langsam drehen; Farben seit dem Nachtrag nach Referenzfoto), Wohnmobil auf dem Stellplatz, Ferienhaus mit Reetdach.
  - **Windpark & Gewerbe:** vier Windenergieanlagen als Instanzen mit versetzt drehenden Rotoren, schlichte Gewerbehalle mit Büro, Baugebiet mit abgesteckten Parzellen, Rohbau, Container und schwenkendem Kran.
  - **Aussicht:** Die Landschaft wird zur Papierkarte (Raster, Gewässer, Weg, Nordpfeil). Die zehn Ortsteile erscheinen als leuchtende, pulsierende Punkte mit Namen. Die Namen sind echte Links (drei `Html`, außerhalb des `aria-hidden`-Canvas) und per Maus **und** Tastatur bedienbar; Fokus auf einen Namen fährt zur Aussicht. Lage ungefähr, TODO: echte Lage prüfen.
- **GLB-Tausch:** `<StationModel>` lädt `/public/models/<id>.glb` (useGLTF mit lokalem Draco-Decoder), sonst das prozedurale Modell. Ein Manifest verhindert 404-Anfragen. Anleitung in `src/components/three/Models/README.md`.
- **Leben:** Möwenschwärme (Instancing, Flügelschlag im Vertex-Shader), ziehende Wolken, Gras und Wollgras im Wind (Vertex-Shader), Radfahrer auf einer Runde um den Dorfplatz, Traktor mit Egge in der Ferne, schimmerndes Wasser. Alles langsam, nur im Sichtfeld, aus bei `ambientMotion = false` (automatisch bei reduzierter Bewegung).
- **Tageszeit:** Keyframes in `content/lighting.json` (Sonne, Himmel, Nebel, Himmelslicht, Morgennebel, Fensterlicht, Glühwürmchen), weich interpoliert über den gedämpften Fortschritt, vorwärts wie rückwärts gleich. Eigene Himmelskuppel statt drei `Sky`; Spiegelungen im Wasser aus der Kuppel (PMREM, nur bei spürbarer Änderung neu).
- **Postprocessing** nach GPU-Stufe: Stufe 3 Tiefenunschärfe (nur in Haltezonen, scharf auf dem Objekt), Bloom (Schwelle 1,4: nur Lampen, Fenster am Abend, Glühwürmchen, Sonne), ACES-Tone-Mapping, leichte Farbkorrektur, Vignette, SMAA. Stufe 2 ohne Tiefenunschärfe, darunter ohne Effekte (dann MSAA).
- **Interaktion:** Überfahren eines Objekts oder Tastaturfokus in seinem Panel hebt es leicht hervor, Zeiger wird zur Hand. Klick aufs Objekt führt zum selben Ziel wie der Hauptlink des Panels. Easter Eggs: Klick auf die Mühlenflügel lässt sie kurz schneller drehen, Klick auf ein Schaf lässt die Herde nacheinander hüpfen.
- **Ladebildschirm:** Schriftzug „Großheide“ und eine Mühle, deren Flügel sich drehen, mit echtem Fortschritt (Code, Modelle, Shader vorkompiliert, erster Frame). Höchstens 3 Sekunden ab Seitenaufruf, danach nur ein kleiner Hinweis. „Direkt zur Website“ und der 3D-Schalter liegen immer darüber. Danach startet die Kamera im Nebel, der sich lichtet. Bei reduzierter Bewegung keine Animation, nur Einblenden.
- **Ton (Standard aus):** Lautsprecher-Schalter (`aria-pressed`, `aria-label` „Umgebungsgeräusche“), kein Autoplay. Wind wird im Browser erzeugt; Möwen und Mühlenknarzen spielen, sobald Dateien unter `public/audio/` liegen (TODO). Ton pausiert, wenn die Bühne nicht sichtbar oder der Tab verborgen ist.

## Nachtrag: Modelle nach Referenzfotos (17. Oktober 2026)

Chef hat 14 Fotos geschickt (im Projektordner `grossheide-referenz/`, nicht im Repo). Danach umgebaut:

- **Rathaus:** zweigeschossiger Backsteinbau mit dunklem Walmdach und drei Gauben, kleiner Giebel mit Halbrundfenster links, runder Eckturm mit Kegeldach aus Blech und Schriftzug „Rathaus“, rechts Giebelhaus mit großem Halbrundfenster, Eingang mit Pultdach. Vorplatz rötlich gepflastert, junge Bäume in Pflanzbeeten, Fahne schwarz-rot-gold ohne Wappen.
- **Wald- und Moormuseum:** eingeschossiger Backsteinbau statt Holzhaus: Giebelhaus mit steilem Dach, langer Flügel, weiße Sprossenfenster, dunkelgrüne Tür, Holzpavillon davor, weißes Hinweisschild „Wald- und Moor MUSEUM“ (ohne Logo). Im Moorteich ein reetgedeckter Pavillon auf einer Insel.
- **Mühle:** dunkler Achtkant, runde braune Haube mit weißem Band und roten Zierleisten, grüne Ruten mit hellen Windbrettern, rote Nabe.
- **Schule:** zweigeschossiger Backsteinbau mit Walmdach aus roten Pfannen und Dachfenstern, verglaster Eingang mit blauen Rahmen und hellem Schild (ohne Schrift und Wappen), Bänke auf dem Hof.
- **Ortstafel:** „Großheide / Grootheid“ wie auf dem Foto.
- Nicht verwendet: Badesee, Kirchen, Brunnen und das Gebäude im Schnee. Diese Motive gehören zu keiner Station oder ihr Ort ist unklar.
- Danach gemessen: höchstens 139 Draw Calls (Aussicht), 166 000 Dreiecke, 3D-Bundle 0,41 MB; Reise-Test 48 von 48. Moor-Station 14 450 Dreiecke, alle anderen unter 5 000.

## Nachtrag: Fotos auf der Website (17. Oktober 2026)

Chef möchte die echten Fotos selbst auf der Website sehen, die 3D-Szene bleibt. Eingebaut (WebP unter `public/fotos/`, Daten in `content/fotos.json`, Komponente `Photo`):

| Foto | Wo | Größe | Urheber |
|---|---|---|---|
| Rathaus | Panel Station 2 | 274 × 182 | TODO: prüfen |
| Schule | Panel Station 4 | 597 × 335 | TODO: prüfen |
| Wald- und Moormuseum | Panel Station 5 | 321 × 180 | TODO: prüfen |
| Mühle | Panel Station 6 | 420 × 420 | TODO: prüfen |
| Luftbild mit Kirche | Panel Station 8 | 515 × 388 | TODO: prüfen |
| Ortstafel | Ortsteil Großheide | 678 × 452 | © 2023 tenoronline.de (Wasserzeichen) |
| Badesee | Freizeit & Tourismus, Freizeitanlagen | 1000 × 561 | TODO: prüfen |

- Unter jedem Foto steht „Foto: …“ und, solange die Rechte nicht geklärt sind, sichtbar „TODO: Bildrechte prüfen“. `postbuild` listet diese Fotos bei jedem Build auf.
- **Kein Foto darf so veröffentlicht werden.** Die meisten stammen vermutlich aus einer Bildersuche, die Ortstafel trägt ein Wasserzeichen von tenoronline.de. Vor dem Livegang: Rechte klären oder durch eigene Fotos ersetzen.
- Die Fotos sind klein und wirken auf großen Bildschirmen unscharf. Eigene Fotos ab etwa 1600 px Breite wären besser.
- Nicht verwendet: moderne Kirche, Brunnen, Gebäude im Schnee, Schulhof „MOIN“, Reetpavillon am Teich (nur Vorlage fürs Modell). Ihr Ort ist unklar.
- Geprüft: Typecheck, Lint, Build, axe-Audit 54 Seiten ohne Verstöße.

## Nachtrag: Foto-Reise statt 3D-Szene (17. Oktober 2026)

Chef: „das klappt nicht so gut mit dem 3d“, dann „nur die echten bilder aber so eine reise wäre trotzdem cool“. Die 3D-Szene ist deshalb entfernt; die Reise durch die 8 Stationen bleibt, jetzt mit den echten Fotos.

- **So sieht es aus:** Jede Station zeigt ihr Foto als Abzug mit weißem Rand, gegenüber dem Panel (abwechselnd links und rechts). Dahinter füllt dasselbe Foto unscharf den Bildschirm. Beim Scrollen fliegt der Abzug zur Seite, der nächste kommt herein, der Hintergrund blendet über und zoomt langsam; das Licht wandert vom Morgen zum Abend (`content/lighting.json`, nur auf dem Hintergrund, die Fotos bleiben echt).
- **Stationen ohne Foto** (Dorfplatz, Windpark) zeigen die Landschafts-Illustration und einen Abzug „Hier fehlt noch ein Foto. TODO: Foto ergänzen“. Die Ortstafel ist jetzt das Foto der Ankunft.
- **Barrierefreiheit:** Die Bühne ist `aria-hidden`; Alt-Text und Urheber stehen weiter in den Panels (dort nur für Screenreader, sichtbar steht das Foto auf der Bühne). Schalter heißt jetzt „Bewegte Reise“ (localStorage `gh-bewegte-reise`); bei „Bewegung reduzieren“ oder Datensparmodus startet die statische Fassung. WebGL und GPU-Erkennung entfallen.
- **Entfernt:** `src/components/three/`, Ladebildschirm, Ortsteil-Karte der Aussicht (die Ortsteile stehen als Links im Panel), Pakete three, @react-three/fiber, drei, postprocessing, detect-gpu, leva, @types/three, `scripts/measure-3d.mjs`. Der Stand mit 3D liegt im Commit 4d348ea.
- **Gewicht:** JavaScript der Startseite 189 KB gzip (vorher kamen 0,41 MB 3D-Code dazu), Fotos zusammen 465 KB.
- **Geprüft:** Typecheck, Lint, Build; `check:journey` neu für die Foto-Reise geschrieben, 48 von 48 (u. a. jedes Foto im Bild mit Urheber und Rechte-Hinweis, Panel-Fotos mit Alt-Text, Tastatur, reduzierte Bewegung, 390 px ohne Überlappung); axe-Audit 54 Seiten ohne Verstöße.
- **Offen:** Fotos für Dorfplatz und Windpark; Bildrechte aller Fotos; größere Fotos (die Abzüge werden bis zur doppelten Breite vergrößert und wirken dann weich).

## Nachtrag: Rathaus als Vollbild auf der Startseite (17. Oktober 2026)

Chef: „die startseite soll das rathaus zeigen. als vollbild sehr clean“.

- Die Startseite öffnet mit dem Rathaus-Foto als scharfem Vollbild, ohne Rahmen und ohne Lichtfilter. Begrüßung und Suche stehen in weißer Schrift direkt auf dem Foto, ein dunkler Verlauf links (auf dem Handy unten) hält sie lesbar (Kontrast geprüft, mindestens 4,9 : 1).
- Die Urhebernennung mit „TODO: Bildrechte prüfen“ steht oben rechts im Bild.
- Beim Weiterscrollen geht die Reise wie bisher weiter. Die Ortstafel steht nur noch auf der Ortsteilseite Großheide.
- Welches Foto die Startseite zeigt, steht in `content/fotos.json` unter `startbild`.
- Auch die ruhige Fassung (Bewegte Reise aus, reduzierte Bewegung) zeigt das Rathaus als Vollbild.
- **Wichtig:** Das Rathaus-Foto ist nur 274 × 182 px groß und wirkt als Vollbild deutlich unscharf. Für den Livegang braucht es ein eigenes Foto, mindestens 2400 px breit, mit geklärten Rechten.
- Geprüft: `check:journey` 50 von 50 (neu: Startbild scharf als Vollbild, statischer Hero mit Alt-Text), axe-Audit 54 Seiten ohne Verstöße, Kontrastprüfung grün.

## Geprüft

- `npm run check` (Typen, Lint), `npm run build`: ohne Fehler.
- `npm run audit`: 54 Seiten, 0 axe-Verstöße (WCAG 2.1 A/AA), 0 defekte interne Links. Zusätzlich axe auf der 3D-Startseite beim Laden, nach dem Laden und an der Aussicht mit eingeblendeter Karte: jeweils 0 Verstöße.
- `npm run check:journey` (Playwright): 48 von 48 Prüfungen bestanden: alle Stationen vorwärts und rückwärts, Tastatur durch alle Panels, Skip-Link, 3D-Schalter, reduzierte Bewegung, ohne WebGL, schwache GPU, 390 px ohne horizontales Scrollen, Ladebildschirm, Ton-Schalter, Klick aufs Rathaus, Ortsteil-Karte per Tab/Enter und per Mausklick auf den Punkt, Budget je Station.
- Kontrast: Panels unverändert (Text 14,5 : 1, Akzenttext 4,85 : 1), Kartennamen nutzen dieselben Farben.
- Unterseiten: Build von Phase 2 und Phase 3 verglichen (ohne Skript- und Link-Tags, die nur andere Dateinamen enthalten): 56 von 56 Seiten gleich.
- Tageszeit ohne Sprünge: Alle Werte aus `lighting.json` werden weich über den gedämpften Fortschritt interpoliert, vorwärts und rückwärts mit derselben Funktion; Screenshots aller Stationen durchgesehen.
- Ladebildschirm: Der Canvas rendert erst, wenn die Shader kompiliert sind, damit das Kompilieren den Seitenaufbau nicht blockiert. Gemessen im Test: ausgeblendet nach rund 1,4 s, abzüglich der Zeit, in der das Software-Rendering im Testbrowser den Hauptthread blockiert. Auf echter Hardware bitte einmal nachsehen.
- Nebenbei behoben (Fehler aus Phase 2): Nach „Zurück“ von einer Unterseite stand die Reise auf Station 1, obwohl die Seite an der alten Scroll-Position war. Jetzt stimmen Panel und Kamera sofort.

## Messwerte vorher / nachher

Gemessen im Testbrowser mit Software-Rendering (SwiftShader), Fenster 1440 × 900. Draw Calls zählen jetzt **alle** Durchgänge eines Frames (Schatten und Nachbearbeitung eingeschlossen); in Phase 2 wurde nur der letzte Durchgang gezählt, die Werte vorher sind also zu niedrig.

| Wert | vorher (Phase 2) | nachher (Phase 3) | Budget |
|---|---|---|---|
| fps Laptop | nicht messbar (Software: 1–2) | nicht messbar (Software: 1–2) | 60 |
| fps Handy | nicht messbar | nicht messbar | ≥ 40 |
| Draw Calls (max.) | 75 (ohne Schatten/Effekte) | 136 an der Aussicht, sonst 81–116 (mit Schatten und Effekten) | < 150 |
| Dreiecke (max.) | 120 240 | 165 354 | < 250 000 |
| 3D-Bundle (gzip) | 0,33 MB | 0,41 MB | < 3 MB |

Dreiecke je Station (Hauptobjekt + Umfeld, Ziel ≈ 15 000): Ankunft 4 586, Rathaus 3 132, Dorfplatz 2 480, Schule & Kita 3 516, Moor 14 884, Mühle 2 080, Windpark 2 674, Aussicht 2 442. Das Moor lag zuerst bei 23 000; das Wollgras hat deshalb nur noch einen Halm je Büschel.

Die echten fps fehlen: Bitte `/de/?perf` auf einem Laptop und einem Mittelklasse-Handy öffnen, einmal durchscrollen und die Werte unten links notieren.

## Offene Punkte (TODO)

- **Bildrechte:** Alle 7 angezeigten Fotos haben ungeklärte Rechte (siehe Nachtrag „Fotos auf der Website“). Vor dem Livegang klären oder durch eigene Fotos in voller Größe mit Urheber ersetzen.
- **Welche Mühle:** Die Mühle ist nach dem Foto eingefärbt; welche Mühle es ist, steht noch aus.
- **Lage der Ortsteile:** `mapPosition` in `content/de/ortsteile.json` ist nur ungefähr („TODO: echte Lage prüfen“), am besten aus amtlichen Koordinaten ableiten.
- **Ton:** Dateien für Möwen und Mühlenknarzen (zusammen unter 300 KB, Lizenz geklärt) fehlen; bis dahin nur erzeugter Wind.
- **fps auf echter Hardware:** Laptop und Mittelklasse-Handy mit `/de/?perf` messen (Ziel 60 bzw. ≥ 40 fps).
- **Ortsteil-Namen auf dem Handy:** Unter 1024 px Breite sind die Namen auf der Karte ausgeblendet (sie lägen unter dem Panel); die Punkte bleiben antippbar, die Links stehen im Panel.
- **Glühwürmchen** sieht man am stärksten zwischen Moor und Mühle (Nachmittag bis goldene Stunde). Wer sie am Moor dunkler will, verschiebt in `lighting.json` den Abend nach vorn.
- **Mühle Südcoldinne** ist weiter nicht belegt (aus Phase 2).

## So testest du es

```bash
npm install
npm run build && npm start   # http://localhost:3000/de/
```

Zum Ausprobieren: langsam durch die Reise scrollen und zurück (die Fotos fliegen herein, das Licht wird zum Abend wärmer), rechts auf die Punkte klicken, mit Tab durch die Panels gehen, oben „Bewegte Reise“ ausschalten (dann erscheint die ruhige Fassung mit allen Fotos).
