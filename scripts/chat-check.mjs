// Phase 5: Chat-Widget (Probe-Version) und Plattdeutsch-Rahmen im Browser prüfen.
// - Knopf erscheint nur mit JavaScript; auf der Startseite erst nach der Foto-Reise
// - Dialog: axe ohne Verstöße, Fokus im Dialog, Escape schließt, Fokus zurück auf den Knopf
// - Antworten der Probe-Version (Öffnungszeiten, Notfall, Dienstleistung, unbekannt, persönliche Daten)
// - Keine Anfragen an fremde Server; persönliche Daten verlassen den Browser nicht
// - Link in einer Antwort führt zur Seite und schließt den Dialog
// - 390 px: Dialog füllt den Bildschirm, kein Querscrollen
// - Plattdeutsch: html lang="nds", Inhalte lang="de", Sprachwahl führt zur selben Seite, Chat auf Hochdeutsch
// Voraussetzung: `npm run build` und ein laufender Server auf CHAT_BASE.
// Aufruf: CHAT_BASE=http://localhost:3000 npm run check:chat
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.CHAT_BASE ?? "http://localhost:3000";
const ORIGIN = new URL(BASE).origin;
const axeSource = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const chat = JSON.parse(readFileSync("content/de/chat.json", "utf8"));

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` – ${detail}` : ""}`);
}

const browser = await chromium.launch();

async function axeDialog(page) {
  await page.addScriptTag({ content: axeSource });
  const r = await page.evaluate(async () =>
    axe.run(document.querySelector("[data-chat-dialog]"), {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
      rules: { region: { enabled: false } },
    }),
  );
  return r.violations.map((v) => `${v.id} (${v.nodes.length}×) ${v.nodes[0]?.target}`);
}

async function askAndWait(page, question) {
  const n = await page.locator("[data-chat-answer]").count();
  await page.getByLabel(chat.ui.inputLabel).fill(question);
  await page.keyboard.press("Enter");
  await page.waitForFunction((k) => document.querySelectorAll("[data-chat-answer]").length > k, n);
  return page.locator("[data-chat-answer]").last();
}

// 1. Ohne JavaScript kein Knopf
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/de/rathaus/`);
  check("Ohne JavaScript: kein Chat-Knopf", (await page.locator("[data-chat-launcher]").count()) === 0);
  await ctx.close();
}

// 2. Desktop: Dialog, Tastatur, Antworten, Netz
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const foreign = [];
  const posted = [];
  page.on("request", (r) => {
    if (!r.url().startsWith(ORIGIN) && !r.url().startsWith("data:")) foreign.push(r.url());
    // Next lädt Links vorab (eigener Server); geprüft wird, dass nirgends ein Text mitgeschickt wird
    if (r.postData() || /example\.org/.test(decodeURIComponent(r.url()))) posted.push(`${r.method()} ${r.url()}`);
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(`${BASE}/de/rathaus/`);
  const launcher = page.locator("[data-chat-launcher]");
  await launcher.waitFor();
  check("Chat-Knopf sichtbar und mindestens 44 px hoch", (await launcher.boundingBox()).height >= 44);

  await launcher.focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("[data-chat-dialog]")?.open);
  await page.waitForFunction(() => document.activeElement?.closest("[data-chat-dialog]"));
  const startFocused = await page.evaluate(() => document.activeElement?.textContent);
  check("Öffnen: Hinweis zuerst, Fokus auf „Chat starten“", startFocused === chat.ui.start, startFocused ?? "");
  check("Hinweis nennt Probe-Version und 112", (await page.locator("[data-chat-dialog]").innerText()).includes("112"));

  let v = await axeDialog(page);
  check("axe: Hinweis-Ansicht ohne Verstöße", v.length === 0, v.join(" | "));

  await page.keyboard.press("Enter");
  await page.waitForFunction((label) => document.activeElement?.labels?.[0]?.textContent === label, chat.ui.inputLabel);
  check("Nach dem Start: Fokus im Eingabefeld", true);

  // Tab bleibt im Dialog (modal)
  let inside = true;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    inside &&= await page.evaluate(
      () => !!document.activeElement?.closest("[data-chat-dialog]") || document.activeElement === document.body,
    );
  }
  check("Tab-Taste bleibt im Dialog", inside);

  let a = await askAndWait(page, "Wann hat das Rathaus geöffnet?");
  const zeiten = await a.innerText();
  check(
    "Öffnungszeiten: Wochentage und Link",
    (await a.getAttribute("data-chat-answer")) === "zeiten" && zeiten.includes("Montag") && zeiten.includes("Öffnungszeiten"),
  );
  check("Antwort steht im role=log-Bereich", await a.evaluate((el) => !!el.closest('[role="log"]')));
  check(
    "Fokus bleibt nach dem Senden im Eingabefeld",
    await page.evaluate((label) => document.activeElement?.labels?.[0]?.textContent === label, chat.ui.inputLabel),
  );

  a = await askAndWait(page, "Mein Nachbar hat einen Unfall!");
  check(
    "Notfall: feste Nummern 112 und 110",
    (await a.getAttribute("data-chat-answer")) === "notfall" && /112[\s\S]*110/.test(await a.innerText()),
  );

  a = await askAndWait(page, "Ich brauche einen neuen Personalausweis.");
  const ausweis = await a.locator("a").allInnerTexts();
  check(
    "Dienstleistung: Link „Personalausweis beantragen“",
    ausweis.some((t) => t.includes("Personalausweis")),
    ausweis.join(", "),
  );

  a = await askAndWait(page, "Wie wird das Wetter morgen in Paris?");
  const unbekannt = await a.innerText();
  check(
    "Unbekannt: nichts erfunden, Verweis aufs Rathaus",
    (await a.getAttribute("data-chat-answer")) === "unbekannt" && unbekannt.includes("Telefon"),
  );

  a = await askAndWait(page, "Schreib mir an max@example.org");
  check("Persönliche Daten: Frage wird nicht bearbeitet", (await a.getAttribute("data-chat-answer")) === "persoenlich");

  v = await axeDialog(page);
  check("axe: Gespräch ohne Verstöße", v.length === 0, v.join(" | "));

  check(
    "Keine Anfragen an fremde Server, keine Eingaben gesendet",
    foreign.length === 0 && posted.length === 0,
    [...foreign, ...posted].join(" "),
  );

  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("[data-chat-dialog]")?.open);
  check(
    "Escape schließt, Fokus zurück auf den Knopf",
    await page.evaluate(() => document.activeElement?.hasAttribute("data-chat-launcher")),
  );

  // Wieder öffnen: Hinweis schon bestätigt, Gespräch noch da
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("[data-chat-dialog]")?.open);
  check("Erneut öffnen: Gespräch bleibt, ohne neuen Hinweis", (await page.locator("[data-chat-answer]").count()) === 5);

  // Link in der Antwort
  await page.locator("[data-chat-answer]").nth(2).locator("a").first().click();
  await page.waitForURL(/\/de\/rathaus\/dienstleistungen\//);
  await page.waitForFunction(() => !document.querySelector("[data-chat-dialog]")?.open);
  check("Link in der Antwort: Seite öffnet, Dialog schließt", true, new URL(page.url()).pathname + new URL(page.url()).hash);
  check("Keine Skriptfehler", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// 3. Startseite: Knopf erst nach der Foto-Reise
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/de/`);
  await page.waitForFunction(() => document.querySelector("[data-journey-mode]")?.getAttribute("data-journey-mode") === "reise");
  await page.waitForTimeout(300);
  const during = await page.locator("[data-chat-launcher]").count();
  await page.locator("#themen").scrollIntoViewIfNeeded();
  await page.waitForSelector("[data-chat-launcher]", { timeout: 5000 }).catch(() => {});
  const after = await page.locator("[data-chat-launcher]").count();
  check(
    "Startseite: kein Knopf während der Reise, danach sichtbar",
    during === 0 && after === 1,
    `während ${during}, danach ${after}`,
  );
  await ctx.close();
}

// 4. Handy
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/de/kontakt/`);
  await page.locator("[data-chat-launcher]").tap();
  await page.getByRole("button", { name: chat.ui.start }).tap();
  await askAndWait(page, "Öffnungszeiten");
  const box = await page.locator("[data-chat-dialog]").boundingBox();
  const hscroll = await page.evaluate(() => {
    const d = document.querySelector("[data-chat-dialog] > div");
    return document.documentElement.scrollWidth > innerWidth || d.scrollWidth > d.clientWidth;
  });
  check(
    "390 px: Dialog füllt den Bildschirm, kein Querscrollen",
    box.width >= 389 && box.height >= 840 && !hscroll,
    `${Math.round(box.width)}×${Math.round(box.height)}`,
  );
  const inputSize = await page.getByLabel(chat.ui.inputLabel).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  check("390 px: Eingabefeld mit mindestens 16 px Schrift", inputSize >= 16, `${inputSize} px`);
  await ctx.close();
}

// 5. Plattdeutsch
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/nds/rathaus/oeffnungszeiten/`);
  const r = await page.evaluate(() => ({
    html: document.documentElement.lang,
    main: document.querySelector("main")?.lang,
    notice: document.querySelector("main > [lang=nds]")?.textContent ?? "",
    switchHref: document.querySelector('a[hreflang="de"]')?.getAttribute("href"),
    navFallback: [...document.querySelectorAll("#hauptnavigation a[lang=de]")].length,
  }));
  check(
    "Plattdeutsch: html lang=nds, Inhalte lang=de, Hinweis oben im Inhalt",
    r.html === "nds" && r.main === "de" && r.notice.includes("TODO"),
    JSON.stringify({ html: r.html, main: r.main }),
  );
  check(
    "Plattdeutsch: Sprachwahl führt zur selben Seite",
    r.switchHref === `${process.env.BASE_PATH ?? ""}/de/rathaus/oeffnungszeiten/`,
    r.switchHref ?? "",
  );
  check("Plattdeutsch: nicht übersetzte Menüpunkte mit lang=de", r.navFallback > 0, `${r.navFallback} Punkte`);
  await page.locator("[data-chat-launcher]").click();
  const chatLang = await page.evaluate(() =>
    document.querySelector("[data-chat-dialog]")?.closest("[lang]")?.getAttribute("lang"),
  );
  check("Plattdeutsch: Chat auf Hochdeutsch mit lang=de", chatLang === "de", chatLang ?? "");
  const v = await axeDialog(page);
  check("Plattdeutsch: axe im Chat ohne Verstöße", v.length === 0, v.join(" | "));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden`);
process.exit(failed.length ? 1 : 0);
