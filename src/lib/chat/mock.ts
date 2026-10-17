import chatJson from "../../../content/de/chat.json";
import { fill } from "../i18n";
import { telHref } from "../links";
import type { SearchEntry } from "../search";
import { normalize } from "../search-text";
import type { ChatAnswer, ChatKnowledge, ChatLink } from "./types";

/**
 * Probe-Version des Chats: beantwortet Fragen nur mit Inhalten dieser Website.
 * Keine KI, kein Netz: feste Muster (Notfall, Öffnungszeiten, Kontakt) und
 * eine Stichwortsuche über den Suchindex. Erfindet nichts: ohne Treffer
 * verweist sie ans Rathaus.
 */

const A = chatJson.antworten;
const STOP = new Set(chatJson.stoppwoerter);
const ALLGEMEIN = new Set(chatJson.allgemein);
const MAX_LINKS = 3;

type Intent = keyof typeof chatJson.muster;

function tokens(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9-]+/)
    .map((t) => t.replace(/^-+|-+$/g, ""))
    .filter(Boolean);
}

/** Passt ein Muster („wort“, „wortanfang*“, „a&b“) auf die Wörter der Frage? */
function matches(pattern: string, words: string[]): boolean {
  return pattern.split("&").every((p) => (p.endsWith("*") ? words.some((w) => w.startsWith(p.slice(0, -1))) : words.includes(p)));
}

/** Wörter, die ein Muster der Absicht treffen (für das Herausrechnen vor der Suche). */
function intentWords(intent: Intent, words: string[]): Set<string> {
  const hit = new Set<string>();
  for (const pattern of chatJson.muster[intent]) {
    for (const p of pattern.split("&")) {
      for (const w of words) if (p.endsWith("*") ? w.startsWith(p.slice(0, -1)) : w === p) hit.add(w);
    }
  }
  return hit;
}

function hasIntent(intent: Intent, words: string[]): boolean {
  return chatJson.muster[intent].some((p) => matches(p, words));
}

/** Einfache Grundform: Endungen abschneiden, damit „Ausweise“ auch „Ausweis“ findet. */
function stem(word: string): string {
  return word.length > 5 ? word.replace(/(en|es|n|e|s)$/, "") : word;
}

function score(entry: SearchEntry, terms: string[]): number {
  const title = normalize(entry.title);
  const keywords = normalize(entry.keywords ?? "");
  const text = normalize(`${entry.text} ${entry.type}`);
  let total = 0;
  for (const term of terms) {
    const t = stem(term);
    if (title.split(/[^a-z0-9]+/).some((w) => w.startsWith(t))) total += 6;
    else if (title.includes(t)) total += 4;
    else if (keywords.includes(t)) total += 3;
    else if (text.includes(t)) total += 1;
  }
  return total;
}

function search(entries: SearchEntry[], terms: string[]): { links: ChatLink[]; best: number } {
  const scored = entries.map((e) => ({ e, s: score(e, terms) })).filter((x) => x.s > 0);
  const top = Math.max(0, ...scored.map((x) => x.s));
  // Schwache Nebentreffer weglassen, wenn es starke gibt
  const ranked = scored.filter((x) => top < 3 || x.s >= top / 2).sort((a, b) => b.s - a.s);
  const seen = new Set<string>();
  const links: ChatLink[] = [];
  for (const { e } of ranked) {
    if (seen.has(e.href)) continue;
    seen.add(e.href);
    links.push({ title: e.title, href: e.href, type: e.type });
    if (links.length === MAX_LINKS) break;
  }
  return { links, best: top };
}

/** E-Mail-Adresse oder IBAN in der Eingabe? Dann wird die Frage nicht bearbeitet (und nie gesendet). */
export function containsPersonalData(text: string): boolean {
  return /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(text) || /\b[A-Z]{2}\d{2}(?:\s?\d{4}){4,}/i.test(text);
}

export function mockAnswer(question: string, k: ChatKnowledge): ChatAnswer {
  const phone = k.telefon ?? "";
  const kontaktLink: ChatLink = { title: "Kontakt", href: "/kontakt/", type: "Seite" };

  if (containsPersonalData(question)) {
    return { kind: "persoenlich", text: fill(A.persoenlich, { phone }), links: [kontaktLink] };
  }

  const words = tokens(question);

  if (hasIntent("notfall", words)) {
    return {
      kind: "notfall",
      text: A.notfall,
      items: k.notrufe.slice(0, 3),
      links: [{ title: "Im Notfall", href: "/leben-lernen/im-notfall/", type: "Seite" }],
    };
  }

  // Inhaltswörter: ohne Füllwörter, allgemeine Wörter und Wörter, die nur die Absicht ausdrücken
  const intent: Intent | null = hasIntent("zeiten", words) ? "zeiten" : hasIntent("kontakt", words) ? "kontakt" : null;
  const skip = new Set<string>([
    ...(intent ? intentWords(intent, words) : []),
    ...intentWords("dank", words),
    ...intentWords("gruss", words),
  ]);
  const terms = words.filter((w) => w.length > 2 && !STOP.has(w) && !ALLGEMEIN.has(w) && !skip.has(w));

  // „Öffnungszeiten Museum“ sucht das Museum; nur „Öffnungszeiten“ oder „Wann hat das Rathaus offen“ zeigt die Zeiten.
  const found = terms.length ? search(k.entries, terms) : { links: [], best: 0 };
  const confident = found.best >= 3;

  if (intent === "zeiten" && !confident) {
    return {
      kind: "zeiten",
      text: A.zeiten,
      items: [...k.zeiten, ...(k.zeitenHinweis ? [{ label: "Hinweis", value: k.zeitenHinweis }] : [])],
      links: [{ title: "Öffnungszeiten", href: "/rathaus/oeffnungszeiten/", type: "Seite" }],
    };
  }
  if (intent === "kontakt" && !confident) {
    const items = [
      k.telefon && { label: "Telefon", value: k.telefon, href: telHref(k.telefon) },
      k.email && { label: "E-Mail", value: k.email, href: `mailto:${k.email}` },
      k.adresse && { label: "Anschrift", value: k.adresse },
    ].filter((x): x is { label: string; value: string; href?: string } => !!x);
    return { kind: "kontakt", text: A.kontakt, items, links: [kontaktLink] };
  }

  if (!terms.length) {
    if (hasIntent("dank", words)) return { kind: "dank", text: A.dank, links: [] };
    if (hasIntent("gruss", words) || !words.length) return { kind: "gruss", text: A.gruss, links: [] };
  }

  if (found.links.length) {
    return { kind: "treffer", text: confident ? A.treffer : A.trefferUnsicher, links: found.links };
  }

  return {
    kind: "unbekannt",
    text: fill(A.unbekannt, { phone }),
    links: [
      ...(terms.length ? [{ title: "Suche", href: `/suche/?q=${encodeURIComponent(terms.join(" "))}`, type: "Seite" }] : []),
      kontaktLink,
    ],
  };
}
