import { expect, test } from './fixtures';

/**
 * Not a test - this is the one time manual login, run with:
 *
 *   pnpm test:e2e:login
 *
 * It opens chrome with the extension loaded, you log in yourself, and the
 * session is kept in e2e/.auth so the real specs can reuse it.
 */
test('log in to tinder by hand', async ({ context }) => {
  test.skip(
    !process.env.LF_LOGIN,
    'only runs via `pnpm test:e2e:login`',
  );

  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto('https://tinder.com/');

  console.log(
    '\n  Log in to tinder in the window that just opened.\n  This will finish on its own once you reach the swipe page.\n',
  );

  await expect
    .poll(() => page.url(), { timeout: 0, intervals: [2_000] })
    .toContain('/app/');

  console.log('\n  Logged in - session saved to e2e/.auth. You can close the window.\n');
});
