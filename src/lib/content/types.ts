/**
 * Typen für alle Inhalte unter /content.
 *
 * Die Struktur ist bewusst CMS-nah gehalten (flache Collections mit `slug`,
 * Referenzen über IDs/Namen), damit später Directus oder Strapi dieselben
 * Felder liefern kann. Nur die Loader in ./index.ts müssen dann getauscht werden.
 */

export const TODO = "TODO: prüfen" as const;
export type Todo = typeof TODO;

/** Ein belegter Fakt mit Quelle – oder ein offener Punkt ohne Quelle. */
export type Fact<T> =
  | { value: T; source: string; note?: string }
  | { value: Todo; source: null; note?: string };

/** Ein Objekt mit eigener Quelle. Einzelne Felder dürfen TODO sein. */
export type Sourced<T> = T & { source: string; note?: string };

export interface OpeningDay {
  tag: string;
  zeiten: string[];
}

export interface Ansprechpartner {
  name: string;
  aufgabe: string;
  telefon: string;
  email: string;
}

export interface OnlineDienst {
  id: string;
  name: string;
  url: string;
  extern: boolean;
  anbieter: string;
}

export interface Einrichtung {
  id: string;
  name: string;
  art?: string;
  strasse?: string;
  ortsteil: string;
}

export interface Kontaktstelle {
  name: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  ortsteil?: string;
  telefon?: string;
  email?: string;
  oeffnungszeiten?: OpeningDay[];
  saison?: string;
}

export interface Wohnmobilstellplatz extends Einrichtung {
  stellplaetze: number;
  merkmale: string[];
  gebuehren: string[];
}

export interface Radroute {
  id: string;
  name: string;
  laenge: string;
  url: string;
}

export interface Notruf {
  name: string;
  nummer: string;
}

export interface Facts {
  retrievedAt: string;
  gemeinde: {
    name: Fact<string>;
    landkreis: Fact<string>;
    bundesland: Fact<string>;
    flaecheKm2: Fact<number>;
    einwohner: Fact<number>;
    buergermeister: Fact<string>;
    ustId: Fact<string>;
    wappenBeschreibung: Fact<string>;
    leaderRegion: Fact<string>;
  };
  rathaus: {
    bezeichnung: Fact<string>;
    strasse: Fact<string>;
    plz: Fact<string>;
    ort: Fact<string>;
    telefon: Fact<string>;
    fax: Fact<string>;
    email: Fact<string>;
    oeffnungszeiten: Fact<OpeningDay[]>;
    oeffnungszeitenHinweis: Fact<string>;
    bankverbindung: Fact<string>;
  };
  ortsteile: Fact<string[]>;
  ansprechpartner: Sourced<Ansprechpartner>[];
  standesamt: {
    leistungen: Fact<string[]>;
    trauorte: Fact<string[]>;
  };
  onlineDienste: Sourced<OnlineDienst>[];
  social: Sourced<{ name: string; url: string }>[];
  einrichtungen: {
    kitas: Sourced<Einrichtung>[];
    kitasHinweis: Fact<string>;
    schulen: Sourced<Einrichtung>[];
    jugendzentrum: Sourced<Kontaktstelle>;
    seniorenbeirat: Sourced<{ name: string; kontakt: string }>;
    museum: Sourced<Kontaktstelle>;
    feuerwehren: Sourced<Einrichtung>[];
    wohnmobilstellplaetze: Sourced<Wohnmobilstellplatz>[];
    touristInfo: Sourced<Kontaktstelle>;
    freizeitanlagen: Sourced<Einrichtung>[];
    spielplaetze: Fact<{ name: string; ortsteil: string }[]>;
    bauhof: Sourced<Kontaktstelle>;
  };
  radrouten: Sourced<Radroute>[];
  notrufe: Fact<Notruf[]>;
  datenschutz: {
    beauftragter: Fact<string>;
    beauftragterEmail: Fact<string>;
    aufsichtsbehoerde: Fact<string>;
  };
  barrierefreiheit: {
    schlichtungsstelleTelefon: Fact<string>;
    schlichtungsstelleEmail: Fact<string>;
    schlichtungsstelleName: Fact<string>;
    rechtsgrundlage: Fact<string>;
  };
}

export type NewsCategory = "nachricht" | "bekanntmachung" | "ausschreibung" | "stellenangebot";

export interface NewsItem {
  slug: string;
  category: NewsCategory;
  /** ISO-Datum (YYYY-MM-DD) oder TODO */
  date: string;
  title: string;
  summary: string;
  body: string[];
  source: string;
}

export interface EventItem {
  slug: string;
  title: string;
  /** ISO, entweder YYYY-MM-DD (ganztägig) oder YYYY-MM-DDTHH:MM */
  start: string;
  end?: string;
  allDay?: boolean;
  location: string;
  organizer: string;
  ortsteil?: string;
  source: string;
}

export interface ServiceItem {
  slug: string;
  name: string;
  bereich: string;
  terminBuchbar: boolean;
  onlineDienst?: string;
  source: string;
}

export interface Ortsteil {
  slug: string;
  name: string;
  intro: string;
  mapPosition: { x: number; y: number } | null;
}

export interface StationLink {
  label: string;
  href: string;
  /** Verweis auf facts.onlineDienste[].id – dann extern gekennzeichnet. */
  onlineDienst?: string;
}

/** Eine Station der Foto-Reise (content/stations.json). */
export interface Station {
  id: string;
  /** 1-basiert, aus der Reihenfolge abgeleitet */
  number: number;
  name: string;
  titel: string;
  kurztext: string;
  /** Bereichsseite ohne Sprachpräfix */
  href: string;
  links: StationLink[];
  /** Farbe der Bühne, solange kein Foto da ist */
  farbe: string;
  /** [Start, Ende] im Scrollweg 0–1 */
  scrollBereich: [number, number];
}

/** Ein Keyframe der Tageszeit (content/lighting.json). */
export interface LightKeyframe {
  /** Scroll-Fortschritt 0–1 */
  p: number;
  name: string;
  /** Lichtfarbe über dem Bühnenhintergrund */
  farbe: string;
  /** Stärke 0–1 */
  staerke: number;
}

/** Ein Foto (content/fotos.json). Erscheint nur mit Urhebernennung; ungeklärte Rechte werden sichtbar markiert. */
export interface Foto {
  id: string;
  /** Pfad unter /public, z. B. /fotos/rathaus.webp */
  datei: string;
  breite: number;
  hoehe: number;
  /** Alternativtext: beschreibt, was zu sehen ist */
  alt: string;
  /** Für „Foto: …“, oder TODO */
  urheber: string;
  /** Erst true, wenn Urheber und Nutzungsrecht geklärt sind */
  rechteGeklaert: boolean;
  herkunft: string;
  /** Verwendung: Station (Panel), Ortsteil-Seite oder Abschnitt einer Seite */
  station?: string;
  ortsteil?: string;
  seite?: string;
}
