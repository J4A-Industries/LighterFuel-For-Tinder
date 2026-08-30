import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  type BrowserContext,
  type Page,
  type Worker,
  chromium,
  test as base,
} from '@playwright/test';

export const extensionPath = resolve(__dirname, '../.output/chrome-mv3');
/** The browser profile holding the tinder login, created by `pnpm test:e2e:login` */
export const profilePath = resolve(__dirname, './.auth/chrome-profile');

export const recsUrl = 'https://tinder.com/app/recs';

/**
 * Launches chrome with the built extension loaded.
 *
 * Headed on purpose - tinder blocks headless browsers, and MV3 extensions are
 * awkward in headless chrome regardless.
 *
 * @param profile The user data dir to launch with
 * @returns The browser context
 */
export const launchWithExtension = (profile: string): Promise<BrowserContext> => {
  if (!existsSync(extensionPath)) {
    throw new Error(
      `No build found at ${extensionPath}. Run \`pnpm build\` first.`,
    );
  }

  return chromium.launchPersistentContext(profile, {
    // * real chrome (137+) silently ignores --load-extension, so the bundled
    // * chromium is the only one that will actually load the build
    channel: process.env.LF_CHROME_CHANNEL ?? 'chromium',
    headless: false,
    viewport: null,
    args: [
      // * chrome 137 dropped --load-extension unless you opt back in
      '--disable-features=DisableLoadExtensionCommandLineSwitch',
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
};

/**
 * The extension's background worker, waiting for it to spin up if chrome
 * hasn't started it yet.
 *
 * @param context The browser context the extension is loaded into
 * @returns The service worker
 */
export const getServiceWorker = async (
  context: BrowserContext,
): Promise<Worker> =>
  context.serviceWorkers()[0] ?? context.waitForEvent('serviceworker');

type ExtensionFixtures = {
  context: BrowserContext;
  serviceWorker: Worker;
  extensionId: string;
  /** A tinder tab, already on the swipe page, skipping the test if logged out */
  recsPage: Page;
};

export const test = base.extend<ExtensionFixtures>({
  context: async ({}, use) => {
    const context = await launchWithExtension(profilePath);
    await use(context);
    await context.close();
  },

  serviceWorker: async ({ context }, use) => {
    await use(await getServiceWorker(context));
  },

  extensionId: async ({ serviceWorker }, use) => {
    await use(new URL(serviceWorker.url()).host);
  },

  recsPage: async ({ context }, use) => {
    const page = context.pages()[0] ?? (await context.newPage());

    await page.goto(recsUrl, { waitUntil: 'domcontentloaded' });
    // * tinder bounces logged out visitors back to the landing page
    await page.waitForTimeout(5_000);

    if (!page.url().includes('/app/')) {
      test.skip(
        true,
        'Not logged in to tinder - run `pnpm test:e2e:login` first.',
      );
    }

    await use(page);
  },
});

export const { expect } = base;
