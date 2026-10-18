interface Props {
  label: string;
  /** Beschreibt, welches Motiv hier später gezeigt werden soll. */
  motif: string;
  className?: string;
}

/**
 * Klar beschrifteter Bildplatzhalter. Es werden keine echten Fotos, Logos
 * oder Wappen der Gemeinde verwendet, bis eine Freigabe vorliegt.
 */
export function Placeholder({ label, motif, className = "" }: Props) {
  return (
    <div
      role="img"
      aria-label={`${label}: ${motif}`}
      className={`relative flex min-h-40 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-nebel-300 bg-nebel-100 p-4 text-center ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-60"
      >
        <path d="M0 70 Q50 60 100 68 T200 64 V100 H0Z" fill="var(--gh-moorgruen-100)" />
        <path d="M0 82 Q60 74 120 80 T200 78 V100 H0Z" fill="var(--gh-moorgruen-300)" />
      </svg>
      <p aria-hidden="true" className="relative text-sm font-bold text-muted">
        {label}
        <span className="block font-normal">{motif}</span>
      </p>
    </div>
  );
}

export function LogoPlaceholder({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      title={label}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gh-logo font-display text-xl font-extrabold shadow-md"
    >
      G
    </span>
  );
}
