/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import browser, { events } from 'webextension-polyfill';
import { Storage } from '@plasmohq/storage';

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
  profileSliderContainer,
} from '@/misc/types';

export enum Events {
  settingsUpdate = 'settingsUpdate',
  imagesUpdate = 'imagesUpdate',
}

class ImageHandler {
  images: ImageType[];

  emitter: EventEmitter;

  showSettings: ShowSettings;

  storage: Storage;

  /**
   * @param {Boolean} debug
   */
  constructor() {
    this.emitter = new EventEmitter();
    this.images = [];

    this.storage = new Storage();

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
    if (this.images.length > 50) this.images.splice(0, this.images.length - 50);

    this.emitter.emit(Events.imagesUpdate, this.images);
  }

  /**
   * Used to get the initial images/settings from the background
   */
  getInitialData() {
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
  }
}

export default ImageHandler;
