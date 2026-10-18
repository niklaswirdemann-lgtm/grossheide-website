// Prüft Hell-/Dunkelmodus und die Effekte im Browser (Playwright/Chromium):
// Modus folgt der Systemeinstellung, Schalter im Kopf (Maus und Tastatur) mit Speicherung,
// gespeicherte Wahl gilt schon vor dem ersten Zeichnen, keine Foto-Reise mehr, Zahlen zählen
// bis zum echten Wert, bei „Bewegung reduzieren“ steht alles still, Schalter „Bewegung“ hält alle
// Effekte an (WCAG 2.2.2), 390 px ohne Querscrollen.
//
// Voraussetzung: `npm run build` und ein laufender Server auf THEME_BASE.
// Aufruf: THEME_BASE=http://localhost:3000 npm run check:theme
import { chromium } from "playwright";

const BASE = process.env.THEME_BASE ?? "http://localhost:3000";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` – ${detail}` : ""}`);
}
const browser = await chromium.launch();
const bodyBg = (page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const isDarkBg = (rgb) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return r + g + b < 150;
};
const toggle = (page) => page.getByRole("switch", { name: "Dunkel" });

// 1. System hell / dunkel, ohne eigene Wahl
for (const scheme of ["light", "dark"]) {
  const ctx = await browser.newContext({ colorScheme: scheme });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE}/de/`, { waitUntil: "networkidle" });
  const bg = await bodyBg(page);
  check(
    `System ${scheme}: Seite folgt (Hintergrund ${scheme === "dark" ? "dunkel" : "hell"})`,
    isDarkBg(bg) === (scheme === "dark"),
    bg,
  );
  check(
    `System ${scheme}: Schalter zeigt den Zustand (aria-checked)`,
    (await toggle(page).getAttribute("aria-checked")) === String(scheme === "dark"),
  );
  check(`System ${scheme}: keine Skriptfehler`, errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// 2. Umschalten mit Maus und Tastatur, Wahl bleibt nach Neuladen, gilt vor dem ersten Zeichnen
{
  const ctx = await browser.newContext({ colorScheme: "light", reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/de/`, { waitUntil: "networkidle" });
  await toggle(page).click();
  await page.waitForTimeout(200);
  const after = { theme: await page.evaluate(() => document.documentElement.dataset.theme), bg: await bodyBg(page) };
  check("Klick schaltet auf dunkel", after.theme === "dark" && isDarkBg(after.bg), JSON.stringify(after));
  check("Wahl ist gespeichert", (await page.evaluate(() => localStorage.getItem("gh-farbmodus"))) === "dark");
  await ctx.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => (window.__themeBeimLaden = document.documentElement.dataset.theme), {
      once: true,
    });
  });
  await page.goto(`${BASE}/de/rathaus/`, { waitUntil: "networkidle" });
  check(
    "Andere Seite: dunkel schon beim Laden (kein Aufblitzen)",
    (await page.evaluate(() => window.__themeBeimLaden)) === "dark" && isDarkBg(await bodyBg(page)),
  );
  await toggle(page).focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(200);
  check(
    "Leertaste schaltet zurück auf hell",
    (await page.evaluate(() => document.documentElement.dataset.theme)) === "light" && !isDarkBg(await bodyBg(page)),
  );
  check("Fokus bleibt auf dem Schalter", (await page.evaluate(() => document.activeElement?.getAttribute("role"))) === "switch");
  await ctx.close();
}

// 3. Startseite: keine Foto-Reise mehr, Zahlen zählen bis zum Endwert
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/de/`, { waitUntil: "networkidle" });
  const reise = await page.evaluate(() => ({
    mode: document.querySelectorAll("[data-journey-mode]").length,
    schalter: [...document.querySelectorAll('[role="switch"]')].filter((e) => /Reise/.test(e.textContent ?? "")).length,
  }));
  check("Keine bewegte Reise und kein Reise-Schalter", reise.mode === 0 && reise.schalter === 0, JSON.stringify(reise));
  await page.locator("#zahlen").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  const zahlen = await page.$$eval('[aria-labelledby="zahlen"] dd', (dds) =>
    dds.map((dd) => [dd.querySelector('[aria-hidden="true"]')?.textContent, dd.querySelector(".sr-only")?.textContent]),
  );
  check(
    "Zahlen zählen bis zum echten Wert, Screenreader lesen nur den Endwert",
    zahlen.length > 0 && zahlen.every(([a, b]) => a === b),
    JSON.stringify(zahlen),
  );
  await ctx.close();
}

// 4. Bewegung reduzieren: Startbild und Karten bleiben still
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/de/`, { waitUntil: "networkidle" });
  await page.mouse.move(1100, 450);
  await page.mouse.move(1200, 500, { steps: 5 });
  await page.waitForTimeout(800);
  const still = await page.evaluate(() => ({
    translate: [...document.querySelectorAll(".gh-parallax [data-tiefe]")].map((e) => getComputedStyle(e).translate),
    running: document
      .getAnimations()
      .filter((a) => a.playState === "running" && (a.effect?.getComputedTiming().duration ?? 0) > 20).length,
  }));
  check(
    "Bewegung reduzieren: Fotos folgen der Maus nicht, keine laufenden Animationen",
    still.translate.every((t) => t === "none") && still.running === 0,
    JSON.stringify(still),
  );
  await ctx.close();
}

// 5. Schalter „Bewegung“ (WCAG 2.2.2): hält alles an, Wahl bleibt, entfällt bei „Bewegung reduzieren“
{
  const running = (page) =>
    page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running" && (a.effect?.getComputedTiming().duration ?? 0) > 20)
          .length,
    );
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/de/`, { waitUntil: "networkidle" });
  const motion = page.getByRole("switch", { name: "Bewegung" });
  const before = await running(page);
  check(
    "Bewegung an: Effekte laufen (Laufband, Licht)",
    before > 0 && (await motion.getAttribute("aria-checked")) === "true",
    `${before}`,
  );
  await motion.click();
  await page.waitForTimeout(300);
  const after = await running(page);
  check(
    "Bewegung aus: keine laufenden Animationen, Wahl gespeichert",
    after === 0 && (await page.evaluate(() => localStorage.getItem("gh-bewegung"))) === "off",
    `${after}`,
  );
  await page.goto(`${BASE}/de/rathaus/`, { waitUntil: "networkidle" });
  check(
    "Bewegung aus gilt nach dem Laden einer anderen Seite",
    (await page.evaluate(() => document.documentElement.dataset.motion)) === "off" &&
      (await motion.getAttribute("aria-checked")) === "false" &&
      (await running(page)) === 0,
  );
  await motion.focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(200);
  check(
    "Leertaste schaltet Bewegung wieder an",
    (await page.evaluate(() => document.documentElement.dataset.motion)) === undefined &&
      (await page.evaluate(() => localStorage.getItem("gh-bewegung"))) === null,
  );
  await ctx.close();
  const calm = await browser.newContext({ reducedMotion: "reduce" });
  const p2 = await calm.newPage();
  await p2.goto(`${BASE}/de/`, { waitUntil: "networkidle" });
  check(
    "Bewegung reduzieren: Schalter „Bewegung“ entfällt (es bewegt sich ohnehin nichts)",
    (await p2.getByRole("switch", { name: "Bewegung" }).count()) === 0,
  );
  await calm.close();
}

// 6. 390 px dunkel: kein Querscrollen
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  for (const path of ["/de/", "/de/rathaus/", "/nds/"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    check(
      `390 px dunkel ${path}: kein Querscrollen`,
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    );
  }
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden`);
process.exit(failed.length ? 1 : 0);
