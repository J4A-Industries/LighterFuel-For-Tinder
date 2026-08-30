import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { shouldOpenAnnouncement } from '@/background/announcement';

import { getServiceWorker, launchWithExtension } from './fixtures';

/**
 * These use a throwaway profile rather than the logged-in one, because a fresh
 * profile is what makes chrome fire onInstalled.
 */
const freshProfile = () => mkdtempSync(join(tmpdir(), 'lf-e2e-'));

const readSync = (worker: any, key: string) =>
  worker.evaluate(
    (k: string) => (globalThis as any).chrome.storage.sync.get(k),
    key,
  );

test.describe('the announcement page', () => {
  test('a fresh install does not announce, but records the version', async () => {
    const context = await launchWithExtension(freshProfile());

    try {
      const worker = await getServiceWorker(context);
      await expect
        .poll(async () => (await readSync(worker, 'announcementSeen'))?.announcementSeen)
        .toBe('"1.7.0"');

      const urls = context.pages().map((page) => page.url());
      expect(urls.some((url) => url.includes('review.html'))).toBe(false);
    } finally {
      await context.close();
    }
  });

  test('it says what changed, and only announces once', async () => {
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

/**
 * Chrome only fires onInstalled with reason "update" for a genuine version
 * change, which can't be forced against an unpacked build - reloading one
 * doesn't fire it, and rewriting its manifest stops chrome bringing the worker
 * back at all. So the decision itself is tested directly.
 */
test.describe('when to announce', () => {
  test('only on an update, and only once per announcement', () => {
    // a fresh install gets the consent page instead
    expect(shouldOpenAnnouncement('install', undefined, '1.7.0')).toBe(false);
    expect(shouldOpenAnnouncement('install', '1.6.6', '1.7.0')).toBe(false);

    // a returning user who hasn't seen this one
    expect(shouldOpenAnnouncement('update', '1.6.6', '1.7.0')).toBe(true);
    expect(shouldOpenAnnouncement('update', undefined, '1.7.0')).toBe(true);

    // ...but never twice, so a patch release or a reload doesn't nag
    expect(shouldOpenAnnouncement('update', '1.7.0', '1.7.0')).toBe(false);

    // and nothing else opens it
    expect(shouldOpenAnnouncement('chrome_update', '1.6.6', '1.7.0')).toBe(false);
    expect(shouldOpenAnnouncement('shared_module_update', undefined, '1.7.0')).toBe(false);
  });
});
