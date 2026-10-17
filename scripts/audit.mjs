// Prüft den statischen Export: axe-core (WCAG 2.1 A/AA) auf allen Seiten und
// interne Links auf Existenz. Voraussetzung: `npm run build` und `npm start`
// (Server auf AUDIT_BASE, Standard http://localhost:3000).
// Aufruf: AUDIT_BASE=http://localhost:3000 npm run audit
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";
const OUT = "out";
const axeSource = readFileSync("node_modules/axe-core/axe.min.js", "utf8");

function pages(dir = OUT, prefix = "") {
  const res = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "_next") continue;
    if (statSync(p).isDirectory()) res.push(...pages(p, `${prefix}/${name}`));
    else if (name === "index.html") res.push(`${prefix}/`);
  }
  return res;
}

// Bei einem Build mit BASE_PATH (Vorschau im Unterordner) beginnen interne Links mit diesem Pfad
const PREFIX = process.env.BASE_PATH ?? "";

function internalTargetExists(href) {
  const path = decodeURI(href.split("#")[0].split("?")[0]).replace(PREFIX, "");
  if (!path || path === "/") return true;
  const file = path.endsWith("/") ? join(OUT, path, "index.html") : join(OUT, path);
  return existsSync(file);
}

const browser = await chromium.launch();
const page = await browser.newPage();
let violations = 0;
let broken = 0;
const list = pages().filter((p) => p !== "/" && !p.startsWith("/_not-found") && !p.startsWith("/404"));

for (const path of list) {
  await page.goto(BASE + path, { waitUntil: "load" });
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () =>
    axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } }),
  );
  const hrefs = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")));
  const missing = [...new Set(hrefs)].filter((h) => !internalTargetExists(h));
  const v = result.violations;
  violations += v.length;
  broken += missing.length;
  const status = v.length || missing.length ? "✗" : "✓";
  console.log(`${status} ${path}`);
  for (const x of v) console.log(`    axe ${x.impact}: ${x.id} – ${x.help} (${x.nodes.length}×) ${x.nodes[0]?.target}`);
  for (const m of missing) console.log(`    Link-Ziel fehlt: ${m}`);
}
await browser.close();
console.log(`\n${list.length} Seiten, ${violations} axe-Verstöße, ${broken} defekte interne Links`);
process.exit(violations || broken ? 1 : 0);
