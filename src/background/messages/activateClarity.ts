import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import { injectClarity } from '../injectClarity';

/**
 * This message hander is called when the user clicks the error button
 * in the popup.
 */
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const storage = new Storage({
    area: 'sync',
  });

  const replayConsent = await storage.get('replayConsent');

  if (typeof replayConsent === 'string') {
    if (replayConsent.toLowerCase() !== 'true') {
      return;
    }
  }

  chrome.tabs.query({ url: 'https://tinder.com/*', active: true }, (tabs) => {
    if (tabs.length === 0) {
      res.send({
        info: null,
      });
      return;
    }
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: injectClarity,
      args: [{
        url: chrome.runtime.getURL('resources/clarity.js'),
        // This config is taken from the https://www.clarity.ms/tag/examplethisisnotreal script
        // I'm not sure what most of these do, but copying all the options seems like a good idea
        config: {
          projectId: 'jri296qhbt',
          upload: 'https://t.clarity.ms/collect',
          expire: 365,
          cookies: ['_uetmsclkid', '_uetvid'],
          track: true,
          lean: false,
          content: true,
          dob: 1441,
        },
        clarityKey: 'clarity',
      }],
      injectImmediately: true,
      world: 'MAIN',
    });
  });
};

export default handler;
