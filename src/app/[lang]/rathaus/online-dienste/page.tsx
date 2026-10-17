import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SmartLink } from "@/components/ui/SmartLink";
import { SourceLink } from "@/components/ui/SourceLink";
import { TodoMark } from "@/components/ui/Todo";
import { facts } from "@/lib/content";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Online-Dienste" };

export default async function OnlineDienstePage({ params }: PageProps<"/[lang]/rathaus/online-dienste">) {
  const locale = await resolveLocale(params);
  return (
    <>
      <PageHeader
        locale={locale}
        title="Online-Dienste"
        crumbs={[{ label: "Rathaus & Service", href: "/rathaus/" }]}
        intro="Diese Anliegen kannst du von zu Hause aus erledigen. Die Dienste laufen bei externen Anbietern; jeder Link ist entsprechend gekennzeichnet."
      />
      <div className="gh-container py-12">
        <ul className="grid gap-4 md:grid-cols-2">
          {facts.onlineDienste.map((d) => (
            <li key={d.id} className="gh-card p-5">
              <h2 className="font-sans text-lg font-bold">
                <SmartLink locale={locale} href={d.url}>
                  {d.name}
                </SmartLink>
              </h2>
              <p className="mt-1 text-sm text-muted">Anbieter: {d.anbieter}</p>
              {d.note && (
                <p className="mt-2 text-sm">
                  <TodoMark /> {d.note}
                </p>
              )}
              <SourceLink href={d.source} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
