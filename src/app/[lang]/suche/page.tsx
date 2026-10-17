import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchForm } from "@/components/layout/SearchForm";
import { SearchResults } from "@/components/search/SearchResults";
import { facts, factValue } from "@/lib/content";
import { contentLocale, getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";
import { buildSearchIndex } from "@/lib/search";

export const metadata: Metadata = { title: "Suche" };

export default async function SuchePage({ params }: PageProps<"/[lang]/suche">) {
  const locale = await resolveLocale(params);
  const t = getDictionary(contentLocale(locale));
  return (
    <>
      <PageHeader locale={locale} title={t.searchHeading} />
      <div className="gh-container space-y-10 py-12">
        <div className="max-w-2xl">
          <SearchForm locale={locale} textLocale={contentLocale(locale)} id="seiten-suche" size="large" showLabel />
        </div>
        {/* Ergebnisse kommen im Browser dazu: Platz freihalten, damit die Fußzeile nicht springt (CLS) */}
        <div className="min-h-[60svh]">
          <Suspense fallback={<p>{t.searchHint}</p>}>
            <SearchResults
              locale={locale}
              index={buildSearchIndex(contentLocale(locale))}
              t={t}
              phone={factValue(facts.rathaus.telefon) ?? ""}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}
