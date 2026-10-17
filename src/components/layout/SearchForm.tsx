import { getDictionary, localeHref, type Locale } from "@/lib/i18n";
import { withBase } from "@/lib/links";

interface Props {
  locale: Locale;
  /** Sprache der Beschriftung, falls abweichend (Suchseite: Sprache der Seiteninhalte). */
  textLocale?: Locale;
  id: string;
  size?: "default" | "large";
  defaultValue?: string;
  /** Beschriftung sichtbar anzeigen (Startseite) oder nur für Screenreader (Kopfzeile). */
  showLabel?: boolean;
  /** Eindeutiger Name der Such-Landmark, falls mehrere Suchfelder auf der Seite stehen. */
  landmarkLabel?: string;
}

/** Suche als normales GET-Formular: funktioniert auch ohne JavaScript. */
export function SearchForm({
  locale,
  textLocale = locale,
  id,
  size = "default",
  defaultValue,
  showLabel = false,
  landmarkLabel,
}: Props) {
  const t = getDictionary(textLocale);
  const large = size === "large";
  return (
    <form
      role="search"
      aria-label={landmarkLabel}
      action={withBase(localeHref(locale, "/suche/"))}
      method="get"
      className="w-full"
    >
      <label htmlFor={id} className={showLabel ? `mb-2 block font-bold ${large ? "text-lg" : ""}` : "sr-only"}>
        {t.searchLabel}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={t.searchPlaceholder}
          autoComplete="off"
          enterKeyHint="search"
          className={`min-w-0 flex-1 rounded-full border-2 border-ink-500 bg-surface px-4 text-text placeholder:text-ink-700 ${
            large ? "min-h-14 text-lg" : "min-h-11"
          }`}
        />
        <button type="submit" className={`gh-button gh-button-primary ${large ? "min-h-14 px-6 text-lg" : ""}`}>
          <svg aria-hidden="true" viewBox="0 0 20 20" width="1.1em" height="1.1em">
            <path
              fill="currentColor"
              d="M8.5 2a6.5 6.5 0 0 1 5.18 10.43l4.2 4.2-1.06 1.06-4.2-4.2A6.5 6.5 0 1 1 8.5 2Zm0 1.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
            />
          </svg>
          <span>{t.searchSubmit}</span>
        </button>
      </div>
    </form>
  );
}
