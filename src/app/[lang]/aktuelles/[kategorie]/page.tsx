import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsList } from "@/components/content/NewsList";
import { PageHeader } from "@/components/layout/PageHeader";
import { getNews, newsCategories } from "@/lib/content";
import { enabledLocales } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const dynamicParams = false;

export function generateStaticParams() {
  return enabledLocales.flatMap((lang) => newsCategories.map((c) => ({ lang, kategorie: c.slug })));
}

const intros: Record<string, string> = {
  nachrichten: "Neuigkeiten aus Rathaus, Ortsteilen und Vereinen.",
  bekanntmachungen: "Amtliche Bekanntmachungen der Gemeinde Großheide.",
  ausschreibungen: "Öffentliche Ausschreibungen und Vergaben der Gemeinde.",
  stellenangebote: "Freie Stellen bei der Gemeinde und ihren Einrichtungen.",
};

export async function generateMetadata({ params }: PageProps<"/[lang]/aktuelles/[kategorie]">): Promise<Metadata> {
  const { kategorie } = await params;
  return { title: newsCategories.find((c) => c.slug === kategorie)?.plural };
}

export default async function KategoriePage({ params }: PageProps<"/[lang]/aktuelles/[kategorie]">) {
  const locale = await resolveLocale(params);
  const { kategorie } = await params;
  const cat = newsCategories.find((c) => c.slug === kategorie);
  if (!cat) notFound();
  const items = getNews(locale, cat.id);
  return (
    <>
      <PageHeader
        locale={locale}
        title={cat.plural}
        intro={intros[cat.slug]}
        crumbs={[{ label: "Aktuelles", href: "/aktuelles/" }]}
      />
      <div className="gh-container py-12">
        <p className="mb-6 text-muted">
          {items.length} {items.length === 1 ? "Eintrag" : "Einträge"}
        </p>
        <NewsList locale={locale} items={items} headingLevel={2} showCategory={false} />
      </div>
    </>
  );
}
