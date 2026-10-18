import { Parallax } from "@/components/effects/Parallax";
import { SearchForm } from "@/components/layout/SearchForm";
import { FotosCredit } from "@/components/ui/Photo";
import type { Foto, Station } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n";

/**
 * Startbild: dunkle Bühne mit wanderndem Licht, Begrüßung (einzige h1 der Startseite) und
 * Suche links, rechts drei rund gerahmte Fotos, die der Maus leicht folgen. Das erste Foto ist
 * das große (das schärfste, `startbild`); kleine Fotos stehen nur in den kleinen Rahmen.
 */
export function HomeHero({ locale, station, fotos }: { locale: Locale; station: Station; fotos: Foto[] }) {
  const [main, second, third] = fotos;
  // „Moin!“ schlicht, der Rest der Begrüßung mit Farbverlauf
  const [gruss, ...rest] = station.titel.split(" ");
  const frame = (f: Foto, cls: string, tiefe: number, eager = false) => (
    <div data-tiefe={tiefe} className={`gh-foto-frame absolute ring-1 ring-white/25 ${cls}`}>
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
      <div className="gh-container relative grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:min-h-[calc(100svh-11rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-24">
        <div className="gh-hero-text min-w-0">
          <p className="gh-hero-badge">
            <span aria-hidden="true" className="gh-hero-badge-dot" />
            Gemeinde Großheide · Ostfriesland
          </p>
          <h1 id="start-titel" className="mt-6 text-5xl sm:text-6xl lg:text-7xl">
            <span lang="nds">
              {gruss} <span className="gh-glanz">{rest.join(" ")}</span>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted sm:text-xl">
            <span className="sr-only">Auf Hochdeutsch: Moin! Schön, dass du hier bist. </span>
            {station.kurztext}
          </p>
          <div className="gh-glas mt-9 max-w-xl p-4 sm:p-5">
            <SearchForm locale={locale} id="start-suche" size="large" showLabel landmarkLabel="Suche auf der Startseite" />
          </div>
        </div>
        {main && (
          <figure className="gh-collage mx-auto w-full max-w-md lg:max-w-none">
            <Parallax className="relative aspect-[6/5] w-full">
              <div aria-hidden="true" data-tiefe={-1} className="gh-hero-ring" />
              {frame(main, "right-0 top-0 aspect-[4/3] w-[80%]", 1, true)}
              {second && frame(second, "bottom-0 left-0 aspect-square w-[44%] shadow-2xl", 2.2)}
              {third && frame(third, "bottom-[4%] right-[6%] aspect-[4/3] w-[40%] shadow-2xl", 3)}
            </Parallax>
            <figcaption className="gh-hero-credit mt-4 inline-block">
              <FotosCredit fotos={fotos} />
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
