# Chat-Assistent: Schnittstelle

Stand: 17.10.2026 (Phase 5). Das Widget auf der Website ist fertig, dahinter steckt eine **Probe-Version**
ohne KI und ohne Server. Dieses Dokument beschreibt, was ein echter Dienst liefern muss, damit er das Widget
ohne Änderung an der Oberfläche übernehmen kann.

## Heute: Probe-Version

- Läuft ganz im Browser (`src/lib/chat/mock.ts`). Nichts wird gesendet oder gespeichert.
- Wissen: `/{lang}/chat-wissen.json`, beim Build erzeugt aus dem Suchindex und `content/facts.json`
  (`src/lib/chat/knowledge.ts`). Etwa 20 KB, wird erst beim ersten Frage-Absenden geladen.
- Antworten: feste Muster für Notfall, Öffnungszeiten, Kontakt, Gruß und Dank, sonst eine Stichwortsuche.
  Ohne Treffer: Verweis auf das Rathaus mit Telefonnummer. Die Probe erfindet nichts.
- Texte und Muster: `content/de/chat.json`.

## Umschalten auf einen echten Dienst

Beim Build die Adresse setzen:

```sh
NEXT_PUBLIC_CHAT_ENDPOINT=https://chat.example.de/api/chat npm run build
```

Dann schickt das Widget jede Frage per `POST` an diese Adresse (`src/lib/chat/client.ts`). Ohne die Variable
bleibt die Probe-Version aktiv. Dieser Weg ist bisher nur per Typprüfung abgesichert; er wird getestet, sobald
es einen Dienst gibt. Vorher muss der Datenschutzhinweis im Widget und auf `/datenschutz/#chat-assistent`
angepasst werden (siehe unten).

## Anfrage

`POST {NEXT_PUBLIC_CHAT_ENDPOINT}`, `Content-Type: application/json`, ohne Cookies (`credentials: "omit"`).

```json
{
  "locale": "de",
  "question": "Wann hat das Rathaus geöffnet?",
  "history": [
    { "role": "user", "text": "Moin" },
    { "role": "assistant", "text": "Moin! Frag mich zum Beispiel nach Öffnungszeiten, Dienstleistungen oder Kitas." }
  ],
  "page": "/de/rathaus/"
}
```

| Feld | Typ | Bedeutung |
|---|---|---|
| `locale` | `"de"` \| `"nds"` | Sprache der Antwort. Heute immer `"de"`, weil die Inhalte nur auf Hochdeutsch vorliegen. |
| `question` | string, 1–500 Zeichen | Die Frage, schon gekürzt. |
| `history` | Liste | Bisheriges Gespräch dieser Seite, nur im Browser gehalten. Eingaben mit E-Mail-Adresse oder IBAN fehlen darin. |
| `page` | string | Pfad der Seite, auf der gefragt wird. Darf für bessere Treffer genutzt werden. |

Typen: `ChatRequest` in `src/lib/chat/types.ts`.

## Antwort

`200 OK`, `Content-Type: application/json`, die ganze Antwort auf einmal (kein Streaming, siehe Barrierefreiheit).

```json
{
  "kind": "zeiten",
  "text": "So ist das Rathaus geöffnet:",
  "items": [
    { "label": "Montag", "value": "08:00–12:00 Uhr" },
    { "label": "Dienstag", "value": "08:00–12:00 Uhr und 14:00–16:00 Uhr" }
  ],
  "links": [{ "title": "Öffnungszeiten", "href": "/rathaus/oeffnungszeiten/", "type": "Seite" }]
}
```

| Feld | Typ | Bedeutung |
|---|---|---|
| `kind` | string | `gruss`, `dank`, `notfall`, `zeiten`, `kontakt`, `treffer`, `unbekannt`, `persoenlich`. Für Auswertung und Tests; das Widget zeigt alle gleich an. |
| `text` | string | Reiner Text, kein HTML und kein Markdown. Das Widget gibt ihn als Text aus. |
| `items` | Liste, optional | Aufzählung `{label, value, href?}`, z. B. Öffnungszeiten oder Telefonnummern. `href` nur `tel:` oder `mailto:`. |
| `links` | Liste | Quellen `{title, href, type?}`. Interne Seiten als Pfad **ohne** Sprachpräfix (`/rathaus/`), das Widget setzt `/de/` oder `/nds/` davor. Externe Links mit `https://`, sie werden gekennzeichnet. |

Antworten, die nicht in dieses Schema passen, verwirft das Widget und zeigt den Fehlertext.

## Fehler und Grenzen

- Zeitlimit im Widget: 15 Sekunden. Danach erscheint „Der Chat ist gerade nicht erreichbar. Ruf uns gern an: …“.
- Jeder Status außer 200 gilt als Fehler. Für zu viele Anfragen `429` senden; das Widget zeigt dann denselben Hinweis.
- Der Dienst sollte Anfragen je Quelle begrenzen (Vorschlag: 20 pro Minute) und Fragen über 500 Zeichen ablehnen.
- CORS: nur die Domain der Gemeinde zulassen, nur `POST` und `Content-Type`.

## Pflichten für einen echten Dienst

1. **Nur belegte Antworten.** Antworten nur aus Inhalten dieser Website und des späteren CMS, jede Antwort mit
   mindestens einem Link auf die Quelle. Wenn nichts passt: `kind: "unbekannt"` mit Verweis aufs Rathaus,
   nie raten. Gleiche Regel wie für die ganze Website: nichts erfinden.
2. **Notfall zuerst und fest.** Fragen nach Notfall, Feuer, Unfall usw. bekommen sofort die festen Nummern 112 und
   110 aus `facts.json`, ohne Umweg über ein Sprachmodell.
3. **Keine persönlichen Daten.** Das Widget hält Eingaben mit E-Mail-Adresse oder IBAN schon im Browser zurück.
   Der Dienst speichert Fragen nicht dauerhaft und nutzt sie nicht zum Training. Server-Protokolle ohne volle IP.
4. **Datenschutz.** Betrieb in der EU, Auftragsverarbeitungsvertrag, Eintrag ins Verarbeitungsverzeichnis.
   Vor der ersten Frage ein eigener Hinweis mit aktiver Zustimmung (der Schritt „Verstanden, Chat starten“
   ist dafür schon da, der Text muss angepasst werden). TODO: prüfen mit dem Datenschutzbeauftragten.
5. **Kennzeichnung.** Das Widget bleibt als Chat einer Maschine erkennbar („Antworten ohne Gewähr“), auch nach dem
   Ende der Probe-Version (KI-Verordnung, Art. 50: Hinweis auf KI-Interaktion). TODO: prüfen.
6. **Plattdeutsch.** Solange die Inhalte nur Hochdeutsch sind, antwortet der Dienst auf Hochdeutsch. Das Widget
   zeichnet sich auf `/nds/`-Seiten mit `lang="de"` aus.

## Barrierefreiheit im Widget (bleibt bei jedem Dienst gleich)

- Knopf „Frag den Chat“ unten rechts, mindestens 44 px hoch, öffnet einen modalen Dialog (natives `<dialog>`):
  Fokus bleibt im Dialog, Escape schließt, der Fokus kehrt auf den Knopf zurück.
- Auf dem Handy füllt der Dialog den Bildschirm, ab 640 px ist er ein Fenster unten rechts.
- Antworten stehen in einem `role="log"`-Bereich und werden vorgelesen; „Antwort wird gesucht …“ steht in einem
  `role="status"`. Deshalb kommt die Antwort als Ganzes: Streaming Wort für Wort würde Vorlesegeräte überfluten.
- Der Fokus bleibt beim Senden im Eingabefeld. Nach einem Link-Klick schließt der Dialog.
- Ohne JavaScript gibt es keinen Knopf. Alle Inhalte sind über Navigation und Suche erreichbar.
- Auf der Startseite bleibt der Knopf weg, solange die Foto-Reise läuft, damit er nichts verdeckt.
- Geprüft mit `npm run check:chat` (axe im offenen Dialog, Tastatur, Antworten, keine fremden Anfragen).
