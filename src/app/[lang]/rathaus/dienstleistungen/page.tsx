import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SmartLink } from "@/components/ui/SmartLink";
import { SourceLink } from "@/components/ui/SourceLink";
import { TodoMark } from "@/components/ui/Todo";
import { getOnlineDienst, getServices, type ServiceItem } from "@/lib/content";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Dienstleistungen A–Z" };

function initial(name: string): string {
  return name.charAt(0).toUpperCase().replace("Ä", "A").replace("Ö", "O").replace("Ü", "U");
}

export default async function DienstleistungenPage({ params }: PageProps<"/[lang]/rathaus/dienstleistungen">) {
  const locale = await resolveLocale(params);
  const services = getServices(locale);
  const termin = getOnlineDienst("termin")!;
  const groups = new Map<string, ServiceItem[]>();
  for (const s of services) groups.set(initial(s.name), [...(groups.get(initial(s.name)) ?? []), s]);
  const letters = [...groups.keys()];

  return (
    <>
      <PageHeader
        locale={locale}
        title="Dienstleistungen A–Z"
        crumbs={[{ label: "Rathaus & Service", href: "/rathaus/" }]}
        intro="Alle Anliegen, die du bei der Gemeindeverwaltung erledigen kannst, alphabetisch sortiert."
      />
      <div className="gh-container py-12">
        <nav aria-label="Buchstaben">
          <ul className="flex flex-wrap gap-2">
            {letters.map((l) => (
              <li key={l}>
                <a
                  href={`#buchstabe-${l}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border-2 border-brand font-bold no-underline hover:bg-brand-soft"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-6 max-w-2xl rounded-md bg-warm-soft p-4">
          Erforderliche Unterlagen, Gebühren und Bearbeitungszeiten werden je Leistung ergänzt. <TodoMark />
        </p>
        <div className="mt-10 space-y-10">
          {[...groups.entries()].map(([letter, items]) => (
            <section key={letter} id={`buchstabe-${letter}`} aria-labelledby={`h-${letter}`} className="scroll-mt-28">
              <h2 id={`h-${letter}`} className="border-b-2 border-brand pb-1 text-3xl">
                {letter}
              </h2>
              <ul className="mt-4 divide-y divide-border">
                {items.map((s) => {
                  const dienst = s.onlineDienst ? getOnlineDienst(s.onlineDienst) : undefined;
                  return (
                    <li key={s.slug} id={s.slug} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <h3 className="font-sans text-lg font-bold">{s.name}</h3>
                        <p className="text-sm text-muted">Bereich: {s.bereich}</p>
                      </div>
                      <ul className="flex flex-wrap gap-2 text-sm">
                        {s.terminBuchbar && (
                          <li>
                            <SmartLink locale={locale} href={termin.url} className="gh-button gh-button-secondary">
                              Termin buchen<span className="sr-only">: {s.name}</span>
                            </SmartLink>
                          </li>
                        )}
                        {dienst && (
                          <li>
                            <SmartLink locale={locale} href={dienst.url} className="gh-button gh-button-secondary">
                              {dienst.name}
                            </SmartLink>
                          </li>
                        )}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <SourceLink href="https://www.grossheide.de/buergerservice" />
      </div>
    </>
  );
}
