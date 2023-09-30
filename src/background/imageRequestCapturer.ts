import browser from 'webextension-polyfill';
import { Storage } from '@plasmohq/storage';
import { debug } from '@/misc/config';
import type {
  AISettings, ImageType, ShowSettings, Sites,
} from '@/misc/types';
import { sendImageDataToTab } from './Misc';

// the max number of image records to keep
const maxImages = 600;

/**
 * The ImageRequestCapturer class is responsible for monitoring image requests
 * and storing the image data in the images array, then sending them to the CS upon request
 */
class ImageRequestCapturer extends EventTarget {
  images: ImageType[] = [];

  lastImageGetTime: Date = new Date(0);

  urls: string[];

  site: Sites;

  maxImages: number;

  constructor(urls: string[], siteToListenFor: Sites, maxImagesToStore: number = maxImages) {
    super();
    this.site = siteToListenFor;
    this.urls = urls;
    this.initialiseImageListener();
    this.maxImages = maxImagesToStore;
  }

  /**
   * Initialised the image Listener, for whenever the webpage requests a new image,
   * add it to the images arr (through proxy)
   */
  initialiseImageListener() {
    browser.webRequest.onCompleted.addListener(
      (details) => {
        if (debug) console.log(details);
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

          const newImageEvent = new CustomEvent('new image');
          this.dispatchEvent(newImageEvent);

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

  sendAllImagesToTab() {
    sendImageDataToTab(this.images).catch((e) => {
      if (debug) console.log(e);
    });
  }

  /**
   * Adds an image to the images array, and removes the first element if the array is too long
   */
  addImage(image: ImageType) {
    if (this.images.find((x) => x.url === image.url)) return;
    this.images.push(image);
    if (this.images.length > this.maxImages) {
      this.images.shift();
    }
  }

  getAllImages() {
    this.lastImageGetTime = new Date();
    return this.images;
  }

  async getNewImages() {
    // filter the images array to only include images added after the last time the CS got images
    const newImages = this.images.filter((x) => x.timeAddedToArr > this.lastImageGetTime);
    // if there are no new images, then wait for a new image to be added
    if (newImages.length === 0) {
      await new Promise<void>((resolve) => {
        this.addEventListener('new image', () => {
          resolve();
        });
      });
    }
    this.lastImageGetTime = new Date();
    return newImages;
  }
}

export default ImageRequestCapturer;
