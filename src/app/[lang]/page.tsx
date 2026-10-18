import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventList } from "@/components/content/EventList";
import { NewsList } from "@/components/content/NewsList";
import { PhotoGallery } from "@/components/content/PhotoGallery";
import { FotoBild, FotosCredit, PhotoCredit } from "@/components/ui/Photo";
import { HomeJourney } from "@/components/journey/HomeJourney";
import { StationPanel } from "@/components/journey/StationPanel";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";
import {
  facts,
  factValue,
  getEvents,
  getFoto,
  getGalerie,
  getOnlineDienst,
  getLighting,
  getStartFoto,
  getNews,
  getOrtsteile,
  getStations,
  type Station,
} from "@/lib/content";
import { contentLocale, getDictionary, isEnabledLocale, localeHref, type Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
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

  const galerie = getGalerie();
  const flaeche = factValue(facts.gemeinde.flaecheKm2);
  const ortsteile = factValue(facts.ortsteile);
  const stats = [
    ortsteile && { value: String(ortsteile.length), label: "Ortsteile, eine Gemeinde" },
    flaeche && { value: `${Math.round(Number(flaeche))} km²`, label: `Fläche (genau ${String(flaeche).replace(".", ",")} km²)` },
    { value: String(facts.einrichtungen.kitas.length), label: "Kindertagesstätten" },
    { value: String(facts.einrichtungen.schulen.length), label: "Schulen" },
  ].filter((x): x is { value: string; label: string } => !!x);

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
        // Großes Bild = das schärfste Foto (startbild); kleine Fotos wie das Rathaus (274 px) nur in den kleinen Rahmen
        heroFotos={[getStartFoto(), getFoto({ station: "muehle" }), getFoto({ station: "rathaus" })].filter((f) => !!f)}
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
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-3">
            {quick.map((q) => (
              <li key={q.href} className="gh-reveal">
                <SmartLink
                  locale={lang}
                  href={q.href}
                  className="gh-card group flex h-full flex-col items-start gap-3 p-4 text-text no-underline hover:border-kuestenblau-100 sm:flex-row sm:gap-4 sm:p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon name={q.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-base font-extrabold tracking-tight hyphens-auto sm:text-lg">
                      {q.label}
                    </span>
                    <span className="mt-0.5 hidden text-sm text-muted sm:block">{q.text}</span>
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="bereiche" className="gh-nur-ruhig gh-container pb-16 lg:pb-24">
          <p className="gh-eyebrow">Alles auf einen Blick</p>
          <h2 id="bereiche" className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
            Unsere Bereiche
          </h2>
          <ul className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {stations.slice(1).map((st, i) => {
              const foto = getFoto({ station: st.id });
              const wide = i === 0;
              return (
                <li
                  key={st.id}
                  className={`gh-card gh-reveal flex flex-col overflow-hidden ${wide ? "md:col-span-2 lg:flex-row" : ""}`}
                >
                  {foto ? (
                    <FotoBild
                      foto={foto}
                      className={`w-full ${wide ? "aspect-[2/1] sm:aspect-[16/10] lg:aspect-auto lg:w-1/2" : "aspect-[2/1] sm:aspect-[16/10]"}`}
                    />
                  ) : (
                    <div aria-hidden="true" className="gh-dark-stage flex aspect-[2/1] items-end p-6 sm:aspect-[16/10]">
                      <span className="font-display text-6xl font-extrabold text-white/90">{st.number}</span>
                    </div>
                  )}
                  <div className={`flex flex-1 flex-col p-5 sm:p-6 ${wide ? "lg:p-8" : ""}`}>
                    <p className="gh-eyebrow">{st.name}</p>
                    <h3 className="mt-2 text-2xl">{st.titel}</h3>
                    <p className="mt-2 text-muted">{st.kurztext}</p>
                    {st.links.length > 0 && (
                      // Auf dem Handy nur „Alles zu …“: die Seite bleibt kurz, die Links stehen im Bereich
                      <ul className="mt-4 hidden flex-wrap gap-2 sm:flex">
                        {st.links.slice(0, wide ? 5 : 3).map((l) => {
                          const dienst = l.onlineDienst ? getOnlineDienst(l.onlineDienst) : undefined;
                          return (
                            <li key={l.href}>
                              <SmartLink
                                locale={lang}
                                href={dienst?.url ?? l.href}
                                className="gh-button gh-button-secondary min-h-10 px-3.5 py-1.5 text-sm"
                              >
                                {l.label}
                              </SmartLink>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <p className="mt-auto pt-4 sm:pt-5">
                      <SmartLink locale={lang} href={st.href} className="gh-more-link font-bold">
                        Alles zu {st.titel}
                      </SmartLink>
                    </p>
                    {foto && (
                      <p className="mt-3 text-xs text-muted">
                        <PhotoCredit foto={foto} />
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="zahlen" className="gh-dark-stage">
          <div className="gh-container py-14 lg:py-20">
            <h2 id="zahlen" className="sr-only">
              Großheide in Zahlen
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {stats.map((st) => (
                <div key={st.label} className="gh-reveal flex flex-col-reverse border-l-2 border-white/25 pl-5">
                  <dt className="mt-2 text-kuestenblau-100">{st.label}</dt>
                  <dd className="whitespace-nowrap font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {st.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-10 text-sm text-kuestenblau-100">
              Quelle:{" "}
              <a href="https://www.grossheide.de/Rathaus/Unser-Grossheide/Ortsportrait" className="text-white">
                grossheide.de, Ortsporträt
              </a>{" "}
              und Seite Kindertagesstätten (Stand {formatDate(facts.retrievedAt)})
            </p>
          </div>
        </section>

        {galerie.length > 0 && (
          <section aria-labelledby="bilder" className="bg-surface py-16 lg:py-24">
            <div className="gh-container">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="gh-eyebrow">Moor, Mühlen, Badesee</p>
                  <h2 id="bilder" className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
                    Großheide in Bildern
                  </h2>
                </div>
                <p className="max-w-md text-muted">
                  Tippe auf ein Foto, um es groß zu sehen.
                  {galerie.length > 6 && (
                    <span className="sm:hidden"> Mit „Weiter“ siehst du dort alle {galerie.length} Fotos.</span>
                  )}
                </p>
              </div>
              <div className="mt-10">
                <PhotoGallery fotos={galerie} headingId="bilder" />
              </div>
              <p className="mt-4 text-xs text-muted">
                <FotosCredit fotos={galerie} />
              </p>
            </div>
          </section>
        )}

        <div className="gh-container grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr] lg:py-24">
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
