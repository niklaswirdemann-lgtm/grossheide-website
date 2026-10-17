import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Placeholder } from "@/components/ui/Placeholder";
import { SourceLink } from "@/components/ui/SourceLink";
import { Val } from "@/components/ui/Todo";
import { facts, factValue, getOrtsteile } from "@/lib/content";
import { localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Unsere Gemeinde" };

const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });

export default async function UnsereGemeindePage({ params }: PageProps<"/[lang]/rathaus/unsere-gemeinde">) {
  const locale = await resolveLocale(params);
  const g = facts.gemeinde;
  const flaeche = factValue(g.flaecheKm2);
  const einwohner = factValue(g.einwohner);
  return (
    <>
      <PageHeader
        locale={locale}
        title="Unsere Gemeinde"
        crumbs={[{ label: "Rathaus & Service", href: "/rathaus/" }]}
        intro="Großheide ist eine ländlich geprägte Flächengemeinde im Landkreis Aurich, im Nordwesten Ostfrieslands."
      />
      <div className="gh-container space-y-14 py-12">
        <Section id="zahlen" title="Zahlen und Fakten">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Fläche", flaeche ? `${nf.format(flaeche)} km²` : null, g.flaecheKm2.source],
              ["Ortsteile", String(factValue(facts.ortsteile)?.length ?? ""), facts.ortsteile.source],
              ["Einwohnerinnen und Einwohner", einwohner ? nf.format(einwohner) : null, g.einwohner.source],
              ["Bürgermeister", factValue(g.buergermeister), g.buergermeister.source],
            ].map(([label, value, source]) => (
              <div key={label} className="gh-card p-5">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold">
                  <Val>{value}</Val>
                </dd>
                <dd>
                  <SourceLink href={source} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6">
            Landkreis: {factValue(g.landkreis)}. {factValue(g.leaderRegion)}.
          </p>
        </Section>
        <Section id="ortsteile" title="Zehn Ortsteile">
          <ul className="flex flex-wrap gap-2">
            {getOrtsteile(locale).map((o) => (
              <li key={o.slug}>
                <Link href={localeHref(locale, `/ortsteile/${o.slug}/`)} className="gh-button gh-button-secondary">
                  {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
        <Section id="wappen" title="Das Wappen">
          <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
            <Placeholder label="Platzhalter" motif="Wappen der Gemeinde (nach Freigabe)" />
            <div>
              <p className="max-w-2xl">{factValue(g.wappenBeschreibung)}</p>
              <SourceLink href={g.wappenBeschreibung.source} />
            </div>
          </div>
        </Section>
        <Section id="geschichte" title="Geschichte und Partnerschaft">
          <p>
            Ortsgeschichte und Partnerstadt werden nach Prüfung der Quellen ergänzt. <Val>TODO: prüfen</Val>
          </p>
        </Section>
      </div>
    </>
  );
}
