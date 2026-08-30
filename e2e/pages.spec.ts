import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { getServiceWorker, launchWithExtension } from './fixtures';

/** A throwaway profile, so these never touch the logged-in tinder session */
const freshProfile = () => mkdtempSync(join(tmpdir(), 'lf-e2e-'));

test.describe("the what's new page", () => {
  test('renders the current release notes', async () => {
    const context = await launchWithExtension(freshProfile());

    try {
      const worker = await getServiceWorker(context);
      const id = new URL(worker.url()).host;
      const page = await context.newPage();

      await page.goto(`chrome-extension://${id}/review.html`);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(
        'Two long-standing bugs',
      );
      await expect(page.getByText('1.7.0')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Leave a review' })).toBeVisible();
      await expect(page.getByText('Earlier versions')).toBeVisible();
    } finally {
      await context.close();
    }
  });
});

test.describe('the popup', () => {
  test('shows status and every setting', async () => {
    const context = await launchWithExtension(freshProfile());

    try {
      const worker = await getServiceWorker(context);
      const id = new URL(worker.url()).host;
      const page = await context.newPage();

      await page.goto(`chrome-extension://${id}/popup.html`);

      await expect(page.getByText('LighterFuel', { exact: true })).toBeVisible();
      await expect(page.getByText('Open Tinder to get going')).toBeVisible();

      // the three settings, each rendered as a real switch
      const switches = page.getByRole('switch');
      await expect(switches).toHaveCount(3);
      await expect(switches.first()).toHaveAttribute('aria-checked', 'true');

      // and flipping one writes through to storage
      await switches.first().click();
      await expect(switches.first()).toHaveAttribute('aria-checked', 'false');
      await expect
        .poll(async () => {
          const stored: any = await worker.evaluate(() =>
            (globalThis as any).chrome.storage.sync.get('showSettings'),
          );
          return JSON.parse(stored.showSettings ?? '{}').overlayButton;
        })
        .toBe(false);
    } finally {
      await context.close();
    }
  });
});

