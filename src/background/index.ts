/* eslint-disable import/no-mutable-exports */
import { Storage } from '@plasmohq/storage';
import { debug, defaultSettings } from '@/misc/config';
import { Sites } from '@/misc/types';
import ImageRequestCapturer from './imageRequestCapturer';
import { AnalyticsEvent } from '~src/misc/GA';
import { PeopleHandler } from './PeopleHandler';

const setAndCheckDefaultSettings = async () => {
  const storage = new Storage();
  const settings = await storage.get('showSettings');
  if (settings === undefined) {
    await storage.set('showSettings', defaultSettings);
  }

  const analyticsConsent = await storage.get('analyticsConsent');
  if (analyticsConsent === undefined) {
    await storage.set('analyticsConsent', 'true');
  }
  const replayConsent = await storage.get('replayConsent');
  if (replayConsent === undefined) {
    const sentryConsent = await storage.get('sentryConsent');
    if (sentryConsent === undefined) {
      await storage.set('sentryConsent', 'true');
    } else {
      await storage.set('replayConsent', sentryConsent);
    }
  }
};

let mambaRequestCap: ImageRequestCapturer;
let peopleHandler: PeopleHandler;

try {
  setAndCheckDefaultSettings();

  peopleHandler = new PeopleHandler();

  mambaRequestCap = new ImageRequestCapturer(['*://*.wmbcdn.com/*'], Sites.MAMBA, 1000);

  // prints the bg instance to the console for debugging!
  if (debug) console.log(mambaRequestCap);
  if (debug) console.log('people handler', peopleHandler);
} catch (err: any) {
  console.error(`Error caught in background.js: ${err.stack}`);
}

// exporting so the message handlers can access the images
export {
  peopleHandler,
  mambaRequestCap,
};

/**
 * When the user first installs the extension, open the main page
 */
chrome.runtime.onInstalled.addListener(async (object) => {
  const platform = await chrome.runtime.getPlatformInfo();
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    const clientId = await AnalyticsEvent([
      {
        name: 'install',
        params: {
          platform: platform.os,
        },
      },
    ]);
    chrome.runtime.setUninstallURL(`https://j4a.uk/projects/lighterfuel/uninstall?clientId=${clientId}`);
  } else if (object.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    await AnalyticsEvent([
      {
        name: 'update',
        params: {
          platform: platform.os,
        },
      },
    ]);
    // chrome.tabs.create({ url: chrome.runtime.getURL('tabs/review.html') });
  }

  const storage = new Storage({
    area: 'sync',
  });
  const replayConsent = await storage.get('replayConsent');
  const analyticsConsent = await storage.get('analyticsConsent');

  if (replayConsent === undefined || analyticsConsent === undefined) {
    const consentUrl = chrome.runtime.getURL('tabs/consent.html');
    chrome.tabs.create({ url: consentUrl });
  }
});
