import { buildChatKnowledge } from "@/lib/chat/knowledge";
import { enabledLocales, isEnabledLocale } from "@/lib/i18n";

// Beim Build als statische Datei erzeugt (/de/chat-wissen.json); das Widget lädt sie erst beim Öffnen.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return enabledLocales.map((lang) => ({ lang }));
}

export async function GET(_request: Request, { params }: RouteContext<"/[lang]/chat-wissen.json">) {
  const { lang } = await params;
  return Response.json(buildChatKnowledge(isEnabledLocale(lang) ? lang : "de"));
}
