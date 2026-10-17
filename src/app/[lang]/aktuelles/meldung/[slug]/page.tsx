import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { SourceLink } from "@/components/ui/SourceLink";
import { Val } from "@/components/ui/Todo";
import { getNews, getNewsItem, newsCategories } from "@/lib/content";
import { formatDate, machineDate } from "@/lib/format";
import { enabledLocales, localeHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route";

export const dynamicParams = false;

export function generateStaticParams() {
  return enabledLocales.flatMap((lang) => getNews(lang).map((n) => ({ lang, slug: n.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/aktuelles/meldung/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const item = getNewsItem(lang === "nds" ? "nds" : "de", slug);
  return { title: item?.title, description: item?.summary };
}

export default async function MeldungPage({ params }: PageProps<"/[lang]/aktuelles/meldung/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const item = getNewsItem(locale, slug);
  if (!item) notFound();
  const cat = newsCategories.find((c) => c.id === item.category)!;
  return (
    <>
      <PageHeader
        locale={locale}
        title={item.title}
        eyebrow={cat.label}
        crumbs={[
          { label: "Aktuelles", href: "/aktuelles/" },
          { label: cat.plural, href: `/aktuelles/${cat.slug}/` },
        ]}
        intro={
          <p>
            Veröffentlicht am{" "}
            {machineDate(item.date) ? <time dateTime={item.date}>{formatDate(item.date)}</time> : <Val>{item.date}</Val>}
          </p>
        }
      />
      <article className="gh-container py-12">
        <div className="gh-prose">
          <p className="text-lg">{item.summary}</p>
          {item.body.map((p, i) => (
            <p key={i}>
              <Val>{p}</Val>
            </p>
          ))}
          <p>
            Den vollständigen Text mit allen Anlagen findest du bis zur Umstellung auf der{" "}
            <a href={item.source} rel="noopener">
              bisherigen Website der Gemeinde<span className="sr-only"> (externer Link)</span>
            </a>
            .
          </p>
        </div>
        <SourceLink href={item.source} />
        <p className="mt-10">
          <Link href={localeHref(locale, `/aktuelles/${cat.slug}/`)}>Zurück zu allen {cat.plural}</Link>
        </p>
      </article>
    </>
  );
}
