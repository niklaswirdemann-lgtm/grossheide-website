import type { ReactNode } from "react";

// Eigenes Root-Layout nur für die Wurzel-URL "/", die auf /de/ weiterleitet.
export default function RedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", background: "#FBF8F1", color: "#15222C" }}>
        {children}
      </body>
    </html>
  );
}
