import browser from 'webextension-polyfill';
import { Storage } from '@plasmohq/storage';
import { debug, defaultSettings } from '@/misc/config';
import {
  AISettings, ImageType, ShowSettings, Sites,
} from '@/misc/types';
import { sendImageDataToTab } from './Misc';
import ImageRequestCapturer from './imageRequestCapturer';

class Background {
  images: ImageType[];

  constructor() {
    this.images = [];
    this.initialiseImageListener();
  }

  /**
   * Initialised the image Listener, for whenever tinder requests a new image,
   * add it to the images arr (through proxy)
   */
  initialiseImageListener() {
    browser.webRequest.onCompleted.addListener(
      (details) => {
        // tinder has yet to discover cache and the images reload *every time they're viewed*
        const imageInArray = this.images.find((x) => details.url === x.url);
        if (!imageInArray) {
          if (!details.responseHeaders) return;
          const data: ImageType = {
            url: details.url,
            lastModified: details.responseHeaders.filter((x) => x.name === 'last-modified')[0].value,
            timeAddedToArr: new Date(),
          };
          // TODO: maybe need to send the images array to the tab?
          this.addImage(data);
          sendImageDataToTab(data).catch((e) => {
            if (debug) console.log(e);
          });

          if (debug) console.log(details);
        }
      },
      { urls: ['*://*.gotinder.com/*/*.jpg*', '*://*.gotinder.com/*/*.webp*', '*://*.gotinder.com/*/*.mp4*'] },
      ['responseHeaders'],
    );
  }

  /**
   * Adds an image to the images array, and removes the first element if the array is too long
   */
  addImage(image: ImageType) {
    this.images.push(image);
    if (this.images.length > 50) {
      this.images.shift();
    }
  }

  /**
   * Used to listen out for whenever there is a request to the "core"
   * which contains the profile information!
   */
  // eslint-disable-next-line class-methods-use-this
  initialiseCoreListner() {
    browser.webRequest.onCompleted.addListener(
      (details) => {
        console.log('core/profile:');
        console.log(details);
      },
      { urls: ['*://api.gotinder.com/v2/recs/core*', '*://api.gotinder.com/v2/profile*'] },
    );
  }
}

const setDefaultSettings = async () => {
  const storage = new Storage();
  const settings = await storage.get('showSettings');
  if (settings === undefined) {
    await storage.set('showSettings', defaultSettings);
  }
};

try {
  setDefaultSettings();
  const bg = new ImageRequestCapturer(['*://*.gotinder.com/*/*.jpg*', '*://*.gotinder.com/*/*.webp*', '*://*.gotinder.com/*/*.mp4*'], Sites.TINDER);
  // prints the bg instance to the console for debugging!
  console.log(bg);
} catch (err: any) {
  console.error(`Error caught in background.js: ${err.stack}`);
}

export default Background;
