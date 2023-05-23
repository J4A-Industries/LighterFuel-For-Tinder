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

export enum Events {
  settingsUpdate = 'settingsUpdate',
  imagesUpdate = 'imagesUpdate',
}

const imagesToKeep = 300;

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
    this.emitter = new EventEmitter();
    this.images = [];
    this.site = site;

    this.storage = new Storage();

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
      console.log(response.images);
      console.log(`Successfully got images for ${this.site}, ${response.images.length} images`);
      this.addNewImage(response.images);
    });
  }
}

export default ImageHandler;
