import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SourceLink } from "@/components/ui/SourceLink";
import { facts, factValue } from "@/lib/content";
import { telHref } from "@/lib/links";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Im Notfall" };

export default async function NotfallPage({ params }: PageProps<"/[lang]/leben-lernen/im-notfall">) {
  const locale = await resolveLocale(params);
  const nummern = factValue(facts.notrufe) ?? [];
  return (
    <>
      <PageHeader
        locale={locale}
        title="Im Notfall"
        crumbs={[{ label: "Leben & Lernen", href: "/leben-lernen/" }]}
        intro="Bei Lebensgefahr wähle sofort 112. Die Notrufe 110 und 112 sind kostenlos und rund um die Uhr erreichbar."
      />
      <div className="gh-container py-12">
        <table className="w-full max-w-3xl border-collapse text-left">
          <caption className="mb-3 text-left text-xl font-bold">Notruf- und Störungsnummern</caption>
          <thead>
            <tr className="border-b-2 border-brand">
              <th scope="col" className="py-2 pr-4">
                Stelle
              </th>
              <th scope="col" className="py-2">
                Telefon
              </th>
            </tr>
          </thead>
          <tbody>
            {nummern.map((n) => (
              <tr key={n.name} className="border-b border-border">
                <th scope="row" className="py-3 pr-4 font-normal">
                  {n.name}
                </th>
                <td className="py-3">
                  {/* Notrufnummern als große Tippfläche (44 px), damit sie auf dem Handy sicher treffen */}
                  <a href={telHref(n.nummer)} className="inline-flex min-h-11 min-w-11 items-center text-lg font-bold">
                    {n.nummer}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <SourceLink href={facts.notrufe.source} />
      </div>
    </>
  );
}
