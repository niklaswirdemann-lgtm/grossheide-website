// Phase 4: Handy, ruhige Fassung ohne JavaScript und Ladezeit.
// 1. Alle Seiten bei 390 px: kein horizontales Scrollen, Bedienelemente mindestens
//    24 × 24 px (WCAG 2.2, 2.5.8; Links im Fließtext ausgenommen), Eingabefelder mit
//    mindestens 16 px Schrift (sonst zoomt iOS beim Antippen).
// 2. Ohne JavaScript: Startseite zeigt Begrüßung, alle Bereiche als Karten, Fotos und die Suche; alle
//    Hauptbereiche sind auch ohne aufklappbares Menü als Links erreichbar.
// 3. Ladezeit mit gedrosseltem Handy (CPU 4× langsamer, etwa 4G: 150 ms, 1,6 Mbit/s):
//    LCP < 2,5 s, CLS < 0,1, Blockierzeit (TBT) < 500 ms. Die Blockierzeit kommt hier fast ganz
//    vom Start von React und Next (Profil: Framework-Code, nicht eigener Code) und schwankt im
//    Container stark; echte Werte auf Geräten misst Phase 6 mit Lighthouse.
// Voraussetzung: `npm run build` und ein laufender Server auf MOBILE_BASE.
// Aufruf: MOBILE_BASE=http://localhost:3000 npm run check:mobile
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = process.env.MOBILE_BASE ?? "http://localhost:3000";
const stations = JSON.parse(readFileSync("content/stations.json", "utf8")).items;
const nav = JSON.parse(readFileSync("content/de/navigation.json", "utf8"));

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
const list = pages().filter((p) => p !== "/" && !p.startsWith("/_not-found") && !p.startsWith("/404"));

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` – ${detail}` : ""}`);
}

const browser = await chromium.launch();

// 1. Alle Seiten bei 390 px
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const problems = { scroll: [], targets: [], inputs: [] };
  for (const path of list) {
    await page.goto(BASE + path, { waitUntil: "load" });
    const r = await page.evaluate(() => {
      const scroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
      const small = [];
      for (const el of document.querySelectorAll(
        'a[href], button, input:not([type="hidden"]), select, textarea, [role="switch"]',
      )) {
        const box = el.getBoundingClientRect();
        if (!box.width || !box.height) continue; // nicht sichtbar
        if (el.closest('[aria-hidden="true"], .sr-only')) continue;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden") continue;
        // Ausnahme der Norm: Links im Fließtext
        const inline =
          style.display === "inline" &&
          el.parentElement &&
          /\S/.test((el.parentElement.textContent ?? "").replace(el.textContent ?? "", ""));
        if (inline) continue;
        if (box.width < 24 || box.height < 24)
          small.push(
            `${el.tagName.toLowerCase()} „${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}“ ${Math.round(box.width)}×${Math.round(box.height)}`,
          );
      }
      const inputs = [...document.querySelectorAll("input:not([type=hidden]), select, textarea")]
        .filter((el) => el.getBoundingClientRect().width > 0 && parseFloat(getComputedStyle(el).fontSize) < 16)
        .map((el) => el.name || el.id);
      return { scroll, small, inputs };
    });
    if (r.scroll) problems.scroll.push(path);
    if (r.small.length) problems.targets.push(`${path}: ${r.small.slice(0, 3).join(", ")}`);
    if (r.inputs.length) problems.inputs.push(`${path}: ${r.inputs.join(", ")}`);
  }
  check(
    `390 px: kein horizontales Scrollen (${list.length} Seiten)`,
    problems.scroll.length === 0,
    problems.scroll.slice(0, 5).join(" "),
  );
  check("390 px: Bedienelemente mindestens 24 × 24 px", problems.targets.length === 0, problems.targets.slice(0, 5).join(" | "));
  check(
    "390 px: Eingabefelder mit mindestens 16 px Schrift",
    problems.inputs.length === 0,
    problems.inputs.slice(0, 5).join(" | "),
  );
  await ctx.close();
}

// 2. Ohne JavaScript
for (const [w, h, label] of [
  [390, 844, "Handy"],
  [1440, 900, "Desktop"],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/de/`, { waitUntil: "load" });
  const r = await page.evaluate(() => ({
    mode: document.querySelector("[data-journey-mode]")?.getAttribute("data-journey-mode"),
    sections: document.querySelectorAll("section[data-station]").length,
    karten: document.querySelectorAll('section[aria-labelledby="bereiche"] h3').length,
    h1: document.querySelectorAll("h1").length,
    heroImg: document.querySelector('[data-journey-mode="static"] img')?.complete ?? false,
    fotos: document.querySelectorAll('section[aria-labelledby="bereiche"] img').length,
    search: !!document.querySelector('form[role="search"] input'),
    links: [...document.querySelectorAll("a[href]")]
      .filter((a) => a.getBoundingClientRect().width > 0)
      .map((a) => a.getAttribute("href")),
  }));
  check(
    `Ohne JavaScript (${label}): kompakte Startseite mit Begrüßung, ${stations.length - 1} Bereichskarten, einer h1 und Suche`,
    r.mode === "static" && r.sections === 1 && r.karten === stations.length - 1 && r.h1 === 1 && r.search,
    JSON.stringify({ mode: r.mode, sections: r.sections, karten: r.karten, h1: r.h1 }),
  );
  check(`Ohne JavaScript (${label}): Startbild und Fotos der Bereiche geladen`, r.heroImg && r.fotos > 0, `${r.fotos} Fotos`);
  const missing = nav.main.map((i) => `/de${i.href}`).filter((href) => !r.links.includes(href));
  check(
    `Ohne JavaScript (${label}): alle Hauptbereiche als sichtbare Links erreichbar`,
    missing.length === 0,
    missing.join(", "),
  );
  await ctx.close();
}

// 3. Ladezeit mit gedrosseltem Handy
const measured = [];
// Drei Durchläufe je Seite, gewertet wird der Median (die Werte schwanken im Container stark)
async function measure(path) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    window.__gh = { lcp: 0, cls: 0, tbt: 0 };
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__gh.lcp = e.startTime))).observe({
      type: "largest-contentful-paint",
      buffered: true,
    });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__gh.cls += e.value))).observe({
      type: "layout-shift",
      buffered: true,
    });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__gh.tbt += Math.max(0, e.duration - 50)))).observe({
      type: "longtask",
      buffered: true,
    });
  });
  await page.goto(BASE + path, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const m = await page.evaluate(() => window.__gh);
  const bytes = await page.evaluate(
    () =>
      performance.getEntriesByType("resource").reduce((s, e) => s + (e.transferSize || 0), 0) +
      (performance.getEntriesByType("navigation")[0]?.transferSize ?? 0),
  );
  await ctx.close();
  return { lcp: m.lcp, cls: m.cls, tbt: m.tbt, kb: bytes / 1024 };
}
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
for (const path of ["/de/", "/de/rathaus/", "/de/freizeit-tourismus/", "/de/ortsteile/grossheide/"]) {
  const runs = [];
  for (let k = 0; k < 3; k++) runs.push(await measure(path));
  const pick = (key) => median(runs.map((r) => r[key]));
  measured.push({
    path,
    lcp: Math.round(pick("lcp")),
    cls: Number(pick("cls").toFixed(3)),
    tbt: Math.round(pick("tbt")),
    kb: Math.round(pick("kb")),
  });
}
for (const m of measured) {
  check(
    `Ladezeit ${m.path}: LCP < 2,5 s, CLS < 0,1, TBT < 500 ms`,
    m.lcp < 2500 && m.cls < 0.1 && m.tbt < 500,
    `LCP ${m.lcp} ms, CLS ${m.cls}, TBT ${m.tbt} ms, ${m.kb} KB übertragen`,
  );
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden`);
process.exit(failed.length ? 1 : 0);
