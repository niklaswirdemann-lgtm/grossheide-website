import type { Metadata } from "next";
import Link from "next/link";
import { ContactDetails } from "@/components/content/ContactDetails";
import { OpeningHours } from "@/components/content/OpeningHours";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { SmartLink } from "@/components/ui/SmartLink";
import { SourceLink } from "@/components/ui/SourceLink";
import { TodoMark } from "@/components/ui/Todo";
import { facts, factValue, getOnlineDienst } from "@/lib/content";
import { localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Kontakt" };

export default async function KontaktPage({ params }: PageProps<"/[lang]/kontakt">) {
  const locale = await resolveLocale(params);
  const r = facts.rathaus;
  const hours = factValue(r.oeffnungszeiten);
  const termin = getOnlineDienst("termin")!;
  return (
    <>
      <PageHeader locale={locale} title="Kontakt" intro="So erreichst du die Gemeindeverwaltung Großheide." />
      <div className="gh-container grid gap-12 py-12 md:grid-cols-2">
        <Section id="anschrift" title="Anschrift und Kontakt">
          <ContactDetails
            locale={locale}
            name={factValue(r.bezeichnung) ?? undefined}
            strasse={factValue(r.strasse)}
            plzOrt={`${factValue(r.plz)} ${factValue(r.ort)}`}
            telefon={factValue(r.telefon)}
            email={factValue(r.email)}
          />
          <p className="mt-4">
            Fax: <TodoMark />
          </p>
          <SourceLink href={r.strasse.source} />
        </Section>
        <Section id="zeiten" title="Öffnungszeiten">
          {hours && <OpeningHours days={hours} />}
          <p className="mt-3">{factValue(r.oeffnungszeitenHinweis)}</p>
          <p className="mt-4">
            <SmartLink locale={locale} href={termin.url} className="gh-button gh-button-primary">
              Termin online buchen
            </SmartLink>
          </p>
        </Section>
        <Section id="weitere" title="Weitere Wege">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <Link href={localeHref(locale, "/rathaus/ansprechpartner/")}>Ansprechpartner nach Thema</Link>
            </li>
            <li>
              <Link href={localeHref(locale, "/rathaus/online-dienste/")}>Online-Dienste</Link>
            </li>
            <li>
              <Link href={localeHref(locale, "/leben-lernen/im-notfall/")}>Notrufnummern</Link>
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted">
            Ein Kontaktformular ist für den statischen Betrieb nicht vorgesehen; Anfragen bitte per E-Mail oder Telefon.
            Ein späteres Formular braucht einen datenschutzkonformen Versanddienst. <TodoMark />
          </p>
        </Section>
      </div>
    </>
  );
}
