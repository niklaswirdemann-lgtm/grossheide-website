import { notFound } from "next/navigation";
import { isEnabledLocale, type Locale } from "./i18n";

/** Sprachparameter einer Route auflösen; unbekannte Sprachen → 404. */
export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  return lang;
}
