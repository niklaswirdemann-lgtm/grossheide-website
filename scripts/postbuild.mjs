// Nach `next build`: eigene, barrierefreie 404-Seite (mit lang="de", Navigation und Suche)
// als out/404.html ablegen. Der Webserver liefert sie für unbekannte Pfade aus.
import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const src = "out/de/seite-nicht-gefunden/index.html";
if (!existsSync(src)) {
  console.error(`postbuild: ${src} fehlt`);
  process.exit(1);
}
copyFileSync(src, "out/404.html");
console.log("postbuild: out/404.html aus /de/seite-nicht-gefunden/ erzeugt");

// Fotos mit ungeklärten Rechten auflisten: vor einer Veröffentlichung klären oder ersetzen.
const { items } = JSON.parse(readFileSync("content/fotos.json", "utf8"));
const offen = items.filter((f) => !f.rechteGeklaert);
if (offen.length) {
  console.warn(
    `postbuild: ${offen.length} Foto(s) mit ungeklärten Bildrechten (nicht veröffentlichen): ${offen.map((f) => f.id).join(", ")}`,
  );
}

// Öffentliche Vorschau: keine Fotos mit ungeklärten Rechten ausliefern, Suchmaschinen aussperren.
if (process.env.VORSCHAU === "1") {
  const gesperrt = offen.filter((f) => !f.vorschauFreigabe);
  for (const f of gesperrt) rmSync(`out${f.datei}`, { force: true });
  writeFileSync("out/robots.txt", "User-agent: *\nDisallow: /\n");
  console.log(`postbuild: Vorschau – ${gesperrt.length} Foto(s) aus out/ entfernt, robots.txt sperrt Suchmaschinen`);
  const frei = offen.filter((f) => f.vorschauFreigabe);
  if (frei.length)
    console.warn(
      `postbuild: Vorschau zeigt ${frei.length} Foto(s) mit ungeklärten Rechten (freigegeben): ${frei.map((f) => f.id).join(", ")}`,
    );
}
