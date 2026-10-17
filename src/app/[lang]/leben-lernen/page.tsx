import type { Metadata } from "next";
import Link from "next/link";
import { ContactDetails } from "@/components/content/ContactDetails";
import { EinrichtungList } from "@/components/content/EinrichtungList";
import { OpeningHours } from "@/components/content/OpeningHours";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Toc } from "@/components/layout/Toc";
import { SourceLink } from "@/components/ui/SourceLink";
import { TodoMark, Val } from "@/components/ui/Todo";
import { facts, factValue } from "@/lib/content";
import { localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Leben & Lernen" };

export default async function LebenLernenPage({ params }: PageProps<"/[lang]/leben-lernen">) {
  const locale = await resolveLocale(params);
  const e = facts.einrichtungen;
  const kitaKontakt = facts.ansprechpartner.find((a) => a.email === "kinderbetreuung@grossheide.de");
  const schulKontakt = facts.ansprechpartner.find((a) => a.email === "manninga-kruse@grossheide.de");
  const jz = e.jugendzentrum;
  return (
    <>
      <PageHeader
        fotoPath="/leben-lernen/"
        locale={locale}
        title="Leben & Lernen"
        intro="Betreuung, Bildung und Hilfe für alle Generationen: von der Krippe über die Schule bis zu Angeboten für Seniorinnen und Senioren."
      />
      <div className="gh-container space-y-16 py-12">
        <Toc
          locale={locale}
          items={[
            { id: "kitas", label: "Kindertagesstätten" },
            { id: "schulen", label: "Schulen" },
            { id: "jugend", label: "Jugend" },
            { id: "senioren", label: "Seniorinnen und Senioren" },
            { id: "feuerwehren", label: "Feuerwehren" },
            { id: "notfall", label: "Im Notfall" },
          ]}
        />
        <Section
          id="kitas"
          title="Kindertagesstätten"
          intro="In der Gemeinde gibt es zwei Kinderkrippen und fünf Kindergärten. Die Anmeldung läuft zentral über die Gemeinde."
        >
          <EinrichtungList items={e.kitas} />
          {kitaKontakt && (
            <div className="mt-6 gh-card max-w-xl p-5">
              <h3 className="font-sans text-lg font-bold">Auskunft und Anmeldung</h3>
              <p>{kitaKontakt.name}</p>
              <ContactDetails locale={locale} telefon={kitaKontakt.telefon} email={kitaKontakt.email} />
            </div>
          )}
          <p className="mt-4">
            <Val>{factValue(e.kitasHinweis)}</Val>
          </p>
        </Section>
        <Section id="schulen" title="Schulen" intro="Zwei Grundschulen und die Friederikenschule (Haupt- und Realschule).">
          <EinrichtungList items={e.schulen} />
          {schulKontakt && (
            <div className="mt-6 gh-card max-w-xl p-5">
              <h3 className="font-sans text-lg font-bold">Schulangelegenheiten in der Verwaltung</h3>
              <p>{schulKontakt.name}</p>
              <ContactDetails locale={locale} telefon={schulKontakt.telefon} email={schulKontakt.email} />
            </div>
          )}
        </Section>
        <Section id="jugend" title="Jugend">
          <div className="gh-card max-w-2xl p-5">
            <h3 className="font-sans text-lg font-bold">{jz.name}</h3>
            <ContactDetails
              locale={locale}
              strasse={jz.strasse}
              plzOrt={`${jz.plz} ${jz.ort}`}
              telefon={jz.telefon}
              email={jz.email}
            />
            <div className="mt-4">
              {jz.oeffnungszeiten && <OpeningHours days={jz.oeffnungszeiten} caption="Öffnungszeiten" />}
            </div>
            <SourceLink href={jz.source} />
          </div>
          <p className="mt-4">
            Ferienprogramm für Kinder und Jugendliche: <TodoMark />
          </p>
        </Section>
        <Section id="senioren" title="Seniorinnen und Senioren">
          <div className="gh-card max-w-2xl p-5">
            <h3 className="font-sans text-lg font-bold">{e.seniorenbeirat.name}</h3>
            <p className="mt-1">
              Kontakt: <Val>{e.seniorenbeirat.kontakt}</Val>
            </p>
            <SourceLink href={e.seniorenbeirat.source} />
          </div>
        </Section>
        <Section id="feuerwehren" title="Feuerwehren" intro="Die Gemeinde Großheide hat drei Ortsfeuerwehren.">
          <EinrichtungList items={e.feuerwehren} />
        </Section>
        <Section id="notfall" title="Im Notfall">
          <p className="text-xl">
            Notruf Feuerwehr und Rettungsdienst:{" "}
            <a href="tel:112" className="font-bold">
              112
            </a>
            , Polizei:{" "}
            <a href="tel:110" className="font-bold">
              110
            </a>
          </p>
          <p className="mt-4">
            <Link href={localeHref(locale, "/leben-lernen/im-notfall/")} className="gh-button gh-button-primary">
              Alle Notrufnummern
            </Link>
          </p>
        </Section>
        <Section id="weiteres" title="Weitere Themen">
          <p>
            Gesundheit, Sporthallen, Soziales und Beratung, Kirchengemeinden sowie Umwelt und Tiere werden nach Prüfung der
            Quellen ergänzt. <TodoMark />
          </p>
        </Section>
      </div>
    </>
  );
}
