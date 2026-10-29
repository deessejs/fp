import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const output = process.env.HOMEPAGE_SCREENSHOT_DIR ?? path.resolve('artifacts/homepage');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH }
    : {}),
  ...(process.env.CHROMIUM_ARGS ? { args: JSON.parse(process.env.CHROMIUM_ARGS) } : {}),
});
const results = [];
try {
  const context = await browser.newContext({
    colorScheme: 'light',
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  assert.equal((await page.goto(baseURL)).status(), 200);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.getByRole('main').count(), 1);
  assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
  assert.equal(await page.getByRole('tabpanel').count(), 1);
  assert.equal(await page.getByRole('tabpanel').locator('figure').count(), 2);
  assert.match(
    await page.locator('h1').evaluate((node) => getComputedStyle(node).fontFamily),
    /Geist/
  );
  assert.equal(
    await page.locator('h1').evaluate((node) => getComputedStyle(node).fontSize),
    '56px'
  );
  results.push('One main, one H1, one panel per example; Geist loaded at 56px desktop.');

  // Each resize mutates the same page, so viewport checks must be sequential.
  await [320, 360, 390, 640, 768, 1024, 1280, 1440, 1536, 1920].reduce(async (previous, width) => {
    await previous;
    await page.setViewportSize({ width, height: 1000 });
    const geometry = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
      localScroll: [...document.querySelectorAll('.marketing-code-scroll')].some(
        (node) => node.scrollWidth > node.clientWidth
      ),
    }));
    assert.ok(
      geometry.page <= geometry.viewport + 1,
      `Page overflow at ${width}px: ${JSON.stringify(geometry)}`
    );
    if (width === 320) {
      assert.ok(geometry.localScroll, 'Code must scroll locally on narrow screens.');
    }
  }, Promise.resolve());
  results.push(
    'No page-level horizontal overflow at 10 viewport widths; code scrolls locally at 320px.'
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  assert.ok(await page.getByRole('navigation', { name: 'Mobile navigation' }).isVisible());
  await page.keyboard.press('Escape');
  assert.ok(!(await page.getByRole('navigation', { name: 'Mobile navigation' }).count()));
  assert.equal(
    await page.getByRole('button', { name: 'Open navigation menu' }).getAttribute('aria-expanded'),
    'false'
  );
  results.push('Mobile navigation opens and dismisses with Escape.');

  await page.getByRole('tab', { name: 'Error handling', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() =>
    document
      .querySelector('[role=tab][aria-selected=true]')
      ?.textContent?.includes('Missing values')
  );
  assert.equal(
    await page
      .getByRole('tab', { name: 'Missing values', exact: true })
      .getAttribute('aria-selected'),
    'true'
  );
  assert.equal(await page.getByRole('tabpanel').count(), 1);
  assert.match(await page.getByRole('tabpanel').innerText(), /Anonymous/);
  await page.getByRole('tab', { name: 'Composition', exact: true }).click();
  assert.match(await page.getByRole('tabpanel').innerText(), /flatMap/);
  results.push(
    'Comparison switches by keyboard and pointer; both code slots follow the single active panel.'
  );

  await page.evaluate(() => {
    window.__copied = null;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value) => {
          window.__copied = value;
        },
      },
    });
  });
  await page.getByRole('button', { name: 'Copy install command', exact: true }).first().click();
  await page.getByRole('button', { name: 'Copied to clipboard', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.__copied), 'npm install @deessejs/fp');
  assert.ok(
    await page.getByRole('button', { name: 'Copied to clipboard', exact: true }).isVisible()
  );
  await page.getByRole('button', { name: 'For agents', exact: true }).click();
  assert.equal(
    await page
      .getByRole('button', { name: 'For agents', exact: true })
      .getAttribute('aria-pressed'),
    'true'
  );
  assert.equal(
    await page.getByRole('button', { name: 'Copied to clipboard', exact: true }).count(),
    0
  );
  await page.getByRole('button', { name: 'Copy install command', exact: true }).first().click();
  await page.getByRole('button', { name: 'Copied to clipboard', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.__copied), 'npx skills add deessejs/fp');
  await page.getByRole('button', { name: 'For humans', exact: true }).click();
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Denied');
        },
      },
    })
  );
  await page.getByRole('button', { name: 'Copy install command', exact: true }).first().click();
  await page.getByText('Copy failed. Select and copy the text manually.').waitFor();
  assert.ok(await page.getByText('Copy failed. Select and copy the text manually.').isVisible());
  assert.equal(
    await page.getByRole('button', { name: 'Copied to clipboard', exact: true }).count(),
    0
  );
  results.push(
    'Clipboard writes exact commands; audience changes reset feedback; denied copies show an error.'
  );

  // Reset transient feedback before taking reference screenshots.
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.waitForFunction(() => window.scrollY === 0);
  await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
  await page.screenshot({ path: path.join(output, 'desktop-hero.png') });
  const lightToken = await page
    .locator('.marketing-code .shiki span')
    .first()
    .evaluate((node) => getComputedStyle(node).color);
  await page.getByRole('button', { name: 'Toggle Theme', exact: true }).click();
  await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
  const darkToken = await page
    .locator('.marketing-code .shiki span')
    .first()
    .evaluate((node) => getComputedStyle(node).color);
  assert.notEqual(lightToken, darkToken);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.waitForFunction(() => window.scrollY === 0);
  await page.screenshot({ path: path.join(output, 'desktop-dark.png'), fullPage: true });
  results.push('Theme switch changes the actual syntax-token palette.');

  await page.getByRole('button', { name: 'Toggle Theme', exact: true }).click();
  await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.waitForFunction(() => window.scrollY === 0);
  await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
  await page.screenshot({ path: path.join(output, 'mobile-hero.png') });
  const ctas = await page
    .locator('.home-button')
    .evaluateAll((nodes) => nodes.slice(0, 2).map((node) => node.getBoundingClientRect().top));
  assert.ok(Math.abs(ctas[0] - ctas[1]) < 1, 'Hero CTAs should share a row at 390px.');

  const urls = await page
    .locator('a[href^="/"]')
    .evaluateAll((nodes) => [...new Set(nodes.map((node) => new URL(node.href).pathname))]);
  await Promise.all(
    urls.map(async (url) => {
      assert.equal(
        (await context.request.get(new URL(url, baseURL).href)).status(),
        200,
        `Broken internal link: ${url}`
      );
    })
  );
  assert.equal((await page.goto(new URL('/docs/result', baseURL).href)).status(), 200);
  assert.equal(await page.locator('.fp-home').count(), 0);
  assert.ok(await page.getByRole('heading', { name: 'Result', exact: true }).first().isVisible());
  results.push('Every homepage internal route returns 200; docs retain their own layout.');
  assert.deepEqual(errors, []);
  await writeFile(
    path.join(output, 'verification.json'),
    JSON.stringify({ passed: true, results, browser: browser.version() }, null, 2) + '\n'
  );
  process.stdout.write(results.map((result) => `PASS ${result}`).join('\n') + '\n');
  await context.close();
} finally {
  await browser.close();
}
