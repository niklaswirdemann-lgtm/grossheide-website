# Hosting (statischer Export)

`npm run build` erzeugt `out/`. Den Inhalt auf einen deutschen bzw. EU-Webhoster kopieren. Kein Node-Server nötig.

Empfohlene Server-Einstellungen:
- `/` → `/de/` per **301** weiterleiten (die mitgelieferte `out/index.html` leitet sonst per Meta-Refresh weiter).
- Unbekannte Pfade → `/404.html` mit Status 404.
- `Content-Type: text/html; charset=utf-8`, gzip oder brotli für `.html`, `.js`, `.css`, `.txt`.
- `/_next/static/*` lange cachen (`Cache-Control: public, max-age=31536000, immutable`).
- Sicherheits-Header: `Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'`
  (Next.js nutzt Inline-Skripte für die Hydration; TODO: prüfen, ob Hashes/Nonce möglich), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

Beispiel nginx:

```nginx
location = / { return 301 /de/; }
error_page 404 /404.html;
location /_next/static/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
```

Beispiel Apache (`.htaccess`):

```apache
RedirectMatch 301 ^/$ /de/
ErrorDocument 404 /404.html
```

## Öffentliche Vorschau (GitHub Pages)

Nur zum Anschauen, nicht der Livegang. `.github/workflows/vorschau.yml` baut bei jedem Push auf `main` die Vorschau-Fassung
und veröffentlicht sie unter `https://<konto>.github.io/<repository>/de/`.

- `VORSCHAU=1`: Fotos mit ungeklärten Rechten (`rechteGeklaert: false` in `content/fotos.json`) werden weder verlinkt noch
  ausgeliefert (Platzhalter statt Foto), ein Hinweis-Streifen steht über dem Kopf, `robots.txt` sperrt Suchmaschinen.
- `BASE_PATH=/<repository>`: Die Seite liegt in einem Unterordner. Pfade außerhalb von `next/link` laufen über
  `withBase()` aus `src/lib/links.ts`.
- Lokal nachbauen: `VORSCHAU=1 BASE_PATH=/grossheide-website npm run build`, dann `out/` in einen Ordner
  `grossheide-website/` legen und dessen Elternordner ausliefern.
- Das öffentliche Repository darf `public/fotos/` und die Git-Historie dieses Repositorys nicht enthalten (dort liegen
  die Fotos). Hochgeladen wird ein frischer Stand ohne Historie.
