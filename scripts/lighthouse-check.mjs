// Phase 6: Lighthouse auf den wichtigsten Seiten, Handy (Standard-Drosselung) und Desktop.
// Grenzen: Leistung ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 90.
// SEO ohne „is-crawlable“: Die Entwicklungsfassung ist absichtlich auf noindex gestellt (vor dem Livegang entfernen).
// Ein Aufwärmlauf vorab wird nicht gewertet. Berichte (HTML + JSON) nach lighthouse-reports/.
// Voraussetzung: `npm run build` und ein laufender Server auf LH_BASE; Chrome über CHROME_PATH.
// Aufruf: LH_BASE=http://localhost:3000 CHROME_PATH=/pfad/zu/chrome npm run check:lighthouse
import { mkdirSync, writeFileSync } from "node:fs";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

const BASE = process.env.LH_BASE ?? "http://localhost:3000";
const OUT = "lighthouse-reports";
const PAGES = [
  "/de/",
  "/de/rathaus/",
  "/de/rathaus/dienstleistungen/",
  "/de/leben-lernen/im-notfall/",
  "/de/freizeit-tourismus/",
  "/de/ortsteile/grossheide/",
  "/de/aktuelles/nachrichten/",
  "/de/suche/?q=kita",
  "/nds/",
];
const MIN = { performance: 90, accessibility: 100, "best-practices": 95, seo: 90 };
const LABEL = { performance: "Leistung", accessibility: "Barrierefreiheit", "best-practices": "Best Practices", seo: "SEO" };

mkdirSync(OUT, { recursive: true });
const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"] });

// Erster Lauf nach dem Chrome-Start ist kalt (Messungen: Startseite 61 statt 95–99); er wird verworfen
await lighthouse(BASE + PAGES[0], { port: chrome.port, logLevel: "error", onlyCategories: ["performance"] });

const rows = [];
let failed = 0;
for (const formFactor of ["mobile", "desktop"]) {
  for (const path of PAGES) {
    const config = formFactor === "desktop" ? desktopConfig : undefined;
    const result = await lighthouse(
      BASE + path,
      { port: chrome.port, output: ["html", "json"], logLevel: "error", skipAudits: ["is-crawlable"] },
      config,
    );
    const lhr = result.lhr;
    const name = `${formFactor}-${path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "start"}`;
    writeFileSync(`${OUT}/${name}.html`, result.report[0]);
    writeFileSync(`${OUT}/${name}.json`, result.report[1]);
    const scores = Object.fromEntries(Object.keys(MIN).map((k) => [k, Math.round((lhr.categories[k]?.score ?? 0) * 100)]));
    const bad = Object.entries(MIN).filter(([k, min]) => scores[k] < min);
    const m = lhr.audits;
    const metrics = `LCP ${Math.round(m["largest-contentful-paint"].numericValue)} ms, TBT ${Math.round(m["total-blocking-time"].numericValue)} ms, CLS ${m["cumulative-layout-shift"].numericValue.toFixed(3)}`;
    console.log(
      `${bad.length ? "✗" : "✓"} ${formFactor.padEnd(7)} ${path.padEnd(32)} ${Object.entries(scores)
        .map(([k, v]) => `${LABEL[k]} ${v}`)
        .join(" · ")} – ${metrics}`,
    );
    for (const [k] of bad) {
      const audits = lhr.categories[k].auditRefs
        .filter((r) => r.weight > 0 && (m[r.id].score ?? 1) < 0.9)
        .map((r) => `${r.id} (${m[r.id].displayValue ?? Math.round((m[r.id].score ?? 0) * 100)})`);
      console.log(`    ${LABEL[k]} unter ${MIN[k]}: ${audits.join(", ")}`);
    }
    failed += bad.length ? 1 : 0;
    rows.push({ formFactor, path, ...scores, metrics });
  }
}
await chrome.kill();
writeFileSync(`${OUT}/zusammenfassung.json`, JSON.stringify(rows, null, 2));
console.log(`\n${rows.length - failed}/${rows.length} Läufe innerhalb der Grenzen`);
process.exit(failed ? 1 : 0);
