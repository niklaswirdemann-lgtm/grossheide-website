import { Parallax } from "@/components/effects/Parallax";
import { SearchForm } from "@/components/layout/SearchForm";
import { FotosCredit } from "@/components/ui/Photo";
import type { Foto, Station } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n";

/** Wörter im Laufband: nur Schmuck (aria-hidden), alles Dinge, die die Website selbst zeigt */
const BAND = ["Moin", "Badesee", "Mühlen", "Moor & Wald", "Rathaus", "Zehn Ortsteile", "Ostfriesland", "Landkreis Aurich"];

/**
 * Startbild: tiefgrüne Bühne mit wanderndem Polarlicht, mittig die Begrüßung (einzige h1 der
 * Startseite) und die große Suche, darunter drei Fotos als Fächer, die sich beim Zeigen gerade
 * richten und der Maus folgen, unten ein schräges Laufband. Das mittlere Foto ist das große
 * (das schärfste, `startbild`); kleine Fotos stehen nur in den Seiten-Rahmen und werden nie
 * größer als ihre echte Breite gezeigt.
 */
export function HomeHero({ locale, station, fotos }: { locale: Locale; station: Station; fotos: Foto[] }) {
  const [main, second, third] = fotos;
  // „Moin!“ schlicht, der Rest der Begrüßung mit Farbverlauf
  const [gruss, ...rest] = station.titel.split(" ");
  const frame = (f: Foto, cls: string, tiefe: number, eager = false) => (
    <div data-tiefe={tiefe} className={`gh-foto-frame ${cls}`} style={{ maxWidth: f.breite }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export ohne Bildoptimierung */}
      <img
        src={f.datei}
        alt={f.alt}
        width={f.breite}
        height={f.hoehe}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
  return (
    <section aria-labelledby="start-titel" className="gh-dark-stage gh-hero">
      <div className="gh-container relative pb-12 pt-12 text-center sm:pb-16 sm:pt-20 lg:pt-24">
        <div className="gh-hero-text mx-auto max-w-5xl">
          <p className="gh-hero-badge">
            <span aria-hidden="true" className="gh-hero-badge-dot" />
            Gemeinde Großheide · Ostfriesland
          </p>
          <h1 id="start-titel" className="gh-hero-titel mt-7">
            <span lang="nds">
              {gruss} <span className="gh-glanz">{rest.join(" ")}</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl">
            <span className="sr-only">Auf Hochdeutsch: Moin! Schön, dass du hier bist. </span>
            {station.kurztext}
          </p>
          <div className="gh-glas mx-auto mt-9 max-w-2xl p-3 text-left sm:p-4">
            <SearchForm locale={locale} id="start-suche" size="large" showLabel landmarkLabel="Suche auf der Startseite" />
          </div>
        </div>
        {main && (
          <figure className="mt-14 sm:mt-20">
            <Parallax className="gh-faecher mx-auto flex max-w-5xl items-end justify-center">
              <div aria-hidden="true" data-tiefe={-1} className="gh-hero-ring" />
              {second && frame(second, "gh-faecher-links", 2.2)}
              {frame(main, "gh-faecher-mitte", 1, true)}
              {third && frame(third, "gh-faecher-rechts", 3)}
            </Parallax>
            <figcaption className="gh-hero-credit mt-8 inline-block">
              <FotosCredit fotos={fotos} />
            </figcaption>
          </figure>
        )}
      </div>
      <div aria-hidden="true" className="gh-band">
        <div className="gh-band-spur">
          {[0, 1].map((k) => (
            <span key={k} className="gh-band-teil">
              {BAND.map((w) => (
                <span key={w} className="gh-band-wort">
                  {w}
                  <svg viewBox="0 0 20 20" width="22" height="22" className="gh-band-stern">
                    <path fill="currentColor" d="M10 0l2.6 7.4L20 10l-7.4 2.6L10 20l-2.6-7.4L0 10l7.4-2.6z" />
                  </svg>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
