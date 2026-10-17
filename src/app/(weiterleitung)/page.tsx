import type { Metadata } from "next";
import Link from "next/link";
import { withBase } from "@/lib/links";

/*
 * Statischer Export kennt keine Server-Weiterleitung. Der Webserver sollte "/"
 * per 301 auf "/de/" leiten (siehe docs/hosting.md); diese Seite ist der Fallback:
 * sofortige Weiterleitung (0 Sekunden, WCAG-konform) plus sichtbarer Link.
 */
export const metadata: Metadata = {
  title: "Gemeinde Großheide",
  robots: { index: false },
};

export default function RootRedirect() {
  return (
    <main>
      <meta httpEquiv="refresh" content={`0; url=${withBase("/de/")}`} />
      <h1>Gemeinde Großheide</h1>
      <p>
        <Link href="/de/" style={{ color: "#1D5784" }}>
          Weiter zur Website der Gemeinde Großheide
        </Link>
      </p>
    </main>
  );
}
