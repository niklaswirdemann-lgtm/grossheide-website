# Phase 5: Chat-Widget (Probe-Version) und Plattdeutsch-Grundgerüst

Stand: 17.10.2026. Nichts gepusht oder veröffentlicht.

## Chat-Widget

- Knopf „Frag den Chat“ unten rechts auf jeder Seite. Er öffnet einen Dialog: auf dem Handy als Vollbild, ab 640 px als
  Fenster unten rechts.
- Vor dem ersten Gespräch steht ein Hinweis: Probe-Version, läuft nur im Browser, nichts wird gesendet oder gespeichert,
  keine persönlichen Daten eingeben, bei Lebensgefahr 112. Erst danach geht es los („Verstanden, Chat starten“). An dieser
  Stelle kommt bei einem echten Dienst die Datenschutz-Zustimmung hin.
- Die Probe-Version ist keine KI. Sie antwortet nur mit Inhalten dieser Website:
  - Notfall (Unfall, Feuer, Notruf …): immer zuerst 112, 110 und der ärztliche Bereitschaftsdienst aus `facts.json`
  - Öffnungszeiten und Kontakt des Rathauses aus `facts.json`
  - sonst eine Stichwortsuche über den Suchindex (Dienstleistungen, Einrichtungen, Seiten, Meldungen, Termine),
    höchstens 3 Links
  - ohne Treffer: „Dazu finde ich auf der Website nichts“ und die Telefonnummer des Rathauses. Die Probe erfindet nichts.
  - Eingaben mit E-Mail-Adresse oder IBAN werden nicht bearbeitet und auch an einen späteren echten Dienst nie weitergegeben.
- Beispiele aus dem Test: „Ich brauche einen neuen Personalausweis“ findet „Personalausweis beantragen“, „Umzug melden“ die
  drei Wohnsitz-Leistungen, „Öffnungszeiten Museum“ das Wald- und Moormuseum, „Wie werde ich Mitglied der Feuerwehr?“ die
  Feuerwehren. „Wer ist Bürgermeister?“ und „Hundesteuer“ findet sie nicht (steht nicht im Suchindex) und verweist ans Rathaus.
- Ohne JavaScript gibt es keinen Knopf. Auf der Startseite erscheint er erst nach der Foto-Reise, damit er nichts verdeckt.
- Barrierefreiheit: natives `<dialog>` (Fokus bleibt drin, Escape schließt, Fokus zurück auf den Knopf), Antworten in
  `role="log"`, „Antwort wird gesucht …“ als Status, Fokus bleibt beim Senden im Feld, Link in der Antwort schließt den Dialog.
  Unten auf jeder Seite ist Platz, damit der Knopf „Zum Seitenanfang“ nicht verdeckt; fokussierte Elemente rutschen nicht
  unter den Knopf (`scroll-padding-bottom`).
- Schnittstelle für einen echten Dienst: [chat-api.md](chat-api.md). Umschalten per `NEXT_PUBLIC_CHAT_ENDPOINT` beim Build.
- Datenschutzerklärung und Erklärung zur Barrierefreiheit beschreiben die Probe-Version.

## Plattdeutsch-Grundgerüst

- Jede Seite gibt es jetzt auch unter `/nds/…`. Die Sprachwahl oben führt zur selben Seite in der anderen Sprache.
- Auf Plattdeutsch sind bisher nur Kopfzeile, Menü (Hauptpunkte), Fußzeile und Sprungmarken, als **ungeprüfter Entwurf**
  (Ostfriesisches Platt, von mir formuliert). Beispiele: „Startsied“, „Menü opmaken“, „Söken“, „Raadhuus & Service“,
  „Leven & Lehren“, „Apentieden“, „Na baven“.
- Die Inhalte der Seiten stehen auf Hochdeutsch und sind mit `lang="de"` ausgezeichnet, damit Vorlesegeräte sie richtig
  aussprechen (WCAG 3.1.2). Oben im Inhalt steht auf jeder Platt-Seite ein Hinweis mit „TODO: Plattdeutsch prüfen“.
- Unterpunkte des Menüs, „Ortsteile“ und „Barrierefreiheit“ bleiben vorerst Hochdeutsch (mit `lang="de"`), weil ich bei den Begriffen
  nicht sicher bin. „Leichte Sprache“ ist ein Angebot auf Hochdeutsch und bleibt so.
- Der Chat antwortet auch auf Platt-Seiten auf Hochdeutsch (mit `lang="de"`), weil sein Wissen Hochdeutsch ist.
- Technik: `contentLocales` in `src/lib/i18n.ts` sagt, in welchen Sprachen Inhalte vorliegen; `contentLocale()` liefert die
  Sprache für alles in `<main>`. Platt-Beschriftungen des Menüs in `content/nds/navigation.json`, UI-Texte in
  `content/nds/ui.json`.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run check` (Kontrast, Typen, Lint, Build) | fehlerfrei |
| `npm run audit` (axe + Links) | 108 Seiten (54 je Sprache), 0 Verstöße, 0 kaputte Links |
| `npm run check:journey` | 47 von 47 |
| `npm run check:mobile` | 13 von 13 (jetzt 108 Seiten bei 390 px) |
| `npm run check:chat` (neu) | 28 von 28 |

Ladezeit (gedrosseltes Handy, Median aus 3 Läufen):

| Seite | LCP | CLS | TBT | Übertragen | Phase 4 |
|---|---|---|---|---|---|
| Startseite | 948 ms | 0 | 430 ms | 524 KB | 852 ms / 380 ms / 520 KB |
| Rathaus | 884 ms | 0 | 279 ms | 285 KB | 800 ms / 239 ms / 268 KB |
| Freizeit | 924 ms | 0 | 368 ms | 425 KB | 860 ms / 341 ms / 406 KB |
| Ortsteil Großheide | 2180 ms | 0 | 339 ms | 367 KB | 2104 ms / 294 ms / 350 KB |

Das Widget kostet je Seite etwa 15 KB mehr; das Wissen (20 KB) lädt erst bei der ersten Frage. Die Blockierzeit
schwankt im Container stark (siehe Phase 4), alle Werte liegen unter den Grenzen (LCP 2,5 s, CLS 0,1, TBT 500 ms).

## Offen

- Plattdeutsch: alle Texte von einer Plattdeutsch-Sprecherin oder einem Plattdeutsch-Sprecher aus der Region prüfen
  lassen; danach Unterpunkte und Seiteninhalte übersetzen (am besten im CMS je Sprache).
- `hreflang`-Verweise zwischen /de/ und /nds/ brauchen die endgültige Domain (vor dem Livegang ergänzen).
- Seitentitel im Browser-Tab sind auf Platt-Seiten noch Hochdeutsch.
- Echter Chat-Dienst: Anbieter, Hosting in der EU, Datenschutzhinweis und Zustimmung, Kennzeichnung als KI. TODO: prüfen.
- Der Weg zu einem echten Dienst (`NEXT_PUBLIC_CHAT_ENDPOINT`) ist nur per Typprüfung abgesichert, bis es einen Dienst gibt.
- Die Probe-Version kennt nur, was im Suchindex steht (z. B. nicht den Bürgermeister oder einzelne Steuern).
- Aus den Phasen davor: Bildrechte aller Fotos, Fotos für Dorfplatz und Windpark, großes Rathaus-Foto.
