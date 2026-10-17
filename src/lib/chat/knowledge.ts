import { facts, factValue } from "../content";
import { contentLocale, type Locale } from "../i18n";
import { telHref } from "../links";
import { buildSearchIndex } from "../search";
import type { ChatKnowledge } from "./types";

/** Wissen der Probe-Version: nur, was auch auf der Website steht (Suchindex und facts.json). */
export function buildChatKnowledge(locale: Locale): ChatKnowledge {
  const r = facts.rathaus;
  const strasse = factValue(r.strasse);
  const plz = factValue(r.plz);
  const ort = factValue(r.ort);
  const telefon = factValue(r.telefon);
  return {
    entries: buildSearchIndex(contentLocale(locale)),
    telefon,
    email: factValue(r.email),
    adresse: strasse && plz && ort ? `${factValue(r.bezeichnung) ?? ""}, ${strasse}, ${plz} ${ort}`.replace(/^, /, "") : null,
    zeiten: (factValue(r.oeffnungszeiten) ?? []).map((d) => ({
      label: d.tag,
      value: d.zeiten.map((z) => (/\d{2}:\d{2}/.test(z) ? `${z} Uhr` : z)).join(" und "),
    })),
    zeitenHinweis: factValue(r.oeffnungszeitenHinweis),
    notrufe: (factValue(facts.notrufe) ?? []).map((n) => ({ label: n.name, value: n.nummer, href: telHref(n.nummer) })),
  };
}
