import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SourceLink } from "@/components/ui/SourceLink";
import { TodoMark, Val } from "@/components/ui/Todo";
import { facts, factValue } from "@/lib/content";
import { telHref } from "@/lib/links";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Erklärung zur Barrierefreiheit" };

export default async function BarrierefreiheitPage({ params }: PageProps<"/[lang]/barrierefreiheit">) {
  const locale = await resolveLocale(params);
  const r = facts.rathaus;
  const b = facts.barrierefreiheit;
  const mail = factValue(r.email);
  const tel = factValue(r.telefon);
  const sTel = factValue(b.schlichtungsstelleTelefon);
  const sMail = factValue(b.schlichtungsstelleEmail);
  const subject = encodeURIComponent("Barriere auf der Website gemeldet");
  return (
    <>
      <PageHeader locale={locale} title="Erklärung zur Barrierefreiheit" />
      <div className="gh-container py-12">
        <div className="gh-prose">
          <p className="rounded-md bg-warm-soft p-4">
            Entwurf: Die Erklärung wird nach der Prüfung der neuen Website (Phase 6) mit Datum und Prüfergebnis
            fertiggestellt. <TodoMark />
          </p>
          <p>
            Die Gemeinde Großheide ist bemüht, ihre Website im Einklang mit den Vorgaben zur barrierefreien
            Informationstechnik barrierefrei zugänglich zu machen. Grundlage sind die BITV 2.0 und die WCAG 2.1 auf Stufe AA.
            Rechtsgrundlage: <Val>{factValue(b.rechtsgrundlage)}</Val>
          </p>
          <h2>Stand der Vereinbarkeit</h2>
          <p>
            <Val>TODO: prüfen</Val>
          </p>
          <h2>Bekannte Einschränkungen</h2>
          <ul>
            <li>Bilder sind noch Platzhalter.</li>
            <li>
              Plattdeutsch gibt es bisher nur für Kopfzeile, Menü und Fußzeile, als ungeprüften Entwurf. Die Inhalte stehen auf
              Hochdeutsch und sind so ausgezeichnet, dass Vorlesegeräte sie richtig aussprechen.
            </li>
            <li>Der Chat ist eine Probe-Version und antwortet nur mit Inhalten dieser Website.</li>
            <li>
              Externe Online-Dienste (z. B. Terminbuchung) werden von Dritten betrieben; deren Barrierefreiheit liegt nicht in
              unserer Hand.
            </li>
          </ul>
          <h2>Barriere melden</h2>
          <p>Ist dir eine Barriere aufgefallen? Schreib uns oder ruf an. Wir antworten so schnell wie möglich.</p>
          <ul>
            <li>
              E-Mail: {mail && <a href={`mailto:${mail}?subject=${subject}`}>{mail}</a>} (Betreff: „Barriere auf der Website
              gemeldet“)
            </li>
            <li>Telefon: {tel && <a href={telHref(tel)}>{tel}</a>}</li>
          </ul>
          <h2>Schlichtungsverfahren</h2>
          <p>
            Wenn auch nach deinem Hinweis keine Lösung gefunden wird, kannst du dich an die Schlichtungsstelle wenden:{" "}
            <Val>{factValue(b.schlichtungsstelleName)}</Val>
          </p>
          <ul>
            <li>Telefon: {sTel && <a href={telHref(sTel)}>{sTel}</a>}</li>
            <li>E-Mail: {sMail && <a href={`mailto:${sMail}`}>{sMail}</a>}</li>
          </ul>
          <SourceLink href={b.schlichtungsstelleEmail.source} />
        </div>
      </div>
    </>
  );
}
