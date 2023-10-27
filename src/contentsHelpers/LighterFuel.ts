/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import browser from 'webextension-polyfill';

import { Storage } from '@plasmohq/storage';
import { sendToBackgroundViaRelay } from '@plasmohq/messaging';
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
import { debug, defaultSettings, text } from '@/misc/config';

import {
  type ImageType,
  type ProfileImage,
  type ShowSettings,
  Sites,
  type profileSliderContainer,
} from '@/misc/types';

import ImageHandler, { Events } from '@/contentsHelpers/ImageHandler';
import type { photoInfo } from '~src/background/PeopleHandler';
import type { getImageInfoRequest, getImageInfoResponse } from '~src/background/messages/getImageInfo';

class LighterFuel {
  showSettings: ShowSettings = defaultSettings;

  storage: Storage;

  site: Sites;

  profileSliderContainers: profileSliderContainer[];

  mainMutationObserver: MutationObserver;

  textContainerObserver: MutationObserver | undefined;

  shownProfileImages: Element[];

  emitter: EventEmitter;

  constructor() {
    this.profileSliderContainers = [];

    this.startMonitorInterval();

    this.emitter = new EventEmitter();
    this.storage = new Storage();
    this.initialiseEventListeners();
    this.getSettings();
  }

  getSettings() {
    // gets the initial settings from storage
    this.storage.get<ShowSettings>('showSettings').then((c) => {
      if (c === undefined) return;
      this.showSettings = c;
      this.emitter.emit(Events.settingsUpdate, this.showSettings);
    });

    // watching the storage for changes, for live updating
    this.storage.watch({
      showSettings: (c) => {
        if (c === undefined) return;
        this.showSettings = c.newValue;
        this.emitter.emit(Events.settingsUpdate, this.showSettings);
      },
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

  initialiseEventListeners() {
    this.emitter.on(Events.settingsUpdate, (settings) => {
      this.setDisplayStatus();
    });
  }

  async getImageInfo(url: string) {
    const res = await sendToBackgroundViaRelay<getImageInfoRequest, getImageInfoResponse>({
      name: 'getImageInfo',
      body: {
        url,
      },
    });

    return res.info;
  }

  startMonitorInterval() {
    setInterval(async () => {
      let keenSlider = [...document.querySelectorAll('div.keen-slider, div.profileCard__slider')];

      if (keenSlider.length === 2) {
        keenSlider = [keenSlider[1]];
      }

      if (keenSlider.length > 0) {
        // For every slider, make sure there's the overlay
        for (const slider of keenSlider) {
          // check to see if the overlay 'aria-url' matches the current image
          const profileImages = [...slider.querySelectorAll('div.StretchedBox, div.profileCard__slider__img')];
          if (profileImages.length === 0) {
            break;
          }
          const currentImage = profileImages.reduce((acc, curr) => {
            const firstParent = curr.parentElement.getAttribute('aria-hidden') === 'false';
            const secondParent = curr.parentElement.parentElement.getAttribute('aria-hidden') === 'false';
            if (firstParent || secondParent) return curr;
            return acc;
          });

          const imageURL = getImageURLfromNode(currentImage);
          console.log('currentImage', imageURL);
          if (!imageURL) {
            if (debug) {
              console.log('getImageURLfromNode returned undefined, skipping this image');
            }
            break;
          }

          this.getImageInfo(imageURL).then((info) => {
            if (!info) {
              return;
            }
            let existingOverlay = slider.parentNode.querySelector('p.overlayBox, p.topBox');
            const sliderParent = slider.parentNode;

            if (existingOverlay) {
              if (existingOverlay.parentNode) {
                const existingOverlayInCorrectPlace = (existingOverlay.parentNode as HTMLElement).classList.contains('keen-slider')
                || (existingOverlay.parentNode as HTMLElement).classList.contains('tappable-view');

                if (!existingOverlayInCorrectPlace) {
                  existingOverlay.parentNode.removeChild(existingOverlay);
                  existingOverlay = undefined;
                  if (debug) {
                    console.log('Existing overlay not in correct place, removing it');
                  }
                }
              }
            }

            if (!existingOverlay) {
              const overlay = this.createOverlayNode(info);
              sliderParent.appendChild(overlay.overlayNode);
              overlay.onPlaced();
              consoleOut('Added overlay');
            } else // check to see if the overlay 'aria-url' matches the current image
              if (existingOverlay.getAttribute('aria-url') !== info.original) {
                // if not, update the overlay
                existingOverlay.parentNode.removeChild(existingOverlay);
                const overlay = this.createOverlayNode(info);
                sliderParent.appendChild(overlay.overlayNode);
                overlay.onPlaced();
                consoleOut('Updated overlay');
              }
          });
        }
      }
    }, 50);
  }

  /* ************************************************ */

  /**
   * Creates the overlay element for the photo
   *
   * @param data The data for the image (using the last modified date and url for reverse lookup)
    * @returns The element with an onPlaced method
   */
  createOverlayNode(data: photoInfo) {
    const overlayNode = document.createElement('p');
    const date = new Date(data.accountCreated);
    const xOld = getTimeOld(date.getTime());
    overlayNode.innerHTML = `${text.overlay.createdAt}: ${date.getHours()}:${date.getMinutes()} ${date.toLocaleDateString()} ${xOld} Old`;
    if (!data.hqUrl) {
      console.log('no hqUrl', data);
    }

    overlayNode.appendChild(createButton(data.hqUrl));
    overlayNode.setAttribute('aria-url', data.original);
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
}

export default LighterFuel;
