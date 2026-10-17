import type { Einrichtung, Sourced } from "@/lib/content";
import { SourceLink } from "@/components/ui/SourceLink";
import { Val } from "@/components/ui/Todo";

/** Einrichtungen (Kitas, Schulen, Feuerwehren …) als Karten mit Adresse und Quelle. */
export function EinrichtungList({ items, headingLevel = 3 }: { items: Sourced<Einrichtung>[]; headingLevel?: 3 | 4 }) {
  const H = `h${headingLevel}` as "h3" | "h4";
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((e) => (
        <li key={e.id} className="gh-card p-5">
          <H className="font-sans text-lg font-bold">{e.name}</H>
          {e.art && <p className="text-sm text-muted">{e.art}</p>}
          <address className="mt-2 not-italic">
            {e.strasse && (
              <span className="block">
                <Val>{e.strasse}</Val>
              </span>
            )}
            <span className="block">
              26532 Großheide, Ortsteil <Val>{e.ortsteil}</Val>
            </span>
          </address>
          {e.note && (
            <p className="mt-2 text-sm">
              <Val>{e.note}</Val>
            </p>
          )}
          <SourceLink href={e.source} />
        </li>
      ))}
    </ul>
  );
}
