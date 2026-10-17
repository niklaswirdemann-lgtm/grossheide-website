# Offene Punkte vor dem Livegang

Stand: 17.10.2026 (Ende Phase 6). Geordnet nach Dringlichkeit. „Gemeinde“ heißt: braucht eine Auskunft oder
Entscheidung aus dem Rathaus. „Technik“ heißt: kann die Webentwicklung erledigen, sobald die Angabe da ist.

## A. Muss vor dem Livegang erledigt sein

| # | Punkt | Wer | Wo |
|---|---|---|---|
| A1 | **Bildrechte aller 7 Fotos klären oder Fotos ersetzen.** Die Fotos stammen wahrscheinlich aus dem Netz (eines mit „© 2023 tenoronline.de“). Ohne Freigabe nicht veröffentlichen. Am besten eigene Fotos der Gemeinde, mindestens 1600 px breit. | Gemeinde | `content/fotos.json` (`rechteGeklaert`), `postbuild` warnt |
| A2 | **Großes Foto vom Rathaus** für das Startbild (das jetzige ist 274 px breit und wirkt unscharf). | Gemeinde | `content/fotos.json` (`startbild`) |
| A3 | **Impressum:** Aufsichtsbehörde und inhaltlich Verantwortliche(r) eintragen. | Gemeinde | `impressum/page.tsx` |
| A4 | **Datenschutzerklärung** mit dem behördlichen Datenschutzbeauftragten abstimmen: Hoster, Server-Protokolle, Speicherdauer, Rechtsgrundlage, Zuständigkeit der Aufsichtsbehörde. | Gemeinde | `datenschutz/page.tsx` |
| A5 | **Erklärung zur Barrierefreiheit:** „Stand der Vereinbarkeit“ erst nach einem unabhängigen BITV-Test eintragen; Schlichtungsstelle (Name) prüfen. Die Prüfungen dieser Phase ersetzen keinen BITV-Test. | Gemeinde + Prüfstelle | `barrierefreiheit/page.tsx`, `facts.json` |
| A6 | **Plattdeutsch prüfen lassen** (Kopfzeile, Menü, Fußzeile sind ein ungeprüfter Entwurf) oder `/nds/` bis dahin abschalten (`enabledLocales` in `src/lib/i18n.ts`). | Gemeinde (Platt-Sprecher:in aus der Region) | `content/nds/ui.json`, `content/nds/navigation.json` |
| A7 | **Hosting und Domain** festlegen (deutscher oder EU-Hoster), Server nach `docs/hosting.md` einstellen (301 von `/` auf `/de/`, 404, Caching, Sicherheits-Header). | Gemeinde + Technik | `docs/hosting.md` |
| A8 | **Suchmaschinen freischalten:** `robots: noindex` im Root-Layout entfernen; mit der Domain `canonical`, `hreflang` (de/nds) und eine `sitemap.xml` ergänzen. | Technik | `src/app/[lang]/layout.tsx` |
| A9 | **Test mit echten Hilfsmitteln:** Screenreader (NVDA mit Firefox, VoiceOver auf iPhone und Mac), Bildschirmlupe, Sprachsteuerung; am besten mit Menschen, die sie täglich nutzen. Hier im Container nicht möglich. | Gemeinde + Technik | – |
| A10 | **Chat:** Entweder als Probe-Version kennzeichnen lassen (so wie jetzt) oder abschalten. Ein echter Dienst braucht vorher Anbieter, EU-Hosting, Auftragsverarbeitung, eigenen Datenschutzhinweis mit Zustimmung und KI-Kennzeichnung. | Gemeinde | `docs/chat-api.md` |

## B. Inhalte, die noch belegt werden müssen („TODO: prüfen“)

Alles hier steht auf der Website sichtbar als „TODO: prüfen“, damit nichts Unbelegtes als Tatsache erscheint.

- **Gemeinde:** Einwohnerzahl, Fax, Bankverbindung, Trauorte des Standesamts, Kontakt des Seniorenbeirats.
- **Freizeit:** Ortsteil einer Freizeitanlage, Gebühren eines Wohnmobilstellplatzes (laut Gebührensatzung).
- **Ortsteile:** Kurzporträts aller 10 Ortsteile fehlen auf der bisherigen Website; Lage der Ortsteile ist nur ungefähr.
- **Unsere Gemeinde:** Ortsgeschichte und Partnerstadt mit Quelle ergänzen.
- **Meldungen:** Fristen, Vergabeunterlagen und Auslegungsfristen bei Ausschreibungen und Bekanntmachungen; ein Datum fehlt; ob eine Stelle noch offen ist.
- **Veranstaltungen:** Ort und Veranstalter bei mehreren Terminen, Beschreibungen, Formular zum Melden von Veranstaltungen.
- **Fotos:** Für Dorfplatz und Windpark fehlen Fotos; welche Mühle auf dem Mühlen-Foto zu sehen ist.

## C. Später (nach dem Start)

- **CMS anbinden** (Directus oder Strapi): Inhalte kommen dann aus dem CMS statt aus `content/*.json`; nur `src/lib/content/` ändert sich.
- **Plattdeutsche Inhalte** Seite für Seite übersetzen (im CMS je Sprache); dann `nds` in `contentLocales` aufnehmen.
- **Seitentitel** im Browser-Tab auf Platt-Seiten übersetzen.
- **Echter Chat-Dienst** nach `docs/chat-api.md`; der Anschluss im Widget ist vorbereitet, aber erst mit einem Dienst testbar.
- **Content-Security-Policy** ohne `unsafe-inline` (Hashes/Nonce), sobald der Hoster feststeht; für einen Chat-Dienst `connect-src` ergänzen.
- **Logo und Wappen** erst nach Freigabe einbauen (jetzt Platzhalter).
- Lighthouse und die eigenen Prüfungen nach jeder größeren Änderung wieder laufen lassen (siehe CLAUDE.md, Befehle).
