#!/usr/bin/env node
// Static checks for the site's HTML files.
//   node scripts/check.mjs
// Exits non-zero if anything fails. Needs `npm install` for html-validate.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (f) => path.relative(ROOT, f);
const problems = [];
const fail = (area, msg) => problems.push(`[${area}] ${msg}`);
const read = (f) => fs.readFileSync(f, 'utf8');

const SKIP = new Set(['.git', 'node_modules', 'test-results', 'playwright-report', '.lighthouse']);
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const count = (file, re) => (read(path.join(ROOT, file)).match(re) || []).length;

// 1. sitemap.xml lists every page (except 404) and nothing that doesn't exist.
{
  const base = (read(path.join(ROOT, 'robots.txt')).match(/Sitemap: (\S+)sitemap\.xml/) || [])[1];
  if (!base) fail('sitemap', 'robots.txt has no Sitemap line');
  else {
    const listed = new Set([...read(path.join(ROOT, 'sitemap.xml')).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
    const pages = new Set(htmlFiles.map(rel).filter((r) => r !== '404.html').map((r) => base + r.replace(/index\.html$/, '')));
    for (const u of pages) if (!listed.has(u)) fail('sitemap', `${u} is missing from sitemap.xml`);
    for (const u of listed) if (!pages.has(u)) fail('sitemap', `sitemap.xml lists ${u}, but there is no such page`);
  }
}

// 2. HTML validation.
{
  const bin = path.join(ROOT, 'node_modules/.bin/html-validate');
  if (!fs.existsSync(bin)) fail('html', 'html-validate not installed (npm install)');
  else {
    const r = spawnSync(bin, ['--formatter', 'text', ...htmlFiles.map(rel)], { cwd: ROOT, encoding: 'utf8' });
    if (r.status !== 0) fail('html', (r.stdout + r.stderr).trim());
  }
}

// 3. JavaScript syntax.
for (const f of files.filter((f) => /\.(m?js)$/.test(f) && !rel(f).startsWith('node_modules'))) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) fail('js', `${rel(f)}: ${r.stderr.trim()}`);
}

// 4. Links, anchors, IDs, images and inline code in every page.
const idsByFile = new Map();
const getIds = (f) => {
  if (!idsByFile.has(f)) idsByFile.set(f, new Set([...read(f).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idsByFile.get(f);
};
let internalLinks = 0;
for (const f of htmlFiles) {
  const html = read(f);
  const r = rel(f);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) fail('ids', `${r}: duplicate id(s) ${[...new Set(dup)].join(', ')}`);
  if (/\sstyle="/i.test(html)) fail('csp', `${r}: inline style attribute`);
  if (/<script(?![^>]*\ssrc=)[^>]*>/i.test(html)) fail('csp', `${r}: inline script`);
  if (/\son[a-z]+="/i.test(html)) fail('csp', `${r}: inline event handler`);
  if (/href="#"/.test(html)) fail('links', `${r}: placeholder href="#"`);
  if (/target="_blank"(?![^>]*noopener)/.test(html)) fail('links', `${r}: target=_blank without rel=noopener`);
  for (const m of html.matchAll(/<img\b([^>]*)>/g)) {
    for (const a of ['src', 'alt', 'width', 'height']) if (!new RegExp(`\\s${a}="`).test(m[1])) fail('img', `${r}: <img> without ${a}`);
  }
  if (r === '404.html') continue; // root-absolute links, checked by the browser tests
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|data:)/.test(url)) continue;
    internalLinks++;
    const [p, hash] = url.split('#');
    let target = p ? path.resolve(path.dirname(f), p) : f;
    if (p.endsWith('/') || (fs.existsSync(target) && fs.statSync(target).isDirectory())) target = path.join(target, 'index.html');
    if (!target.startsWith(ROOT)) { fail('links', `${r}: ${url} leaves the site root`); continue; }
    if (!fs.existsSync(target)) { fail('links', `${r}: broken link ${url}`); continue; }
    if (hash && target.endsWith('.html') && !getIds(target).has(hash)) fail('links', `${r}: missing anchor ${url}`);
  }
}

// 5. Each "(n)" on the homepage matches the number of entries on the page it links to.
{
  const home = read(path.join(ROOT, 'index.html'));
  const counted = [...home.matchAll(/<a href="\.\/([^"]+)">([^<]+)<\/a> <span class="n">\((\d+)\)/g)];
  if (counted.length !== 9) fail('counts', `homepage has ${counted.length} counted directories, expected 9`);
  for (const [, dir, name, n] of counted) {
    const file = path.join(dir, 'index.html');
    if (!fs.existsSync(path.join(ROOT, file))) { fail('counts', `${name}: ${file} does not exist`); continue; }
    const listed = dir === 'experiments/' ? count(file, /<li data-cat="/g)
      : dir === 'research/' ? count(file, /class="record"/g) + count(file, /<li id="/g)
      : count(file, /<li id="/g);
    if (listed !== Number(n)) fail('counts', `${name}: homepage says (${n}) but ${file} lists ${listed}`);
  }
}

// 6. Required documents: the patent PDF, and every resume PDF is linked from the resumes page.
{
  if (!fs.existsSync(path.join(ROOT, 'assets/documents/IN202641060337A1.pdf'))) fail('docs', 'missing patent PDF');
  const linked = new Set([...read(path.join(ROOT, 'resumes/index.html')).matchAll(/href="pdf\/([^"]+\.pdf)"/g)].map((m) => m[1]));
  const onDisk = fs.readdirSync(path.join(ROOT, 'resumes/pdf')).filter((f) => f.endsWith('.pdf'));
  if (onDisk.length !== 5) fail('docs', `resumes/pdf has ${onDisk.length} PDFs, expected 5`);
  for (const f of onDisk) if (!linked.has(f)) fail('docs', `resumes/pdf/${f} is not linked from resumes/index.html`);
}

// 7. Nothing private in the published tree. Everything outside .git/node_modules is
//    published by GitHub Pages, so scan all text files (and PDF metadata) for local
//    paths, device serials, registration numbers, keys and unwanted names.
{
  // Generic patterns live here; identifiers that are themselves private (usernames,
  // device serials, excluded names) live in the git-ignored .private-patterns file.
  const everywhere = [
    [/\/home\/[a-z_][\w-]*\//i, 'local home path'],
    [/\b[A-Z]:\\Users\\/i, 'Windows user path'],
    [/\b\d{2}[A-Z]{3}\d{4}\b/, 'university registration number'],
    [/BEGIN [A-Z ]*PRIVATE KEY/, 'private key'],
    [new RegExp(['\\.', 'jks', '\\b'].join('')), 'keystore reference'], // built from parts so it doesn't match itself
  ];
  const privateFile = path.join(ROOT, '.private-patterns');
  if (fs.existsSync(privateFile)) {
    for (const line of read(privateFile).split('\n')) {
      if (!line.trim() || line.startsWith('#')) continue;
      const [label, re] = line.split('\t');
      everywhere.push([new RegExp(re, 'i'), label]);
    }
  } else {
    console.warn('note: .private-patterns not found; only generic privacy patterns were checked');
  }
  const siteOnly = [
    [/\borion\b/i, 'old site name'],
    [/Text File\.txt/, 'private brief'],
    [/linkedin\.com\/?"/i, 'placeholder LinkedIn link'],
  ];
  const textExt = /\.(html|css|js|mjs|json|md|txt|xml|typ|sh|py|svg|yml|yaml)$/i;
  for (const f of files) {
    const r = rel(f);
    if (r === 'Text File.txt' || r === 'package-lock.json' || r === '.private-patterns') continue;
    let body;
    if (textExt.test(f) || path.basename(f).startsWith('.')) body = read(f);
    else if (f.endsWith('.pdf')) body = execFileSync('pdfinfo', [f], { encoding: 'utf8' });
    else continue;
    for (const [re, what] of everywhere) if (re.test(body)) fail('privacy', `${r}: ${what} (${body.match(re)[0]})`);
    const isSite = /\.(html|css|js)$/.test(f) && !r.startsWith('scripts/') && !r.startsWith('tests/');
    if (isSite) for (const [re, what] of siteOnly) if (re.test(body)) fail('privacy', `${r}: ${what}`);
  }
}

// Report
const pages = htmlFiles.length;
if (problems.length) {
  console.error(`${problems.length} problem(s):\n` + problems.map((p) => '  ' + p).join('\n'));
  process.exit(1);
}
console.log(`OK: ${pages} pages, ${internalLinks} internal links/assets, sitemap and counts match, HTML valid, no private strings.`);
