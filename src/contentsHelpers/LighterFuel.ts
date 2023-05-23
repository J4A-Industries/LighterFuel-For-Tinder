/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import browser from 'webextension-polyfill';

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

import {
  ImageType,
  ProfileImage,
  ShowSettings,
  Sites,
  profileSliderContainer,
} from '@/misc/types';

import ImageHandler, { Events } from '@/contentsHelpers/ImageHandler';

class LighterFuel extends ImageHandler {
  profileSliderContainers: profileSliderContainer[];

  mainMutationObserver: MutationObserver;

  textContainerObserver: MutationObserver | undefined;

  shownProfileImages: Element[];

  constructor() {
    super(Sites.TINDER); // Call the parent class constructor

    this.profileSliderContainers = [];

    if (debug) this.setCustomFetch();

    this.initialiseEventListeners();

    this.initialiseMessageListner = this.initialiseMessageListner.bind(this);

    this.getInitialData = this.getInitialData.bind(this);

    this.startMonitorInterval();
  }

  startMonitorInterval() {
    setInterval(() => {
      const keenSlider = [...document.querySelectorAll('div.keen-slider, div.profileCard__slider')];
      if (keenSlider.length > 0) {
        // For every slider, make sure there's the overlay
        for (const slider of keenSlider) {
          const existingOverlay = slider.parentNode.querySelector('p.overlayBox, p.topBox');
          const sliderParent = slider.parentNode;
          // check to see if the overlay 'aria-url' matches the current image
          const profileImages = [...slider.querySelectorAll('div.StretchedBox, div.profileCard__slider__img')];
          if (profileImages.length === 0) return;
          const currentImage = profileImages.reduce((acc, curr) => {
            const firstParent = curr.parentElement.getAttribute('aria-hidden') === 'false';
            const secondParent = curr.parentElement.parentElement.getAttribute('aria-hidden') === 'false';
            if (firstParent || secondParent) return curr;
            return acc;
          });
          const imageURL = getImageURLfromNode(currentImage);
          const imageRecord = this.images.find((image) => image.url === imageURL);
          if (!imageRecord) return consoleOut(`imageRecord not found in startMonitorInterval ${imageURL}`);

          if (!existingOverlay) {
            const overlay = this.createOverlayNode(imageRecord);
            sliderParent.appendChild(overlay.overlayNode);
            overlay.onPlaced();
            consoleOut('Added overlay');
          } else // check to see if the overlay 'aria-url' matches the current image
          if (existingOverlay.getAttribute('aria-url') !== imageRecord.url) {
            // if not, update the overlay
            existingOverlay.parentNode.removeChild(existingOverlay);
            const overlay = this.createOverlayNode(imageRecord);
            sliderParent.appendChild(overlay.overlayNode);
            overlay.onPlaced();
            consoleOut('Updated overlay');
          }
        }
      }
    }, 50);
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
    if (this.images.length > 50) this.images.splice(0, this.images.length - 50);
  }

  /**
   * Looks for the profile images, if they're not there, sets the windowOnload to it
   *
   * @returns {Promise<Array>}
   */
  lookForProfileImages(): Promise<ProfileImage[]> {
    return new Promise((resolve) => {
      const profileImages = getProfileImages(document, this.images);
      if (profileImages.length < 1) {
        resolve(profileImages);
      } else {
        window.onload = () => {
          resolve(this.lookForProfileImages());
          if (debug) consoleOut('No nodes found, setting window onload event');
        };
      }
    });
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
   * @param data The data for the image (using the last modified date and url for reverse lookup)
    * @returns The element with an onPlaced method
   */
  createOverlayNode(data: ImageType) {
    const { lastModified } = data;
    const overlayNode = document.createElement('p');
    const date = new Date(lastModified);
    const xOld = getTimeOld(date.getTime());
    overlayNode.innerHTML = `${text.overlay.uploadedAt}: ${date.getHours()}:${date.getMinutes()} ${date.toLocaleDateString()} ${xOld} Old`;
    overlayNode.appendChild(createButton(data.url));
    overlayNode.setAttribute('aria-url', data.url);
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

export default LighterFuel;
