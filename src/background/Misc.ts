import browser from 'webextension-polyfill';
import type { ImageType, TabMessage } from '@/misc/types';
import { debug } from '@/misc/config';

/**
   * This filters through all the tabs and sends the info to them
   *
   */
export const sendInfoToTab = (obj: ImageType) => new Promise<void>((resolve) => {
  browser.tabs.query({})// query all tabs
    .then((x) => x.filter((y) => y.url))// filter to only ones we have permission to look at (all tinder tabs)
    .then((tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          const msg: TabMessage = {
            action: 'newImage',
            data: obj,
          };
          browser.tabs.sendMessage(tab.id, JSON.stringify(msg)).catch((e) => {
            if (debug) console.log(e);
          });
        }
      });
      resolve();
    });
});
