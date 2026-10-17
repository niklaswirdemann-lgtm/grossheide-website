"use client";

import type { StaticReason } from "@/lib/journey-store";

export const TOGGLE_ID = "gh-reise-schalter";

const reasons: Record<Exclude<StaticReason, null>, string> = {
  user: "Du hast die bewegte Reise ausgeschaltet.",
  "reduced-motion": "Ausgeschaltet, weil dein Gerät „Bewegung reduzieren“ eingestellt hat.",
  "save-data": "Ausgeschaltet, weil dein Gerät den Datensparmodus nutzt.",
};

interface Props {
  on: boolean;
  reason?: StaticReason;
  onChange: (on: boolean) => void;
  /** Hinweistext zur Einstellung anzeigen (statische Ansicht) */
  showReason?: boolean;
  variant?: "light" | "overlay";
}

/** Schalter „Bewegte Reise“ (role="switch"); Einstellung wird in localStorage gespeichert. */
export function JourneyToggle({ on, reason, onChange, showReason, variant = "light" }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        id={TOGGLE_ID}
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`gh-button ${variant === "overlay" ? "bg-surface/95 text-text shadow-lg ring-1 ring-border hover:bg-surface" : "gh-button-secondary"}`}
      >
        <span
          aria-hidden="true"
          className={`relative inline-block h-5 w-9 rounded-full transition-colors ${on ? "bg-brand" : "bg-ink-500"}`}
        >
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-4.5" : "left-0.5"}`} />
        </span>
        Bewegte Reise
        <span className="font-normal">{on ? "an" : "aus"}</span>
      </button>
      {showReason && reason && <p className="text-sm text-muted">{reasons[reason]}</p>}
    </div>
  );
}
