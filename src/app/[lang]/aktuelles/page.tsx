import type { Metadata } from "next";
import Link from "next/link";
import { EventList } from "@/components/content/EventList";
import { NewsList } from "@/components/content/NewsList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { facts, getEvents, getNews, newsCategories } from "@/lib/content";
import { localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Aktuelles" };

export default async function AktuellesPage({ params }: PageProps<"/[lang]/aktuelles">) {
  const locale = await resolveLocale(params);
  return (
    <>
      <PageHeader
        locale={locale}
        title="Aktuelles"
        intro="Nachrichten, amtliche Bekanntmachungen, Ausschreibungen, Stellenangebote und Veranstaltungen aus der Gemeinde Großheide."
      />
      <div className="gh-container space-y-16 py-12">
        <nav aria-labelledby="rubriken">
          <h2 id="rubriken" className="text-2xl">
            Rubriken
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {newsCategories.map((c) => (
              <li key={c.id}>
                <Link href={localeHref(locale, `/aktuelles/${c.slug}/`)} className="gh-button gh-button-secondary">
                  {c.plural} <span className="font-normal">({getNews(locale, c.id).length})</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href={localeHref(locale, "/aktuelles/veranstaltungen/")} className="gh-button gh-button-secondary">
                Veranstaltungen
              </Link>
            </li>
          </ul>
        </nav>
        <Section id="neueste" title="Neueste Meldungen">
          <NewsList locale={locale} items={getNews(locale).slice(0, 6)} />
        </Section>
        <Section id="termine" title="Nächste Veranstaltungen">
          <EventList locale={locale} items={getEvents(locale, facts.retrievedAt).slice(0, 4)} />
          <p className="mt-4">
            <Link href={localeHref(locale, "/aktuelles/veranstaltungen/")}>Zum Veranstaltungskalender</Link>
          </p>
        </Section>
      </div>
    </>
  );
}
