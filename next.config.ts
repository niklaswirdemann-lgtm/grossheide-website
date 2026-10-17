import type { NextConfig } from "next";

// Statischer Export: Die Seite läuft ohne Node-Server auf jedem (EU-)Webhoster.
// Keine Bildoptimierung zur Laufzeit, keine externen Dienste.
// BASE_PATH: Unterordner, wenn die Seite nicht im Wurzelverzeichnis liegt (Vorschau auf GitHub Pages: /grossheide-website).
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  ...(basePath ? { basePath } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
