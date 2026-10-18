// Phase 6: Prüfungen, die axe nicht abdeckt, auf allen Seiten.
// 1. Tastatur (1280 px): erster Tab = „Zum Inhalt springen“ sichtbar; Sprung setzt den Fokus auf <main>;
//    jede Tab-Station hat einen sichtbaren Fokusrahmen, liegt im Bild und ist nicht verdeckt (WCAG 2.4.7, 2.4.11);
//    Reihenfolge folgt dem Quelltext (2.4.3); kein tabindex > 0.
// 2. Reduzierte Bewegung: keine laufenden Animationen, Startseite in der ruhigen Fassung (2.3.3).
// 3. Umbruch: kein Querscrollen bei 320 px und 640 px Breite (= 400 % und 200 % Zoom, 1.4.10, 1.4.4).
// 4. Textabstände: mit den Werten aus WCAG 1.4.12 kein Querscrollen und kein abgeschnittener Text.
// Voraussetzung: `npm run build` und ein laufender Server auf A11Y_BASE.
// Aufruf: A11Y_BASE=http://localhost:3000 npm run check:a11y
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = process.env.A11Y_BASE ?? "http://localhost:3000";

function pages(dir = "out", prefix = "") {
  const res = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "_next") continue;
    if (statSync(p).isDirectory()) res.push(...pages(p, `${prefix}/${name}`));
    else if (name === "index.html") res.push(`${prefix}/`);
  }
  return res;
}
const all = pages()
  .filter((p) => p !== "/" && !p.startsWith("/_not-found") && !p.startsWith("/404"))
  .sort();

const results = [];
function check(name, problems) {
  const ok = problems.length === 0;
  results.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` – ${problems.length} Problem(e)`}`);
  for (const p of problems.slice(0, 8)) console.log(`    ${p}`);
}

const browser = await chromium.launch();

// 1. Tastatur
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  const problems = { skip: [], focus: [], order: [], tabindex: [] };
  for (const path of all) {
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.waitForTimeout(150);
    const positive = await page.$$eval("[tabindex]", (els) => els.filter((e) => e.tabIndex > 0).length);
    if (positive) problems.tabindex.push(`${path}: ${positive}×`);

    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => {
      const el = document.activeElement;
      const r = el.getBoundingClientRect();
      return { text: el.textContent?.trim(), visible: r.width > 20 && r.height > 20 && r.top >= 0 };
    });
    if (first.text !== "Zum Inhalt springen" && first.text !== "Na de Inholt springen")
      problems.skip.push(`${path}: erster Tab auf „${first.text}“`);
    else if (!first.visible) problems.skip.push(`${path}: Sprunglink beim Fokus nicht sichtbar`);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(50);
    if ((await page.evaluate(() => document.activeElement?.id)) !== "inhalt")
      problems.skip.push(`${path}: Sprung landet nicht in <main>`);

    // Von vorn durch die ganze Seite
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.waitForTimeout(150);
    let prev = null;
    const seen = new Set();
    for (let i = 0; i < 400; i++) {
      await page.keyboard.press("Tab");
      const r = await page.evaluate(async (prevPath) => {
        const el = document.activeElement;
        if (!el || el === document.body) return { end: true };
        // Fokus scrollt (weich) zum Element: warten, bis die Seite still steht
        const frame = () => new Promise((res) => requestAnimationFrame(res));
        let last = -1;
        for (let still = 0, n = 0; still < 3 && n < 90; n++) {
          await frame();
          still = scrollY === last ? still + 1 : 0;
          last = scrollY;
        }
        const pathOf = (n) => {
          const parts = [];
          for (let x = n; x && x !== document.documentElement; x = x.parentElement)
            parts.unshift([...x.parentElement.children].indexOf(x));
          return parts.join(".");
        };
        const id = pathOf(el);
        const s = getComputedStyle(el);
        const ring = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2) || s.boxShadow !== "none";
        const box = el.getBoundingClientRect();
        const inView = box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
        const cx = Math.min(Math.max(box.left + Math.min(box.width, 40) / 2, 1), innerWidth - 1);
        const cy = Math.min(Math.max(box.top + Math.min(box.height, 40) / 2, 1), innerHeight - 1);
        const hit = document.elementFromPoint(cx, cy);
        const covered =
          inView && hit && !el.contains(hit) && !hit.contains(el)
            ? hit.closest("[data-chat-launcher], header")
              ? "Chat-Knopf/Kopf"
              : hit.tagName
            : null;
        let before = false;
        if (prevPath) {
          const prevEl = document.querySelector(`[data-a11y-prev]`);
          before = prevEl ? !!(prevEl.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) : false;
          prevEl?.removeAttribute("data-a11y-prev");
        }
        el.setAttribute("data-a11y-prev", "");
        const label = `${el.tagName.toLowerCase()} „${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}“`;
        return { id, ring, inView, covered, before, label };
      }, prev);
      if (r.end || seen.has(r.id)) break;
      seen.add(r.id);
      if (!r.ring) problems.focus.push(`${path}: kein Fokusrahmen an ${r.label}`);
      else if (!r.inView) problems.focus.push(`${path}: ${r.label} beim Fokus nicht im Bild`);
      else if (r.covered) problems.focus.push(`${path}: ${r.label} verdeckt von ${r.covered}`);
      if (r.before) problems.order.push(`${path}: ${r.label} springt im Quelltext zurück`);
      prev = r.id;
    }
  }
  check(`Tastatur: erster Tab „Zum Inhalt springen“, Sprung in <main> (${all.length} Seiten)`, problems.skip);
  check("Tastatur: Fokusrahmen sichtbar, im Bild, nicht verdeckt", problems.focus);
  check("Tastatur: Reihenfolge folgt dem Quelltext", problems.order);
  check("Tastatur: kein tabindex > 0", problems.tabindex);
  await ctx.close();
}

// 2. Reduzierte Bewegung
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const problems = [];
  for (const path of all) {
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => ({
      running: document
        .getAnimations()
        .filter((a) => a.playState === "running" && (a.effect?.getComputedTiming().duration ?? 0) > 20)
        .map((a) => a.animationName ?? a.constructor.name),
      mode: document.querySelector("[data-journey-mode]")?.getAttribute("data-journey-mode") ?? null,
      smooth: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    if (r.running.length) problems.push(`${path}: laufende Animation ${r.running.join(", ")}`);
    if (r.mode && r.mode !== "static") problems.push(`${path}: Startseite im Modus ${r.mode}`);
    if (r.smooth === "smooth") problems.push(`${path}: weiches Scrollen trotz reduzierter Bewegung`);
  }
  check("Reduzierte Bewegung: keine Animationen, ruhige Startseite", problems);
  await ctx.close();
}

// 3. Umbruch bei 320 px und 640 px
for (const width of [320, 640]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  const page = await ctx.newPage();
  const problems = [];
  for (const path of all) {
    await page.goto(BASE + path, { waitUntil: "load" });
    const r = await page.evaluate(() => {
      const wide = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const b = el.getBoundingClientRect();
          return b.width > 0 && b.right > innerWidth + 1 && !el.closest('[aria-hidden="true"], .sr-only, [data-chat-dialog]');
        })
        .slice(0, 2)
        .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join(".")}`);
      return { scroll: document.documentElement.scrollWidth > innerWidth, wide };
    });
    if (r.scroll) problems.push(`${path}: Querscrollen (${r.wide.join(", ")})`);
  }
  check(`Umbruch bei ${width} px: kein Querscrollen`, problems);
  await ctx.close();
}

// 4. Textabstände nach WCAG 1.4.12
const SPACING = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
p { margin-bottom: 2em !important; }`;
for (const [w, h, label] of [
  [1280, 900, "Desktop"],
  [390, 844, "Handy"],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const problems = [];
  for (const path of all) {
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.addStyleTag({ content: SPACING });
    await page.waitForTimeout(50);
    const r = await page.evaluate(() => {
      const clipped = [];
      for (const el of document.querySelectorAll("body *")) {
        if (el.closest('[aria-hidden="true"], .sr-only, [data-chat-dialog], svg')) continue;
        const s = getComputedStyle(el);
        if (!/(hidden|clip)/.test(s.overflowX + s.overflowY)) continue;
        if (!el.textContent?.trim()) continue;
        if (el.scrollHeight <= el.clientHeight + 2 && el.scrollWidth <= el.clientWidth + 2) continue;
        // Überlauf allein reicht nicht (z. B. die Lichtebene ::before der dunklen Bühne ist größer):
        // abgeschnitten ist ein Text erst, wenn er wirklich über den Rand des Behälters ragt.
        const box = el.getBoundingClientRect();
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        for (let t = walker.nextNode(); t; t = walker.nextNode()) {
          if (!t.textContent.trim() || t.parentElement.closest('[aria-hidden="true"], .sr-only')) continue;
          range.selectNodeContents(t);
          const r = range.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          if (r.left < box.left - 2 || r.right > box.right + 2 || r.top < box.top - 2 || r.bottom > box.bottom + 2) {
            clipped.push(`${el.tagName.toLowerCase()} „${t.textContent.trim().slice(0, 30)}“`);
            break;
          }
        }
      }
      return { scroll: document.documentElement.scrollWidth > innerWidth, clipped: clipped.slice(0, 3) };
    });
    if (r.scroll) problems.push(`${path}: Querscrollen`);
    if (r.clipped.length) problems.push(`${path}: abgeschnitten ${r.clipped.join(", ")}`);
  }
  check(`Textabstände (1.4.12, ${label}): nichts abgeschnitten, kein Querscrollen`, problems);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden`);
process.exit(failed.length ? 1 : 0);
