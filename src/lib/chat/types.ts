import type { Locale } from "../i18n";
import type { SearchEntry } from "../search";

/**
 * Schnittstelle des Chat-Widgets. Die Probe-Version (mock.ts) und ein späterer
 * echter Dienst (client.ts, docs/chat-api.md) liefern dieselben Typen.
 */

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface ChatRequest {
  locale: Locale;
  /** Aktuelle Frage, höchstens 500 Zeichen */
  question: string;
  /** Bisheriger Verlauf dieses Gesprächs (nur im Browser gehalten) */
  history: ChatTurn[];
  /** Pfad der Seite, auf der gefragt wird, z. B. /de/rathaus/ */
  page: string;
}

export type ChatAnswerKind = "gruss" | "dank" | "notfall" | "zeiten" | "kontakt" | "treffer" | "unbekannt" | "persoenlich";

export interface ChatLink {
  title: string;
  /** Interner Pfad ohne Sprachpräfix (/rathaus/), externe URL oder tel:/mailto: */
  href: string;
  /** Art der Seite, z. B. „Dienstleistung“ */
  type?: string;
}

export interface ChatItem {
  label: string;
  value: string;
  href?: string;
}

export interface ChatAnswer {
  kind: ChatAnswerKind;
  /** Reiner Text, kein HTML */
  text: string;
  /** Aufzählung, z. B. Öffnungszeiten oder Notrufnummern */
  items?: ChatItem[];
  /** Quellen bzw. passende Seiten dieser Website */
  links: ChatLink[];
}

/** Wissen der Probe-Version: beim Build als /{lang}/chat-wissen.json erzeugt. */
export interface ChatKnowledge {
  entries: SearchEntry[];
  telefon: string | null;
  email: string | null;
  adresse: string | null;
  zeiten: ChatItem[];
  zeitenHinweis: string | null;
  notrufe: ChatItem[];
}
