import { facts, getEvents, getNavigation, getNews, getOrtsteile, getServices } from "./content";
import { formatDate } from "./format";
import type { Locale } from "./i18n";

export interface SearchEntry {
  title: string;
  href: string;
  type: string;
  text: string;
  /** Zusätzliche Suchbegriffe (Synonyme), werden nicht angezeigt. */
  keywords?: string;
}

/** Suchindex, beim Build erzeugt und als Prop an die Suchseite übergeben. */
export function buildSearchIndex(locale: Locale): SearchEntry[] {
  const nav = getNavigation(locale);
  const pages: SearchEntry[] = nav.main.flatMap((m) => [
    { title: m.label, href: m.href, type: "Seite", text: "" },
    ...(m.children ?? []).map((c) => ({ title: c.label, href: c.href, type: "Seite", text: m.label })),
  ]);
  pages.push(
    ...nav.legal.map((l) => ({ title: l.label, href: l.href, type: "Seite", text: "" })),
    { title: "Im Notfall", href: "/leben-lernen/im-notfall/", type: "Seite", text: "Notruf Polizei Feuerwehr Arzt", keywords: "112 110 116117 Bereitschaftsdienst Störung Strom Gas Wasser" },
  );

  const services = getServices(locale).map((s) => ({
    title: s.name,
    href: `/rathaus/dienstleistungen/#${s.slug}`,
    type: "Dienstleistung",
    text: s.bereich,
    keywords: s.name.includes("Personalausweis") || s.name.includes("Reisepass") ? "Ausweis Pass Bürgerbüro" : s.name.includes("Wohnsitz") ? "Umzug Ummeldung Meldeamt" : "",
  }));

  const dienste = facts.onlineDienste.map((d) => ({ title: d.name, href: d.url, type: "Online-Dienst", text: d.anbieter }));

  const news = getNews(locale).map((n) => ({
    title: n.title,
    href: `/aktuelles/meldung/${n.slug}/`,
    type: "Meldung",
    text: n.summary,
  }));

  const events = getEvents(locale).map((e) => ({
    title: e.title,
    href: `/aktuelles/veranstaltungen/${e.slug}/`,
    type: "Veranstaltung",
    text: `${formatDate(e.start)} · ${e.location}`,
  }));

  const ortsteile = getOrtsteile(locale).map((o) => ({ title: o.name, href: `/ortsteile/${o.slug}/`, type: "Ortsteil", text: "" }));

  const e = facts.einrichtungen;
  const einrichtungen: SearchEntry[] = [
    ...e.kitas.map((k) => ({ title: k.name, href: "/leben-lernen/#kitas", type: "Einrichtung", text: `${k.art}, ${k.ortsteil}`, keywords: "Kita Kindergarten Krippe Betreuung" })),
    ...e.schulen.map((s) => ({ title: s.name, href: "/leben-lernen/#schulen", type: "Einrichtung", text: `${s.art}, ${s.ortsteil}`, keywords: "Schule" })),
    ...e.feuerwehren.map((f) => ({ title: f.name, href: "/leben-lernen/#feuerwehren", type: "Einrichtung", text: f.ortsteil })),
    ...e.wohnmobilstellplaetze.map((w) => ({ title: w.name, href: "/freizeit-tourismus/#wohnmobil", type: "Einrichtung", text: w.ortsteil, keywords: "Wohnmobil Camping Stellplatz Reisemobil" })),
    { title: e.museum.name, href: "/freizeit-tourismus/#museum", type: "Einrichtung", text: "Berumerfehn", keywords: "Museum Moor Torf Wald" },
    { title: e.jugendzentrum.name, href: "/leben-lernen/#jugend", type: "Einrichtung", text: "Poppenweg", keywords: "Jugend JUZ" },
    { title: e.touristInfo.name, href: "/freizeit-tourismus/#tourist-info", type: "Einrichtung", text: "", keywords: "Urlaub Tourismus Ferien" },
  ];

  return [...services, ...dienste, ...pages, ...einrichtungen, ...ortsteile, ...news, ...events];
}
