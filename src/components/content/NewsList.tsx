import Link from "next/link";
import { newsCategories, type NewsItem } from "@/lib/content";
import { formatDate, machineDate } from "@/lib/format";
import { localeHref, type Locale } from "@/lib/i18n";
import { Val } from "@/components/ui/Todo";

interface Props {
  locale: Locale;
  items: NewsItem[];
  /** Überschriftenebene der Einträge, passend zur umgebenden Hierarchie. */
  headingLevel?: 2 | 3;
  showCategory?: boolean;
}

export function NewsList({ locale, items, headingLevel = 3, showCategory = true }: Props) {
  const H = `h${headingLevel}` as "h2" | "h3";
  if (!items.length) {
    return <p className="text-muted">Derzeit liegen keine Einträge vor.</p>;
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((n) => {
        const cat = newsCategories.find((c) => c.id === n.category);
        return (
          <li key={n.slug} className="gh-card relative flex flex-col p-5 focus-within:ring-2 focus-within:ring-brand">
            <H className="order-2 mt-1 font-sans text-lg font-bold leading-snug">
              <Link href={localeHref(locale, `/aktuelles/meldung/${n.slug}/`)} className="after:absolute after:inset-0">
                {n.title}
              </Link>
            </H>
            <p className="order-1 text-sm text-muted">
              {showCategory && cat && <span className="font-bold text-warm-text">{cat.label} · </span>}
              {machineDate(n.date) ? <time dateTime={n.date}>{formatDate(n.date)}</time> : <Val>{n.date}</Val>}
            </p>
            <p className="order-3 mt-2">{n.summary}</p>
          </li>
        );
      })}
    </ul>
  );
}
