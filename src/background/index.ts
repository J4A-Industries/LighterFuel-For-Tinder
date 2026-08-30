/* eslint-disable import/no-mutable-exports */

import { announcementVersion, debug, defaultSettings } from '@/misc/config';
import { registerMessageHandlers } from '@/misc/messaging';
import { Storage } from '@/misc/storage';
import { browser } from 'wxt/browser';

import { shouldOpenAnnouncement } from './announcement';
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

/**
 * Opens the what's new page, unless this user has already seen this one.
 *
 * @param storage The sync storage the seen marker lives in
 */
const openAnnouncementIfUnseen = async (storage: Storage, reason: string) => {
  const seen = await storage.get<string>('announcementSeen');
  if (!shouldOpenAnnouncement(reason, seen, announcementVersion)) return;

  await storage.set('announcementSeen', announcementVersion);
  await browser.tabs.create({ url: browser.runtime.getURL('/review.html') });
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
   * On install we ask for consent, and on update we show what's new - but only
   * once per announcement, so a reload or a patch release doesn't nag anyone.
   */
  browser.runtime.onInstalled.addListener(async (object) => {
    const storage = new Storage({
      area: 'sync',
    });
    const replayConsent = await storage.get('replayConsent');
    const analyticsConsent = await storage.get('analyticsConsent');
    const needsConsent =
      replayConsent === undefined || analyticsConsent === undefined;

    if (object.reason === 'install') {
      await storage.set('hasInstalled', true);
      // * a new user hasn't missed anything, so don't announce what shipped
      // * before they arrived
      await storage.set('announcementSeen', announcementVersion);
      browser.runtime.setUninstallURL(
        `https://j4a.uk/projects/lighterfuel/uninstall`,
      );
    }

    if (needsConsent) {
      browser.tabs.create({ url: browser.runtime.getURL('/consent.html') });
      return;
    }

    await openAnnouncementIfUnseen(storage, object.reason);
  });

  try {
    setAndCheckDefaultSettings();

    if (debug) console.log('people handler', peopleHandler);
  } catch (err: any) {
    console.error(`Error caught in background.js: ${err.stack}`);
  }
};
