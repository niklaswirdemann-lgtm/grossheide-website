import type { Foto } from "@/lib/content";
import { TODO } from "@/lib/content/types";
import { TodoMark } from "./Todo";

interface Props {
  foto: Foto;
  /** Zusätzliche Klassen für das Bild (Höhe, Seitenverhältnis) */
  imgClassName?: string;
  className?: string;
  /** Foto steht oben im Bild: sofort laden (verbessert LCP) statt erst beim Scrollen */
  priority?: boolean;
}

/**
 * Foto mit Alternativtext und Urhebernennung („Foto: …“). Solange die Rechte nicht
 * geklärt sind, steht sichtbar „TODO: Bildrechte prüfen“ darunter, damit vor einer
 * Veröffentlichung klar ist, welche Bilder geklärt oder ersetzt werden müssen.
 */
export function Photo({ foto, imgClassName = "aspect-[16/9] w-full", className = "", priority = false }: Props) {
  return (
    <figure className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export ohne Bildoptimierung */}
      <img
        src={foto.datei}
        alt={foto.alt}
        width={foto.breite}
        height={foto.hoehe}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={`rounded-md bg-sand-100 object-cover ${imgClassName}`}
      />
      <figcaption className="mt-1 text-xs text-muted">
        <PhotoCredit foto={foto} />
      </figcaption>
    </figure>
  );
}

/** „Foto: Urheber“ und, solange die Rechte offen sind, „TODO: Bildrechte prüfen“. */
export function PhotoCredit({ foto }: { foto: Foto }) {
  return (
    <>
      Foto: {foto.urheber.includes(TODO) ? <TodoMark label="Urheber unbekannt" /> : foto.urheber}
      {!foto.rechteGeklaert && (
        <>
          {" "}
          <TodoMark label="TODO: Bildrechte prüfen" />
        </>
      )}
    </>
  );
}
