import type { Metadata } from "next";
import Link from "next/link";
import { ContactDetails } from "@/components/content/ContactDetails";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Toc } from "@/components/layout/Toc";
import { SmartLink } from "@/components/ui/SmartLink";
import { SourceLink } from "@/components/ui/SourceLink";
import { TodoMark } from "@/components/ui/Todo";
import { facts, factValue, getOnlineDienst } from "@/lib/content";
import { localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Bauen, Wohnen, Wirtschaft" };

export default async function BauenPage({ params }: PageProps<"/[lang]/bauen-wohnen-wirtschaft">) {
  const locale = await resolveLocale(params);
  const gis = getOnlineDienst("gis")!;
  const breitband = getOnlineDienst("breitband")!;
  const leader = getOnlineDienst("leader")!;
  const bauhof = facts.einrichtungen.bauhof;
  return (
    <>
      <PageHeader
        locale={locale}
        title="Bauen, Wohnen, Wirtschaft"
        intro="Bauplätze und Bebauungspläne, Gemeindeentwicklung, erneuerbare Energie und die Betriebe vor Ort."
      />
      <div className="gh-container space-y-16 py-12">
        <Toc
          locale={locale}
          items={[
            { id: "bauen", label: "Bauen & Wohnen" },
            { id: "entwicklung", label: "Gemeindeentwicklung" },
            { id: "energie", label: "Energie" },
            { id: "wirtschaft", label: "Wirtschaft" },
            { id: "leader", label: "LEADER-Region" },
            { id: "bauhof", label: "Bauhof" },
          ]}
        />
        <Section id="bauen" title="Bauen & Wohnen">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <Link href={localeHref(locale, "/rathaus/dienstleistungen/#wohnbaugrundstuecke-der-gemeinde")}>
                Wohnbaugrundstücke der Gemeinde
              </Link>
            </li>
            <li>
              <Link href={localeHref(locale, "/rathaus/dienstleistungen/#bebauungsplan-einsehen")}>Bebauungspläne</Link>
            </li>
            <li>
              <Link href={localeHref(locale, "/rathaus/dienstleistungen/#bodenrichtwerte-auskunft")}>Bodenrichtwerte</Link>
            </li>
            <li>
              <SmartLink locale={locale} href={gis.url}>
                {gis.name}
              </SmartLink>{" "}
              mit Karten und Plänen
            </li>
          </ul>
          <p className="mt-4">
            Aktuelle Baugebiete und freie Grundstücke: <TodoMark />
          </p>
        </Section>
        <Section id="entwicklung" title="Gemeindeentwicklung">
          <p>
            Dorfentwicklung, Förderprogramme und laufende Planungen werden nach Prüfung der Quellen ergänzt. <TodoMark />
          </p>
        </Section>
        <Section id="energie" title="Energie">
          <p className="max-w-2xl">
            Hier informiert die Gemeinde über Verfahren rund um erneuerbare Energien, zum Beispiel das Genehmigungsverfahren
            für das Repowering im Windpark Holtriem.
          </p>
          <p className="mt-3">
            <Link href={localeHref(locale, "/aktuelles/meldung/bekanntmachung-repowering-windpark-holtriem/")}>
              Bekanntmachung zum Repowering im Windpark Holtriem
            </Link>
          </p>
          <p className="mt-3">
            <SmartLink locale={locale} href={breitband.url}>
              {breitband.name}
            </SmartLink>
          </p>
        </Section>
        <Section id="wirtschaft" title="Wirtschaft">
          <p>
            Ein Verzeichnis der Betriebe in Großheide und Informationen zu Gewerbeflächen folgen. <TodoMark />
          </p>
          <p className="mt-3">
            <Link href={localeHref(locale, "/rathaus/dienstleistungen/#gewerbe-anmelden")}>Gewerbe an- oder abmelden</Link>
          </p>
        </Section>
        <Section id="leader" title="LEADER-Region Mittleres Ostfriesland">
          <p className="max-w-2xl">
            Großheide gehört zur {factValue(facts.gemeinde.leaderRegion)}. Das Regionalmanagement unterstützt Projekte im
            ländlichen Raum.
          </p>
          <p className="mt-3">
            <SmartLink locale={locale} href={leader.url}>
              Website der LEADER-Region
            </SmartLink>
          </p>
          <SourceLink href={facts.gemeinde.leaderRegion.source} />
        </Section>
        <Section id="bauhof" title={bauhof.name}>
          <ContactDetails locale={locale} telefon={bauhof.telefon} />
          <SourceLink href={bauhof.source} />
        </Section>
      </div>
    </>
  );
}
