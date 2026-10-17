/** Unterordner der Website (leer im Wurzelverzeichnis); next/link setzt ihn selbst, alles andere braucht withBase. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(path: string): string {
  return path.startsWith("/") ? `${BASE_PATH}${path}` : path;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

/** "+49 4936 3179-300" → "tel:+4949363179300" */
export function telHref(phone: string): string {
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("0") && !digits.startsWith("00")) digits = `+49${digits.slice(1)}`;
  return `tel:${digits}`;
}
