import type { ReactNode } from "react";
import { FotosCredit } from "@/components/ui/Photo";
import type { Foto } from "@/lib/content/types";

/**
 * Statischer Hero: Illustration der Landschaft
 * (gleiche Token-Farben). Wird gezeigt, wenn die bewegte Reise aus ist (Schalter,
 * reduzierte Bewegung, Datensparmodus), und als Bühne für Stationen ohne Foto.
 */
export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className={className}>
      <defs>
        <linearGradient id="gh-himmel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FC3E0" />
          <stop offset="0.55" stopColor="#DCEAF4" />
          <stop offset="0.8" stopColor="#F6E3C9" />
          <stop offset="1" stopColor="#F2D7C4" />
        </linearGradient>
        <radialGradient id="gh-sonne" cx="0.78" cy="0.62" r="0.35">
          <stop offset="0" stopColor="#FFE2C2" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFE2C2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gh-nebel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#gh-himmel)" />
      <rect width="1600" height="900" fill="url(#gh-sonne)" />
      {/* Wolken */}
      <g fill="#FFFFFF" opacity="0.85">
        <ellipse cx="300" cy="170" rx="120" ry="34" />
        <ellipse cx="380" cy="150" rx="80" ry="30" />
        <ellipse cx="1050" cy="120" rx="150" ry="36" />
        <ellipse cx="1150" cy="100" rx="90" ry="30" />
        <ellipse cx="760" cy="230" rx="90" ry="22" />
      </g>
      {/* Windräder am Horizont */}
      <g stroke="#E9EEF0" strokeWidth="5" strokeLinecap="round">
        <line x1="1220" y1="610" x2="1220" y2="420" />
        <line x1="1220" y1="420" x2="1180" y2="360" />
        <line x1="1220" y1="420" x2="1290" y2="430" />
        <line x1="1220" y1="420" x2="1195" y2="485" />
        <line x1="1360" y1="615" x2="1360" y2="450" />
        <line x1="1360" y1="450" x2="1335" y2="395" />
        <line x1="1360" y1="450" x2="1420" y2="455" />
        <line x1="1360" y1="450" x2="1340" y2="505" />
      </g>
      {/* ferne Landstreifen */}
      <path d="M0 610 L1600 600 L1600 900 L0 900Z" fill="#9DBB8E" />
      <path d="M0 640 Q400 625 800 640 T1600 632 L1600 900 L0 900Z" fill="#7FA35C" />
      {/* Baumgruppen */}
      <g fill="#4F7A3F">
        <circle cx="180" cy="610" r="34" />
        <circle cx="225" cy="600" r="40" />
        <circle cx="270" cy="615" r="30" />
        <circle cx="900" cy="618" r="26" />
        <circle cx="935" cy="610" r="32" />
        <circle cx="1480" cy="612" r="28" />
      </g>
      {/* Mühle */}
      <g>
        <path d="M560 640 L575 520 L615 520 L630 640Z" fill="#8C5A3C" />
        <path d="M568 525 L595 492 L622 525Z" fill="#3F3A35" />
        <g stroke="#EDE6D6" strokeWidth="9" strokeLinecap="round">
          <line x1="596" y1="512" x2="530" y2="446" />
          <line x1="596" y1="512" x2="662" y2="578" />
          <line x1="596" y1="512" x2="662" y2="446" />
          <line x1="596" y1="512" x2="530" y2="578" />
        </g>
      </g>
      {/* Rathaus */}
      <g>
        <rect x="320" y="600" width="130" height="62" fill="#B5563A" />
        <path d="M310 602 L385 560 L460 602Z" fill="#5A3B30" />
      </g>
      {/* Kanal und Vordergrund */}
      <path d="M0 720 Q500 690 980 712 T1600 700 L1600 900 L0 900Z" fill="#5A8549" />
      <path d="M1040 900 Q1080 800 1180 740 T1600 712 L1600 742 Q1300 760 1230 800 T1110 900Z" fill="#3C7FB0" opacity="0.85" />
      <path d="M0 790 Q420 760 900 790 T1600 780 L1600 900 L0 900Z" fill="#33582F" />
      <rect y="560" width="1600" height="340" fill="url(#gh-nebel)" />
    </svg>
  );
}

/**
 * Drei rund gerahmte Fotos übereinander versetzt (Startseite). Die Fotos sind klein; so
 * erscheinen sie in einer Größe, in der sie scharf bleiben. `decorative`: ohne Alt-Texte
 * (Bühne der Reise, dort stehen Inhalt und Urheber im Panel).
 */
export function HeroCollage({
  fotos,
  decorative = false,
  className = "",
}: {
  fotos: Foto[];
  decorative?: boolean;
  className?: string;
}) {
  const [main, second, third] = fotos;
  if (!main) return null;
  const img = (f: Foto, cls: string, eager: boolean) => (
    <div className={`gh-foto-frame absolute ring-1 ring-white/25 ${cls}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export ohne Bildoptimierung */}
      <img
        src={f.datei}
        alt={decorative ? "" : f.alt}
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
    <figure className={`gh-collage ${className}`} aria-hidden={decorative || undefined}>
      <div className="relative aspect-[6/5] w-full">
        {img(main, "right-0 top-0 aspect-[4/3] w-[80%]", true)}
        {second && img(second, "bottom-0 left-0 aspect-square w-[44%] shadow-2xl", false)}
        {third && img(third, "bottom-[4%] right-[6%] aspect-[4/3] w-[40%] shadow-2xl", false)}
      </div>
      <figcaption className="gh-hero-credit mt-4 inline-block">
        <FotosCredit fotos={fotos.filter(Boolean)} />
      </figcaption>
    </figure>
  );
}

export function StaticHero({
  children,
  controls,
  fotos = [],
}: {
  children: ReactNode;
  controls?: ReactNode;
  /** Fotos für die Collage, das erste ist das Startbild */
  fotos?: Foto[];
}) {
  if (fotos.length) {
    // Dunkle Bühne mit heller Schrift, rechts die Foto-Collage
    return (
      <div className="gh-dark-stage relative overflow-hidden">
        <div className="gh-container relative grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:py-24">
          <div className="gh-hero-text min-w-0">
            {children}
            {controls && <div className="mt-6">{controls}</div>}
          </div>
          <HeroCollage fotos={fotos} className="mx-auto w-full max-w-md lg:max-w-none" />
        </div>
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden">
      <HeroIllustration className="absolute inset-0 h-full w-full" />
      <div className="gh-container relative pb-40 pt-12 sm:pt-20">
        <div className="max-w-2xl rounded-lg bg-surface/95 p-6 shadow-xl ring-1 ring-border backdrop-blur-md sm:p-8">
          {children}
        </div>
        {controls && <div className="mt-4">{controls}</div>}
      </div>
    </div>
  );
}
