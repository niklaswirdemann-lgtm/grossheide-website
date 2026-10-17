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
        className={`rounded-2xl bg-nebel-100 object-cover ${imgClassName}`}
      />
      <figcaption className="mt-2 text-xs text-muted">
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

/** „Fotos: …“ für mehrere Fotos auf einmal (gleiche Urheber nur einmal). */
export function FotosCredit({ fotos }: { fotos: Foto[] }) {
  const urheber = [...new Set(fotos.map((f) => f.urheber))];
  const offen = fotos.some((f) => !f.rechteGeklaert);
  return (
    <>
      {fotos.length > 1 ? "Fotos: " : "Foto: "}
      {urheber.map((u, i) => (
        <span key={u}>
          {i > 0 && ", "}
          {u.includes(TODO) ? <TodoMark label="Urheber unbekannt" /> : u}
        </span>
      ))}
      {offen && (
        <>
          {" "}
          <TodoMark label="TODO: Bildrechte prüfen" />
        </>
      )}
    </>
  );
}
