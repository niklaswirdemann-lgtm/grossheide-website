import Link from "next/link";
import type { ReactNode } from "react";
import { contentLocale, getDictionary, fill, localeHref, type Locale } from "@/lib/i18n";
import { hostOf, isExternal } from "@/lib/links";

interface Props {
  href: string;
  locale: Locale;
  children: ReactNode;
  className?: string;
  /** Externe Kennzeichnung unterdrücken (z. B. tel:/mailto:) – Standard: automatisch. */
  plain?: boolean;
}

/**
 * Einheitlicher Link: intern mit Sprachpräfix über next/link, extern als <a>
 * mit sichtbarem Symbol und Screenreader-Hinweis auf das Ziel.
 * Externe Links öffnen bewusst im selben Fenster (BITV: keine ungewollten Kontextwechsel).
 */
export function SmartLink({ href, locale, children, className, plain }: Props) {
  if (isExternal(href)) {
    // Hinweistext in der Sprache der Inhalte, mit eigenem lang (der Link kann auch im Rahmen stehen)
    const textLang = contentLocale(locale);
    const t = getDictionary(textLang);
    return (
      <a href={href} className={className} rel="noopener">
        {children}
        {!plain && (
          <>
            <ExternalIcon />
            <span className="sr-only" lang={textLang}>
              {" "}
              ({fill(t.externalLink, { host: hostOf(href) })})
            </span>
          </>
        )}
      </a>
    );
  }
  if (/^(mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={localeHref(locale, href)} className={className}>
      {children}
    </Link>
  );
}

export function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="0.8em"
      height="0.8em"
      className="ml-1 inline-block align-baseline"
    >
      <path
        fill="currentColor"
        d="M9 2h5v5h-1.5V4.56L7.53 9.53 6.47 8.47l4.97-4.97H9V2ZM3 4h4v1.5H3.5v7h7V9H12v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}
