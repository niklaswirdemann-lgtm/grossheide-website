import { TodoMark } from "@/components/ui/Todo";
import { contentLocale, getDictionary, type Locale } from "@/lib/i18n";

/**
 * Hinweis auf Seiten, deren Inhalte noch nicht in der Seitensprache vorliegen
 * (bisher: Plattdeutsch). Steht als Erstes in <main>, damit „Zum Inhalt springen“
 * ihn nicht überspringt.
 */
export function PlattNotice({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const textLang = contentLocale(locale);
  const d = getDictionary(textLang);
  return (
    <div lang={locale} className="border-b border-border bg-bg-subtle">
      <p className="gh-container py-3 text-sm">
        <strong>{t.plattNotice}</strong>{" "}
        <span lang={textLang}>
          {d.plattNotice} {d.plattNoticeDetail}
        </span>{" "}
        <TodoMark label="TODO: Plattdeutsch prüfen" />
      </p>
    </div>
  );
}
