import { contentLocale, enabledLocales, isEnabledLocale } from "@/lib/i18n";
import { buildSearchIndex } from "@/lib/search";

// Beim Build als statische Datei erzeugt (/de/suchindex.json); die Schnellsuche lädt sie erst beim Öffnen.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return enabledLocales.map((lang) => ({ lang }));
}

export async function GET(_request: Request, { params }: RouteContext<"/[lang]/suchindex.json">) {
  const { lang } = await params;
  return Response.json(buildSearchIndex(contentLocale(isEnabledLocale(lang) ? lang : "de")));
}
