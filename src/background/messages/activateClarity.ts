import type { MessageHandler } from '@/misc/messaging';
import { Storage } from '@/misc/storage';
import { browser } from 'wxt/browser';

import { injectClarity } from '../injectClarity';

const config = {
  projectId: 'jri296qhbt',
  upload: 'https://t.clarity.ms/collect',
  expire: 365,
  cookies: ['_uetmsclkid', '_uetvid'],
  track: true,
  lean: false,
  content: true,
  dob: 1441,
};

/**
 * This message hander is called when the user clicks the error button
 * in the popup.
 */
const handler: MessageHandler = async (req, res) => {
  const storage = new Storage({
    area: 'sync',
  });

  const replayConsent = await storage.get('replayConsent');

  if (typeof replayConsent === 'string') {
    if (replayConsent.toLowerCase() !== 'true') {
      return;
    }
  }

  const tabs = await browser.tabs.query({
    url: 'https://tinder.com/*',
    active: true,
  });

  if (tabs.length === 0) {
    res.send({
      info: null,
    });
    return;
  }

  await browser.scripting.executeScript({
    target: { tabId: tabs[0].id, allFrames: true },
    func: injectClarity,
    args: [
      {
        url: browser.runtime.getURL('/resources/clarity.js'),
        // This config is taken from the https://www.clarity.ms/tag/examplethisisnotreal script
        // I'm not sure what most of these do, but copying all the options seems like a good idea
        config,
        clarityKey: 'clarity',
      },
    ],
    injectImmediately: true,
    world: 'MAIN',
  });
};

export default handler;
