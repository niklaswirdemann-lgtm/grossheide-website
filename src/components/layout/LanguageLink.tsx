"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { locales, type Locale } from "@/lib/i18n";

const prefix = new RegExp(`^/(${locales.join("|")})(?=/|$)`);

/** Link auf dieselbe Seite in einer anderen Sprache (alle Seiten gibt es in jeder Sprache). */
export function LanguageLink({ to, className, children }: { to: Locale; className?: string; children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const rest = pathname.replace(prefix, "") || "/";
  return (
    <Link href={`/${to}${rest}`} hrefLang={to} lang={to} className={className}>
      {children}
    </Link>
  );
}
