import type { Locale } from "@/lib/i18n";
import { SmartLink } from "./SmartLink";

export interface LinkCard {
  label: string;
  href: string;
  description?: string;
}

/** Kachel-Liste für Übersichtsseiten (Bereich → Unterseite = 2. Klick). */
export function LinkList({ locale, items }: { locale: Locale; items: LinkCard[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <li key={i.href} className="gh-card relative p-5 focus-within:ring-2 focus-within:ring-brand hover:border-brand">
          <SmartLink locale={locale} href={i.href} className="text-lg font-bold after:absolute after:inset-0">
            {i.label}
          </SmartLink>
          {i.description && <p className="mt-1 text-muted">{i.description}</p>}
        </li>
      ))}
    </ul>
  );
}
