/**
 * Hinweis auf jeder Seite der öffentlichen Vorschau (Build mit VORSCHAU=1, z. B. GitHub Pages):
 * Die Seite ist ein Entwurf und nicht die offizielle Website der Gemeinde.
 */
export function PreviewNotice() {
  return (
    <aside aria-label="Hinweis zur Vorschau" lang="de" className="bg-warm-soft text-text">
      <p className="gh-container py-2 text-sm">
        <strong>Vorschau der neuen Website, noch nicht offiziell.</strong> Die Bildrechte der Fotos sind noch nicht geklärt.
        Angaben ohne Gewähr. Die offizielle Website der Gemeinde ist{" "}
        <a href="https://www.grossheide.de" rel="noopener" className="text-text underline">
          www.grossheide.de
        </a>
        .
      </p>
    </aside>
  );
}
