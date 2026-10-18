"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/lib/content";
import { fill, localeHref, type Dictionary, type Locale } from "@/lib/i18n";

interface Props {
  locale: Locale;
  items: NavItem[];
  t: Pick<Dictionary, "mainNav" | "menuOpen" | "menuClose" | "submenuToggle">;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path fill="currentColor" d="M3.2 5.7 8 10.5l4.8-4.8 1 1L8 12.5 2.2 6.7z" />
    </svg>
  );
}

/**
 * Hauptnavigation nach dem „Disclosure“-Muster (WAI-ARIA APG):
 * Hauptpunkte sind echte Links zu Übersichtsseiten, die Unterpunkte öffnen
 * sich über einen eigenen Button. Escape schließt und setzt den Fokus zurück.
 * Ohne JavaScript bleiben alle Hauptpunkte als Links nutzbar; der Footer
 * enthält zusätzlich die vollständige Navigation.
 */
export function MainNav({ locale, items, t }: Props) {
  const pathname = usePathname();
  const baseId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const toggleRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const closeAll = useCallback(() => {
    setOpenIndex(null);
    setMobileOpen(false);
  }, []);

  // Beim Seitenwechsel Menüs schließen (Zustand an den Pfad koppeln statt per Effekt setzen).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenIndex(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (openIndex !== null) {
        toggleRefs.current[openIndex]?.focus();
        setOpenIndex(null);
      } else if (mobileOpen) {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    function onPointer(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) closeAll();
    }
    // Fokus verlässt die Navigation (z. B. per Tab) → offenes Untermenü schließen.
    function onFocusIn(e: FocusEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenIndex(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [openIndex, mobileOpen, closeAll]);

  const isCurrent = (href: string) => {
    const full = localeHref(locale, href);
    return pathname === full || pathname === full.replace(/\/$/, "");
  };
  const isSection = (href: string) => pathname.startsWith(localeHref(locale, href).replace(/\/$/, ""));

  const panelId = `${baseId}-panel`;

  return (
    <nav ref={navRef} id="hauptnavigation" aria-label={t.mainNav} tabIndex={-1}>
      <button
        ref={menuButtonRef}
        type="button"
        className="gh-button gh-button-secondary lg:hidden"
        aria-expanded={mobileOpen}
        aria-controls={panelId}
        onClick={() => setMobileOpen((v) => !v)}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
          {mobileOpen ? (
            <path
              fill="currentColor"
              d="m4.4 3.3 5.6 5.6 5.6-5.6 1.1 1.1-5.6 5.6 5.6 5.6-1.1 1.1-5.6-5.6-5.6 5.6-1.1-1.1 5.6-5.6-5.6-5.6z"
            />
          ) : (
            <path fill="currentColor" d="M2 4.5h16V6H2zm0 4.75h16v1.5H2zM2 14h16v1.5H2z" />
          )}
        </svg>
        {mobileOpen ? t.menuClose : t.menuOpen}
      </button>

      <ul
        id={panelId}
        className={`${mobileOpen ? "flex" : "hidden"} absolute inset-x-0 top-full z-40 max-h-[calc(100vh-5rem)] flex-col overflow-y-auto border-b border-border bg-surface px-4 pb-6 pt-2 shadow-lg lg:static lg:flex lg:max-h-none lg:flex-row lg:flex-wrap lg:items-center lg:gap-1 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
      >
        {items.map((item, i) => {
          const hasChildren = !!item.children?.length;
          const open = openIndex === i;
          const subId = `${baseId}-sub-${i}`;
          const active = isSection(item.href);
          return (
            <li key={item.href} className="relative border-b border-border lg:border-0">
              <div className="flex items-center">
                <Link
                  href={localeHref(locale, item.href)}
                  lang={item.lang}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={`flex min-h-11 flex-1 items-center rounded-full px-3 py-2 font-bold no-underline hover:bg-brand-soft lg:flex-none lg:px-2.5 ${
                    active ? "bg-brand-soft text-brand-text ring-1 ring-kuestenblau-100" : "text-text"
                  }`}
                >
                  {item.label}
                </Link>
                {hasChildren && (
                  <button
                    ref={(el) => {
                      toggleRefs.current[i] = el;
                    }}
                    type="button"
                    aria-expanded={open}
                    aria-controls={subId}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="hidden min-h-11 min-w-9 items-center justify-center rounded-full text-text hover:bg-brand-soft lg:-ml-1.5 lg:inline-flex"
                  >
                    <Chevron open={open} />
                    <span className="sr-only">
                      {fill(t.submenuToggle, { label: "" })}
                      <span lang={item.lang}>{item.label}</span>
                    </span>
                  </button>
                )}
              </div>
              {hasChildren && (
                <ul
                  id={subId}
                  className={`pb-2 pl-4 lg:absolute lg:left-0 lg:top-[calc(100%+0.5rem)] lg:z-50 lg:min-w-72 lg:rounded-2xl lg:border lg:border-border lg:bg-surface lg:p-2 lg:shadow-2xl ${
                    open ? "lg:block" : "lg:hidden"
                  }`}
                >
                  {item.children!.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={localeHref(locale, child.href)}
                        lang={child.lang}
                        aria-current={isCurrent(child.href) ? "page" : undefined}
                        className="flex min-h-11 items-center rounded-xl px-3 py-2 font-bold text-text no-underline hover:bg-brand-soft hover:text-brand-text"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
