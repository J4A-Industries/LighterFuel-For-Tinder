/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import browser from 'webextension-polyfill';
import { Storage } from '@plasmohq/storage';
import { createRoot } from 'react-dom/client';
import {
  createButtons,
  getDomsWithBGImages,
  getImageURLfromNode,
  getTimeOld,
  parentNode,
  consoleOut,
  getProfileImagesShown,
  getBackgroundImageFromNode,
  getShownImages,
} from '@/contents/Misc';

import { debug } from '@/misc/config';

import type {
  ImageType,
  ProfileImage,
  ShowSettings,
  profileSliderContainer,
} from '@/misc/types';

class LighterFuel {
  images: ImageType[];

  profileSliderContainers: profileSliderContainer[];

  showSettings: ShowSettings;

  mainMutationObserver: MutationObserver;

  textContainerObserver: MutationObserver | undefined;

  storage: Storage;

  shownProfileImages: Element[];

  /**
   * @param {Boolean} debug
   */
  constructor() {
    this.images = [];
    this.shownProfileImages = [];
    this.profileSliderContainers = [];
    this.showSettings = {
      overlayButton: true,
      searchButton: true,
    };

    this.mainMutationObserver = new MutationObserver(() => this.mutationCallback());
    this.storage = new Storage();

    if (debug) this.setCustomFetch();
    this.getInitialData();
    this.initialiseMessageListner();
    this.initaliseObserver();
  }

  initaliseObserver() {
    const config = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    };
    consoleOut('initaliseObserver');
    // * The main observer, observing the body for changes
    consoleOut(document.body ? 'body exists' : 'body does not exist');
    if (document.body) {
      this.mainMutationObserver.observe(document.body, config);
    } else {
      // on body load
      document.addEventListener('DOMContentLoaded', () => {
        consoleOut('body loaded');
        this.mainMutationObserver.observe(document.body, config);
      });
    }
  }

  addOverlayButtons() {
    // For every profile image discovered in this.shownProfileImages
    for (const image of this.shownProfileImages) {
      // Get the URl for the image
      // TODO: only add if it's not already there
      if (image.innerHTML !== '<h1>yeeeeeeet</h1>') {
        image.innerHTML = '<h1>yeeeeeeet</h1>';
      }
    }
  }

  mutationCallback() {
    consoleOut('mutationCallback');
    consoleOut(this.shownProfileImages);
    this.shownProfileImages = getShownImages();
    if (this.shownProfileImages.length === 0) {
      consoleOut('no images');
      const interval = window.setInterval(() => {
        this.shownProfileImages = getShownImages();
        if (this.shownProfileImages.length > 0) {
          consoleOut('images found');
          clearInterval(interval);
          this.addOverlayButtons();
        }
      }, 50);
      return;
    }
    this.addOverlayButtons();
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
   * Used to get the initial images/settings from the background
   */
  getInitialData() {
    this.storage.get<ShowSettings>('showSettings').then((c) => {
      this.showSettings = c;
      this.setDisplayStatus();
    });

    // watching the storage for changes, for live updating
    this.storage.watch({
      showSettings: (c) => {
        this.showSettings = c.newValue;
        this.setDisplayStatus();
      },
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
  }
  /* ************************************************* */

  /**
   * Sets a passthrough for the fetch so we can monitor requests
   * TODO: make this look nicer
   */
  setCustomFetch() {
    if (debug) {
      // save default fetch
      const nativeFetch = window.fetch;
      window.fetch = (...args) => new Promise((resolve, reject) => {
        nativeFetch(...args).then((result) => {
          resolve(result);
          this.handleFetchResponse(result.clone(), args);
        }).catch((err) => reject(err));
      });
    }
  }

  /**
   * TODO: move this to an external helper file
   * This method is to handle the response from the custom fetch when one appears
   * @param {Response} result The result from the fetch
   * @param {Array} args The arguments sent back
   */
  handleFetchResponse(result: Response, args: any[]) {
    const regexChecks = {
      matches: /https:\/\/api.gotinder.com\/v2\/matches\?/g,
      core: /https:\/\/api.gotinder.com\/v2\/recs\/core\/*/g,
      profile: /https:\/\/api.gotinder.com\/v2\/profile\/*/g,
      user: /https:\/\/api.gotinder.com\/user\/([A-z0-9]+)/g,
      messages: /https:*:\/\/api.gotinder.com\/v2\/matches\/([A-z0-9]+)\/messages\?/g,
    };
    // check for JSON here
    result.json().then((jsonOut: any) => {
      if (args[0].match(regexChecks.matches)) {
        browser.runtime.sendMessage({ action: 'send matches', matches: jsonOut });
      } else if (args[0].match(regexChecks.core)) {
        browser.runtime.sendMessage({ action: 'send core', core: jsonOut });
      } else if (args[0].match(regexChecks.profile)) {
        browser.runtime.sendMessage({ action: 'send profile', profile: jsonOut });
      } else if (args[0].match(regexChecks.user)) {
        browser.runtime.sendMessage({ action: 'send user data', data: jsonOut });
      } else if (args[0].match(regexChecks.messages)) {
        browser.runtime.sendMessage({ action: 'send messages', messages: jsonOut });
      }
    });
  }

  /* ************************************************ */

  /**
   * Creates the overlay element for the photo
   *
   * @param {String} lastModified The last modified time from the image
   * @returns {{HTMLElement, function}}
   */
  createOverlayNode(data: ImageType) {
    const { lastModified } = data;
    const overlayNode = document.createElement('p');
    const date = new Date(lastModified);
    const xOld = getTimeOld(date.getTime());
    const outFormat = `${date.getHours()}:${date.getMinutes()} ${date.toLocaleDateString()} <br>${xOld} Old`;
    overlayNode.innerHTML = `Image Uploaded At: ${outFormat}`;
    overlayNode.appendChild(createButtons(data));
    console.log(overlayNode);
    const onPlaced = () => {
      const bounds = overlayNode.getBoundingClientRect();
      // * whenever there's 100px above, we have room to place the box above
      if (bounds.top > 100) {
        overlayNode.classList.add('topBox');
        parentNode(overlayNode, 2).style.overflow = 'visible';
        parentNode(overlayNode, 5).style.top = '50px';
      } else {
        overlayNode.classList.add('overlayBox');
      }
    };

    return { overlayNode, onPlaced };
  }

  /*
  /**
   * Creates the overlay element for the photo
   * TODO: Fix to use CSUI instead of raw html
   * @param {String} lastModified The last modified time from the image
   * @returns {HTMLElement}

  createReactOverlayNode(data: ImageType) {
    const { lastModified } = data;
    const overlayNode = document.createElement('p');
    const date = new Date(lastModified);
    const xOld = getTimeOld(date.getTime());
    const outFormat = `${date.getHours()}:${date.getMinutes()} ${date.toLocaleDateString()} <br>${xOld} Old`;
    const text = `Image Uploaded At: ${outFormat}`;

    const rootNode = createRoot(document.createElement('div'));

    const Overlay = () => (
      <div className="z-100 text-2xl bg-white text-black">
        <div className="overlayText">
          {text}
        </div>
        <div className="overlayButtons">
          **Insert Buttons**
        </div>
      </div>
    );

    rootNode.render(<Overlay />);

    const onPlaced = () => {
      const bounds = overlayNode.getBoundingClientRect();
      // * whenever there's 100px above, we have room to place the box above
      if (bounds.top > 100) {
        overlayNode.classList.add('topBox');
        parentNode(overlayNode, 2).style.overflow = 'visible';
        parentNode(overlayNode, 5).style.top = '50px';
      } else {
        overlayNode.classList.add('overlayBox');
      }
    };
    consoleOut(overlayNode);
    return { overlayNode, onPlaced };
  }
 */
  /**
   * Sets the overlay display status to shown/hidden
   *
   * TODO: use the CSUI to show the overlay
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
.buttonLF .search { ${this.showSettings.searchButton ? '' : 'display: none'} }`;
    consoleOut(this.showSettings);
  }
}

export default LighterFuel;
