import type { Metadata } from "next";
import { EventList } from "@/components/content/EventList";
import { PageHeader } from "@/components/layout/PageHeader";
import { getEvents } from "@/lib/content";
import { formatMonth } from "@/lib/format";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Veranstaltungen" };

export default async function VeranstaltungenPage({ params }: PageProps<"/[lang]/aktuelles/veranstaltungen">) {
  const locale = await resolveLocale(params);
  const events = getEvents(locale);
  // Nach Monat gruppieren, jede Gruppe mit eigener Überschrift (Monat und Jahr).
  const groups = new Map<string, typeof events>();
  for (const e of events) {
    const key = e.start.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  return (
    <>
      <PageHeader
        locale={locale}
        title="Veranstaltungen"
        intro="Feste, Märkte, Konzerte und Angebote für Kinder in Großheide und den Ortsteilen."
        crumbs={[{ label: "Aktuelles", href: "/aktuelles/" }]}
      />
      <div className="gh-container space-y-12 py-12">
        {[...groups.entries()].map(([month, items]) => (
          <section key={month} aria-labelledby={`monat-${month}`}>
            <h2 id={`monat-${month}`} className="text-3xl">
              {formatMonth(`${month}-01`)}
            </h2>
            <div className="mt-4">
              <EventList locale={locale} items={items} />
            </div>
          </section>
        ))}
        <p className="text-muted">
          Du planst eine Veranstaltung? Melde sie bei der Tourist-Information der Gemeinde. Ein Online-Formular dafür folgt
          (TODO: prüfen).
        </p>
      </div>
    </>
  );
}
