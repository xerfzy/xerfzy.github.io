# xerf — A Guide to My Work

KISP — Keep It Secure, Performant.

A static portfolio laid out as a plain web directory: categories, counts and short descriptions. The pages are pre-rendered HTML with one small stylesheet. Only the Experiments page loads a script (a filter under 1 KB gzipped), and the site works without it. There are no frameworks, web fonts, trackers or third-party requests.

## Layout

```
index.html, 404.html, robots.txt, sitemap.xml   generated
projects/ experiments/ research/ writing/
about/ whats-new/ resumes/index.html            generated pages (do not edit by hand)

content/
  projects.json            the project registry: categories, tiers, records
  projects/<slug>.html     body of a project detail page (only when "detail": true)
  writing.json             article list and external writing
  writing/<slug>.html      article bodies
  updates.json             What's New entries (newest first)
  research.json            publication records
  resumes.json             resume list for the Resumes page
  pages/about.html         About page body
site.config.json           identity, contact, education, base URL

assets/css/site.css        the only stylesheet
assets/js/filter.js        Experiments filter (progressive enhancement)
assets/images/             project images (WebP)
assets/documents/          patent publication PDF
assets/favicon.svg

resumes/sources/*.typ      resume sources (Typst)
resumes/pdf/*.pdf          generated resumes

scripts/build.mjs                 site build (Node, no dependencies)
scripts/check.mjs                 static checks
scripts/check-external-links.mjs  external link check
scripts/build-resumes.sh          resume build + scripts/check-resumes.py
tests/site.spec.mjs               Playwright browser tests

docs/PROJECT_AUDIT.md         evidence for every project claim
docs/CONTENT_DECISIONS.md     categorisation, naming, scope decisions
docs/RESUME_KEYWORD_MATRIX.md job-posting keywords vs. evidence
docs/PERFORMANCE_REPORT.md    measured results and environment
docs/screenshots/             responsive screenshots from the test run
```

## Build and preview

```sh
node scripts/build.mjs                 # regenerate all pages (Node 18+)
python3 -m http.server 8000            # then open http://127.0.0.1:8000/
```

Use a local server rather than opening files directly. Links point at directories (`projects/`), and over `file://` the browser shows a directory listing instead of `index.html`.

The build reads only `content/` and `site.config.json`, and is deterministic: the same content always produces the same bytes. Counts, "Last updated" (the newest date in `updates.json` or the registry), ordering, related links and the sitemap are all derived at build time.

## Checks

```sh
npm install                            # dev tools only: Playwright, axe-core, html-validate
npx playwright install chromium        # once

node scripts/build.mjs
node scripts/check.mjs                 # reproducible build, HTML validity, links, counts, privacy grep
npx playwright test                    # overflow 320-1920 px, axe, keyboard, filter, PDFs, screenshots
node scripts/check-external-links.mjs  # every external URL in the pages and resume PDFs
bash scripts/build-resumes.sh          # rebuild and text-check the five resume PDFs
```

`scripts/check.mjs` also reads an optional, git-ignored `.private-patterns` file (`label<TAB>regex` per line) for identifiers that must never be published but should not be written into a public script either.

Lighthouse, as used for the report:

```sh
CHROME_PATH=$(ls ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome | head -1) \
  npx lighthouse@12.8.2 http://127.0.0.1:8000/ --preset=desktop --view
```

## Adding content

**A project.** Add one record to `content/projects.json`:

```jsonc
{
  "slug": "my-tool",                     // lowercase-hyphenated; becomes projects/my-tool/
  "title": "my-tool",
  "category": "systems",                 // systems | graphics | mobile | games | ai | robotics | web
  "tier": "project",                     // featured | research | project | coursework | experiment | archive
  "summary": "One factual sentence.",
  "tags": ["C++17", "Linux"],
  "repo": "https://github.com/xerfzy/my-tool",
  "demo": "...", "video": "...", "download": "...",   // optional
  "period": "Nov 2026", "year": 2026, "updated": "2026-11-20",
  "status": "Working",
  "detail": false,                        // true requires content/projects/my-tool.html
  "related": ["censface-cpp"]             // optional
}
```

Then run the build. The project appears in its category, the counts update, and if its tier is experiment, coursework or archive it also appears in Experiments and Archive. For a detail page, set `"detail": true` and write `content/projects/<slug>.html`. Use `<h2>` sections; `{{root}}` expands to the relative path to the site root. Put images in `assets/images/` as WebP, with `width`, `height`, `alt` and `loading="lazy"`.

**An experiment.** It is the same as a project, with tier `experiment` (or `coursework` / `archive`).

**An article.** Add an entry to `content/writing.json`, with `basis` stating whether it comes from source, docs or measured results. Write the body in `content/writing/<slug>.html`.

**An update.** Add a dated line at the top of `content/updates.json`. Entries with a `project` field feed "Recently updated" on the homepage.

**A resume.** See `resumes/README.md`.

## Deploying to GitHub Pages

The generated site is committed at the repository root, so Pages needs no build step. `.nojekyll` is included.

1. Run the build and all checks. Commit.
2. To serve at `https://xerfzy.github.io/` (the `baseUrl` in `site.config.json`), rename this repository to `xerfzy.github.io` and enable Pages from the `main` branch root.
3. To serve elsewhere, change `baseUrl`, rebuild, and commit. Relative links work at any path. Only canonical URLs, the sitemap and the 404 page depend on `baseUrl`.

Files outside the generated pages are also published, because Pages serves the whole branch: `content/`, `docs/`, `resumes/sources/` and `scripts/`. They contain nothing private (`scripts/check.mjs` verifies this). Locally, `Text File.txt` and `.private-patterns` are git-ignored.

GitHub Pages cannot set HTTP headers. The CSP is therefore a `<meta>` tag, and `frame-ancestors` and HSTS are not available.
