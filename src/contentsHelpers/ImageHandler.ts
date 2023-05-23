/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import browser, { events } from 'webextension-polyfill';
import { Storage } from '@plasmohq/storage';
import { sendToBackground } from '@plasmohq/messaging';

import EventEmitter from 'events';
import {
  createButton,
  getTimeOld,
  parentNode,
  consoleOut,
  getShownImages,
  getImageURLfromNode,
  getDomsWithBGImages,
  getProfileImages,
} from '@/contentsHelpers/Misc';

import { debug, text } from '@/misc/config';

import type {
  ImageType,
  ProfileImage,
  ShowSettings,
  Sites,
  profileSliderContainer,
} from '@/misc/types';
import type { getImagesRequest, getImagesResponse } from '@/background/messages/getImages';

// the events that the emmitter can emit
export enum Events {
  settingsUpdate = 'settingsUpdate',
  imagesUpdate = 'imagesUpdate',
}

// The number of images records to keep in memory, before shifting the array
const imagesToKeep = 300;

/**
 * The ImageHandler class is responsible for monitoring the background communication,
 * for new image records (image url + timestamps) then it stores them in the images array.
 *
 * This class is meant to be extended by the site specific classes, which will then
 * use the functions in this class to display the image data.
 */
class ImageHandler {
  images: ImageType[];

  emitter: EventEmitter;

  showSettings: ShowSettings;

  storage: Storage;

  site: Sites;

  /**
   * @param {Boolean} debug
   */
  constructor(site: Sites) {
    // the event emmitter is here for flexibility, so that the site specific classes can listen for events
    this.emitter = new EventEmitter();
    this.images = [];
    this.site = site;

    this.storage = new Storage();

    this.initialiseEventListeners();
    this.getInitialData();
    this.initialiseMessageListner();
  }

  /**
   * Listens for messages from the background
   */
  initialiseMessageListner() {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'new image':
          this.addNewImage(request.data);
          break;
        default:
          break;
      }
      sendResponse();
    });
  }

  /**
   * Sets the display status, if the user updates the settings
   */
  initialiseEventListeners() {
    this.emitter.on(Events.settingsUpdate, (settings) => {
      this.setDisplayStatus();
    });
  }

  /**
   * Adds the images to the images array, then it prunes the old ones off (if the array gets to big)
   */
  addNewImage(image: ImageType | ImageType[]) {
    if (!image) return;
    if (Array.isArray(image)) {
      this.images.push(...image);
    } else {
      this.images.push(image);
    }
    // prune off the old images
    if (this.images.length > imagesToKeep) this.images.splice(0, this.images.length - imagesToKeep);

    this.emitter.emit(Events.imagesUpdate, this.images);
  }

  /**
   * Used to get the initial images/settings from the background
   */
  async getInitialData() {
    // gets the initial settings from storage
    this.storage.get<ShowSettings>('showSettings').then((c) => {
      this.showSettings = c;
      this.emitter.emit(Events.settingsUpdate, this.showSettings);
    });

    // watching the storage for changes, for live updating
    this.storage.watch({
      showSettings: (c) => {
        this.showSettings = c.newValue;
        this.emitter.emit(Events.settingsUpdate, this.showSettings);
      },
    });

    // TODO: fix name as never? some weird TS error
    sendToBackground({
      name: 'getImages' as never,
      body: {
        site: this.site,
      } as getImagesRequest,
    }).then((response: getImagesResponse) => {
      if (debug) console.log(`Successfully got images for ${this.site}, ${response.images.length} images`);
      this.addNewImage(response.images);
    });
  }

  /**
   * Sets the overlay display status to shown/hidden
   *
   * @param {Boolean} status Whether or not to display the overlay
   */
  setDisplayStatus() {
    let styleElem = document.querySelector('#overlayDisplay');
    if (!styleElem) {
      styleElem = document.createElement('style');
      styleElem.setAttribute('id', 'overlayDisplay');
      document.head.append(styleElem);
    }
    styleElem.textContent = `
  .overlayBox {  ${this.showSettings.overlayButton ? '' : 'display: none'} }
  .topBox { ${this.showSettings.overlayButton ? '' : 'display: none'} }
  .search { ${this.showSettings.searchButton ? '' : 'display: none'} }`;
    consoleOut(this.showSettings);
  }
}

export default ImageHandler;
