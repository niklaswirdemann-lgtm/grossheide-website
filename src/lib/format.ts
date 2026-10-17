import { TODO } from "./content/types";

const dateFmt = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const monthFmt = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "Europe/Berlin" });

/** Kalenderdatum (YYYY-MM-DD) zur Mittagszeit UTC, damit es in Europe/Berlin nie kippt. */
function parseLocal(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value);
}

/** Immer volles Datum mit Jahr, z. B. „Sonntag, 18. Oktober 2026“. */
export function formatDate(iso: string): string {
  if (!isIsoDate(iso)) return TODO;
  return dateFmt.format(parseLocal(iso.slice(0, 10)));
}

export function formatMonth(iso: string): string {
  return monthFmt.format(parseLocal(iso.slice(0, 10)));
}

export function timeOf(iso: string | undefined): string | null {
  if (!iso || !iso.includes("T")) return null;
  return iso.split("T")[1].slice(0, 5);
}

/** „10:00–16:00 Uhr“, „20:00 Uhr“ oder „ganztägig“. */
export function formatTimeRange(start: string, end?: string, allDay?: boolean): string {
  const s = timeOf(start);
  if (allDay || !s) return "ganztägig";
  const e = timeOf(end);
  return e ? `${s}–${e} Uhr` : `${s} Uhr`;
}

/** Datum für das <time datetime>-Attribut. */
export function machineDate(iso: string): string | undefined {
  return isIsoDate(iso) ? iso : undefined;
}
