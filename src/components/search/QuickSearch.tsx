"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { contentLocale, localeHref, type Locale } from "@/lib/i18n";
import { withBase } from "@/lib/links";
import type { SearchEntry } from "@/lib/search";
import { rankEntries } from "@/lib/search-text";

/** Vorschläge, solange noch nichts eingegeben ist. */
const SUGGESTIONS: SearchEntry[] = [
  {
    title: "Termin buchen",
    href: "https://www.terminland.de/grossheide/?m=40492",
    type: "Online-Dienst",
    text: "Einwohnermeldeamt und Standesamt",
  },
  { title: "Dienstleistungen A–Z", href: "/rathaus/dienstleistungen/", type: "Seite", text: "Ausweis, Anmeldung, Urkunden" },
  { title: "Öffnungszeiten", href: "/rathaus/oeffnungszeiten/", type: "Seite", text: "Wann das Rathaus geöffnet hat" },
  { title: "Im Notfall", href: "/leben-lernen/im-notfall/", type: "Seite", text: "Notrufe und Bereitschaftsdienste" },
  { title: "Veranstaltungen", href: "/aktuelles/veranstaltungen/", type: "Seite", text: "Was in Großheide los ist" },
];

const MAX = 8;
const subscribe = () => () => {};

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

/**
 * Schnellsuche (Strg+K bzw. ⌘K, oder der Knopf im Kopf): Dialog mit Eingabefeld und Treffern
 * während des Tippens, nach dem Combobox-Muster (WAI-ARIA APG): Pfeiltasten wählen, Enter öffnet,
 * Escape schließt. Der Index (/de/suchindex.json) wird erst beim ersten Öffnen geladen.
 * Ohne JavaScript bleibt das normale Suchformular im Kopf.
 */
export function QuickSearch({ locale }: { locale: Locale }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const listId = `${baseId}-liste`;
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  // Tastenkürzel passend zum Gerät, erst nach dem Laden bekannt
  const mac = useSyncExternalStore(
    subscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );

  const results = useMemo(() => (q.trim() ? rankEntries(index ?? [], q).slice(0, MAX) : SUGGESTIONS), [q, index]);

  const open = useCallback(() => {
    const d = dialog.current;
    if (!d || d.open) return;
    d.showModal();
    setActive(0);
    if (!index)
      fetch(withBase(`/${contentLocale(locale)}/suchindex.json`))
        .then((r) => r.json())
        .then(setIndex)
        .catch(() => setIndex([]));
  }, [index, locale]);

  const close = useCallback(() => dialog.current?.close(), []);

  // Klick neben den Dialog (auf den abgedunkelten Hintergrund) schließt ihn
  useEffect(() => {
    const d = dialog.current;
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d?.close();
    };
    d?.addEventListener("click", onClick);
    return () => d?.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (entry: SearchEntry | undefined) => {
    if (!entry) {
      if (q.trim()) router.push(`${localeHref(locale, "/suche/")}?q=${encodeURIComponent(q.trim())}`);
      close();
      return;
    }
    close();
    if (isExternal(entry.href)) window.location.href = entry.href;
    else router.push(localeHref(locale, entry.href));
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  };

  const shown = Math.min(active, Math.max(0, results.length - 1));
  const status = !q.trim()
    ? "Vorschläge"
    : index === null
      ? "Suche wird geladen …"
      : results.length
        ? `${results.length === MAX ? "Mindestens " : ""}${results.length} ${results.length === 1 ? "Treffer" : "Treffer"}`
        : "Keine Treffer. Enter sucht auf der Suchseite weiter.";

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={open}
        className="gh-quick-trigger hidden min-h-11 items-center gap-2 rounded-full border border-nebel-300 bg-nebel-50 px-3 text-sm font-bold text-text hover:border-kuestenblau-300 hover:bg-brand-soft lg:inline-flex"
        lang={locale === "de" ? undefined : "de"}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16">
          <path fill="currentColor" d="M11 2 4 11h5l-1 7 7-9h-5l1-7Z" />
        </svg>
        Schnellsuche
        <kbd className="rounded-md border border-nebel-300 bg-surface px-1.5 py-0.5 font-sans text-xs font-bold text-muted">
          <span className="sr-only">Tastenkürzel: </span>
          {mac ? "⌘ K" : "Strg K"}
        </kbd>
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={`${baseId}-titel`}
        lang={locale === "de" ? undefined : "de"}
        className="gh-palette"
        onClose={() => {
          setQ("");
          trigger.current?.focus({ preventScroll: true });
        }}
      >
        <div className="flex flex-col">
          <h2 id={`${baseId}-titel`} className="sr-only">
            Schnellsuche
          </h2>
          <div className="flex items-center gap-3 border-b border-border px-5">
            <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20" className="shrink-0 text-muted">
              <path
                fill="currentColor"
                d="M8.5 2a6.5 6.5 0 0 1 5.18 10.43l4.2 4.2-1.06 1.06-4.2-4.2A6.5 6.5 0 1 1 8.5 2Zm0 1.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
              />
            </svg>
            <label htmlFor={`${baseId}-eingabe`} className="sr-only">
              Was suchst du?
            </label>
            <input
              ref={input}
              id={`${baseId}-eingabe`}
              type="text"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results.length ? `${listId}-${shown}` : undefined}
              autoComplete="off"
              placeholder="Was suchst du? z. B. Ausweis, Kita, Badesee"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKey}
              className="min-h-16 min-w-0 flex-1 bg-transparent text-lg text-text placeholder:text-ink-700 focus:outline-none"
            />
            <button type="button" onClick={close} className="gh-button gh-button-secondary min-h-9 px-3 text-sm">
              Schließen
            </button>
          </div>
          <p role="status" className="px-5 pt-4 text-xs font-bold uppercase tracking-wider text-muted">
            {status}
          </p>
          <div id={listId} role="listbox" aria-label="Treffer" className="max-h-[50vh] overflow-y-auto p-3">
            {results.map((r, i) => (
              // Tastatur läuft über das Eingabefeld (aria-activedescendant), die Maus klickt direkt
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <div
                key={`${r.type}-${r.href}-${r.title}`}
                id={`${listId}-${i}`}
                role="option"
                tabIndex={-1}
                aria-selected={i === shown}
                onClick={() => go(r)}
                onMouseMove={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl px-4 py-3 ${i === shown ? "bg-brand-soft ring-1 ring-kuestenblau-100" : ""}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-text">{r.title}</span>
                  {r.text && <span className="block truncate text-sm text-muted">{r.text}</span>}
                </span>
                <span className="shrink-0 rounded-full bg-nebel-100 px-2.5 py-1 text-xs font-bold text-muted">
                  {r.type}
                  {isExternal(r.href) && <span className="sr-only"> (externe Seite)</span>}
                </span>
              </div>
            ))}
          </div>
          <p className="border-t border-border px-5 py-3 text-xs text-muted">
            <kbd className="font-bold">↑</kbd> <kbd className="font-bold">↓</kbd> auswählen ·{" "}
            <kbd className="font-bold">Enter</kbd> öffnen · <kbd className="font-bold">Esc</kbd> schließen
          </p>
        </div>
      </dialog>
    </>
  );
}
