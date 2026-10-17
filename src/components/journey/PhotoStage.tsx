"use client";

import { useEffect, useMemo, useRef } from "react";
import { PhotoCredit } from "@/components/ui/Photo";
import { TodoMark } from "@/components/ui/Todo";
import type { Foto, LightKeyframe, Station } from "@/lib/content/types";
import { clamp01, panelSide, progressToT, smoothstep } from "@/lib/journey-math";
import { journeyStore } from "@/lib/journey-store";
import { HeroIllustration } from "./StaticHero";

/** Wie weit eine Postkarte beim Wechsel zur Seite fliegt (Anteil der Bühnenbreite). */
const FLIGHT = 0.7;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Tageszeit beim Fortschritt p: Lichtfarbe und Stärke, weich zwischen den Keyframes. */
function lightAt(keys: LightKeyframe[], p: number): { rgb: [number, number, number]; strength: number } {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].p) i++;
  const a = keys[i];
  const b = keys[i + 1] ?? a;
  const k = b.p === a.p ? 0 : smoothstep((p - a.p) / (b.p - a.p));
  const ca = hexToRgb(a.farbe);
  const cb = hexToRgb(b.farbe);
  return {
    rgb: [0, 1, 2].map((j) => Math.round(ca[j] + (cb[j] - ca[j]) * k)) as [number, number, number],
    strength: a.staerke + (b.staerke - a.staerke) * k,
  };
}

interface Props {
  stations: Station[];
  /** Foto je Station (gleiche Reihenfolge), fehlt bei Stationen ohne Foto */
  fotos: (Foto | undefined)[];
  lighting: LightKeyframe[];
}

/**
 * Bühne der Foto-Reise: Die Ankunft zeigt das Startbild (Rathaus) als Vollbild. Jede weitere
 * Station zeigt ihr echtes Foto als Abzug mit weißem Rand,
 * dahinter dasselbe Foto groß und unscharf (die Fotos sind klein, so füllt es trotzdem
 * den Bildschirm). Beim Scrollen fliegt der Abzug zur Seite, der nächste kommt herein,
 * der Hintergrund zoomt langsam, und das Licht wandert vom Morgen zum Abend.
 * Rein dekorativ (aria-hidden): Inhalt, Alt-Texte und Urheber stehen in den Panels.
 */
export function PhotoStage({ stations, fotos, lighting }: Props) {
  const ranges = useMemo(() => stations.map((s) => s.scrollBereich), [stations]);
  const bgs = useRef<(HTMLDivElement | null)[]>([]);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const tint = useRef<HTMLDivElement>(null);
  const vignette = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const n = stations.length;
    const apply = (p: number) => {
      const calm = journeyStore.getState().calmMotion;
      const t = progressToT(ranges, p) * (n - 1);
      for (let i = 0; i < n; i++) {
        // d < 0: Station kommt noch, d > 0: schon vorbei, 0: angekommen
        const d = t - i;
        const bg = bgs.current[i];
        if (bg) {
          bg.style.opacity = String(i === 0 || d >= 0 ? 1 : smoothstep(d + 1));
          // Startbild: scharf und ruhig, zoomt beim Weiterscrollen nur leicht heran
          bg.style.transform =
            i === 0
              ? calm
                ? "none"
                : `scale(${1 + 0.06 * clamp01(d)})`
              : calm
                ? "scale(1.12)"
                : `scale(${1.16 - 0.06 * Math.max(-1, Math.min(1, d))})`;
        }
        const card = cards.current[i];
        if (card) {
          const o = clamp01(1 - Math.abs(d) * 1.3);
          card.style.opacity = String(o);
          card.style.visibility = o > 0 ? "visible" : "hidden";
          card.style.transform =
            calm || i === 0
              ? "none"
              : `translate3d(${-d * FLIGHT * 100}vw, ${Math.abs(d) * 4}vh, 0) rotate(${(i % 2 ? 1.8 : -1.8) - d * 7}deg)`;
        }
      }
      if (vignette.current) vignette.current.style.opacity = String(clamp01(t));
      if (tint.current) {
        const { rgb, strength } = lightAt(lighting, p);
        tint.current.style.backgroundColor = `rgb(${rgb.join(" ")})`;
        // nicht über dem Startbild: das Rathaus erscheint so, wie es fotografiert ist
        tint.current.style.opacity = String(strength * clamp01(t));
      }
    };
    apply(journeyStore.getState().progress);
    return journeyStore.subscribe((s, prev) => {
      if (s.progress !== prev.progress || s.calmMotion !== prev.calmMotion) apply(s.progress);
    });
  }, [ranges, lighting, stations.length]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-kuestenblau-100">
      {/* Hintergründe: späte Stationen liegen oben und blenden über die früheren */}
      {stations.map((s, i) => {
        const foto = fotos[i];
        return (
          <div
            key={s.id}
            ref={(el) => {
              bgs.current[i] = el;
            }}
            className={`absolute will-change-[opacity,transform] ${i === 0 ? "inset-0" : "-inset-[4%]"}`}
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            {foto && i === 0 ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export ohne Bildoptimierung */}
                <img
                  src={foto.datei}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="gh-hero-shade absolute inset-0" />
              </>
            ) : foto ? (
              // eslint-disable-next-line @next/next/no-img-element -- statischer Export ohne Bildoptimierung
              <img
                src={foto.datei}
                alt=""
                className="h-full w-full object-cover blur-2xl brightness-[0.8] saturate-[1.15]"
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
              />
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: s.farbe }}>
                <HeroIllustration className="h-full w-full opacity-90" />
              </div>
            )}
          </div>
        );
      })}

      {/* Tageszeit: weiches Licht über dem Hintergrund, die Fotos selbst bleiben echt */}
      <div ref={tint} className="absolute inset-0 mix-blend-soft-light" />
      <div
        ref={vignette}
        className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25"
        style={{ opacity: 0 }}
      />

      {/* Abzüge: gegenüber dem Panel, auf kleinen Bildschirmen über dem Panel. Das Startbild hat
          keinen Abzug, nur die Urhebernennung in der Ecke. */}
      {stations.map((s, i) => {
        const foto = fotos[i];
        if (i === 0 && foto)
          return (
            <div
              key={s.id}
              ref={(el) => {
                cards.current[i] = el;
              }}
              data-stage-card={i}
              className="absolute left-3 top-32 lg:left-auto lg:right-24 lg:top-6"
            >
              <p className="gh-hero-credit m-0">
                <PhotoCredit foto={foto} />
              </p>
            </div>
          );
        const right = panelSide(i) === "left";
        return (
          <div
            key={s.id}
            className={`absolute inset-x-0 top-32 bottom-[calc(56svh+3.5rem)] flex items-center justify-center px-6 lg:inset-y-0 lg:bottom-0 lg:top-0 lg:px-0 ${
              right ? "lg:justify-end lg:pr-[11%]" : "lg:justify-start lg:pl-[9%]"
            } ${i === 0 ? "lg:pr-[6%]" : ""}`}
          >
            <div
              ref={(el) => {
                cards.current[i] = el;
              }}
              data-stage-card={i}
              className="flex max-h-full will-change-[opacity,transform]"
              style={{
                opacity: i === 0 ? 1 : 0,
                visibility: i === 0 ? "visible" : "hidden",
              }}
            >
              {foto ? (
                <figure
                  className="gh-postkarte flex max-h-full flex-col"
                  style={{
                    width: `min(${Math.round(foto.breite * 2)}px, ${i === 0 ? 38 : 44}vw, 640px)`,
                    minWidth: "min(240px, 70vw)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export ohne Bildoptimierung */}
                  <img
                    src={foto.datei}
                    alt=""
                    width={foto.breite}
                    height={foto.hoehe}
                    className="min-h-0 w-full flex-1 object-contain"
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <figcaption className="mt-1.5 text-xs text-ink-700">
                    <PhotoCredit foto={foto} />
                  </figcaption>
                </figure>
              ) : (
                <div className="gh-postkarte w-[min(26rem,70vw)]">
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 border-2 border-dashed border-ink-500 p-4 text-center text-ink-700">
                    <span className="font-display text-2xl">{s.name}</span>
                    <span className="text-sm">Hier fehlt noch ein Foto.</span>
                    <TodoMark label="TODO: Foto ergänzen" />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
