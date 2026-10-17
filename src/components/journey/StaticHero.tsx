import type { ReactNode } from "react";
import { PhotoCredit } from "@/components/ui/Photo";
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

export function StaticHero({ children, controls, foto }: { children: ReactNode; controls?: ReactNode; foto?: Foto }) {
  if (foto) {
    // Startbild als Vollbild, Text direkt darauf (heller Text über dunklem Verlauf, siehe .gh-hero-text)
    return (
      <div className="relative flex min-h-[calc(100svh-6rem)] items-end overflow-hidden bg-ink-900 lg:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export ohne Bildoptimierung */}
        <img src={foto.datei} alt={foto.alt} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="gh-hero-shade absolute inset-0" />
        <div className="gh-container relative py-12 sm:py-20">
          <div className="gh-hero-text max-w-2xl">{children}</div>
          {controls && <div className="mt-6">{controls}</div>}
        </div>
        <p className="gh-hero-credit absolute right-3 top-3 m-0">
          <PhotoCredit foto={foto} />
        </p>
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
