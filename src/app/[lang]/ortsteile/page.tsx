import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { SourceLink } from "@/components/ui/SourceLink";
import { facts, getOrtsteile } from "@/lib/content";
import { localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Ortsteile" };

export default async function OrtsteilePage({ params }: PageProps<"/[lang]/ortsteile">) {
  const locale = await resolveLocale(params);
  const items = getOrtsteile(locale);
  return (
    <>
      <PageHeader
        locale={locale}
        title="Ortsteile"
        intro={`Die Gemeinde Großheide besteht aus ${items.length} Ortsteilen.`}
      />
      <div className="gh-container py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((o) => (
            <li key={o.slug}>
              <Link
                href={localeHref(locale, `/ortsteile/${o.slug}/`)}
                className="gh-card flex min-h-20 items-center justify-between px-6 py-5 font-display text-2xl font-semibold no-underline hover:border-brand hover:bg-brand-soft"
              >
                {o.name}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <SourceLink href={facts.ortsteile.source} />
      </div>
    </>
  );
}
