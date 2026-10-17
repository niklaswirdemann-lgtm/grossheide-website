import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  children: ReactNode;
  intro?: ReactNode;
  className?: string;
}

/** Inhaltsabschnitt mit h2 und Sprunganker. */
export function Section({ id, title, intro, children, className = "" }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-titel`} className={`scroll-mt-28 ${className}`}>
      <h2 id={`${id}-titel`} className="text-3xl">
        {title}
      </h2>
      {intro && <div className="mt-3 max-w-2xl text-muted">{intro}</div>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
