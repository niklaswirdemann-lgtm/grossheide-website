import type { Metadata } from "next";
import { OpeningHours } from "@/components/content/OpeningHours";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { SmartLink } from "@/components/ui/SmartLink";
import { SourceLink } from "@/components/ui/SourceLink";
import { facts, factValue, getOnlineDienst } from "@/lib/content";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Öffnungszeiten" };

export default async function OeffnungszeitenPage({ params }: PageProps<"/[lang]/rathaus/oeffnungszeiten">) {
  const locale = await resolveLocale(params);
  const r = facts.rathaus;
  const e = facts.einrichtungen;
  const hours = factValue(r.oeffnungszeiten);
  const termin = getOnlineDienst("termin")!;
  return (
    <>
      <PageHeader
        locale={locale}
        title="Öffnungszeiten"
        crumbs={[{ label: "Rathaus & Service", href: "/rathaus/" }]}
        intro="Sprechzeiten der Gemeindeverwaltung und weiterer Einrichtungen."
      />
      <div className="gh-container space-y-14 py-12">
        <Section id="rathaus" title="Rathaus Großheide">
          {hours && <OpeningHours days={hours} caption="Sprechzeiten der Verwaltung" />}
          <p className="mt-4">{factValue(r.oeffnungszeitenHinweis)}</p>
          <p className="mt-4">
            <SmartLink locale={locale} href={termin.url} className="gh-button gh-button-primary">
              Termin online buchen
            </SmartLink>
          </p>
          <SourceLink href={r.oeffnungszeiten.source} />
        </Section>
        <Section id="museum" title={e.museum.name}>
          {e.museum.oeffnungszeiten && <OpeningHours days={e.museum.oeffnungszeiten} />}
          <p className="mt-3">{e.museum.saison}</p>
          <SourceLink href={e.museum.source} />
        </Section>
        <Section id="jugendzentrum" title={e.jugendzentrum.name}>
          {e.jugendzentrum.oeffnungszeiten && <OpeningHours days={e.jugendzentrum.oeffnungszeiten} />}
          <SourceLink href={e.jugendzentrum.source} />
        </Section>
      </div>
    </>
  );
}
