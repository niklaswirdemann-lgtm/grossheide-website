import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { ContactDetails } from "@/components/content/ContactDetails";
import { OpeningHours } from "@/components/content/OpeningHours";
import { LinkList } from "@/components/ui/LinkList";
import { facts, factValue, getOnlineDienst } from "@/lib/content";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Rathaus & Service" };

export default async function RathausPage({ params }: PageProps<"/[lang]/rathaus">) {
  const locale = await resolveLocale(params);
  const r = facts.rathaus;
  const hours = factValue(r.oeffnungszeiten);
  const termin = getOnlineDienst("termin")!;
  const schaden = getOnlineDienst("schadensmelder")!;
  const ris = getOnlineDienst("ratsinfo")!;
  return (
    <>
      <PageHeader
        fotoPath="/rathaus/"
        locale={locale}
        title="Rathaus & Service"
        intro="Hier erledigst du Behördengänge, buchst Termine und findest die richtigen Ansprechpartner in der Gemeindeverwaltung."
      />
      <div className="gh-container space-y-16 py-12">
        <Section id="themen" title="Was möchtest du erledigen?">
          <LinkList
            locale={locale}
            items={[
              {
                label: "Dienstleistungen A–Z",
                href: "/rathaus/dienstleistungen/",
                description: "Ausweis, Anmeldung, Urkunden, Gewerbe und mehr.",
              },
              {
                label: "Online-Dienste",
                href: "/rathaus/online-dienste/",
                description: "Alles, was du online erledigen kannst.",
              },
              { label: termin.name, href: termin.url, description: "Wunschtermin für Einwohnermeldeamt und Standesamt." },
              { label: schaden.name, href: schaden.url, description: "Straßenschäden, defekte Laternen und Ähnliches melden." },
              { label: ris.name, href: ris.url, description: "Sitzungen, Tagesordnungen und Beschlüsse des Rates." },
              { label: "Ansprechpartner", href: "/rathaus/ansprechpartner/", description: "Wer hilft bei welchem Thema?" },
              { label: "Öffnungszeiten", href: "/rathaus/oeffnungszeiten/", description: "Wann das Rathaus geöffnet hat." },
              { label: "Unsere Gemeinde", href: "/rathaus/unsere-gemeinde/", description: "Zahlen, Ortsteile und Wappen." },
            ]}
          />
        </Section>
        <div className="grid gap-8 md:grid-cols-2">
          <Section id="besuch" title="Besuch im Rathaus">
            <ContactDetails
              locale={locale}
              name={factValue(r.bezeichnung) ?? undefined}
              strasse={factValue(r.strasse)}
              plzOrt={`${factValue(r.plz)} ${factValue(r.ort)}`}
              telefon={factValue(r.telefon)}
              email={factValue(r.email)}
            />
          </Section>
          <Section id="zeiten" title="Öffnungszeiten">
            {hours && <OpeningHours days={hours} />}
            <p className="mt-3 text-muted">{factValue(r.oeffnungszeitenHinweis)}</p>
          </Section>
        </div>
      </div>
    </>
  );
}
