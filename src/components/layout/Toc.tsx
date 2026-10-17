import { contentLocale, getDictionary, type Locale } from "@/lib/i18n";

/** Sprungmarken innerhalb einer Seite. */
export function Toc({ locale, items }: { locale: Locale; items: { id: string; label: string }[] }) {
  const t = getDictionary(contentLocale(locale));
  return (
    <nav aria-labelledby="toc-heading" className="gh-card p-5">
      <h2 id="toc-heading" className="mb-2 font-sans text-base font-bold">
        {t.inThisPage}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className="inline-flex min-h-11 items-center rounded-full bg-brand-soft px-4 font-bold no-underline hover:underline"
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
