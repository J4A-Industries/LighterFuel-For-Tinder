const { chromium } = require('@playwright/test');
const path = require('path');
const os = require('os');
const fs = require('fs');

(async () => {
  const ext = path.resolve('.output/chrome-mv3');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lf-open-'));

  const ctx = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless: false,
    viewport: null,
    args: [
      '--disable-features=DisableLoadExtensionCommandLineSwitch',
      `--disable-extensions-except=${ext}`,
      `--load-extension=${ext}`,
    ],
  });

  const worker = ctx.serviceWorkers()[0] || (await ctx.waitForEvent('serviceworker'));
  const id = new URL(worker.url()).host;

  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto(`chrome-extension://${id}/review.html`);

  console.log(`\n  Announcement page open at:\n  chrome-extension://${id}/review.html`);
  console.log(`  Popup:  chrome-extension://${id}/popup.html`);
  console.log(`  Consent/settings: chrome-extension://${id}/consent.html`);
  console.log('\n  Close the browser window when you are done.\n');

  await ctx.waitForEvent('close', { timeout: 0 });
})();
