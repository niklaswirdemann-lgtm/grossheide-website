// Prüft die Foto-Reise der Startseite im Browser (Playwright/Chromium):
// Fahrt vor und zurück, Panels und Fotos je Station, Fortschrittsleiste, Skip,
// Schalter „Bewegte Reise“ mit Speicherung, reduzierte Bewegung, Tastatur
// und 390 px Breite. Screenshots landen in JOURNEY_SHOTS.
//
// Voraussetzung: `npm run build` und ein laufender Server auf JOURNEY_BASE.
//
// Aufruf: JOURNEY_BASE=http://localhost:3000 node scripts/journey-check.mjs
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.JOURNEY_BASE ?? "http://localhost:3000";
const SHOTS = process.env.JOURNEY_SHOTS ?? "journey-shots";
const stations = JSON.parse(readFileSync("content/stations.json", "utf8")).items;
const fotos = JSON.parse(readFileSync("content/fotos.json", "utf8")).items;
const fotosJson = JSON.parse(readFileSync("content/fotos.json", "utf8"));
// Station 1 zeigt die Foto-Collage mit dem Startbild, die anderen ihr eigenes Foto rund gerahmt
const fotoFor = (id) => (id === stations[0].id ? fotos.find((f) => f.id === fotosJson.startbild) : fotos.find((f) => f.station === id));
const center = (i) => (stations[i].scrollBereich[0] + stations[i].scrollBereich[1]) / 2;
mkdirSync(SHOTS, { recursive: true });

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` – ${detail}` : ""}`);
}

const browser = await chromium.launch();

async function open(ctxOptions = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...ctxOptions });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${BASE}/de/`, { waitUntil: "networkidle" });
  return { ctx, page, errors };
}

const mode = (page) => page.locator("[data-journey-mode]").first().getAttribute("data-journey-mode");
async function waitMode(page, want, timeout = 15000) {
  await page.waitForFunction((w) => document.querySelector("[data-journey-mode]")?.getAttribute("data-journey-mode") === w, want, { timeout });
}
// Foto auf der Bühne (bei Station 1 die Collage) mit Urhebernennung: sichtbar und im Bild?
const cardState = (page, i) =>
  page.evaluate((i) => {
    const card = document.querySelector(`[data-stage-card="${i}"]`);
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return {
      opacity: Number(getComputedStyle(card).opacity),
      inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      caption: card.querySelector("figcaption")?.textContent ?? card.textContent,
      loaded: [...card.querySelectorAll("img")].every((im) => im.complete && im.naturalWidth > 0),
    };
  }, i);
const visiblePanels = (page) =>
  page.$$eval("[data-panel-index]", (els) => els.filter((e) => Number(getComputedStyle(e).opacity) > 0.5).map((e) => Number(e.dataset.panelIndex)));
const activeDot = (page) =>
  page.$$eval('nav[aria-label="Stationen der Reise"] a', (as) => as.findIndex((a) => a.getAttribute("aria-current") === "step"));
async function settle(page, ms = 2600) {
  await page.waitForTimeout(ms);
}
// Wartet, bis Station i aktiv und ihr Panel sichtbar ist (auf den Zustand, nicht auf eine feste Zeit).
async function waitStation(page, i, timeout = 15000) {
  await page
    .waitForFunction(
      (want) => {
        const dots = [...document.querySelectorAll('nav[aria-label="Stationen der Reise"] a')];
        const panel = document.querySelector(`[data-panel-index="${want}"]`);
        return dots.findIndex((a) => a.getAttribute("aria-current") === "step") === want && !!panel && Number(getComputedStyle(panel).opacity) > 0.5;
      },
      i,
      { timeout },
    )
    .catch(() => {});
  await settle(page, 600);
}
const noHScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

// 1. Desktop: Fahrt vorwärts über die Fortschrittsleiste, Panels, Fotos, Screenshots
{
  const { ctx, page, errors } = await open();
  await waitMode(page, "reise");
  check("Desktop: Foto-Reise startet", true);
  check("Keine 3D-Szene mehr (kein Canvas)", (await page.locator("canvas").count()) === 0);
  const stageHidden = await page.evaluate(() => document.querySelector("[data-stage-card]")?.closest('[aria-hidden="true"]') !== null);
  const hero = await page.evaluate(() => {
    const img = document.querySelector('[data-journey-mode="reise"] [aria-hidden="true"] .gh-collage img');
    const r = img?.getBoundingClientRect();
    return img ? { src: img.getAttribute("src"), big: r.width >= 300 && getComputedStyle(img).filter === "none" } : null;
  });
  const start = fotos.find((f) => f.id === fotosJson.startbild);
  check("Startseite zeigt das Startbild scharf und groß in der Collage", !!hero && hero.src === start.datei && hero.big, JSON.stringify(hero));
  check("Bühne ist für Screenreader ausgeblendet (Inhalt steht in den Panels)", stageHidden);
  const skipBox = await page.locator('[data-journey-mode="reise"]').getByRole("link", { name: /Direkt zur Website/ }).boundingBox();
  check("Skip-Button ist direkt nach dem Laden im Bild", !!skipBox && skipBox.y + skipBox.height <= 900, skipBox ? `y ${Math.round(skipBox.y)}` : "fehlt");
  for (let i = 0; i < stations.length; i++) {
    await page.locator('nav[aria-label="Stationen der Reise"] a').nth(i).click();
    await waitStation(page, i);
    await settle(page, 1200);
    const vis = await visiblePanels(page);
    const dot = await activeDot(page);
    check(`Station ${i + 1} (${stations[i].id}): Panel sichtbar, Punkt aktiv`, vis.length === 1 && vis[0] === i && dot === i, `sichtbar ${JSON.stringify(vis)}, Punkt ${dot}`);
    const card = await cardState(page, i);
    const foto = fotoFor(stations[i].id);
    const captionOk = foto ? /Fotos?:/.test(card?.caption ?? "") && (foto.rechteGeklaert || card.caption.includes("Bildrechte prüfen")) : card?.caption.includes("Foto ergänzen");
    check(
      `Station ${i + 1}: ${foto ? "Foto" : "Hinweis „Foto ergänzen“"} im Bild${foto ? " mit Urheber und Rechte-Hinweis" : ""}`,
      !!card && card.opacity > 0.95 && card.inView && card.loaded && captionOk,
      JSON.stringify(card && { ...card, caption: card.caption.slice(0, 60) }),
    );
    await page.screenshot({ path: `${SHOTS}/desktop-${i + 1}-${stations[i].id}.png` });
  }
  const panelFoto = await page.evaluate(() => {
    const f = document.querySelector('[data-journey-mode="reise"] .gh-panel-foto');
    const img = f?.querySelector("img");
    return f ? { w: f.getBoundingClientRect().width, alt: img?.alt ?? "" } : null;
  });
  check("Panel-Fotos: unsichtbar, aber mit Alt-Text für Screenreader", !!panelFoto && panelFoto.w <= 1 && panelFoto.alt.length > 10, JSON.stringify(panelFoto));

  // Rückwärts mit dem Mausrad (über Lenis)
  const seen = [];
  for (let k = 0; k < 60; k++) {
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(140);
    const d = await activeDot(page);
    if (seen.at(-1) !== d) seen.push(d);
  }
  await settle(page, 1500);
  const backOk = seen.join(",") === [...Array(stations.length).keys()].reverse().join(",") || (seen[0] === stations.length - 1 && seen.at(-1) === 0 && seen.every((v, j) => j === 0 || v < seen[j - 1]));
  check("Rückwärts scrollen durchläuft die Stationen absteigend", backOk, `Reihenfolge ${seen.join(",")}`);
  check("Nach dem Zurückscrollen: Station 1 sichtbar", (await visiblePanels(page)).join() === "0");
  check("Keine Fehler in der Konsole", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// 2. Vorwärts mit dem Mausrad: kontinuierlich, Panels wechseln in Reihenfolge
{
  const { ctx, page } = await open();
  await waitMode(page, "reise");
  const seen = [0];
  for (let k = 0; k < 140; k++) {
    await page.mouse.wheel(0, 280);
    await page.waitForTimeout(120);
    const d = await activeDot(page);
    if (seen.at(-1) !== d) seen.push(d);
  }
  check("Vorwärts scrollen durchläuft alle Stationen der Reihe nach", seen.join(",") === [...Array(stations.length).keys()].join(","), `Reihenfolge ${seen.join(",")}`);
  // Nach der Reise kommt die klassische Seite
  await page.mouse.wheel(0, 3000);
  await settle(page, 1500);
  const themenTop = await page.evaluate(() => document.getElementById("themen").getBoundingClientRect().top);
  check("Nach der Reise folgt die klassische Startseite", themenTop < 900, `#themen top ${Math.round(themenTop)}`);
  await ctx.close();
}

// 3. Skip-Button und Schalter „Bewegte Reise“ (mit Speicherung)
{
  const { ctx, page } = await open();
  await waitMode(page, "reise");
  await page.locator("[data-journey-mode=\"reise\"]").getByRole("link", { name: /Direkt zur Website/ }).click();
  await settle(page, 600);
  const skip = await page.evaluate(() => ({ focused: document.activeElement?.id, top: document.getElementById("themen").getBoundingClientRect().top }));
  check("Skip „Direkt zur Website“ springt zu den Themen und setzt den Fokus", skip.focused === "themen" && Math.abs(skip.top) < 140, JSON.stringify(skip));

  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 600);
  const sw = page.getByRole("switch", { name: /Bewegte Reise/ });
  check("Schalter „Bewegte Reise“ ist ein Switch mit aria-checked=true", (await sw.getAttribute("aria-checked")) === "true");
  await sw.click();
  await waitMode(page, "static");
  const stored = await page.evaluate(() => localStorage.getItem("gh-bewegte-reise"));
  // Der Fokus wird im nächsten Frame nach dem Umschalten gesetzt
  await page.waitForFunction(() => document.activeElement?.getAttribute("role") === "switch", null, { timeout: 2000 }).catch(() => {});
  const focusedSwitch = await page.evaluate(() => document.activeElement?.getAttribute("role"));
  const staticHero = await page.evaluate(() => document.querySelector('[data-journey-mode="static"] img')?.getAttribute("alt") ?? "");
  check("Ausschalten zeigt den statischen Hero und speichert „off“", stored === "off" && (await page.locator(".gh-postkarte").count()) === 0, `localStorage=${stored}`);
  check("Statischer Hero zeigt das Startbild mit Alt-Text", staticHero.length > 10, staticHero.slice(0, 50));
  check("Fokus bleibt nach dem Umschalten auf dem Schalter", focusedSwitch === "switch");
  await page.screenshot({ path: `${SHOTS}/desktop-statisch.png` });
  const staticFotos = await page.locator('[data-journey-mode="static"] .gh-panel-foto img:visible').count();
  check("Statische Ansicht zeigt die Fotos in den Abschnitten", staticFotos === fotos.filter((f) => f.station && f.station !== stations[0].id).length, `${staticFotos} Fotos`);
  await page.reload({ waitUntil: "networkidle" });
  await waitMode(page, "static");
  check("Nach Neuladen bleibt die Reise aus", (await mode(page)) === "static");
  await page.getByRole("switch", { name: /Bewegte Reise/ }).click();
  await waitMode(page, "reise");
  check("Wieder einschalten startet die Foto-Reise", (await page.evaluate(() => localStorage.getItem("gh-bewegte-reise"))) === "on");
  await ctx.close();
}

// 4. Reduzierte Bewegung → statischer Hero
{
  const { ctx, page } = await open({ reducedMotion: "reduce" });
  await page.waitForTimeout(1000);
  check("prefers-reduced-motion: statischer Hero", (await mode(page)) === "static" && (await page.locator(".gh-postkarte").count()) === 0);
  const reason = await page.locator("main").innerText();
  check("Hinweis nennt den Grund (reduzierte Bewegung)", /Bewegung/i.test(reason));
  await ctx.close();
}

// 5. Tastatur: Tab durch die Panels, die Bühne folgt
{
  const { ctx, page } = await open();
  await waitMode(page, "reise");
  const reached = new Set();
  let last = -1;
  const order = [];
  for (let k = 0; k < 120; k++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const a = document.activeElement;
      const p = a?.closest("[data-panel-index]");
      return { panel: p ? Number(p.dataset.panelIndex) : -1, inThemen: !!a?.closest("#themen") };
    });
    if (info.panel >= 0) {
      reached.add(info.panel);
      if (info.panel !== last) {
        order.push(info.panel);
        last = info.panel;
        await waitStation(page, info.panel);
        const vis = await visiblePanels(page);
        const dot = await activeDot(page);
        if (!(vis.includes(info.panel) && dot === info.panel)) {
          check(`Tab in Panel ${info.panel + 1}: Bühne und Panel folgen`, false, `sichtbar ${vis}, Punkt ${dot}`);
        }
      }
    }
    if (info.inThemen) break;
  }
  check("Tab erreicht alle 8 Panels in Reihenfolge", order.join(",") === [...Array(stations.length).keys()].join(","), `Reihenfolge ${order.join(",")}`);
  const focusVisible = await page.evaluate(() => {
    const a = document.activeElement;
    return a ? getComputedStyle(a).outlineStyle !== "none" || getComputedStyle(a).boxShadow !== "none" : false;
  });
  check("Fokus ist sichtbar", focusVisible);
  await ctx.close();
}

// 6. Mobil 390 px: kein horizontales Scrollen (Reise und statisch), Panel unten, Foto darüber
for (const variant of ["reise", "static"]) {
  const { ctx, page } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  if (variant === "static") {
    await page.evaluate(() => localStorage.setItem("gh-bewegte-reise", "off"));
    await page.reload({ waitUntil: "networkidle" });
  }
  await waitMode(page, variant);
  await settle(page, 800);
  check(`390 px (${variant}): kein horizontales Scrollen`, await noHScroll(page));
  await page.screenshot({ path: `${SHOTS}/mobil-${variant}-1.png` });
  if (variant === "reise") {
    for (const i of [1, 4]) {
      await page.evaluate((p) => window.scrollTo(0, p * (document.querySelector("[data-journey-mode] > div").offsetHeight - innerHeight)), center(i));
      await waitStation(page, i);
      await settle(page, 1200);
      check(`390 px: Station ${i + 1} als Karte unten sichtbar`, (await visiblePanels(page)).join() === String(i));
      const overlap = await page.evaluate((i) => {
        const card = document.querySelector(`[data-stage-card="${i}"] .gh-postkarte`).getBoundingClientRect();
        const panel = document.querySelector(`[data-panel-index="${i}"]`).getBoundingClientRect();
        const ctrl = document.getElementById("gh-reise-schalter").getBoundingClientRect();
        return { panel: card.bottom > panel.top, controls: card.top < ctrl.bottom };
      }, i);
      check(`390 px: Station ${i + 1} Foto zwischen Schaltern und Panel`, !overlap.panel && !overlap.controls, JSON.stringify(overlap));
      check(`390 px: Station ${i + 1} kein horizontales Scrollen`, await noHScroll(page));
      await page.screenshot({ path: `${SHOTS}/mobil-reise-${i + 1}.png` });
    }
  }
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden`);
process.exit(failed.length ? 1 : 0);
