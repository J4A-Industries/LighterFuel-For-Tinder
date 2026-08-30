import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { test } from '@playwright/test';

import { getServiceWorker, launchWithExtension } from './fixtures';

/**
 * Writes a picture of every screen the extension has into ./screenshots.
 *
 * Not an assertion - it exists so the UI actually gets looked at rather than
 * only being checked for the presence of text.
 */
const outDir = resolve(__dirname, '../screenshots');

const pages = ['review', 'consent', 'notCWS'];

test('capture every screen', async () => {
  const context = await launchWithExtension(
    mkdtempSync(join(tmpdir(), 'lf-shot-')),
  );

  try {
    const worker = await getServiceWorker(context);
    const id = new URL(worker.url()).host;
    const page = await context.newPage();

    await page.setViewportSize({ width: 420, height: 760 });
    await page.goto(`chrome-extension://${id}/popup.html`);
    await page.waitForTimeout(1200);
    await page
      .locator('body > div')
      .first()
      .screenshot({ path: join(outDir, 'popup.png') });

    await pages.reduce(async (previous, name) => {
      await previous;
      await page.setViewportSize({ width: 1200, height: 900 });
      await page.goto(`chrome-extension://${id}/${name}.html`);
      await page.waitForTimeout(800);
      await page.screenshot({
        path: join(outDir, `${name}.png`),
        fullPage: true,
      });
    }, Promise.resolve());
  } finally {
    await context.close();
  }
});
