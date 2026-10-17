# Phase 6: Schlussprüfung

Stand: 17.10.2026. Geprüft wurde der statische Export (`out/`) mit 108 Seiten (54 Hochdeutsch, 54 Plattdeutsch).
Nichts gepusht oder veröffentlicht. Was vor dem Livegang noch fehlt: [offene-punkte.md](offene-punkte.md).

## Ergebnis

| Prüfung | Befehl | Ergebnis |
|---|---|---|
| Kontrast, Typen, Lint, Build | `npm run check` | fehlerfrei |
| axe (WCAG 2.1 A/AA + Best Practices), interne Links | `npm run audit` | 108 Seiten, 0 Verstöße, 0 kaputte Links |
| Lighthouse, Handy und Desktop (neu) | `npm run check:lighthouse` | 18 von 18 Läufen innerhalb der Grenzen |
| Tastatur, reduzierte Bewegung, Zoom, Textabstände (neu) | `npm run check:a11y` | 9 von 9 |
| Foto-Reise | `npm run check:journey` | 47 von 47 |
| Handy (390 px, ohne JavaScript, Ladezeit) | `npm run check:mobile` | 13 von 13 |
| Chat und Plattdeutsch-Rahmen | `npm run check:chat` | 28 von 28 |

## Lighthouse

Lighthouse 13.5.0, Standard-Einstellungen (Handy: gedrosselte CPU und langsames 4G, simuliert). SEO ohne die Prüfung
„is-crawlable“, weil die Entwicklungsfassung absichtlich auf `noindex` steht. Grenzen: Leistung ≥ 90,
Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 90.

| Seite | Handy: Leistung | Handy: LCP | Desktop: Leistung | Barrierefreiheit | Best Practices | SEO |
|---|---|---|---|---|---|---|
| Startseite | 96 | 2,9 s | 100 | 100 | 100 | 100 |
| Rathaus & Service | 99 | 1,5 s | 100 | 100 | 100 | 100 |
| Dienstleistungen A–Z | 99 | 1,4 s | 100 | 100 | 100 | 100 |
| Im Notfall | 96 | 2,6 s | 100 | 100 | 100 | 100 |
| Freizeit & Tourismus | 97 | 2,6 s | 100 | 100 | 100 | 100 |
| Ortsteil Großheide | 96 | 2,9 s | 100 | 100 | 100 | 100 |
| Nachrichten | 95 | 2,6 s | 100 | 100 | 100 | 100 |
| Suche „kita“ | 97 | 2,5 s | 100 | 100 | 100 | 100 |
| Startseite Plattdeutsch | 96 | 2,6 s | 100 | 100 | 100 | 100 |

CLS überall 0, Blockierzeit auf dem Handy 36–157 ms. Der erste Lauf nach dem Start von Chrome ist kalt (Startseite 61
statt 95–99); das Skript macht deshalb vorab einen Aufwärmlauf, der nicht zählt. Die Lighthouse-LCP-Werte auf dem Handy
sind simuliert und strenger als die eigene Messung in `check:mobile` (dort 0,8–2,2 s).

## Was `check:a11y` prüft (neu)

- **Tastatur (WCAG 2.1.1, 2.4.1, 2.4.3, 2.4.7):** Auf jeder Seite wird von oben bis unten durchgetabbt. Der erste Tab
  landet auf „Zum Inhalt springen“, der Sprung setzt den Fokus in den Inhalt. Jede Station hat einen sichtbaren
  Fokusrahmen, liegt nach dem Scrollen im Bild und wird nicht verdeckt, auch nicht vom Chat-Knopf. Die Reihenfolge
  folgt dem Quelltext, nirgends `tabindex` > 0.
- **Reduzierte Bewegung (2.3.3):** keine laufenden Animationen, kein weiches Scrollen, Startseite in der ruhigen Fassung.
- **Zoom (1.4.4, 1.4.10):** kein Querscrollen bei 320 px (entspricht 400 % Zoom) und 640 px (200 %).
- **Textabstände (1.4.12):** mit Zeilenhöhe 1,5, Buchstabenabstand 0,12 em, Wortabstand 0,16 em und Absatzabstand 2 em
  wird nichts abgeschnitten und nichts scrollt quer (Desktop und Handy).

## Behoben in dieser Phase

- **Suchseite sprang beim Laden** (Lighthouse Desktop: CLS 0,21). Die Treffer erscheinen erst im Browser und schoben die
  Fußzeile nach unten. Jetzt hält die Seite Platz frei; CLS 0.
- **Zwei Seiten bei 320 px zu breit:** Die E-Mail-Adresse der Schlichtungsstelle (Barrierefreiheit) und die Karten der
  Online-Dienste ließen sich nicht umbrechen. Lange E-Mail-Adressen und Links brechen jetzt um, Karten werden nicht
  breiter als ihre Spalte.

## Was diese Prüfungen nicht ersetzen

- Einen **BITV-Test** durch eine unabhängige Prüfstelle. Erst danach darf in der Erklärung zur Barrierefreiheit ein
  Stand der Vereinbarkeit stehen.
- Tests mit **Screenreadern** (NVDA, JAWS, VoiceOver, TalkBack), Bildschirmlupe und Sprachsteuerung, am besten mit
  Menschen, die sie täglich nutzen. Im Container gibt es diese Programme nicht.
- Messungen auf **echten Geräten** und im echten Netz nach dem Umzug auf den Hoster.
- Die inhaltliche Prüfung aller „TODO: prüfen“-Stellen, der Bildrechte und der plattdeutschen Texte.

Lighthouse-Berichte liegen nach einem Lauf in `lighthouse-reports/` (nicht im Git).
