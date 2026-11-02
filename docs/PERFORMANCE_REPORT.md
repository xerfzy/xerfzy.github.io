# Performance, accessibility and test report

All numbers below were measured on 2026-10-31 against the built site served locally. Nothing has been deployed yet, so no field data (real-user Core Web Vitals) exists.

## Environment

- Machine: Intel Core i5-13450HX, Linux 6.18 (CachyOS), Node 26.12.
- Browser: Playwright's Chromium 156 (headless), used for both Playwright and Lighthouse.
- Server: `python3 -m http.server` on 127.0.0.1. It does **not** compress responses, so the Lighthouse transfer sizes below are uncompressed. GitHub Pages serves gzip, so the compressed sizes in the next section apply after deployment.
- Lighthouse 12.8.2 with the default mobile preset (simulated throttling: slow 4G, 4× CPU slowdown) and `--preset=desktop`.

## Lighthouse

| Page | Form factor | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT | Requests | Bytes (uncompressed) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Home `/` | mobile | 100 | 100 | 100 | 100 | 752 ms | 902 ms | 0 | 0 ms | 4 | 9.1 KB |
| Home `/` | desktop | 100 | 100 | 100 | 100 | 201 ms | 241 ms | 0 | 0 ms | 4 | 9.1 KB |
| Category `/projects/graphics/` | mobile | 100 | 100 | 100 | 100 | 750 ms | 900 ms | 0 | 0 ms | 3 | 11.0 KB |
| Category `/projects/graphics/` | desktop | 100 | 100 | 100 | 100 | 201 ms | 241 ms | 0 | 0 ms | 3 | 11.0 KB |
| Detail with images `/projects/xrivenixai/` | mobile | 100 | 100 | 100 | 100 | 752 ms | 902 ms | 0 | 0 ms | 5 | 72.7 KB |
| Detail with images `/projects/xrivenixai/` | desktop | 100 | 100 | 100 | 100 | 203 ms | 243 ms | 0 | 0 ms | 5 | 72.7 KB |
| Article `/writing/chacha20-on-the-gpu/` | mobile | 100 | 100 | 100 | 100 | 752 ms | 902 ms | 0 | 0 ms | 3 | 13.6 KB |
| Article `/writing/chacha20-on-the-gpu/` | desktop | 100 | 100 | 100 | 100 | 201 ms | 241 ms | 0 | 0 ms | 3 | 13.6 KB |
| Experiments `/experiments/` | mobile | 100 | 100 | 100 | 100 | 752 ms | 914 ms | 0 | 0 ms | 4 | 17.6 KB |
| Experiments `/experiments/` | desktop | 100 | 100 | 100 | 100 | 202 ms | 247 ms | 0 | 0 ms | 4 | 17.6 KB |

The earlier run before two fixes had SEO 92 on every page and CLS 0.064 on Experiments (mobile). The fixes:

- **SEO.** Lighthouse reads `robots.txt` with a fetch from inside the page, and the original CSP (`default-src 'none'`) blocked it. Crawlers fetch `robots.txt` directly and were never affected. The CSP now allows `connect-src 'self'` (same origin only).
- **CLS.** The filter controls appeared after the script ran and pushed the list down. Their space is now reserved, and they are invisible until the script is ready.

## Transfer sizes against the budgets

| File | Raw | gzip -9 | Budget |
|---|---|---|---|
| `index.html` | 3,687 B | 1,364 B | < 20 KB compressed |
| `projects/graphics/index.html` | 5,631 B | 2,030 B | |
| `projects/xrivenixai/index.html` | 8,001 B | 3,415 B | |
| `experiments/index.html` | 10,958 B | 3,378 B | |
| `assets/css/site.css` (the only stylesheet) | 4,620 B | 1,892 B | < 10 KB compressed |
| `assets/js/filter.js` (the only script, Experiments page only) | 1,098 B | 577 B | < 5 KB compressed |

- The homepage loads 4 resources: HTML, CSS, favicon, and the folder icon inlined in the CSS.
- It loads **no JavaScript**. Only the Experiments page loads a script.
- No fonts are downloaded (system font stacks only).
- There are no third-party requests on any page.
- The five project images total 164 KB as WebP. They appear only on detail pages, with explicit `width` and `height` and `loading="lazy"`.

## Browser tests (`npx playwright test`)

31 tests, all passing:

- **Overflow.** No horizontal overflow on 12 page types (all page kinds, including 404) at 320, 360, 375, 390, 414, 768, 1024, 1366 and 1920 px.
- **Accessibility.** axe-core (WCAG 2.0/2.1/2.2 A and AA plus best-practice rules) reports **0 violations** on all 12 page types.
- **Console.** No console errors and no CSP violations on any page.
- **Keyboard.** Tab order on the homepage is: skip link → site title → the six navigation links in order. The focused element has a visible outline.
- **Filter.** The experiments filter narrows the list by text and by category. With JavaScript disabled, the controls stay hidden and all 12 entries are shown.
- **PDFs.** All five resume PDFs and the patent PDF return 200 with `application/pdf`.
- **Homepage.** It shows the exact title, tagline and navigation text, with no paragraphs, images, canvas or video.

Screenshots of 8 page types at 360 px and 1366 px are in `docs/screenshots/`. They were inspected by eye. Lazy images are scrolled into view before capture, so screenshots show them as a visitor would.

## Static checks (`node scripts/check.mjs`)

- `sitemap.xml` lists every page except 404, and nothing else.
- html-validate (recommended rules) passes on all 29 pages.
- `node --check` passes on all JavaScript.
- 476 internal links and asset references resolve, including `#anchor` targets.
- There are no duplicate IDs, no `style=""` attributes, no inline scripts, no event-handler attributes and no `href="#"`.
- Every `<img>` has `alt`, `width` and `height`.
- Every `(n)` count on the homepage equals the number of entries on the page it links to.
- The patent PDF exists, and all five resume PDFs exist and are linked from the Resumes page.
- No local paths, private keys, keystores, registration numbers or other private identifiers appear anywhere in the published tree. Private patterns are read from the git-ignored `.private-patterns` file.

## External links (`node scripts/check-external-links.mjs`)

- 36 external URLs from the pages and resume PDFs were checked: **36 OK**, 0 broken, 0 refused, 0 network errors. These include GitHub repositories, the two WebGL demos on `xerfzy.github.io` and YouTube videos.
- 28 canonical URLs pointing at `https://xerfzy.github.io/` (this site) are skipped. They only resolve after deployment there.

## Resume PDFs (`bash scripts/build-resumes.sh`)

All five PDFs pass these checks:

- one page each, with fonts embedded;
- the name is the first extracted line;
- email, GitHub, education and the patent status ("not granted") are present;
- each of the five section headings appears exactly once, in order;
- only ASCII characters plus the bullet marker;
- no line breaks inside hyphenated terms, and no URL split across lines.

Rebuilding produces byte-identical PDFs (`SOURCE_DATE_EPOCH` is fixed). Each page was rendered with `pdftoppm` and inspected.

## Security notes

- **CSP** (meta tag): `default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'`. GitHub Pages cannot set response headers, so `frame-ancestors`, HSTS and similar headers are not available. A meta CSP cannot express `frame-ancestors`.
- No third-party scripts, fonts, analytics or embeds. No forms. The only user input is the client-side filter, which never writes HTML (it toggles `hidden`).
- External links are plain links; no `target="_blank"` is used.

## Not measured

- Real-device and field data (CrUX). The site has no traffic yet.
- INP. Lighthouse's lab run reports TBT 0 ms on every page. The only interaction handler is the filter's `input` and `change` listener over 12 list items.
- Behaviour with GitHub Pages compression and caching headers. This should be re-measured after deployment.
