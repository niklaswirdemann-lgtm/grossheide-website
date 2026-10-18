import Link from "next/link";
import { getNavigation } from "@/lib/content";
import { getDictionary, localeHref, type Locale } from "@/lib/i18n";
import { LogoPlaceholder } from "@/components/ui/Placeholder";
import { LanguageSwitch } from "./LanguageSwitch";
import { MainNav } from "./MainNav";
import { QuickSearch } from "@/components/search/QuickSearch";
import { SearchForm } from "./SearchForm";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const nav = getNavigation(locale);
  return (
    <header className="relative z-30 border-b border-border bg-surface">
      {/* Schmale dunkle Leiste: Sprache, Leichte Sprache, Kontakt */}
      <div className="gh-topbar bg-brand-strong text-white">
        <div className="gh-container flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5">
          <LanguageSwitch locale={locale} />
          <ul className="flex flex-wrap items-center gap-x-5 text-sm">
            <li>
              {/* Leichte Sprache ist ein Angebot auf Hochdeutsch */}
              <Link
                href={localeHref(locale, "/leichte-sprache/")}
                lang={locale === "de" ? undefined : "de"}
                className="inline-flex min-h-6 items-center"
              >
                Leichte Sprache
              </Link>
            </li>
            <li>
              <Link href={localeHref(locale, "/kontakt/")} className="inline-flex min-h-6 items-center">
                {t.contact}
              </Link>
            </li>
            <li lang={locale === "de" ? undefined : "de"}>
              <ThemeToggle label="Dunkel" />
            </li>
          </ul>
        </div>
      </div>
      <div className="gh-container flex flex-wrap items-center gap-x-6 gap-y-3 py-3 lg:py-4">
        <Link href={localeHref(locale, "/")} className="mr-auto flex items-center gap-3 text-text no-underline">
          <LogoPlaceholder label={t.placeholderLogo} />
          <span className="leading-tight">
            <span className="block font-display text-xl font-extrabold tracking-tight">{t.siteName}</span>
            <span className="block text-sm text-muted">{t.siteTagline}</span>
            <span className="sr-only">, {t.home}</span>
          </span>
        </Link>
        <div className="gh-kopf-suche order-3 w-full md:order-2 md:w-auto md:min-w-80">
          <SearchForm locale={locale} id="header-suche" landmarkLabel={t.quickSearch} />
        </div>
        <div className="hidden lg:order-3 lg:block">
          <QuickSearch locale={locale} />
        </div>
        <div className="order-2 lg:order-4 lg:-mx-3 lg:w-full">
          <MainNav locale={locale} items={nav.main} t={t} />
        </div>
      </div>
    </header>
  );
}
