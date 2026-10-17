"use client";

import { jumpTo } from "@/lib/journey-scroll";

/** „Direkt zur Website“: springt ohne Fahrt zum klassischen Inhalt unter der Foto-Reise. */
export function SkipButton({ label, targetId = "themen" }: { label: string; targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      onClick={(e) => {
        e.preventDefault();
        jumpTo(targetId);
      }}
      className="gh-button gh-button-primary shadow-lg"
    >
      {label}
      <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
        <path fill="currentColor" d="M7.25 2h1.5v9.1l3.2-3.2 1.06 1.06L8 14 2.99 8.96 4.05 7.9l3.2 3.2z" />
      </svg>
    </a>
  );
}
