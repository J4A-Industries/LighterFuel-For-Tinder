import { defineConfig } from '@playwright/test';

/**
 * These tests drive the real tinder site with a real logged in account, so
 * they're deliberately kept out of CI:
 *  - tinder blocks headless/automated browsers, so everything runs headed
 *  - one worker only, because it's one account and one session
 *  - nothing in here swipes, likes or messages anyone, it only looks at the
 *    photos already on screen
 *
 * Run `pnpm test:e2e:login` once to create the browser profile before running.
 */
export default defineConfig({
  testDir: './e2e',
  // * the real site is slow and we wait on tinder's own network calls
  timeout: 120_000,
  expect: { timeout: 30_000 },
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 0 : 1,
  reporter: [['list']],
  use: {
    actionTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
