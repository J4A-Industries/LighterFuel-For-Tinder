/* eslint-disable import/no-mutable-exports */

import { debug, defaultSettings } from '@/misc/config';

import { Storage } from '@plasmohq/storage';

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

const peopleHandler = new PeopleHandler();

try {
  setAndCheckDefaultSettings();

  if (debug) console.log('people handler', peopleHandler);
} catch (err: any) {
  console.error(`Error caught in background.js: ${err.stack}`);
}

// exporting so the message handlers can access the images
export { peopleHandler };

/**
 * When the user first installs the extension, open the main page
 */
chrome.runtime.onInstalled.addListener(async (object) => {
  const storage = new Storage({
    area: 'sync',
  });
  const replayConsent = await storage.get('replayConsent');
  const analyticsConsent = await storage.get('analyticsConsent');

  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    await storage.set('hasInstalled', true);
    chrome.runtime.setUninstallURL(
      `https://j4a.uk/projects/lighterfuel/uninstall`,
    );
  }

  if (replayConsent === undefined || analyticsConsent === undefined) {
    const consentUrl = chrome.runtime.getURL('tabs/consent.html');
    chrome.tabs.create({ url: consentUrl });
  }
});
