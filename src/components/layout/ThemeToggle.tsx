"use client";

import { useCallback, useSyncExternalStore } from "react";
import { bewegungErlaubt } from "@/lib/motion";

const KEY = "gh-farbmodus";
const dark = () =>
  document.documentElement.dataset.theme === "dark" ||
  (!document.documentElement.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  mq.addEventListener("change", onChange);
  return () => {
    obs.disconnect();
    mq.removeEventListener("change", onChange);
  };
}

/**
 * Schalter Hell/Dunkel in der Kopfleiste. Ohne Wahl folgt die Seite der Systemeinstellung;
 * eine Wahl wird gespeichert (das Skript im Kopf setzt sie vor dem ersten Zeichnen).
 * Wo erwünscht, blendet der Wechsel als wachsender Kreis vom Schalter aus über.
 */
export function ThemeToggle({ label }: { label: string }) {
  const isDark = useSyncExternalStore(subscribe, dark, () => false);

  const toggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const next = dark() ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(KEY, next);
      } catch {}
    };
    if (!bewegungErlaubt() || !document.startViewTransition) return apply();
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggle}
      className="gh-theme-toggle inline-flex min-h-6 items-center gap-2 rounded-full text-sm font-bold"
    >
      <span aria-hidden="true" className="gh-theme-icon">
        <svg viewBox="0 0 20 20" width="16" height="16">
          {isDark ? (
            <path fill="currentColor" d="M10.5 2a7.5 7.5 0 1 0 7.47 8.2A6 6 0 0 1 10.5 2Z" />
          ) : (
            <path
              fill="currentColor"
              d="M10 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-.75-5h1.5v3h-1.5V1Zm0 15h1.5v3h-1.5v-3ZM1 9.25h3v1.5H1v-1.5Zm15 0h3v1.5h-3v-1.5ZM3.1 4.16l1.06-1.06 2.12 2.12-1.06 1.06L3.1 4.16Zm10.6 10.6 1.06-1.06 2.12 2.12-1.06 1.06-2.12-2.12Zm-10.6 1.08 2.12-2.12 1.06 1.06-2.12 2.12-1.06-1.06Zm10.6-10.6 2.12-2.12 1.06 1.06-2.12 2.12-1.06-1.06Z"
            />
          )}
        </svg>
      </span>
      {/* auf dem Handy nur das Symbol, der Name bleibt für Screenreader */}
      <span className="max-sm:sr-only">{label}</span>
    </button>
  );
}
