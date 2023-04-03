import browser from 'webextension-polyfill';
import type { ImageType } from '@/misc/types';
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
          browser.tabs.sendMessage(tab.id, obj).catch((e) => {
            if (debug) console.log(e);
          });
        }
      });
      resolve();
    });
});
