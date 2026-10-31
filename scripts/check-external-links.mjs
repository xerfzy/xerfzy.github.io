#!/usr/bin/env node
// Checks every external http(s) link in the built pages and the resume PDFs.
//   node scripts/check-external-links.mjs
// Each URL gets up to 3 attempts with a 30 s timeout (HEAD, then GET when HEAD is
// refused). Results are grouped so that real breakage (404/410) is not confused
// with network failures or hosts that refuse automated requests (403/429).

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules', 'content', 'docs', 'scripts', 'tests', 'test-results']);
const walk = (d, out = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

const urls = new Map(); // url -> Set(source)
const add = (u, src) => { if (!urls.has(u)) urls.set(u, new Set()); urls.get(u).add(src); };
for (const f of walk(ROOT)) {
  const r = path.relative(ROOT, f);
  if (f.endsWith('.html')) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/href="(https?:[^"]+)"/g)) add(m[1], r);
  } else if (f.endsWith('.pdf') && r.startsWith('resumes/pdf/')) {
    const text = execFileSync('pdftotext', [f, '-'], { encoding: 'utf8' });
    for (const m of text.matchAll(/((?:github\.com|xerfzy\.github\.io)\/[\w./-]+)/g)) add('https://' + m[1], r);
  }
}

async function probe(url) {
  let last = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const method of ['HEAD', 'GET']) {
      try {
        const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(30_000),
          headers: { 'user-agent': 'portfolio-link-check/1.0' } });
        if (method === 'GET' || res.status < 400 || ![403, 405, 501].includes(res.status)) {
          if (method === 'GET') res.body?.cancel();
          return { status: res.status, final: res.url };
        }
      } catch (e) {
        last = e.cause?.code || e.name || String(e);
        break; // network-level failure: retry the whole attempt after a pause
      }
    }
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  return { status: 0, error: last };
}

// The site's own canonical/og URLs only resolve once the site is deployed there.
const { baseUrl } = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8'));
const ownPages = new Set(walk(ROOT).filter((f) => f.endsWith('.html'))
  .map((f) => baseUrl + path.relative(ROOT, f).replace(/index\.html$/, '')));
const own = [...urls.keys()].filter((u) => ownPages.has(u));
for (const u of own) urls.delete(u);
if (own.length) console.log(`Skipped ${own.length} canonical URLs on ${baseUrl} (this site; valid only after deployment).`);

const results = { ok: [], broken: [], blocked: [], network: [], other: [] };
const list = [...urls.keys()].sort();
const queue = [...list];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const u = queue.shift();
    const r = await probe(u);
    const entry = { url: u, ...r, from: [...urls.get(u)].slice(0, 3) };
    if (r.status >= 200 && r.status < 400) results.ok.push(entry);
    else if ([404, 410].includes(r.status)) results.broken.push(entry);
    else if ([401, 403, 429, 999].includes(r.status)) results.blocked.push(entry); // 999: LinkedIn bot block
    else if (r.status === 0) results.network.push(entry);
    else results.other.push(entry);
  }
}));

console.log(`Checked ${list.length} external URLs: ${results.ok.length} ok, ${results.broken.length} broken, ` +
  `${results.blocked.length} refused automated access, ${results.network.length} network errors, ${results.other.length} other.`);
for (const k of ['broken', 'blocked', 'network', 'other']) {
  for (const e of results[k]) console.log(`  ${k.toUpperCase()} ${e.status || e.error} ${e.url}  (from ${e.from.join(', ')})`);
}
process.exit(results.broken.length ? 1 : 0);
