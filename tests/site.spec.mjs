// Browser checks for the built site: layout at many widths, accessibility, keyboard
// order, CSP/console errors, the experiments filter and downloadable PDFs.
// Run with `npx playwright test` (starts a local server on port 4173).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const PAGES = {
  home: '',
  projects: 'projects/',
  category: 'projects/graphics/',
  detail: 'projects/censface-cpp/',
  'detail-images': 'projects/xrivenixai/',
  experiments: 'experiments/',
  research: 'research/',
  writing: 'writing/',
  article: 'writing/chacha20-on-the-gpu/',
  whatsnew: 'whats-new/',
  about: 'about/',
  resumes: 'resumes/',
  notfound: '404.html',
};
const WIDTHS = [320, 360, 375, 390, 414, 768, 1024, 1366, 1920];
const SHOTS = { mobile: 360, desktop: 1366 };

for (const [name, path] of Object.entries(PAGES)) {
  test(`${name}: no horizontal overflow at ${WIDTHS.join('/')}px`, async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test(`${name}: axe finds no violations, no console or CSP errors`, async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(summary, path).toEqual([]);
    expect(errors, path).toEqual([]);
  });
}

// Phones and docks cover the bottom of the screen, so on long pages the footer must
// end well above the viewport edge, and "Last updated <date>" must not split.
test('footer clears the bottom edge on long pages and keeps the date on one line', async ({ browser }) => {
  for (const [width, height] of [[320, 568], [360, 740], [390, 844], [1366, 768]]) {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: width < 800, hasTouch: width < 800 });
    const page = await ctx.newPage();
    for (const path of ['projects/', 'experiments/', 'writing/chacha20-on-the-gpu/']) {
      await page.goto(path);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const m = await page.evaluate(() => {
        const nw = document.createRange();
        nw.selectNodeContents(document.querySelector('footer .nw'));
        return {
          clear: innerHeight - document.querySelector('footer p').getBoundingClientRect().bottom,
          lines: new Set([...nw.getClientRects()].map((r) => Math.round(r.top))).size,
        };
      });
      expect(m.clear, `${path} at ${width}x${height}`).toBeGreaterThanOrEqual(60);
      expect(m.lines, `${path} at ${width}x${height}`).toBe(1);
    }
    await ctx.close();
  }
});

test('screenshots of representative pages (docs/screenshots)', async ({ page }) => {
  fs.mkdirSync('docs/screenshots', { recursive: true });
  for (const name of ['home', 'category', 'detail', 'detail-images', 'experiments', 'research', 'article', 'resumes']) {
    for (const [label, width] of Object.entries(SHOTS)) {
      await page.setViewportSize({ width, height: label === 'mobile' ? 780 : 900 });
      await page.goto(PAGES[name]);
      // Lazy images load only near the viewport: scroll through, then wait for them.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
        await Promise.all([...document.images].map((img) => img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
        window.scrollTo(0, 0);
      });
      await page.screenshot({ path: `docs/screenshots/${name}-${label}.png`, fullPage: true });
    }
  }
});

test('keyboard: skip link first, then title, then navigation in order', async ({ page }) => {
  await page.goto('');
  const order = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => document.activeElement.textContent.trim()));
  }
  expect(order).toEqual(['Skip to content', 'xerf', "What's New?", 'Projects', 'Experiments', 'Writing', 'About', 'Resumes']);
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  expect(outline).not.toBe('none');
});

test('experiments filter narrows the list and is hidden without JavaScript', async ({ page, browser }) => {
  await page.goto('experiments/');
  const total = await page.locator('#list > li').count();
  await page.fill('#q', 'vulkan');
  await expect(page.locator('#list > li:visible')).toHaveCount(1);
  await expect(page.locator('#count')).toHaveText('1 entry');
  await page.fill('#q', '');
  await page.selectOption('#cat', 'ai');
  const ai = await page.locator('#list > li:visible').count();
  expect(ai).toBeGreaterThan(0);
  expect(ai).toBeLessThan(total);

  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const nojs = await ctx.newPage();
  await nojs.goto('http://127.0.0.1:4173/experiments/');
  await expect(nojs.locator('#filter')).toBeHidden();
  await expect(nojs.locator('#list > li:visible')).toHaveCount(total);
  await ctx.close();
});

test('filter controls are at least 16px on phones (iOS Safari zooms on smaller inputs)', async ({ page }) => {
  for (const width of [320, 360, 390, 414]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('experiments/');
    for (const id of ['#q', '#cat']) {
      const px = await page.locator(id).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(px, `${id} at ${width}px`).toBeGreaterThanOrEqual(16);
    }
  }
});

test('resume and patent PDFs download as PDFs', async ({ page, request }) => {
  const links = [];
  for (const p of ['resumes/', 'research/']) {
    await page.goto(p);
    for (const href of await page.locator('a[href$=".pdf"]').evaluateAll((as) => as.map((a) => a.href))) links.push(href);
  }
  expect(links.length).toBe(6);
  for (const href of links) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
    expect(res.headers()['content-type'], href).toContain('application/pdf');
    expect((await res.body()).subarray(0, 5).toString(), href).toBe('%PDF-');
  }
});

test('homepage has the required wording and no introduction paragraph', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('h1')).toHaveText('xerf');
  await expect(page.locator('.tagline')).toHaveText('KISP — Keep It Secure, Performant.');
  await expect(page.locator('nav.main')).toHaveText("[ What's New? | Projects | Experiments | Writing | About | Resumes ]");
  expect(await page.locator('main p').count()).toBe(0);
  expect(await page.locator('img, canvas, video').count()).toBe(0);
});
