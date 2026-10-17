import deUi from "../../content/de/ui.json";
import ndsUi from "../../content/nds/ui.json";

/** Alle vorgesehenen Sprachen. BCP-47: "de" Hochdeutsch, "nds" Niederdeutsch. */
export const locales = ["de", "nds"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

/** Sprachen, für die Seiten gebaut werden (/de/…, /nds/…). */
export const enabledLocales: readonly Locale[] = ["de", "nds"];

/**
 * Sprachen, in denen die Seiteninhalte (alles in <main>) schon vorliegen.
 * Plattdeutsch hat bisher nur den Rahmen: Kopf, Menü, Fußzeile. Die Inhalte
 * stehen dort auf Hochdeutsch und sind mit lang="de" ausgezeichnet (WCAG 3.1.2).
 */
export const contentLocales: readonly Locale[] = ["de"];

/** Sprache der Seiteninhalte: die Seitensprache, wenn übersetzt, sonst Hochdeutsch. */
export function contentLocale(locale: Locale): Locale {
  return contentLocales.includes(locale) ? locale : defaultLocale;
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isEnabledLocale(value: string): value is Locale {
  return (enabledLocales as readonly string[]).includes(value);
}

export type UiKey = Exclude<keyof typeof deUi, "$comment">;
export type Dictionary = Record<UiKey, string>;

const MISSING = "TODO: Plattdeutsch";

const dictionaries: Record<Locale, Partial<Record<string, string>>> = {
  de: deUi,
  nds: ndsUi,
};

/**
 * Liefert das UI-Wörterbuch; fehlende Platt-Texte fallen auf Hochdeutsch zurück.
 * Für Texte in <main> `getDictionary(contentLocale(locale))` nehmen, damit Sprache
 * und lang-Attribut zusammenpassen.
 */
export function getDictionary(locale: Locale): Dictionary {
  const base = deUi as Dictionary;
  if (locale === "de") return base;
  const out = { ...base };
  for (const key of Object.keys(base) as UiKey[]) {
    const v = dictionaries[locale][key];
    if (v && v !== MISSING) out[key] = v;
  }
  return out;
}

/** Einfache Platzhalter-Ersetzung: t("Hallo {name}", { name: "Moin" }). */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}

/** Interner Link mit Sprachpräfix. Externe URLs und Anker bleiben unverändert. */
export function localeHref(locale: Locale, href: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const path = href.startsWith("/") ? href : `/${href}`;
  return `/${locale}${path}`;
}
