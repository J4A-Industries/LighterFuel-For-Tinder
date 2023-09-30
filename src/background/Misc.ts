import browser from 'webextension-polyfill';
import type { ImageType, TabMessage } from '@/misc/types';
import { debug } from '@/misc/config';

/**
   * This filters through all the tabs and sends the info to them
   *
   */
export const sendImageDataToTab = (obj: ImageType | ImageType[]) => new Promise<void>((resolve) => {
  const arrIn = Array.isArray(obj);
  browser.tabs.query({})// query all tabs
    .then((x) => x.filter((y) => y.url))// filter to only ones we have permission to look at
    .then((tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          const msg: TabMessage = {
            action: arrIn ? 'new images' : 'new image',
            data: obj,
          };
          browser.tabs.sendMessage(tab.id, msg).catch((e) => {
            if (debug) console.log(e);
          });
        }
      });
      resolve();
    });
});

if (!process.env.PLASMO_PUBLIC_SENTRY_DSN) throw new Error('Missing Sentry DSN');

export const SENTRY_DSN = process.env.PLASMO_PUBLIC_SENTRY_DSN;
