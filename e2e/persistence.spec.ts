import type { BrowserContext, Page } from '@playwright/test';

import { getCardState, photoIdFromUrl } from './tinder';
import { expect, test } from './fixtures';

/**
 * Kills the background worker the way chrome does when it goes idle.
 *
 * @param context The browser context
 * @param page A page to open a CDP session from
 * @param extensionId The extension's id
 */
const killServiceWorker = async (
  context: BrowserContext,
  page: Page,
  extensionId: string,
) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Target.setDiscoverTargets', { discover: true });

  const { targetInfos } = (await cdp.send('Target.getTargets')) as any;
  const worker = targetInfos.find(
    (target: any) =>
      target.type === 'service_worker' && target.url.includes(extensionId),
  );

  expect(worker, 'could not find the background worker to kill').toBeTruthy();

  await cdp.send('Target.closeTarget', { targetId: worker.targetId });
  await cdp.detach();
};

test.describe('surviving the background worker being killed', () => {
  test('the people cache is written to session storage', async ({
    recsPage,
    serviceWorker,
  }) => {
    // * wait until the extension has actually seen some profiles
    await expect
      .poll(async () => (await getCardState(recsPage)).href, { timeout: 45_000 })
      .toMatch(/^https:/);

    const readCache = (): Promise<any> =>
      serviceWorker.evaluate(() =>
        (globalThis as any).chrome.storage.session.get('peopleCache'),
      );

    await expect
      .poll(
        async () => {
          const stored = await readCache();
          if (!stored?.peopleCache) return 0;
          return JSON.parse(stored.peopleCache).length;
        },
        { message: 'nothing was ever cached to session storage' },
      )
      .toBeGreaterThan(0);

    const people = JSON.parse((await readCache()).peopleCache);
    // * only the slim projection should be in there
    expect(Object.keys(people[0]).sort()).toEqual([
      '_id',
      'addedAt',
      'photos',
      'type',
    ]);
  });

  /**
   * The regression test for lighterfuel going blank after leaving tinder alone
   * for a few minutes: MV3 shuts the worker down, and the people list used to
   * die with it.
   */
  test('the overlay still works after the worker restarts', async ({
    context,
    recsPage,
    extensionId,
  }) => {
    await expect
      .poll(async () => (await getCardState(recsPage)).href, { timeout: 45_000 })
      .toMatch(/^https:/);

    const before = photoIdFromUrl((await getCardState(recsPage)).displayed);

    await killServiceWorker(context, recsPage, extensionId);

    // * no waiting on a 'serviceworker' event here - chrome restarts the worker
    // * the moment the content script's next poll arrives, which can happen
    // * before we'd even started listening. The overlay coming back is the
    // * thing we actually care about.
    await expect
      .poll(async () => photoIdFromUrl((await getCardState(recsPage)).href), {
        message:
          'the overlay never came back after the worker restarted - the people cache was lost',
        timeout: 45_000,
      })
      .toBe(before);
  });
});
