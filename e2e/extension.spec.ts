import { expect, test } from './fixtures';

/**
 * The only spec that doesn't need a logged in account - it just checks the
 * built extension loads and injects into tinder.com.
 */
test.describe('extension loads', () => {
  test('the background worker starts', async ({ serviceWorker, extensionId }) => {
    expect(extensionId).toMatch(/^[a-p]{32}$/);
    expect(serviceWorker.url()).toContain('background.js');
  });

  test('the content scripts inject on tinder.com', async ({ context }) => {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto('https://tinder.com/', { waitUntil: 'domcontentloaded' });

    // * the isolated world script adds this stylesheet holder as soon as it
    // * gets settings, and the MAIN world one swaps window.fetch out
    await expect
      .poll(
        () =>
          page.evaluate(
            () => window.fetch.toString().includes('native code') === false,
          ),
        { message: 'the MAIN world fetch interceptor never installed' },
      )
      .toBe(true);
  });

  /**
   * The full message path the MAIN world uses: page -> relay content script ->
   * background worker -> back again.
   */
  test('the relay reaches the background worker', async ({ context }) => {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto('https://tinder.com/', { waitUntil: 'domcontentloaded' });

    const response = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const id = `e2e-${Math.random()}`;

          const listener = (event: MessageEvent) => {
            if (event.source !== window) return;
            const data = event.data as any;
            if (data?.type !== 'lighterfuel-relay-response' || data.id !== id)
              return;

            window.removeEventListener('message', listener);
            resolve(data.body);
          };

          window.addEventListener('message', listener);
          window.postMessage(
            { type: 'lighterfuel-relay-request', id, name: 'pong' },
            '*',
          );

          setTimeout(() => resolve('timed out'), 10_000);
        }),
    );

    expect(response).toEqual({ msg: 'pong' });
  });
});
