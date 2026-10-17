"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { SmartLink } from "@/components/ui/SmartLink";
import { fill, type Dictionary, type Locale } from "@/lib/i18n";
import type { SearchEntry } from "@/lib/search";
import { rankEntries } from "@/lib/search-text";

interface Props {
  locale: Locale;
  index: SearchEntry[];
  t: Pick<Dictionary, "searchResultsFor" | "searchResultCount" | "searchNoResults" | "searchHint">;
  phone: string;
}

/** Clientseitige Suche über den beim Build erzeugten Index (kein externer Dienst). */
export function SearchResults({ locale, index, t, phone }: Props) {
  const q = (useSearchParams().get("q") ?? "").trim();
  const results = useMemo(() => rankEntries(index, q), [q, index]);

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
