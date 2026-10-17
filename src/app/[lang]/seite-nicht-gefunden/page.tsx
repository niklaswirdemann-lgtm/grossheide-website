import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchForm } from "@/components/layout/SearchForm";
import { contentLocale, getDictionary, localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const metadata: Metadata = { title: "Seite nicht gefunden", robots: { index: false } };

/** Wird beim Build zusätzlich als out/404.html abgelegt (scripts/postbuild.mjs). */
export default async function NotFoundPage({ params }: PageProps<"/[lang]/seite-nicht-gefunden">) {
  const locale = await resolveLocale(params);
  const t = getDictionary(contentLocale(locale));
  return (
    <>
      <PageHeader locale={locale} title={t.notFoundTitle} intro={t.notFoundText} />
      <div className="gh-container space-y-8 py-12">
        <div className="max-w-2xl">
          <SearchForm locale={locale} id="404-suche" showLabel />
        </div>
        <p>
          <Link href={localeHref(locale, "/")} className="gh-button gh-button-primary">
            Zur Startseite
          </Link>
        </p>
      </div>
    </>
  );
}
