import Link from "next/link";
import type { EventItem } from "@/lib/content";
import { formatDate, formatTimeRange } from "@/lib/format";
import { localeHref, type Locale } from "@/lib/i18n";
import { Val } from "@/components/ui/Todo";

interface Props {
  locale: Locale;
  items: EventItem[];
  headingLevel?: 2 | 3;
  /** Plakat-Optik für die Litfaßsäule auf der Startseite */
  variant?: "list" | "poster";
}

function DateBadge({ iso }: { iso: string }) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  const month = new Intl.DateTimeFormat("de-DE", { month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))),
  );
  return (
    <span aria-hidden="true" className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-warm-soft text-center leading-none">
      <span className="font-display text-2xl font-bold text-text">{Number(d)}</span>
      <span className="mt-1 text-xs font-bold uppercase text-warm-text">{month}</span>
    </span>
  );
}

export function EventList({ locale, items, headingLevel = 3, variant = "list" }: Props) {
  const H = `h${headingLevel}` as "h2" | "h3";
  if (!items.length) return <p className="text-muted">Derzeit sind keine Veranstaltungen eingetragen.</p>;
  return (
    <ul className={variant === "poster" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
      {items.map((e) => (
        <li
          key={e.slug}
          className={`gh-card relative flex gap-4 p-4 focus-within:ring-2 focus-within:ring-brand ${
            variant === "poster" ? "border-t-4 border-t-warm" : ""
          }`}
        >
          <DateBadge iso={e.start} />
          <div className="min-w-0">
            <H className="font-sans text-lg font-bold leading-snug">
              <Link href={localeHref(locale, `/aktuelles/veranstaltungen/${e.slug}/`)} className="after:absolute after:inset-0">
                {e.title}
              </Link>
            </H>
            <p className="mt-1 text-sm">
              <time dateTime={e.start}>{formatDate(e.start)}</time>, {formatTimeRange(e.start, e.end, e.allDay)}
            </p>
            <p className="text-sm text-muted">
              <Val>{e.location}</Val>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
