/**
 * Content-Loader. Einziger Ort, der /content liest.
 *
 * Heute: lokale JSON-Dateien, beim Build eingelesen.
 * Später: dieselben Funktionen holen die Daten aus Directus/Strapi
 * (gleiche Rückgabetypen), die Seiten bleiben unverändert.
 */
import factsJson from "../../../content/facts.json";
import newsJson from "../../../content/de/news.json";
import eventsJson from "../../../content/de/events.json";
import servicesJson from "../../../content/de/services.json";
import ortsteileJson from "../../../content/de/ortsteile.json";
import stationsJson from "../../../content/stations.json";
import navigationJson from "../../../content/de/navigation.json";
import ndsNavigationJson from "../../../content/nds/navigation.json";
import fotosJson from "../../../content/fotos.json";
import type { Locale } from "../i18n";
import { withBase } from "../links";
import {
  TODO,
  type EventItem,
  type Foto,
  type Fact,
  type Facts,
  type NewsCategory,
  type NewsItem,
  type Ortsteil,
  type ServiceItem,
  type Station,
} from "./types";

export * from "./types";

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  /** Gesetzt, wenn die Beschriftung nicht in der Seitensprache vorliegt (Rückfall auf Hochdeutsch). */
  lang?: Locale;
}

// Pro Sprache ein Satz Inhalte. Plattdeutsch fällt bis Phase 5 auf Hochdeutsch zurück.
const byLocale = {
  de: {
    news: newsJson.items as NewsItem[],
    events: eventsJson.items as EventItem[],
    services: servicesJson.items as ServiceItem[],
    ortsteile: ortsteileJson.items as Ortsteil[],
    navigation: navigationJson as { main: NavItem[]; legal: NavItem[] },
  },
};

function pick(locale: Locale) {
  return locale in byLocale ? byLocale[locale as keyof typeof byLocale] : byLocale.de;
}

export const facts = factsJson as unknown as Facts;

/** Wert eines Fakts oder null, wenn er noch offen ist. */
export function factValue<T>(fact: Fact<T>): T | null {
  return fact.value === TODO ? null : (fact.value as T);
}

export function isTodo(value: unknown): boolean {
  return typeof value === "string" && value.includes(TODO);
}

type Navigation = { main: NavItem[]; legal: NavItem[] };

/** Navigation mit übersetzten Beschriftungen je href; fehlende bleiben Hochdeutsch und bekommen lang="de". */
function translateNavigation(nav: Navigation, labels: Record<string, string>, fallback: Locale): Navigation {
  const tr = (item: NavItem): NavItem => {
    const label = labels[item.href];
    return {
      ...item,
      ...(label ? { label } : { lang: fallback }),
      ...(item.children ? { children: item.children.map(tr) } : {}),
    };
  };
  return { main: nav.main.map(tr), legal: nav.legal.map(tr) };
}

const ndsNavigation = translateNavigation(byLocale.de.navigation, ndsNavigationJson.labels as Record<string, string>, "de");

export function getNavigation(locale: Locale): Navigation {
  return locale === "nds" ? ndsNavigation : pick(locale).navigation;
}

/** Bereiche der Startseite: der erste ist die Begrüßung, die übrigen stehen als Karten darunter. */
export function getStations(): Station[] {
  return (stationsJson.items as Omit<Station, "number">[]).map((s, i) => ({ ...s, number: i + 1 }) as Station);
}

function byDateDesc(a: NewsItem, b: NewsItem): number {
  // Undatierte Meldungen (TODO) ans Ende.
  if (a.date === TODO) return 1;
  if (b.date === TODO) return -1;
  return b.date.localeCompare(a.date);
}

export function getNews(locale: Locale, category?: NewsCategory): NewsItem[] {
  const items = pick(locale).news;
  return (category ? items.filter((n) => n.category === category) : [...items]).sort(byDateDesc);
}

export function getNewsItem(locale: Locale, slug: string): NewsItem | undefined {
  return pick(locale).news.find((n) => n.slug === slug);
}

/** Veranstaltungen chronologisch. `from` (YYYY-MM-DD) blendet Vergangenes aus. */
export function getEvents(locale: Locale, from?: string): EventItem[] {
  return pick(locale)
    .events.filter((e) => !from || (e.end ?? e.start).slice(0, 10) >= from)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function getEvent(locale: Locale, slug: string): EventItem | undefined {
  return pick(locale).events.find((e) => e.slug === slug);
}

export function getServices(locale: Locale): ServiceItem[] {
  return pick(locale).services;
}

export function getOrtsteile(locale: Locale): Ortsteil[] {
  return pick(locale).ortsteile;
}

export function getOrtsteil(locale: Locale, slug: string): Ortsteil | undefined {
  return pick(locale).ortsteile.find((o) => o.slug === slug);
}

// Öffentliche Vorschau (VORSCHAU=1): nur Fotos mit geklärten Rechten oder einer ausdrücklichen
// Freigabe für die Vorschau (`vorschauFreigabe`); fehlende zeigen Platzhalter.
const VORSCHAU = process.env.VORSCHAU === "1";
const fotos = (fotosJson.items as Foto[])
  .filter((f) => !VORSCHAU || f.rechteGeklaert || !!f.vorschauFreigabe)
  .map((f) => ({ ...f, datei: withBase(f.datei) }));

/** Foto für eine Station, eine Ortsteil-Seite oder einen Seitenabschnitt (höchstens eins je Stelle). */
export function getFoto(where: { station?: string; ortsteil?: string; seite?: string }): Foto | undefined {
  return fotos.find(
    (f) =>
      (where.station && f.station === where.station) ||
      (where.ortsteil && f.ortsteil === where.ortsteil) ||
      (where.seite && f.seite === where.seite),
  );
}

/** Fotos für „Großheide in Bildern“, in der Reihenfolge aus fotos.json. */
export function getGalerie(): Foto[] {
  return fotos.filter((f) => f.galerie).sort((a, b) => a.galerie! - b.galerie!);
}

/** Foto für den Seitenkopf einer Bereichsseite (`seite: "kopf:/pfad/"`). */
export function getKopfFoto(path: string): Foto | undefined {
  return getFoto({ seite: `kopf:${path}` });
}

/** Großes Foto im Startbild der Startseite (`startbild` in fotos.json). */
export function getStartFoto(): Foto | undefined {
  return fotos.find((f) => f.id === fotosJson.startbild);
}

/** Alle Fotos, deren Rechte noch nicht geklärt sind (Prüfliste vor der Veröffentlichung). */
export function getFotosMitOffenenRechten(): Foto[] {
  return fotos.filter((f) => !f.rechteGeklaert);
}

export function getOnlineDienst(id: string) {
  return facts.onlineDienste.find((d) => d.id === id);
}

/** Alle Einrichtungen eines Ortsteils aus facts.json. */
export function getEinrichtungenInOrtsteil(name: string) {
  const e = facts.einrichtungen;
  return {
    kitas: e.kitas.filter((x) => x.ortsteil === name),
    schulen: e.schulen.filter((x) => x.ortsteil === name),
    feuerwehren: e.feuerwehren.filter((x) => x.ortsteil === name),
    wohnmobil: e.wohnmobilstellplaetze.filter((x) => x.ortsteil === name),
    freizeit: e.freizeitanlagen.filter((x) => x.ortsteil === name),
    spielplaetze: (factValue(e.spielplaetze) ?? []).filter((x) => x.ortsteil === name),
    museum: e.museum.ortsteil === name ? [e.museum] : [],
  };
}

export const newsCategories: { id: NewsCategory; slug: string; label: string; plural: string }[] = [
  { id: "nachricht", slug: "nachrichten", label: "Nachricht", plural: "Nachrichten" },
  { id: "bekanntmachung", slug: "bekanntmachungen", label: "Bekanntmachung", plural: "Bekanntmachungen" },
  { id: "ausschreibung", slug: "ausschreibungen", label: "Ausschreibung", plural: "Ausschreibungen" },
  { id: "stellenangebot", slug: "stellenangebote", label: "Stellenangebot", plural: "Stellenangebote" },
];
