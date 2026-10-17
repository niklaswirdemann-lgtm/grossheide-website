import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventList } from "@/components/content/EventList";
import { NewsList } from "@/components/content/NewsList";
import { HomeJourney } from "@/components/journey/HomeJourney";
import { StationPanel } from "@/components/journey/StationPanel";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";
import {
  facts,
  factValue,
  getEvents,
  getFoto,
  getLighting,
  getStartFoto,
  getNews,
  getOrtsteile,
  getStations,
  type Station,
} from "@/lib/content";
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

  const quick: { label: string; text: string; href: string; icon: IconName }[] = [
    {
      label: "Termin buchen",
      text: "Einwohnermeldeamt und Standesamt",
      href: "https://www.terminland.de/grossheide/?m=40492",
      icon: "kalender",
    },
    { label: "Online-Dienste", text: "Anträge bequem von zu Hause", href: "/rathaus/online-dienste/", icon: "laptop" },
    { label: "Dienstleistungen A–Z", text: "Ausweis, Anmeldung, Urkunden", href: "/rathaus/dienstleistungen/", icon: "liste" },
    { label: "Öffnungszeiten", text: "Wann das Rathaus geöffnet hat", href: "/rathaus/oeffnungszeiten/", icon: "uhr" },
    { label: "Kindertagesstätten", text: "Kitas und Krippen im Überblick", href: "/leben-lernen/#kitas", icon: "kind" },
    { label: "Im Notfall", text: "Notrufe und Bereitschaftsdienste", href: "/leben-lernen/im-notfall/", icon: "notfall" },
  ];

  return (
    <>
      <HomeJourney
        stations={stations}
        fotos={stations.map((s, i) => (i === 0 ? getStartFoto() : getFoto({ station: s.id })))}
        heroFotos={[getStartFoto(), getFoto({ station: "muehle" }), getFoto({ seite: "freizeitanlagen" })].filter((f) => !!f)}
        lighting={getLighting()}
        panels={panels}
        skipLabel={t.directToSite}
      />

      <div id="themen" tabIndex={-1} className="scroll-mt-28 focus:outline-none">
        <section aria-labelledby="schnellzugriff" className="gh-container py-16 lg:py-24">
          <p className="gh-eyebrow">Schnell erledigt</p>
          <h2 id="schnellzugriff" className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
            Häufig gesucht
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quick.map((q) => (
              <li key={q.href}>
                <SmartLink
                  locale={lang}
                  href={q.href}
                  className="gh-card group flex h-full items-start gap-4 p-5 text-text no-underline hover:border-kuestenblau-100 sm:p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon name={q.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-extrabold tracking-tight">{q.label}</span>
                    <span className="mt-0.5 block text-sm text-muted">{q.text}</span>
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </section>

        <div className="gh-container grid gap-12 pb-16 lg:grid-cols-[1.4fr_1fr] lg:pb-24">
          <section aria-labelledby="meldungen">
            <h2 id="meldungen" className="text-3xl sm:text-4xl">
              Neueste Meldungen
            </h2>
            <div className="mt-8">
              <NewsList locale={lang} items={getNews(lang).slice(0, 4)} headingLevel={3} />
            </div>
            <p className="mt-6">
              <Link href={localeHref(lang, "/aktuelles/nachrichten/")} className="gh-more-link font-bold">
                {t.allNews}
              </Link>
            </p>
          </section>
          <section aria-labelledby="veranstaltungen">
            <h2 id="veranstaltungen" className="text-3xl sm:text-4xl">
              Nächste Veranstaltungen
            </h2>
            <div className="mt-8">
              <EventList locale={lang} items={getEvents(lang, TODAY).slice(0, 3)} headingLevel={3} />
            </div>
            <p className="mt-6">
              <Link href={localeHref(lang, "/aktuelles/veranstaltungen/")} className="gh-more-link font-bold">
                {t.allEvents}
              </Link>
            </p>
          </section>
        </div>

        <section aria-labelledby="hilfe" className="gh-container pb-4">
          <div className="gh-dark-stage rounded-[2rem] p-8 sm:p-12 lg:p-16">
            <h2 id="hilfe" className="text-3xl text-white sm:text-4xl lg:text-5xl">
              Nicht gefunden, was du suchst?
            </h2>
            <p className="mt-3 max-w-2xl text-kuestenblau-100">Ruf uns an oder schreib uns. Das Rathaus hilft gern weiter.</p>
            <p className="mt-8 flex flex-wrap gap-3">
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
