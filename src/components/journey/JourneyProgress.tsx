"use client";

import type { Station } from "@/lib/content/types";
import { stationCenter } from "@/lib/journey-math";
import { scrollToProgress } from "@/lib/journey-scroll";
import { useJourney } from "@/lib/journey-store";

/**
 * Stations-Navigation am Rand: 8 Punkte, per Tab erreichbar, Enter fährt
 * animiert zur Station. Die Beschriftung erscheint bei Hover und Fokus und ist
 * immer Teil des zugänglichen Namens.
 */
export function JourneyProgress({ stations }: { stations: Station[] }) {
  const active = useJourney((s) => s.activeIndex);
  const ranges = stations.map((s) => s.scrollBereich);
  return (
    <nav aria-label="Stationen der Reise" className="pointer-events-auto">
      <ol className="flex flex-row gap-1 lg:flex-col lg:gap-2">
        {stations.map((s, i) => {
          const current = i === active;
          return (
            <li key={s.id} className="group relative">
              <a
                href={`#station-${s.id}`}
                aria-current={current ? "step" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToProgress(stationCenter(ranges, i));
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full no-underline"
              >
                <span
                  aria-hidden="true"
                  className={`block rounded-full border-2 border-white shadow-md transition-all ${
                    current ? "h-5 w-5 bg-warm" : "h-3 w-3 bg-brand-strong group-hover:bg-brand"
                  }`}
                />
                <span className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 transition-opacity rounded-md bg-brand-strong px-3 py-1.5 text-sm font-bold text-white shadow-lg group-hover:opacity-100 group-focus-within:opacity-100 max-lg:right-auto max-lg:top-12 max-lg:left-1/2 max-lg:-translate-x-1/2 max-lg:translate-y-0">
                  <span className="sr-only">Station </span>
                  {i + 1}: {i === 0 ? s.name : s.titel}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
