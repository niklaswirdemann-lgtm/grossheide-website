import Link from "next/link";
import type { ReactNode } from "react";
import { contentLocale, getDictionary, localeHref, type Locale } from "@/lib/i18n";

export interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  locale: Locale;
  title: string;
  intro?: ReactNode;
  crumbs?: Crumb[];
  /** Kleine Zeile über dem Titel, z. B. Kategorie */
  eyebrow?: string;
}

/** Seitenkopf mit Brotkrumen und der einzigen h1 der Seite. */
export function PageHeader({ locale, title, intro, crumbs = [], eyebrow }: Props) {
  const t = getDictionary(contentLocale(locale));
  const all: Crumb[] = [{ label: t.home, href: "/" }, ...crumbs, { label: title }];
  return (
    <div className="gh-page-header relative overflow-hidden border-b border-border">
      <div className="gh-container relative pb-12 pt-6 lg:pb-16">
        <nav aria-label={t.breadcrumb}>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {all.map((c, i) => {
              const last = i === all.length - 1;
              return (
                <li key={`${c.label}-${i}`} className="flex items-center gap-2">
                  {last || !c.href ? (
                    <span aria-current={last ? "page" : undefined} className="text-muted">
                      {c.label}
                    </span>
                  ) : (
                    <Link href={localeHref(locale, c.href)} className="inline-flex min-h-6 items-center">
                      {c.label}
                    </Link>
                  )}
                  {!last && (
                    <span aria-hidden="true" className="text-muted">
                      ›
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        {eyebrow && <p className="gh-eyebrow mt-8">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-2" : "mt-8"} max-w-4xl text-4xl sm:text-5xl lg:text-6xl`}>{title}</h1>
        {intro && <div className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">{intro}</div>}
      </div>
    </div>
  );
}
