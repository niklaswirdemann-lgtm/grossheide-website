import type { ReactNode } from "react";
import { SearchForm } from "@/components/layout/SearchForm";
import { Photo } from "@/components/ui/Photo";
import { SmartLink } from "@/components/ui/SmartLink";
import { getFoto, getOnlineDienst, type Station } from "@/lib/content";
import { contentLocale, getDictionary, type Locale } from "@/lib/i18n";

interface Props {
  locale: Locale;
  station: Station;
  children?: ReactNode;
}

/**
 * Inhalt einer Station als echtes HTML (section + Überschrift). Dasselbe Markup
 * dient als Panel in der Foto-Reise und als normaler Abschnitt ohne Bewegung.
 * Station 1 trägt die einzige h1 der Startseite.
 */
export function StationPanel({ locale, station, children }: Props) {
  const t = getDictionary(contentLocale(locale));
  const headingId = `station-${station.id}-titel`;
  const first = station.number === 1;
  // Station 1 hat oben schon Suche und Begrüßung; ihr Foto zeigt nur die Bühne der Reise.
  const foto = first ? undefined : getFoto({ station: station.id });
  return (
    <section
      id={`station-${station.id}`}
      aria-labelledby={headingId}
      data-station={station.id}
      className="gh-station scroll-mt-28"
    >
      <div className="gh-station-text min-w-0">
        <p className="gh-eyebrow">
          <span className="sr-only">Station </span>
          {station.number} · {station.name}
        </p>
        {first ? (
          <>
            <h1 id={headingId} className="mt-3 text-4xl sm:text-6xl lg:text-7xl">
              <span lang="nds">{station.titel}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">
              <span className="sr-only">Auf Hochdeutsch: Moin! Schön, dass du hier bist. </span>
              {station.kurztext}
            </p>
            <div className="mt-8 max-w-xl">
              <SearchForm locale={locale} id="start-suche" size="large" showLabel landmarkLabel="Suche auf der Startseite" />
            </div>
            <p className="gh-skip-inline mt-5">
              <a href="#themen" className="gh-button gh-button-primary">
                {t.directToSite}
                <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
                  <path fill="currentColor" d="M7.25 2h1.5v9.1l3.2-3.2 1.06 1.06L8 14 2.99 8.96 4.05 7.9l3.2 3.2z" />
                </svg>
              </a>
            </p>
          </>
        ) : (
          <>
            <h2 id={headingId} className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
              {station.titel}
            </h2>
            <p className="mt-4 text-lg text-muted">{station.kurztext}</p>
          </>
        )}
        {station.links.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {station.links.map((l) => {
              const dienst = l.onlineDienst ? getOnlineDienst(l.onlineDienst) : undefined;
              return (
                <li key={l.href}>
                  <SmartLink locale={locale} href={dienst?.url ?? l.href} className="gh-button gh-button-secondary">
                    {l.label}
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        )}
        {children && <div className="mt-5">{children}</div>}
        {!first && (
          <p className="mt-5">
            <SmartLink locale={locale} href={station.href} className="gh-more-link font-bold">
              Alles zum Bereich {station.titel}
            </SmartLink>
          </p>
        )}
      </div>
      {/* in der Foto-Reise nur für Screenreader, sichtbar steht es groß auf der Bühne (globals.css) */}
      {foto && <Photo foto={foto} className="gh-panel-foto gh-reveal" imgClassName="aspect-[4/3] w-full !rounded-[2rem] shadow-xl" />}
    </section>
  );
}
