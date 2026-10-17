import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventList } from "@/components/content/EventList";
import { NewsList } from "@/components/content/NewsList";
import { HomeJourney } from "@/components/journey/HomeJourney";
import { StationPanel } from "@/components/journey/StationPanel";
import { SmartLink } from "@/components/ui/SmartLink";
import { facts, factValue, getEvents, getFoto, getLighting, getStartFoto, getNews, getOrtsteile, getStations, type Station } from "@/lib/content";
import { contentLocale, getDictionary, isEnabledLocale, localeHref, type Locale } from "@/lib/i18n";
import { telHref } from "@/lib/links";

export const metadata: Metadata = {
  title: { absolute: "Gemeinde Großheide – Ostfriesland, Landkreis Aurich" },
};

// Fester Stichtag für den statischen Build; im CMS-Betrieb dynamisch.
const TODAY = facts.retrievedAt;

/** Zusatzinhalt einzelner Stationen (kurz halten: das Panel liegt über der Bühne). */
function stationExtra(lang: Locale, station: Station) {
  const t = getDictionary(contentLocale(lang));
  if (station.id === "dorfplatz") {
    return (
      <>
        <p className="font-bold">Nächste Veranstaltungen:</p>
        <div className="mt-3">
          <EventList locale={lang} items={getEvents(lang, TODAY).slice(0, 3)} headingLevel={3} />
        </div>
        <p className="mt-3">
          <Link href={localeHref(lang, "/aktuelles/veranstaltungen/")}>{t.allEvents}</Link>
        </p>
      </>
    );
  }
  if (station.id === "aussicht") {
    return (
      <>
        <p className="font-bold">Die Ortsteile:</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {getOrtsteile(lang).map((o) => (
            <li key={o.slug}>
              <Link
                href={localeHref(lang, `/ortsteile/${o.slug}/`)}
                className="gh-card flex min-h-11 items-center justify-center px-2 py-2 text-center font-bold no-underline hover:border-brand hover:bg-brand-soft"
              >
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  }
  return null;
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isEnabledLocale(lang)) notFound();
  const t = getDictionary(contentLocale(lang));
  const stations = getStations();
  const tel = factValue(facts.rathaus.telefon);

  const panels = stations.map((s) => (
    <StationPanel key={s.id} locale={lang} station={s}>
      {stationExtra(lang, s)}
    </StationPanel>
  ));

  const quick = [
    { label: "Termin buchen", href: "https://www.terminland.de/grossheide/?m=40492" },
    { label: "Online-Dienste", href: "/rathaus/online-dienste/" },
    { label: "Dienstleistungen A–Z", href: "/rathaus/dienstleistungen/" },
    { label: "Öffnungszeiten", href: "/rathaus/oeffnungszeiten/" },
    { label: "Kindertagesstätten", href: "/leben-lernen/#kitas" },
    { label: "Im Notfall", href: "/leben-lernen/im-notfall/" },
  ];

  return (
    <>
      <HomeJourney
        stations={stations}
        fotos={stations.map((s, i) => (i === 0 ? getStartFoto() : getFoto({ station: s.id })))}
        lighting={getLighting()}
        panels={panels}
        skipLabel={t.directToSite}
      />

      <div id="themen" tabIndex={-1} className="scroll-mt-28 focus:outline-none">
        <section aria-labelledby="schnellzugriff" className="gh-container py-12">
          <h2 id="schnellzugriff" className="text-3xl">
            Häufig gesucht
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quick.map((q) => (
              <li key={q.href}>
                <SmartLink
                  locale={lang}
                  href={q.href}
                  className="gh-card flex min-h-16 items-center justify-between gap-3 px-5 py-4 font-bold no-underline hover:border-brand hover:bg-brand-soft"
                >
                  {q.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </section>

        <div className="gh-container grid gap-10 pb-12 lg:grid-cols-2">
          <section aria-labelledby="meldungen">
            <h2 id="meldungen" className="text-3xl">
              Neueste Meldungen
            </h2>
            <div className="mt-4">
              <NewsList locale={lang} items={getNews(lang).slice(0, 4)} headingLevel={3} />
            </div>
            <p className="mt-4">
              <Link href={localeHref(lang, "/aktuelles/nachrichten/")}>{t.allNews}</Link>
            </p>
          </section>
          <section aria-labelledby="veranstaltungen">
            <h2 id="veranstaltungen" className="text-3xl">
              Nächste Veranstaltungen
            </h2>
            <div className="mt-4">
              <EventList locale={lang} items={getEvents(lang, TODAY).slice(0, 3)} headingLevel={3} />
            </div>
            <p className="mt-4">
              <Link href={localeHref(lang, "/aktuelles/veranstaltungen/")}>{t.allEvents}</Link>
            </p>
          </section>
        </div>

        <section aria-labelledby="hilfe" className="gh-container pb-12">
          <div className="rounded-lg bg-brand-strong p-8 text-on-brand sm:p-10">
            <h2 id="hilfe" className="text-3xl text-white">
              Nicht gefunden, was du suchst?
            </h2>
            <p className="mt-3 max-w-2xl text-kuestenblau-100">Ruf uns an oder schreib uns. Das Rathaus hilft gern weiter.</p>
            <p className="mt-6 flex flex-wrap gap-3">
              {tel && (
                <a href={telHref(tel)} className="gh-button bg-white text-brand-strong hover:bg-brand-soft">
                  {t.phone}: {tel}
                </a>
              )}
              <Link href={localeHref(lang, "/kontakt/")} className="gh-button border-2 border-white text-white hover:bg-white/10">
                Alle Kontaktwege
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
