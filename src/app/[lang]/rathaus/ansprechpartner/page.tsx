import type { Metadata } from "next";
import { ContactDetails } from "@/components/content/ContactDetails";
import { PageHeader } from "@/components/layout/PageHeader";
import { SourceLink } from "@/components/ui/SourceLink";
import { TodoMark } from "@/components/ui/Todo";
import { facts, factValue } from "@/lib/content";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Ansprechpartner" };

export default async function AnsprechpartnerPage({ params }: PageProps<"/[lang]/rathaus/ansprechpartner">) {
  const locale = await resolveLocale(params);
  const r = facts.rathaus;
  return (
    <>
      <PageHeader
        locale={locale}
        title="Ansprechpartner"
        crumbs={[{ label: "Rathaus & Service", href: "/rathaus/" }]}
        intro="Für allgemeine Fragen erreichst du die Zentrale der Gemeindeverwaltung. Für einzelne Themen gibt es feste Ansprechpartnerinnen und Ansprechpartner."
      />
      <div className="gh-container py-12">
        <div className="gh-card max-w-xl p-6">
          <h2 className="font-sans text-xl font-bold">Zentrale</h2>
          <ContactDetails locale={locale} telefon={factValue(r.telefon)} email={factValue(r.email)} />
        </div>
        <h2 className="mt-12 text-3xl">Nach Thema</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {facts.ansprechpartner.map((a) => (
            <li key={a.email} className="gh-card p-5">
              <h3 className="font-sans text-lg font-bold">{a.aufgabe}</h3>
              <p className="mt-1">{a.name}</p>
              <ContactDetails locale={locale} telefon={a.telefon} email={a.email} />
              {a.note && (
                <p className="mt-2 text-sm">
                  <TodoMark /> {a.note}
                </p>
              )}
              <SourceLink href={a.source} />
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl">
          Die vollständige Übersicht aller Beschäftigten der Verwaltung wird nach Freigabe ergänzt. <TodoMark />
        </p>
      </div>
    </>
  );
}
