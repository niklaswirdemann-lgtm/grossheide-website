import type { Metadata } from "next";
import { ContactDetails } from "@/components/content/ContactDetails";
import { PageHeader } from "@/components/layout/PageHeader";
import { SourceLink } from "@/components/ui/SourceLink";
import { TodoMark, Val } from "@/components/ui/Todo";
import { facts, factValue } from "@/lib/content";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Impressum" };

export default async function ImpressumPage({ params }: PageProps<"/[lang]/impressum">) {
  const locale = await resolveLocale(params);
  const r = facts.rathaus;
  const g = facts.gemeinde;
  return (
    <>
      <PageHeader locale={locale} title="Impressum" />
      <div className="gh-container py-12">
        <div className="gh-prose">
          <p className="rounded-md bg-warm-soft p-4">
            Entwurf: Der Text muss vor dem Livegang von der Gemeinde rechtlich geprüft werden. <TodoMark />
          </p>
          <h2>Herausgeber</h2>
          <ContactDetails
            locale={locale}
            name={factValue(g.name) ?? undefined}
            strasse={factValue(r.strasse)}
            plzOrt={`${factValue(r.plz)} ${factValue(r.ort)}`}
            telefon={factValue(r.telefon)}
            email={factValue(r.email)}
          />
          <p>
            Die Gemeinde Großheide ist eine Körperschaft des öffentlichen Rechts. Sie wird vertreten durch Bürgermeister{" "}
            {factValue(g.buergermeister)}.
          </p>
          <p>Umsatzsteuer-Identifikationsnummer: {factValue(g.ustId)}</p>
          <h2>Aufsichtsbehörde</h2>
          <p>
            <Val>TODO: prüfen</Val>
          </p>
          <h2>Verantwortlich für den Inhalt</h2>
          <p>
            <Val>TODO: prüfen</Val>
          </p>
          <h2>Bildnachweise</h2>
          <p>Auf dieser Website werden derzeit nur Platzhalter verwendet. Fotos und Wappen folgen nach Freigabe.</p>
          <h2>Schriften</h2>
          <p>Atkinson Hyperlegible Next und Fraunces, beide unter der SIL Open Font License 1.1, lokal ausgeliefert.</p>
          <SourceLink href={g.ustId.source} />
        </div>
      </div>
    </>
  );
}
