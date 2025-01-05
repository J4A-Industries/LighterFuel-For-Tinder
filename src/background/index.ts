/* eslint-disable import/no-mutable-exports */

import { debug, defaultSettings } from '@/misc/config';

import { Storage } from '@plasmohq/storage';

import { FeatureFlagManager } from '~src/background/classes/FeatureFlagManager';
import { ProfileShower } from '~src/background/classes/ProfileShower';
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
const featureFlagManager = new FeatureFlagManager();
let profileShower: ProfileShower;

const getProfileShower = async () => {
  if (!profileShower) {
    await featureFlagManager.init();
    profileShower = new ProfileShower(
      featureFlagManager.data.flags.showProfiles.profiles,
    );
    await profileShower.init();
    return profileShower;
  }
  return profileShower;
};

try {
  setAndCheckDefaultSettings();

  getProfileShower().catch((e) => console.error(e));

  if (debug) console.log('people handler', peopleHandler);
  if (debug) console.log('featureFlagManager', featureFlagManager);
} catch (err: any) {
  console.error(`Error caught in background.js: ${err.stack}`);
}

// exporting so the message handlers can access the images
export { peopleHandler, featureFlagManager, getProfileShower };

/**
 * When the user first installs the extension, open the main page
 */
chrome.runtime.onInstalled.addListener(async (object) => {
  const storage = new Storage({
    area: 'sync',
  });
  const replayConsent = await storage.get('replayConsent');
  const analyticsConsent = await storage.get('analyticsConsent');

  const { installType } = await chrome.management.getSelf();
  const platform = await chrome.runtime.getPlatformInfo();
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    let clientId = await storage.get<string | undefined>('clientId');
    const hasInstalled = await storage.get('hasInstalled');
    if (clientId === undefined) {
      clientId = await AnalyticsEvent([
        {
          name: 'install',
          params: {
            platform: platform.os,
            installType,
            hasInstalled: `${hasInstalled}`,
          },
        },
      ]);
    }

    await storage.set('hasInstalled', true);
    chrome.runtime.setUninstallURL(
      `https://j4a.uk/projects/lighterfuel/uninstall?clientId=${clientId}`,
    );
  } else if (object.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    const clientId = await storage.get('clientId');
    console.log(
      `ClientID: ${clientId}, clientID type: ${typeof clientId}, clientID length: ${
        clientId.length
      }`,
    );

    const currentVersion = chrome.runtime.getManifest().version;
    const previousVersion = await storage.get('version');
    // sometimes the update event is fired when the extension has not actually updated
    if (currentVersion !== previousVersion) {
      await AnalyticsEvent([
        {
          name: 'update',
          params: {
            platform: platform.os,
            installType,
          },
        },
      ]);
      chrome.tabs.create({ url: chrome.runtime.getURL('tabs/review.html') });
      await storage.set('version', chrome.runtime.getManifest().version);
    }
  }

  if (installType === 'development' && !debug) {
    chrome.runtime.setUninstallURL(
      'https://chromewebstore.google.com/detail/lighterfuel-for-tinder/bmcnbhnpmbkcpkhnmknmnkgdeodfljnc',
    );
    chrome.tabs.create({ url: chrome.runtime.getURL('tabs/notCWS.html') });
  } else if (replayConsent === undefined || analyticsConsent === undefined) {
    const consentUrl = chrome.runtime.getURL('tabs/consent.html');
    chrome.tabs.create({ url: consentUrl });
  }
});
