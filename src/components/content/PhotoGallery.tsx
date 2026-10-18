"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FotoBild, PhotoCredit } from "@/components/ui/Photo";
import type { Foto } from "@/lib/content/types";

/** Kacheln, die größer sind (Bento-Raster, nur die ersten acht): Index → Klassen ab sm */
const SPANS: Record<number, string> = {
  0: "sm:col-span-2 sm:row-span-2",
  3: "sm:row-span-2",
  6: "sm:col-span-2",
};
/** Wie viele Rasterzellen diese Kacheln belegen */
const CELLS: Record<number, number> = { 0: 4, 3: 2, 6: 2 };

/**
 * „Großheide in Bildern“: Fotos als Bento-Raster. Jede Kachel ist ein Button, der das Foto groß
 * in einem Dialog zeigt (mit Alt-Text als Bildunterschrift und Urheber). Im Dialog blättern
 * die Pfeiltasten, Escape schließt und der Fokus kehrt zur Kachel zurück.
 */
export function PhotoGallery({ fotos, headingId }: { fotos: Foto[]; headingId: string }) {
  // Ab sm vier Spalten: die letzte Kachel wird so breit, dass am Ende keine Lücke bleibt
  const before = fotos.slice(0, -1).reduce((n, _, i) => n + (CELLS[i] ?? 1), 0);
  const lastSpan = ["sm:col-span-4", "sm:col-span-3", "sm:col-span-2", ""][before % 4];
  const dialog = useRef<HTMLDialogElement>(null);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const foto = current === null ? undefined : fotos[current];

  const show = (i: number) => {
    setCurrent(i);
    dialog.current?.showModal();
  };
  const step = useCallback(
    (d: number) => setCurrent((c) => (c === null ? c : (c + d + fotos.length) % fotos.length)),
    [fotos.length],
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    // Klick neben das Foto (auf den abgedunkelten Hintergrund) schließt
    const onClick = (e: MouseEvent) => {
      if (e.target === el) el.close();
    };
    el.addEventListener("keydown", onKey);
    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("click", onClick);
    };
  }, [step]);

  return (
    <>
      <ul
        aria-labelledby={headingId}
        className="grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] sm:grid-cols-4 sm:gap-4 [grid-auto-flow:dense]"
      >
        {fotos.map((f, i) => (
          // Auf dem Handy sechs Kacheln, die übrigen Fotos erreicht man im Dialog mit „Weiter“
          <li
            key={f.id}
            className={`gh-reveal ${i === fotos.length - 1 ? lastSpan : (SPANS[i] ?? "")} ${i >= 6 ? "max-sm:hidden" : ""}`}
          >
            <button
              ref={(el) => {
                tiles.current[i] = el;
              }}
              type="button"
              onClick={() => show(i)}
              className="gh-galerie-kachel group relative block h-full w-full overflow-hidden rounded-3xl bg-nebel-100"
            >
              <FotoBild
                foto={f}
                decorative
                className="h-full w-full transition-transform duration-700 ease-[var(--gh-ease)] group-hover:scale-105"
              />
              <span className="sr-only">Foto vergrößern: {f.alt}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label="Foto groß"
        className="gh-lightbox"
        onClose={() => {
          if (current !== null) tiles.current[current]?.focus({ preventScroll: true });
          setCurrent(null);
        }}
      >
        {foto && (
          <figure className="flex h-full flex-col">
            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export ohne Bildoptimierung */}
              <img
                src={foto.datei}
                alt={foto.alt}
                width={foto.breite}
                height={foto.hoehe}
                style={{ width: `min(100%, ${Math.round(foto.breite * 1.5)}px)` }}
                className="h-auto max-h-full rounded-2xl object-contain shadow-2xl"
              />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 text-white">
              <span className="min-w-0 flex-1">
                <span className="block">{foto.alt}</span>
                <span className="mt-1 block text-xs text-kuestenblau-100">
                  <PhotoCredit foto={foto} />
                </span>
              </span>
              <span className="flex shrink-0 gap-2">
                <button type="button" onClick={() => step(-1)} className="gh-button gh-lightbox-button">
                  <span aria-hidden="true">←</span> Zurück
                </button>
                <button type="button" onClick={() => step(1)} className="gh-button gh-lightbox-button">
                  Weiter <span aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => dialog.current?.close()}
                  className="gh-button bg-white text-kuestenblau-900 hover:bg-kuestenblau-50"
                >
                  Schließen
                </button>
              </span>
            </figcaption>
            <p className="sr-only" aria-live="polite">
              Foto {current! + 1} von {fotos.length}
            </p>
          </figure>
        )}
      </dialog>
    </>
  );
}
