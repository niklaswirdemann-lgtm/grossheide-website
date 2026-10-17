# Phase 4: Zusammenfassung

Stand: 17. Oktober 2026. Chef: „fahre mit der neuen website fort aber ohne 3d“. Phase 4 war ursprünglich „Fallbacks, 3D-Schalter, Performance, Mobile“; ohne 3D heißt das: ruhige Fassung ohne JavaScript, Schalter „Bewegte Reise“, Ladezeit und Handy. Die Fotos bleiben, wie sie sind (weiter mit „TODO: Bildrechte prüfen“).

## Was sich geändert hat

- **Weniger JavaScript für die Reise:** GSAP und ScrollTrigger sind raus; der Fortschritt kommt direkt aus der Scroll-Position (ein Rechenschritt je Bildschirmbild). Lenis bleibt nur für weiches Mausrad und wird nachgeladen.
- **Ton entfernt:** Der Lautsprecher-Knopf und die Windgeräusche gehörten zur 3D-Landschaft. Ohne sie ist die Startseite ruhiger und klarer.
- **Startseite blockiert weniger:** Der Wechsel von der ruhigen Fassung zur bewegten Reise wird als React-Transition gerendert, in kleinen Stücken statt in einem Block (dieser Schritt sank von etwa 200–290 ms auf 60–85 ms bei 4-fach gedrosselter CPU).
- **Fotos oben im Bild laden zuerst:** Startbild und das Foto auf der Ortsteilseite mit hoher Priorität statt „lazy“; die kursive Schrift wird nicht mehr vorgeladen (sie wird derzeit nirgends genutzt), so bleibt Bandbreite für Text und Fotos.
- **Handy:**
  - Lange Wörter in Überschriften („Genehmigungsverfahren“) werden getrennt, statt die Seite seitlich scrollen zu lassen (5 Meldungen waren betroffen).
  - Kleine Links (Kopfzeile „Leichte Sprache“/„Kontakt“, Brotkrumen, Telefon und E-Mail im Fuß, „Zurück zu …“, „Zum Seitenanfang“) sind jetzt mindestens 24 px hoch.
  - Die Notrufnummern 112, 110 und 116117 sind große Tippflächen (44 px).
- **Neue Prüfung `npm run check:mobile`:** alle 54 Seiten bei 390 px, die Startseite ohne JavaScript (Handy und Desktop) und die Ladezeit mit gedrosseltem Handy.

## Geprüft

| Prüfung | Ergebnis |
|---|---|
| `npm run check` (Kontrast, Typecheck, Lint, Build) | grün |
| `npm run audit` (axe, Links) | 54 Seiten, 0 Verstöße, 0 defekte Links |
| `npm run check:journey` | 47 von 47 |
| `npm run check:mobile` | 13 von 13 |

Ohne JavaScript zeigt die Startseite die ruhige Fassung mit Rathaus-Vollbild, allen 8 Stationen, Fotos und Suche; alle Hauptbereiche sind als Links erreichbar (das Menü-Aufklappen braucht JavaScript, die Hauptpunkte und der Fuß funktionieren ohne).

Ladezeit, gedrosselt auf CPU 4× langsamer und etwa 4G (150 ms, 1,6 Mbit/s), Median aus 3 Läufen:

| Seite | LCP | CLS | TBT | übertragen |
|---|---|---|---|---|
| Startseite | 852 ms | 0 | 380 ms | 520 KB |
| Rathaus & Service | 800 ms | 0 | 239 ms | 268 KB |
| Freizeit & Tourismus | 860 ms | 0 | 341 ms | 406 KB |
| Ortsteil Großheide | 2104 ms | 0 | 294 ms | 350 KB |

Die Blockierzeit (TBT) kommt laut Profil fast ganz vom Start von React und Next (Framework-Code, etwa 180 KB gzip auf jeder Seite), nicht vom eigenen Code. Die Werte schwanken im Container stark; die Grenze in `check:mobile` liegt deshalb bei 500 ms. Echte Werte auf Geräten misst Phase 6 mit Lighthouse.

## Offene Punkte (TODO)

- **Bildrechte:** alle 7 Fotos ungeklärt (siehe docs/phase-3.md). Vor dem Livegang klären oder ersetzen.
- **Fotos fehlen** für Dorfplatz und Windpark; das Rathaus-Foto ist für ein Vollbild zu klein (274 px).
- **TBT:** Wenn Lighthouse auf echten Handys über 200 ms meldet, wäre der nächste Schritt, weniger Seiten-Teile als Client-Komponenten zu laden (z. B. das Menü erst bei Bedarf).

## So testest du es

```bash
npm install
npm run build && npm start   # http://localhost:3000/de/
# in einem zweiten Fenster:
npm run check:mobile
```
