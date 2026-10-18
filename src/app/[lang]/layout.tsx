import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { bodyFont, bodyItalicFont, displayFont } from "../fonts";
import "../globals.css";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { color, themeCss, themeScript } from "@/design/tokens";
import { facts, factValue } from "@/lib/content";
import { withBase } from "@/lib/links";
import { PreviewNotice } from "@/components/layout/PreviewNotice";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Spotlight } from "@/components/effects/Spotlight";
import { PlattNotice } from "@/components/layout/PlattNotice";
import { contentLocale, enabledLocales, getDictionary, isEnabledLocale } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return enabledLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const t = getDictionary(isEnabledLocale(lang) ? lang : "de");
  return {
    title: { default: `${t.siteName} – ${t.siteTagline}`, template: `%s – ${t.siteName}` },
    description:
      "Offizielle Website der Gemeinde Großheide in Ostfriesland: Rathaus und Online-Dienste, Aktuelles, Leben und Lernen, Freizeit und Tourismus, Bauen und Wirtschaft.",
    robots: { index: false, follow: false }, // Entwicklungsstand – vor dem Livegang entfernen
    formatDetection: { telephone: false },
    icons: { icon: withBase("/favicon.svg") }, // Platzhalter bis zur Freigabe eines Logos
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: color.brand },
    { media: "(prefers-color-scheme: dark)", color: color.brandStrong },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const t = getDictionary(lang);
  const textLang = contentLocale(lang);

  return (
    <html
      lang={lang}
      dir="ltr"
      className={`${bodyFont.variable} ${bodyItalicFont.variable} ${displayFont.variable}`}
      // data-theme setzt das Skript im Kopf vor React (gespeicherte Wahl Hell/Dunkel)
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <div id="seitenanfang" />
        <div aria-hidden="true" className="gh-progress" />
        <Spotlight />
        <ul className="fixed left-2 top-2 z-[100] flex flex-col gap-2">
          <li>
            <a href="#inhalt" className="gh-button gh-button-primary sr-only focus:not-sr-only focus:px-5 focus:py-3">
              {t.skipToContent}
            </a>
          </li>
          <li>
            <a href="#hauptnavigation" className="gh-button gh-button-primary sr-only focus:not-sr-only focus:px-5 focus:py-3">
              {t.skipToNav}
            </a>
          </li>
        </ul>
        {process.env.VORSCHAU === "1" && <PreviewNotice />}
        <SiteHeader locale={lang} />
        {/* Inhalte, die noch nicht übersetzt sind, tragen ihre eigene Sprache (WCAG 3.1.2) */}
        <main id="inhalt" tabIndex={-1} lang={textLang === lang ? undefined : textLang} className="flex-1 focus:outline-none">
          {textLang !== lang && <PlattNotice locale={lang} />}
          {children}
        </main>
        <SiteFooter locale={lang} />
        <ChatWidget locale={lang} phone={factValue(facts.rathaus.telefon)} />
      </body>
    </html>
  );
}
