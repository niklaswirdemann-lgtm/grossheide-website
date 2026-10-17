import { enabledLocales, getDictionary, locales, type Locale } from "@/lib/i18n";
import { LanguageLink } from "./LanguageLink";

const names: Record<Locale, "languageDe" | "languageNds"> = { de: "languageDe", nds: "languageNds" };

/**
 * Sprachumschalter Hochdeutsch/Plattdeutsch: führt zur selben Seite in der anderen Sprache.
 * Noch nicht freigeschaltete Sprachen werden als „in Vorbereitung“ angezeigt statt als toter Link.
 */
export function LanguageSwitch({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <nav aria-label={t.languageSwitch}>
      <ul className="flex items-center gap-1 text-sm">
        {locales.map((l) => {
          const label = getDictionary(l)[names[l]];
          const active = l === locale;
          const enabled = enabledLocales.includes(l);
          return (
            <li key={l} lang={l}>
              {active ? (
                <span aria-current="true" className="rounded-full bg-brand px-3 py-1.5 font-bold text-on-brand">
                  {label}
                </span>
              ) : enabled ? (
                <LanguageLink to={l} className="inline-flex min-h-6 items-center rounded-full px-3 py-1.5 font-bold">
                  {label}
                </LanguageLink>
              ) : (
                <span className="px-3 py-1.5 text-muted">
                  {label} <span lang="de">(in Vorbereitung)</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
