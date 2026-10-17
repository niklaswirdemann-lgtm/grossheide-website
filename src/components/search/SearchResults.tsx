"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { SmartLink } from "@/components/ui/SmartLink";
import { fill, type Dictionary, type Locale } from "@/lib/i18n";
import type { SearchEntry } from "@/lib/search";
import { normalize } from "@/lib/search-text";

function score(entry: SearchEntry, terms: string[]): number {
  const title = normalize(entry.title);
  const rest = normalize(`${entry.text} ${entry.keywords ?? ""} ${entry.type}`);
  let total = 0;
  for (const t of terms) {
    if (title.startsWith(t)) total += 6;
    else if (title.includes(t)) total += 4;
    else if (rest.includes(t)) total += 1;
    else return 0; // alle Begriffe müssen vorkommen
  }
  return total;
}

interface Props {
  locale: Locale;
  index: SearchEntry[];
  t: Pick<Dictionary, "searchResultsFor" | "searchResultCount" | "searchNoResults" | "searchHint">;
  phone: string;
}

/** Clientseitige Suche über den beim Build erzeugten Index (kein externer Dienst). */
export function SearchResults({ locale, index, t, phone }: Props) {
  const q = (useSearchParams().get("q") ?? "").trim();
  const results = useMemo(() => {
    const terms = normalize(q).split(/\s+/).filter((x) => x.length > 1);
    if (!terms.length) return [];
    return index
      .map((e) => ({ e, s: score(e, terms) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.e);
  }, [q, index]);

  if (!q) return <p>{t.searchHint}</p>;

  return (
    <section aria-labelledby="ergebnisse">
      <h2 id="ergebnisse" className="text-2xl">
        {fill(t.searchResultsFor, { q })}
      </h2>
      <p role="status" className="mt-1 text-muted">
        {results.length ? fill(t.searchResultCount, { n: results.length }) : fill(t.searchNoResults, { phone })}
      </p>
      <ol className="mt-6 space-y-3">
        {results.map((r) => (
          <li key={`${r.type}-${r.href}-${r.title}`} className="gh-card p-4">
            <p className="text-sm font-bold text-warm-text">{r.type}</p>
            <SmartLink locale={locale} href={r.href} className="text-lg font-bold">
              {r.title}
            </SmartLink>
            {r.text && <p className="text-muted">{r.text}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
