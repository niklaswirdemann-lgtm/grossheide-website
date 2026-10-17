import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EinrichtungList } from "@/components/content/EinrichtungList";
import { EventList } from "@/components/content/EventList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Photo } from "@/components/ui/Photo";
import { Placeholder } from "@/components/ui/Placeholder";
import { Val } from "@/components/ui/Todo";
import { facts, getEinrichtungenInOrtsteil, getEvents, getFoto, getOrtsteil, getOrtsteile } from "@/lib/content";
import { enabledLocales, localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const dynamicParams = false;

export function generateStaticParams() {
  return enabledLocales.flatMap((lang) => getOrtsteile(lang).map((o) => ({ lang, slug: o.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/ortsteile/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Ortsteil ${getOrtsteil("de", slug)?.name ?? ""}` };
}

/** Gemeinsames Template für alle Ortsteilseiten. */
export default async function OrtsteilPage({ params }: PageProps<"/[lang]/ortsteile/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const o = getOrtsteil(locale, slug);
  if (!o) notFound();
  const e = getEinrichtungenInOrtsteil(o.name);
  const events = getEvents(locale, facts.retrievedAt).filter((ev) => ev.ortsteil === o.name);
  const all = getOrtsteile(locale);
  const foto = getFoto({ ortsteil: o.slug });
  const blocks = [
    { id: "kitas", title: "Kindertagesstätten", items: e.kitas },
    { id: "schulen", title: "Schulen", items: e.schulen },
    { id: "feuerwehr", title: "Feuerwehr", items: e.feuerwehren },
    { id: "freizeit", title: "Freizeit", items: e.freizeit },
    { id: "wohnmobil", title: "Wohnmobilstellplätze", items: e.wohnmobil },
  ].filter((b) => b.items.length);

  return (
    <>
      <PageHeader locale={locale} title={o.name} eyebrow="Ortsteil" crumbs={[{ label: "Ortsteile", href: "/ortsteile/" }]} />
      <div className="gh-container space-y-14 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_20rem]">
          <p className="max-w-2xl text-lg">
            <Val>{o.intro}</Val>
          </p>
          {foto ? <Photo foto={foto} imgClassName="aspect-[3/2] w-full" priority /> : <Placeholder label="Platzhalter" motif={`Ansicht ${o.name}`} />}
        </div>

        {e.museum.length > 0 && (
          <Section id="museum" title="Museum">
            <p>
              <Link href={localeHref(locale, "/freizeit-tourismus/#museum")}>{e.museum[0].name}</Link>
            </p>
          </Section>
        )}

        {blocks.map((b) => (
          <Section key={b.id} id={b.id} title={b.title}>
            <EinrichtungList items={b.items} />
          </Section>
        ))}

        {e.spielplaetze.length > 0 && (
          <Section id="spielplaetze" title="Spielplätze">
            <ul className="list-disc pl-5">
              {e.spielplaetze.map((s) => (
                <li key={s.name}>{s.name}</li>
              ))}
            </ul>
          </Section>
        )}

        {events.length > 0 && (
          <Section id="termine" title="Veranstaltungen im Ortsteil">
            <EventList locale={locale} items={events} />
          </Section>
        )}

        <nav aria-labelledby="weitere-ortsteile">
          <h2 id="weitere-ortsteile" className="text-2xl">
            Weitere Ortsteile
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {all
              .filter((x) => x.slug !== o.slug)
              .map((x) => (
                <li key={x.slug}>
                  <Link href={localeHref(locale, `/ortsteile/${x.slug}/`)} className="gh-button gh-button-secondary">
                    {x.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
