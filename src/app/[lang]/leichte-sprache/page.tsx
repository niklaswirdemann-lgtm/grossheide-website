import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { TodoMark } from "@/components/ui/Todo";
import { facts, factValue } from "@/lib/content";
import { telHref } from "@/lib/links";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Leichte Sprache" };

export default async function LeichteSprachePage({ params }: PageProps<"/[lang]/leichte-sprache">) {
  const locale = await resolveLocale(params);
  const r = facts.rathaus;
  const tel = factValue(r.telefon);
  return (
    <>
      <PageHeader locale={locale} title="Leichte Sprache" />
      <div className="gh-container py-12">
        <div className="gh-prose text-xl leading-relaxed">
          <p className="rounded-md bg-warm-soft p-4 text-base">
            Diese Texte müssen noch von einer Prüf-Gruppe für Leichte Sprache geprüft werden. <TodoMark />
          </p>
          <h2>Willkommen</h2>
          <p>Das ist die Internet-Seite von der Gemeinde Großheide.</p>
          <p>Großheide liegt in Ostfriesland.</p>
          <p>Zu Großheide gehören 10 Orts-Teile.</p>
          <h2>Was steht auf dieser Internet-Seite?</h2>
          <ul>
            <li>Neuigkeiten aus Großheide.</li>
            <li>Was Sie im Rathaus erledigen können.</li>
            <li>Kinder-Gärten und Schulen.</li>
            <li>Freizeit und Urlaub.</li>
            <li>Bauen und Arbeiten.</li>
          </ul>
          <h2>Das Rathaus</h2>
          <p>Im Rathaus arbeitet die Verwaltung von der Gemeinde.</p>
          <p>Das Rathaus ist hier:</p>
          <p>
            {factValue(r.strasse)}
            <br />
            {factValue(r.plz)} {factValue(r.ort)}
          </p>
          <h2>Wann ist das Rathaus offen?</h2>
          <ul>
            <li>Montag bis Freitag von 8 Uhr bis 12 Uhr.</li>
            <li>Dienstag, Mittwoch und Donnerstag auch von 14 Uhr bis 16 Uhr.</li>
          </ul>
          <h2>Sie haben eine Frage?</h2>
          <p>Rufen Sie an:</p>
          <p>
            <a href={tel ? telHref(tel) : undefined} className="font-bold">
              {tel}
            </a>
          </p>
          <p>Bei Gefahr rufen Sie die Nummer 112 an.</p>
        </div>
      </div>
    </>
  );
}
