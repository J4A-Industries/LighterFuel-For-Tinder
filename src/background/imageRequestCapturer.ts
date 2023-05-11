import browser from 'webextension-polyfill';
import { Storage } from '@plasmohq/storage';
import { debug } from '@/misc/config';
import type {
  AISettings, ImageType, ShowSettings, Sites,
} from '@/misc/types';
import { sendImageDataToTab } from './Misc';

// the max number of image records to keep
const maxImages = 250;

class ImageRequestCapturer {
  images: ImageType[];

  urls: string[];

  site: Sites;

  constructor(urls: string[], siteToListenFor: Sites) {
    this.images = [];
    this.site = siteToListenFor;
    this.urls = urls;
    this.initialiseImageListener();
  }

  /**
   * Initialised the image Listener, for whenever the webpage requests a new image,
   * add it to the images arr (through proxy)
   */
  initialiseImageListener() {
    browser.webRequest.onCompleted.addListener(
      (details) => {
        const imageInArray = this.images.find((x) => details.url === x.url);
        if (!imageInArray) {
          if (!details.responseHeaders) return;

          const lastModifiedHeaders = details.responseHeaders.filter((x) => x.name === 'last-modified');
          if (lastModifiedHeaders.length < 1) return;

          const data: ImageType = {
            url: details.url,
            lastModified: details.responseHeaders.filter((x) => x.name === 'last-modified')[0].value,
            timeAddedToArr: new Date(),
            site: this.site,
          };
          this.addImage(data);
          sendImageDataToTab(data).catch((e) => {
            if (debug) console.log(e);
          });

          if (debug) console.log(details);
        }
      },
      { urls: this.urls },
      ['responseHeaders'],
    );
  }

  /**
   * Adds an image to the images array, and removes the first element if the array is too long
   */
  addImage(image: ImageType) {
    this.images.push(image);
    if (this.images.length > maxImages) {
      this.images.shift();
    }
  }
}

export default ImageRequestCapturer;
