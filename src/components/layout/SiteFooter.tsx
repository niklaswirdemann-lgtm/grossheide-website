import Link from "next/link";
import { OpeningHours } from "@/components/content/OpeningHours";
import { ExternalIcon } from "@/components/ui/SmartLink";
import { facts, factValue, getNavigation } from "@/lib/content";
import { contentLocale, getDictionary, fill, localeHref, type Locale } from "@/lib/i18n";
import { hostOf, telHref } from "@/lib/links";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const nav = getNavigation(locale);
  const r = facts.rathaus;
  const tel = factValue(r.telefon);
  const mail = factValue(r.email);
  const hours = factValue(r.oeffnungszeiten);
  // Sprache der Fakten; nur gesetzt, wenn sie von der Seitensprache abweicht
  const textLang = contentLocale(locale) === locale ? undefined : contentLocale(locale);

  const linkCls = "text-smaragd-100 hover:text-white";

  return (
    <footer className="gh-fuss mt-20 bg-smaragd-950 text-smaragd-100 [&_a]:text-smaragd-100 [&_a:hover]:text-white">
      <div className="gh-container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 id="footer-kontakt" className="mb-3 text-xl text-white">
            {t.contactUs}
          </h2>
          <address className="not-italic">
            <span className="block font-bold text-white">{factValue(r.bezeichnung)}</span>
            <span className="block">{factValue(r.strasse)}</span>
            <span className="block">
              {factValue(r.plz)} {factValue(r.ort)}
            </span>
          </address>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="font-bold">{t.phone}</dt>
            <dd>{tel && <a href={telHref(tel)}>{tel}</a>}</dd>
            <dt className="font-bold">{t.email}</dt>
            <dd className="break-all">{mail && <a href={`mailto:${mail}`}>{mail}</a>}</dd>
          </dl>
        </div>

        <div>
          <h2 id="footer-zeiten" className="mb-3 text-xl text-white">
            {t.openingHours}
          </h2>
          {/* Fakten (Wochentage, Hinweis) liegen nur auf Hochdeutsch vor */}
          <div lang={textLang}>
            {hours && <OpeningHours days={hours} compact />}
            <p className="mt-2 text-sm">{factValue(r.oeffnungszeitenHinweis)}</p>
          </div>
        </div>

        <nav aria-labelledby="footer-themen">
          <h2 id="footer-themen" className="mb-3 text-xl text-white">
            {t.footerService}
          </h2>
          <ul className="space-y-1.5">
            {nav.main.map((item) => (
              <li key={item.href}>
                <Link href={localeHref(locale, item.href)} lang={item.lang} className={linkCls}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={localeHref(locale, "/rathaus/online-dienste/")} lang={textLang} className={linkCls}>
                Online-Dienste
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-8">
          <nav aria-labelledby="footer-recht">
            <h2 id="footer-recht" className="mb-3 text-xl text-white">
              {t.footerLegal}
            </h2>
            <ul className="space-y-1.5">
              {nav.legal.map((item) => (
                <li key={item.href}>
                  <Link href={localeHref(locale, item.href)} lang={item.lang} className={linkCls}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="footer-social">
            <h2 id="footer-social" className="mb-3 font-sans text-base font-bold text-white">
              {t.footerSocial}
            </h2>
            <ul className="space-y-1.5">
              {facts.social.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener" className={linkCls}>
                    {s.name}
                    <ExternalIcon />
                    <span className="sr-only"> ({fill(t.externalLink, { host: hostOf(s.url) })})</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {/* Großer Schriftzug als Abschluss, nur Schmuck */}
      <p aria-hidden="true" className="gh-wortmarke">
        Großheide
      </p>
      <div className="border-t border-smaragd-700">
        {/* unten Platz für den Chat-Knopf, damit er nichts verdeckt */}
        <div className="gh-container flex flex-wrap items-center justify-between gap-4 pb-20 pt-4 text-sm">
          <p>© {factValue(facts.gemeinde.name)}</p>
          <a href="#seitenanfang" className="inline-flex min-h-6 items-center">
            {t.toTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
