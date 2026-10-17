import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SourceLink } from "@/components/ui/SourceLink";
import { TodoMark, Val } from "@/components/ui/Todo";
import { facts, factValue } from "@/lib/content";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Datenschutz" };

export default async function DatenschutzPage({ params }: PageProps<"/[lang]/datenschutz">) {
  const locale = await resolveLocale(params);
  const r = facts.rathaus;
  const d = facts.datenschutz;
  const mail = factValue(r.email);
  const dsbMail = factValue(d.beauftragterEmail);
  return (
    <>
      <PageHeader locale={locale} title="Datenschutz" intro="Wie die Gemeinde Großheide auf dieser Website mit deinen Daten umgeht." />
      <div className="gh-container py-12">
        <div className="gh-prose">
          <p className="rounded-md bg-warm-soft p-4">
            Entwurf: Die Datenschutzerklärung muss vor dem Livegang mit dem behördlichen Datenschutzbeauftragten abgestimmt
            werden. <TodoMark />
          </p>
          <h2>Verantwortliche Stelle</h2>
          <p>
            {factValue(facts.gemeinde.name)}, {factValue(r.strasse)}, {factValue(r.plz)} {factValue(r.ort)}, vertreten durch
            Bürgermeister {factValue(facts.gemeinde.buergermeister)}. Telefon {factValue(r.telefon)}, E-Mail{" "}
            {mail && <a href={`mailto:${mail}`}>{mail}</a>}.
          </p>
          <h2>Datenschutzbeauftragter</h2>
          <p>
            {factValue(d.beauftragter)}. E-Mail: {dsbMail && <a href={`mailto:${dsbMail}`}>{dsbMail}</a>}. Postanschrift wie
            oben.
          </p>
          <SourceLink href={d.beauftragter.source} />
          <h2>Was diese Website nicht tut</h2>
          <ul>
            <li>Keine Cookies für Werbung oder Statistik, keine Tracking-Dienste.</li>
            <li>Keine Google-Dienste und keine Inhalte von Drittservern: Schriften und Programmcode liegen auf unserem Server.</li>
            <li>
              Einstellungen wie „Bewegte Reise aus“ speichert dein Browser lokal (localStorage). Diese Daten verlassen dein Gerät
              nicht.
            </li>
          </ul>
          <h2>Server-Protokolle</h2>
          <p>
            Beim Aufruf speichert der Webserver technisch notwendige Daten (zum Beispiel IP-Adresse, Zeitpunkt, aufgerufene
            Seite). Hoster, Speicherdauer und Rechtsgrundlage: <Val>TODO: prüfen</Val>
          </p>
          <h2>Externe Links</h2>
          <p>
            Online-Dienste wie Terminbuchung oder Schadensmelder laufen bei externen Anbietern. Diese Links sind gekennzeichnet.
            Dort gelten die Datenschutzhinweise des jeweiligen Anbieters.
          </p>
          <h2 id="chat-assistent">Chat-Assistent</h2>
          <p>
            Der Chat auf dieser Website ist eine Probe-Version. Er beantwortet Fragen nur mit Inhalten dieser Website und läuft
            ganz in deinem Browser: Deine Eingaben werden nicht gesendet und nicht gespeichert. Dein Browser merkt sich nur bis
            zum Schließen des Fensters, dass du den Hinweis gelesen hast (sessionStorage).
          </p>
          <p>
            Ein echter Chat-Assistent bekommt vor dem Start einen eigenen Datenschutzhinweis, dem du aktiv zustimmen musst
            (Anbieter, Serverstandort, Speicherdauer). Details: <Val>TODO: prüfen</Val>
          </p>
          <h2>Deine Rechte und Beschwerde</h2>
          <p>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung sowie ein
            Beschwerderecht bei der Aufsichtsbehörde: <Val>{factValue(d.aufsichtsbehoerde)}</Val>{" "}
            <TodoMark label="Zuständigkeit: TODO: prüfen" />
          </p>
        </div>
      </div>
    </>
  );
}
