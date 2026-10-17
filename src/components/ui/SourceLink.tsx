import { hostOf } from "@/lib/links";

/**
 * Quellenhinweis für übernommene Fakten. Hilft bei der Redaktion und Prüfung;
 * kann vor dem Livegang zentral ausgeblendet werden (SHOW_SOURCES).
 */
export const SHOW_SOURCES = true;

export function SourceLink({ href, label = "Quelle" }: { href: string | null | undefined; label?: string }) {
  if (!SHOW_SOURCES || !href) return null;
  return (
    <p className="mt-3 text-sm text-muted">
      {label}:{" "}
      <a href={href} rel="noopener" className="break-all text-muted">
        {hostOf(href)}
        {new URL(href).pathname !== "/" ? new URL(href).pathname : ""}
        <span className="sr-only"> (externer Link)</span>
      </a>
    </p>
  );
}
