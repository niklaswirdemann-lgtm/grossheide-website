/** Text für den Vergleich vereinfachen: klein, ä→ae, ö→oe, ü→ue, ß→ss, ohne Akzente. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Was die Suche braucht (gleiche Felder wie `SearchEntry` aus search.ts). */
interface Searchable {
  title: string;
  text: string;
  type: string;
  keywords?: string;
}

function score(entry: Searchable, terms: string[]): number {
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

/** Treffer für `q`, beste zuerst (Suchseite und Schnellsuche). */
export function rankEntries<T extends Searchable>(index: T[], q: string): T[] {
  const terms = normalize(q)
    .split(/\s+/)
    .filter((x) => x.length > 1);
  if (!terms.length) return [];
  return index
    .map((e) => ({ e, s: score(e, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.e);
}
