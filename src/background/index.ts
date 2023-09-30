/* eslint-disable import/no-mutable-exports */
import { Storage } from '@plasmohq/storage';
import * as Sentry from '@sentry/browser';
import browser from 'webextension-polyfill';
import { debug, defaultSettings } from '@/misc/config';
import { Sites } from '@/misc/types';
import ImageRequestCapturer from './imageRequestCapturer';
import { SENTRY_DSN } from './Misc';
import { AnalyticsEvent } from '~src/misc/GA';

const setDefaultSettings = async () => {
  const storage = new Storage();
  const settings = await storage.get('showSettings');
  if (settings === undefined) {
    await storage.set('showSettings', defaultSettings);
  }
};

const setupSentry = async () => {
  const storage = new Storage({
    area: 'sync',
  });
  const sentryConsent = await storage.get('sentryConsent');
  if (sentryConsent.toLowerCase() === 'true') {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [],
    });
  }
};

let tinderRequestCap: ImageRequestCapturer;
let mambaRequestCap: ImageRequestCapturer;

try {
  setupSentry();
  setDefaultSettings();

  tinderRequestCap = new ImageRequestCapturer(['*://*.gotinder.com/*/*.jpg*', '*://*.gotinder.com/*/*.webp*', '*://*.gotinder.com/*/*.mp4*'], Sites.TINDER);
  mambaRequestCap = new ImageRequestCapturer(['*://*.wmbcdn.com/*'], Sites.MAMBA, 1000);

  // prints the bg instance to the console for debugging!
  if (debug) console.log(tinderRequestCap, mambaRequestCap);
} catch (err: any) {
  console.error(`Error caught in background.js: ${err.stack}`);
}

// exporting so the message handlers can access the images
export {
  tinderRequestCap,
  mambaRequestCap,
};

/**
 * When the user first installs the extension, open the main page
 */
browser.runtime.onInstalled.addListener(async (object) => {
  if (chrome) {
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      const platform = await browser.runtime.getPlatformInfo();
      AnalyticsEvent([
        {
          name: 'install',
          params: {
            platform: platform.os,
          },
        },
      ]);
    }
  }

  const consentUrl = browser.runtime.getURL('tabs/consent.html');
  browser.tabs.create({ url: consentUrl });
});
