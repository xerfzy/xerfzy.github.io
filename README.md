# xerf

KISP — Keep It Secure, Performant.

A static portfolio laid out as a plain web directory. It is plain HTML, one stylesheet and one small script: no build step, no frameworks, no web fonts, no trackers. Every page is a normal `.html` file that you edit directly.

## Where things are

```
index.html                      homepage (directory + counts + recently updated)
about/index.html                About
projects/index.html             all projects
projects/<category>/index.html  one page per category (systems, graphics, mobile, games, ai, robotics, web)
projects/<slug>/index.html      project detail pages
experiments/index.html          Experiments and Archive (with the filter)
research/index.html             Research and Publications
writing/index.html              Writing
writing/<slug>/index.html       articles
resumes/index.html              Resumes page; the PDFs are in resumes/pdf/
404.html                        not-found page (links are root-absolute: /about/ etc.)
sitemap.xml, robots.txt         edit by hand when you add or remove a page

assets/css/site.css             the only stylesheet (colours are at the top, in :root)
assets/js/filter.js             Experiments filter; the page works without it
assets/images/                  project images (WebP)
assets/documents/               patent publication PDF
assets/favicon.svg

resumes/sources/*.typ           resume sources (Typst)
scripts/check.mjs               static checks
scripts/check-external-links.mjs
scripts/build-resumes.sh        builds and checks the five resume PDFs
tests/site.spec.mjs             Playwright browser tests
docs/                           project audit, decisions, keyword matrix, performance report
```

Every page repeats the same header (title, tagline, nav) and footer. If you change one of those, change it on every page, for example with a search-and-replace across `*.html`. Links are relative: a page one folder deep links home with `../`, two folders deep with `../../`.

## Preview

```sh
python3 -m http.server 8000            # then open http://127.0.0.1:8000/
```

Use a local server rather than opening files directly. Links point at folders (`projects/`), and over `file://` the browser shows a folder listing instead of `index.html`.

## Adding things

- **A project.** Add an `<li id="slug">` entry to its category page (`projects/<category>/index.html`) and to `projects/index.html`. Raise that category's `(n)` on the homepage by one. If it is an experiment, coursework or archive entry, also add it to `experiments/index.html` and raise the Experiments and Archive count.
- **A detail page.** Copy an existing `projects/<slug>/index.html` to a new folder, change the text, link to it, and add its URL to `sitemap.xml`. Images go in `assets/images/` as WebP, with `width`, `height`, `alt` and `loading="lazy"`.
- **An article.** Copy an existing `writing/<slug>/index.html`, link it from `writing/index.html`, and add it to `sitemap.xml`.
- **An update.** Add a dated `<li>` at the top of "Recently updated" on the homepage.
- **A resume.** See `resumes/README.md`.

`node scripts/check.mjs` catches the usual slips: a homepage count that doesn't match its page, a page missing from the sitemap, a broken link or anchor, invalid HTML.

## Checks

```sh
npm install                            # dev tools only: Playwright, axe-core, html-validate
npx playwright install chromium        # once

node scripts/check.mjs                 # HTML validity, links, counts, sitemap, privacy grep
npx playwright test                    # overflow 320-1920 px, axe, keyboard, filter, PDFs, screenshots
node scripts/check-external-links.mjs  # every external URL in the pages and resume PDFs
bash scripts/build-resumes.sh          # rebuild and text-check the five resume PDFs
```

`scripts/check.mjs` also reads an optional, git-ignored `.private-patterns` file (`label<TAB>regex` per line) for identifiers that must never be published but should not be written into a public script either.

Lighthouse:

```sh
CHROME_PATH=$(ls ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome | head -1) \
  npx lighthouse@12.8.2 http://127.0.0.1:8000/ --preset=desktop --view
```

## Deploying to GitHub Pages

The site is the repository root, so Pages needs no build step. `.nojekyll` is included.

1. Run the checks. Commit.
2. To serve at `https://xerfzy.github.io/`, rename this repository to `xerfzy.github.io` and enable Pages from the `main` branch root.
3. To serve elsewhere, replace `https://xerfzy.github.io/` in the canonical/`og:url` tags, `sitemap.xml` and `robots.txt`, and the root-absolute links in `404.html`. Relative links work at any path.

Pages serves the whole branch, so `docs/`, `resumes/sources/` and `scripts/` are public too. They contain nothing private (`scripts/check.mjs` verifies this). Locally, `Text File.txt` and `.private-patterns` are git-ignored.

GitHub Pages cannot set HTTP headers. The CSP is therefore a `<meta>` tag, and `frame-ancestors` and HSTS are not available.
