/* eslint-disable import/no-mutable-exports */

import { debug, defaultSettings } from '@/misc/config';
import { registerMessageHandlers } from '@/misc/messaging';
import { Storage } from '@/misc/storage';
import { browser } from 'wxt/browser';

import { messageHandlers } from './messages';
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

// exporting so the message handlers can access the images
export { peopleHandler };

/**
 * Everything the background worker sets up when it starts.
 * Listeners have to be registered synchronously, or the worker misses events
 * that woke it up in the first place.
 */
export const startBackground = () => {
  registerMessageHandlers(messageHandlers);

  /**
   * When the user first installs the extension, open the main page
   */
  browser.runtime.onInstalled.addListener(async (object) => {
    const storage = new Storage({
      area: 'sync',
    });
    const replayConsent = await storage.get('replayConsent');
    const analyticsConsent = await storage.get('analyticsConsent');

    if (object.reason === 'install') {
      await storage.set('hasInstalled', true);
      browser.runtime.setUninstallURL(
        `https://j4a.uk/projects/lighterfuel/uninstall`,
      );
    }

    if (replayConsent === undefined || analyticsConsent === undefined) {
      const consentUrl = browser.runtime.getURL('/consent.html');
      browser.tabs.create({ url: consentUrl });
    }
  });

  try {
    setAndCheckDefaultSettings();

    if (debug) console.log('people handler', peopleHandler);
  } catch (err: any) {
    console.error(`Error caught in background.js: ${err.stack}`);
  }
};
