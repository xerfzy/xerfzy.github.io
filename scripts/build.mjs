#!/usr/bin/env node
// Static site build. No dependencies: Node's standard library only.
//
//   node scripts/build.mjs              write pages into the repository root
//   node scripts/build.mjs --out DIR    write pages into DIR (used by check.mjs)
//
// Inputs:  site.config.json, content/*.json, content/projects/*.html,
//          content/writing/*.html, content/pages/*.html
// Outputs: index.html, 404.html, robots.txt, sitemap.xml and the section
//          directories listed in GENERATED_DIRS. Everything under assets/ and
//          resumes/{pdf,sources} is hand-maintained and never touched.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outArg = process.argv.indexOf('--out');
const OUT = outArg > -1 ? path.resolve(process.argv[outArg + 1]) : ROOT;

const GENERATED_DIRS = ['projects', 'experiments', 'research', 'writing', 'about', 'whats-new'];
const GENERATED_FILES = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '.nojekyll', 'resumes/index.html'];

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const cfg = json('site.config.json');
const reg = json('content/projects.json');
const updates = json('content/updates.json');
const writing = json('content/writing.json');
const research = json('content/research.json');
const resumes = json('content/resumes.json');

// ---------------------------------------------------------------- helpers

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
const time = (iso) => `<time datetime="${iso}">${fmtDate(iso)}</time>`;
const daysBetween = (a, b) => (Date.parse(b) - Date.parse(a)) / 86400000;
const vh = (s) => `<span class="vh"> ${esc(s)}</span>`;

const errors = [];
const fail = (msg) => errors.push(msg);

// ---------------------------------------------------------------- validate content

const cats = new Map(reg.categories.map((c) => [c.key, c]));
const tiers = reg.tiers;
const projects = reg.projects;
const bySlug = new Map();
for (const p of projects) {
  if (bySlug.has(p.slug)) fail(`duplicate project slug: ${p.slug}`);
  bySlug.set(p.slug, p);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) fail(`bad slug: ${p.slug}`);
  if (cats.has(p.slug)) fail(`slug collides with a category directory: ${p.slug}`);
  if (!cats.has(p.category)) fail(`${p.slug}: unknown category ${p.category}`);
  if (!tiers[p.tier]) fail(`${p.slug}: unknown tier ${p.tier}`);
  for (const k of ['title', 'summary', 'status', 'period']) if (!p[k]) fail(`${p.slug}: missing ${k}`);
  if (!p.repo && !p.video && !p.demo) fail(`${p.slug}: needs at least one of repo, video, demo`);
  if (p.updated && !/^\d{4}-\d{2}-\d{2}$/.test(p.updated)) fail(`${p.slug}: bad date ${p.updated}`);
  const frag = `content/projects/${p.slug}.html`;
  if (p.detail && !exists(frag)) fail(`${p.slug}: detail page enabled but ${frag} is missing`);
  if (!p.detail && exists(frag)) fail(`${p.slug}: ${frag} exists but detail is false`);
}
for (const p of projects) for (const r of p.related || []) if (!bySlug.has(r)) fail(`${p.slug}: unknown related slug ${r}`);
for (const u of updates) if (u.project && !bySlug.has(u.project)) fail(`update ${u.date}: unknown project ${u.project}`);
for (const a of writing.articles) {
  if (!exists(`content/writing/${a.slug}.html`)) fail(`article ${a.slug}: body missing`);
  if (a.project && !bySlug.has(a.project)) fail(`article ${a.slug}: unknown project ${a.project}`);
}
for (const pub of research.publications) {
  if (!exists(pub.pdf)) fail(`publication ${pub.id}: ${pub.pdf} missing`);
  if (pub.related && !bySlug.has(pub.related)) fail(`publication ${pub.id}: unknown related ${pub.related}`);
}
if (errors.length) {
  console.error('Content errors:\n  ' + errors.join('\n  '));
  process.exit(1);
}

// ---------------------------------------------------------------- derived data

const TIER_ORDER = ['featured', 'research', 'project', 'coursework', 'experiment', 'archive'];
const ARCHIVE_TIERS = new Set(['experiment', 'coursework', 'archive']);
const byDateDesc = (a, b) => (b.updated || '0000').localeCompare(a.updated || '0000') || a.title.localeCompare(b.title);
const byTierThenDate = (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || byDateDesc(a, b);

const lastUpdated = [...updates.map((u) => u.date), ...projects.map((p) => p.updated || '')].sort().pop();
const inCategory = (key) => projects.filter((p) => p.category === key).sort(byTierThenDate);
const archive = projects.filter((p) => ARCHIVE_TIERS.has(p.tier)).sort(byDateDesc);
const researchProjects = projects.filter((p) => p.tier === 'research').sort(byDateDesc);
const researchCount = research.publications.length + researchProjects.length;
const isNew = (key) => projects.some((p) => p.category === key && p.updated && daysBetween(p.updated, lastUpdated) <= 30);
const recent = updates.filter((u) => u.project).slice(0, 3);

const projectUrl = (p) => (p.detail ? `projects/${p.slug}/` : null);
const primaryHref = (p, root) => (p.detail ? root + projectUrl(p) : p.repo || p.demo || p.video);

// ---------------------------------------------------------------- layout

const NAV = [
  ['whats-new/', "What's New?"],
  ['projects/', 'Projects'],
  ['experiments/', 'Experiments'],
  ['writing/', 'Writing'],
  ['about/', 'About'],
  ['resumes/', 'Resumes'],
];

const CSP = [
  "default-src 'none'",
  "style-src 'self'",
  "script-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'", // same-origin only; lets tools such as Lighthouse read robots.txt
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ');

const pages = []; // { out, html, lastmod, inSitemap }

function nav(root, current) {
  const items = NAV.map(([href, label]) => {
    const cur = current === href ? ' aria-current="page"' : '';
    return `<a href="${root}${href}"${cur}>${label}</a>`;
  });
  return `<nav class="main" aria-label="Main"><p>[ ${items.join(' | ')} ]</p></nav>`;
}

function footer(root) {
  return `<footer>
<p><a href="${cfg.github}">GitHub</a> | <a href="mailto:${cfg.email}">Email</a> | <a href="${root}resumes/">Resumes</a> | Last updated ${time(lastUpdated)}</p>
</footer>`;
}

function crumbs(root, trail) {
  const parts = [`<a href="${root}">Top</a>`];
  trail.forEach(([label, href], i) => {
    parts.push(i === trail.length - 1 || !href ? esc(label) : `<a href="${root}${href}">${esc(label)}</a>`);
  });
  return `<nav class="crumbs" aria-label="Breadcrumb"><p>${parts.join(' : ')}</p></nav>`;
}

function page({ out, title, description, body, current = null, home = false, scripts = [], lastmod = lastUpdated, sitemap = true, rootOverride = null }) {
  const depth = out.split('/').length - 1;
  const root = rootOverride ?? (depth ? '../'.repeat(depth) : './');
  const urlPath = out.replace(/index\.html$/, '');
  const canonical = cfg.baseUrl ? cfg.baseUrl + urlPath : null;
  const head = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<meta http-equiv="Content-Security-Policy" content="${CSP}">`,
    '<meta name="referrer" content="strict-origin-when-cross-origin">',
    '<meta name="color-scheme" content="light">',
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    canonical && sitemap ? `<link rel="canonical" href="${canonical}">` : '',
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(cfg.title)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    canonical && sitemap ? `<meta property="og:url" content="${canonical}">` : '',
    `<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">`,
    `<link rel="stylesheet" href="${root}assets/css/site.css">`,
    ...scripts.map((s) => `<script src="${root}${s}" defer></script>`),
    '</head>',
  ].filter(Boolean);

  const top = home
    ? `<header>
<h1><a href="./" aria-current="page">${esc(cfg.identity)}</a> — A Guide to My Work</h1>
<p class="tagline">${esc(cfg.tagline)}</p>
${nav(root, current)}
</header>`
    : `<header>
<p class="site"><a href="${root}">${esc(cfg.identity)}</a> — A Guide to My Work</p>
${nav(root, current)}
</header>`;

  const html = `${head.join('\n')}
<body>
<a class="skip" href="#main">Skip to content</a>
${top}
<hr>
<main id="main">
${body.replace(/\{\{root\}\}/g, root).trim()}
</main>
<hr>
${footer(root)}
</body>
</html>
`;
  pages.push({ out, html, lastmod, inSitemap: sitemap });
}

// ---------------------------------------------------------------- fragments

function linkList(p, root, { includeRepo }) {
  const links = [];
  if (includeRepo && p.repo) links.push(`<a href="${p.repo}">Source${vh('for ' + p.title)}</a>`);
  if (p.demo) links.push(`<a href="${p.demo}">Play in browser${vh(p.title)}</a>`);
  if (p.video) links.push(`<a href="${p.video}">Video${vh('of ' + p.title)}</a>`);
  if (p.download) links.push(`<a href="${p.download}">Download APK${vh('for ' + p.title)}</a>`);
  if (p.docs) links.push(`<a href="${p.docs}">Documentation${vh('for ' + p.title)}</a>`);
  // When the title itself already points at an external URL, don't repeat that URL.
  const titleTarget = p.detail ? null : primaryHref(p, root);
  return links.filter((l) => !titleTarget || !l.startsWith(`<a href="${titleTarget}"`));
}

function entry(p, root, { showCategory = false } = {}) {
  const meta = [esc(p.period), esc(p.status)];
  if (showCategory) meta.unshift(`<a href="${root}projects/${p.category}/">${esc(cats.get(p.category).name)}</a>`);
  const links = linkList(p, root, { includeRepo: p.detail });
  const titleLink = `<a class="t" href="${primaryHref(p, root)}">${esc(p.title)}</a>`;
  return `<li id="${p.slug}">${titleLink} <em class="tier">${esc(tiers[p.tier])}</em> — ${esc(p.summary)}
<span class="meta">${meta.join(' · ')}${links.length ? ' · ' + links.join(' · ') : ''}</span>
<span class="tags">${p.tags.map(esc).join(', ')}</span></li>`;
}

function directory(root) {
  const items = reg.categories.map((c) => {
    const n = inCategory(c.key).length;
    const fresh = isNew(c.key) ? ' <span class="new">new</span>' : '';
    return `<li><a href="${root}projects/${c.key}/">${esc(c.name)}</a> <span class="n">(${n})</span>${fresh}</li>`;
  });
  return `<ul class="dir">\n${items.join('\n')}\n</ul>`;
}

function updateLine(u, root) {
  if (u.project) {
    const p = bySlug.get(u.project);
    return `<li>${time(u.date)} — <a href="${primaryHref(p, root)}">${esc(p.title)}</a>: ${esc(u.text)}</li>`;
  }
  const text = u.link ? `<a href="${root}${u.link}">${esc(u.text)}</a>` : esc(u.text);
  return `<li>${time(u.date)} — ${text}</li>`;
}

// ---------------------------------------------------------------- pages

// Home
page({
  out: 'index.html',
  title: cfg.title,
  description: `Directory of software projects by ${cfg.identity}: C++ and systems, graphics and GPU, Android, games, machine learning, robotics and web.`,
  home: true,
  body: `
<h2 class="vh">Project directories</h2>
${directory('./')}
<hr>
<h2>Other directories</h2>
<ul class="dir">
<li><a href="./research/">Research and Publications</a> <span class="n">(${researchCount})</span></li>
<li><a href="./experiments/">Experiments and Archive</a> <span class="n">(${archive.length})</span></li>
</ul>
<hr>
<h2>Recently updated</h2>
<ul class="plain">
${recent.map((u) => updateLine(u, './')).join('\n')}
</ul>`,
});

// Projects index
page({
  out: 'projects/index.html',
  title: `Projects — ${cfg.identity}`,
  description: 'All project directories with counts, and the featured projects.',
  current: 'projects/',
  body: `
${crumbs('../', [['Projects']])}
<h1>Projects</h1>
${directory('../')}
<h2>Featured</h2>
<ul class="entries">
${projects.filter((p) => p.tier === 'featured').sort(byDateDesc).map((p) => entry(p, '../', { showCategory: true })).join('\n')}
</ul>
<p>Prototypes, coursework and older work are also listed in <a href="../experiments/">Experiments and Archive</a>.</p>`,
});

// Category pages
for (const c of reg.categories) {
  const list = inCategory(c.key);
  page({
    out: `projects/${c.key}/index.html`,
    title: `${c.name} — ${cfg.identity}`,
    description: `${c.name}: ${list.map((p) => p.title).join(', ')}.`,
    current: null,
    lastmod: list.map((p) => p.updated || '').sort().pop() || lastUpdated,
    body: `
${crumbs('../../', [['Projects', 'projects/'], [c.name]])}
<h1>${esc(c.name)}</h1>
<ul class="entries">
${list.map((p) => entry(p, '../../')).join('\n')}
</ul>`,
  });
}

// Project detail pages
for (const p of projects.filter((x) => x.detail)) {
  const root = '../../';
  const cat = cats.get(p.category);
  const links = linkList(p, root, { includeRepo: true });
  const related = (p.related || []).map((s) => bySlug.get(s));
  const articles = writing.articles.filter((a) => a.project === p.slug);
  const refs = [];
  if (p.repo) refs.push(`<li>Repository: <a href="${p.repo}">${esc(p.repo.replace('https://', ''))}</a></li>`);
  for (const a of articles) refs.push(`<li>Article: <a href="${root}writing/${a.slug}/">${esc(a.title)}</a></li>`);
  for (const r of related) refs.push(`<li>Related: <a href="${primaryHref(r, root)}">${esc(r.title)}</a> — ${esc(r.summary)}</li>`);
  page({
    out: `projects/${p.slug}/index.html`,
    title: `${p.title} — ${cfg.identity}`,
    description: p.summary,
    lastmod: p.updated || lastUpdated,
    body: `
${crumbs(root, [['Projects', 'projects/'], [cat.name, `projects/${cat.key}/`], [p.title]])}
<h1>${esc(p.title)}</h1>
<p class="lede">${esc(p.summary)}</p>
<dl class="facts">
<dt>Technologies</dt><dd>${p.tags.map(esc).join(', ')}</dd>
<dt>Period</dt><dd>${esc(p.period)}</dd>
<dt>Status</dt><dd>${esc(p.status)}</dd>
<dt>Directory</dt><dd><a href="${root}projects/${cat.key}/">${esc(cat.name)}</a> · ${esc(tiers[p.tier])}</dd>
${links.length ? `<dt>Links</dt><dd>${links.join(' · ')}</dd>` : ''}
</dl>
${read(`content/projects/${p.slug}.html`)}
<h2 id="source">Source and references</h2>
<ul class="plain">
${refs.join('\n')}
</ul>`,
  });
}

// Experiments and Archive
{
  const root = '../';
  const items = archive.map((p) => {
    const text = [p.title, p.summary, p.tags.join(' '), cats.get(p.category).name, tiers[p.tier]].join(' ').toLowerCase();
    const href = primaryHref(p, root);
    const year = p.year ? String(p.year) : 'Undated';
    const extra = linkList(p, root, { includeRepo: p.detail });
    return `<li data-cat="${p.category}" data-text="${esc(text)}"><a class="t" href="${href}">${esc(p.title)}</a> (${year}) <em class="tier">${esc(tiers[p.tier])}</em> — ${esc(p.summary)}
<span class="meta"><a href="${root}projects/${p.category}/">${esc(cats.get(p.category).name)}</a> · ${esc(p.status)}${extra.length ? ' · ' + extra.join(' · ') : ''}</span></li>`;
  });
  const options = reg.categories
    .filter((c) => archive.some((p) => p.category === c.key))
    .map((c) => `<option value="${c.key}">${esc(c.name)}</option>`);
  page({
    out: 'experiments/index.html',
    title: `Experiments and Archive — ${cfg.identity}`,
    description: 'Prototypes, learning exercises, coursework and older work, newest first.',
    current: 'experiments/',
    scripts: ['assets/js/filter.js'],
    body: `
${crumbs(root, [['Experiments and Archive']])}
<h1>Experiments and Archive</h1>
<p>Prototypes, learning exercises, coursework and older work, newest first.</p>
<div class="filter" id="filter">
<label for="q">Search</label> <input type="search" id="q" autocomplete="off" spellcheck="false">
<label for="cat">Category</label> <select id="cat"><option value="">All</option>${options.join('')}</select>
<output id="count" for="q cat" aria-live="polite">${archive.length} entries</output>
</div>
<ol class="entries" id="list">
${items.join('\n')}
</ol>`,
  });
}

// Research and Publications
{
  const root = '../';
  const pubs = research.publications.map((r) => {
    const rel = bySlug.get(r.related);
    const pdfKB = Math.round(fs.statSync(path.join(ROOT, r.pdf)).size / 1024);
    return `<article class="record" id="${r.id}">
<h3>${esc(r.title)}</h3>
<dl class="facts">
<dt>Type</dt><dd>${esc(r.kind)}</dd>
<dt>Status</dt><dd><strong>${esc(r.status)}</strong></dd>
<dt>Application no.</dt><dd>${esc(r.applicationNumber)}</dd>
<dt>Publication no.</dt><dd>${esc(r.publicationNumber)}</dd>
<dt>Filed</dt><dd>${time(r.filingDate)}</dd>
<dt>Published</dt><dd>${time(r.publicationDate)} (${esc(r.journal)})</dd>
<dt>Office</dt><dd>${esc(r.office)}</dd>
<dt>Inventors</dt><dd>${r.inventors.map(esc).join('; ')}</dd>
<dt>Applicant</dt><dd>${esc(r.applicant)}</dd>
<dt>Classification</dt><dd>${esc(r.classification)}</dd>
<dt>Document</dt><dd><a href="${root}${r.pdf}">${esc(r.publicationNumber)} publication (PDF, ${pdfKB} KB)</a></dd>
</dl>
<p>${esc(r.titleNote)}</p>
<p><b>Disclosure summary.</b> ${esc(r.abstract)}</p>
${rel ? `<p><b>Related engineering work:</b> <a href="${primaryHref(rel, root)}">${esc(rel.title)}</a>. ${esc(r.relatedNote)}</p>` : ''}
</article>`;
  });
  page({
    out: 'research/index.html',
    title: `Research and Publications — ${cfg.identity}`,
    description: 'Published patent application IN202641060337 A1 and research projects.',
    body: `
${crumbs(root, [['Research and Publications']])}
<h1>Research and Publications</h1>
<h2>Patent applications</h2>
${pubs.join('\n')}
<h2>Research projects</h2>
<ul class="entries">
${researchProjects.map((p) => entry(p, root, { showCategory: true })).join('\n')}
</ul>`,
  });
}

// Writing
{
  const root = '../';
  const arts = [...writing.articles].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  page({
    out: 'writing/index.html',
    title: `Writing — ${cfg.identity}`,
    description: 'Technical notes derived from the source code and recorded results of the projects.',
    current: 'writing/',
    body: `
${crumbs(root, [['Writing']])}
<h1>Writing</h1>
<p>Technical notes written from the projects' source and recorded results. Each note states what it is based on.</p>
<ul class="entries">
${arts.map((a) => `<li><a class="t" href="${a.slug}/">${esc(a.title)}</a> — ${esc(a.summary)}
<span class="meta">${time(a.date)} · ${esc(a.basis)}</span></li>`).join('\n')}
</ul>
<h2>Elsewhere</h2>
<ul class="entries">
${writing.external.map((x) => `<li><a class="t" href="${x.url}">${esc(x.title)}</a> — ${esc(x.summary)}
<span class="meta">${time(x.date)} · ${esc(x.kind)}</span></li>`).join('\n')}
</ul>`,
  });
  for (const a of arts) {
    const r2 = '../../';
    const p = a.project ? bySlug.get(a.project) : null;
    page({
      out: `writing/${a.slug}/index.html`,
      title: `${a.title} — ${cfg.identity}`,
      description: a.summary,
      lastmod: a.date,
      body: `
${crumbs(r2, [['Writing', 'writing/'], [a.title]])}
<article>
<h1>${esc(a.title)}</h1>
<p class="meta">${time(a.date)} · ${esc(a.basis)}</p>
${read(`content/writing/${a.slug}.html`)}
${p ? `<p class="meta">Project: <a href="${primaryHref(p, r2)}">${esc(p.title)}</a></p>` : ''}
</article>`,
    });
  }
}

// What's New
page({
  out: 'whats-new/index.html',
  title: `What's New? — ${cfg.identity}`,
  description: 'Dated list of notable project releases and site changes.',
  current: 'whats-new/',
  body: `
${crumbs('../', [["What's New?"]])}
<h1>What's New?</h1>
<ul class="plain dated">
${updates.map((u) => updateLine(u, '../')).join('\n')}
</ul>`,
});

// About
page({
  out: 'about/index.html',
  title: `About — ${cfg.identity}`,
  description: `About ${cfg.identity} (${cfg.fullName}): education, interests and contact.`,
  current: 'about/',
  body: `
${crumbs('../', [['About']])}
<h1>${esc(cfg.identity)}</h1>
${read('content/pages/about.html')}`,
});

// Resumes
{
  const items = resumes.map((r) => {
    const rel = `resumes/pdf/${r.file}`;
    const label = esc(r.title) + (r.default ? ' <em>(default)</em>' : '');
    if (!exists(rel)) return `<li>${label} — not generated yet.<span class="meta">${esc(r.focus)}</span></li>`;
    const kb = Math.round(fs.statSync(path.join(ROOT, rel)).size / 1024);
    return `<li><a class="t" href="pdf/${r.file}">${esc(r.title)}</a>${r.default ? ' <em>(default)</em>' : ''} — PDF, ${kb} KB
<span class="meta">${esc(r.focus)}</span></li>`;
  });
  page({
    out: 'resumes/index.html',
    title: `Resumes — ${cfg.identity}`,
    description: `Role-specific resumes for ${cfg.fullName} (PDF).`,
    current: 'resumes/',
    body: `
${crumbs('../', [['Resumes']])}
<h1>Resumes</h1>
<p>${esc(cfg.fullName)}. Each resume is a one-column, text-based PDF that covers different projects for a different kind of role.</p>
<ul class="entries">
${items.join('\n')}
</ul>
<p>Generated from Typst sources in the repository (<code>resumes/sources/</code>).</p>`,
  });
}

// 404 (served for any missing path, so links are root-absolute)
{
  const base = cfg.baseUrl ? new URL(cfg.baseUrl).pathname : '/';
  page({
    out: '404.html',
    title: `Not found — ${cfg.identity}`,
    description: 'Page not found.',
    sitemap: false,
    rootOverride: base,
    body: `
<h1>Not found</h1>
<p>There is no page at this address. Try the <a href="${base}">directory</a>.</p>`,
  });
}

// ---------------------------------------------------------------- write

function writeOut(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

if (OUT === ROOT) {
  for (const d of GENERATED_DIRS) fs.rmSync(path.join(ROOT, d), { recursive: true, force: true });
  for (const f of GENERATED_FILES) fs.rmSync(path.join(ROOT, f), { force: true });
}

for (const p of pages) writeOut(p.out, p.html);
writeOut('.nojekyll', '');

if (cfg.baseUrl) {
  const urls = pages.filter((p) => p.inSitemap).map((p) =>
    `<url><loc>${cfg.baseUrl}${p.out.replace(/index\.html$/, '')}</loc><lastmod>${p.lastmod}</lastmod></url>`);
  writeOut('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`);
  writeOut('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${cfg.baseUrl}sitemap.xml\n`);
} else {
  writeOut('robots.txt', 'User-agent: *\nAllow: /\n');
}

console.log(`Built ${pages.length} pages into ${path.relative(process.cwd(), OUT) || '.'} (last updated ${lastUpdated}).`);
