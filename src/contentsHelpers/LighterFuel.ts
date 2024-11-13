/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import { Storage } from '@plasmohq/storage';
import { sendToBackground } from '@plasmohq/messaging';
import EventEmitter from 'events';
import {
  createButton,
  getTimeOld,
  parentNode,
  consoleOut,
  getImageURLfromNode,
  getVideoURLfromNode,
  Events,
} from '@/contentsHelpers/Misc';
import { debug, defaultSettings, text } from '@/misc/config';

import {
  type ShowSettings,
  Sites,
  type profileSliderContainer,
} from '@/misc/types';
import type { photoInfo } from '~src/background/PeopleHandler';
import type { getImageInfoRequest, getImageInfoResponse } from '~src/background/messages/getImageInfo';
import type { sendAnalyticsEventRequest } from '~src/background/messages/sendAnalyticsEvent';
import type { getInstallTypeRequest, getInstallTypeResponse } from '../background/messages/getInstallType';

let imageConsoleLogMod = 0;

/**
 * Returns visibility ratio of element within viewport.
 *
 * @param target - DOM element to observe
 * @return Promise that resolves with visibility ratio
 */
const getVisibility = (target: Element) => new Promise<{ratio: number, visibilityCheck: boolean}>((resolve) => {
  const options = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0, // get ratio, even if only 1px is in view
  };

  const visibilityCheck = target.checkVisibility({ checkOpacity: true, visibilityProperty: true, contentVisibilityAuto: true });

  const observer = new IntersectionObserver(([entry]) => {
    resolve({ ratio: entry.intersectionRatio, visibilityCheck });
    observer.disconnect();
  }, options);

  observer.observe(target);
});

class LighterFuel {
  showSettings: ShowSettings = defaultSettings;

  storage: Storage;

  site: Sites;

  mainMutationObserver: MutationObserver;

  textContainerObserver: MutationObserver | undefined;

  shownProfileImages: Element[];

  emitter: EventEmitter;

  lastPingTime: number = Date.now();

  windowResizeTimeout: NodeJS.Timeout | undefined;

  constructor() {
    this.emitter = new EventEmitter();
    this.storage = new Storage();
    this.setup();
  }

  async setup() {
    const { installType } = await sendToBackground<getInstallTypeRequest, getInstallTypeResponse>({
      name: 'getInstallType',
    });

    if (debug) console.log('installType', installType, debug);
    if (installType === 'normal' || debug) {
      this.startMonitorInterval();
      this.initializeEventListeners();
      this.getSettings();
      this.sendLoadedEvent();
      this.beginPingPongLoop();
      window.addEventListener('resize', () => {
        if (this.windowResizeTimeout) {
          clearTimeout(this.windowResizeTimeout);
        }
        this.windowResizeTimeout = setTimeout(this.handleWindowResize.bind(this), 100);
      });
    } else {
      alert('You must install LighterFuel via the Chrome Web Store to use it.\n\n Uninstall this version and install the Chrome Web Store version.');
      window.open('https://chromewebstore.google.com/detail/lighterfuel-for-tinder/bmcnbhnpmbkcpkhnmknmnkgdeodfljnc', '_blank').focus();
    }
  }

  async sendLoadedEvent() {
    await sendToBackground<sendAnalyticsEventRequest>({
      name: 'sendAnalyticsEvent',
      body: {
        name: 'Loaded_Tinder', // TODO: change this to "Loaded"
        params: {
          event_title: 'loaded',
          event_platform: 'TINDER',
        },
      },
    });
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

  initializeEventListeners() {
    this.emitter.on(Events.settingsUpdate, (settings) => {
      this.setDisplayStatus();
    });
  }

  async getImageInfo(url: string) {
    const res = await sendToBackground<getImageInfoRequest, getImageInfoResponse>({
      name: 'getImageInfo',
      body: {
        url,
      },
    });

    return res.info;
  }

  async handleConventionalSliderImages() {
    const keenSlider = [...document.querySelectorAll('div.keen-slider, div.profileCard__slider')].reverse();

    const visible = keenSlider.filter((x) => x.checkVisibility({ checkOpacity: true, visibilityProperty: true, contentVisibilityAuto: true }));

    if (visible.length > 0) {
      // For every slider, make sure there's the overlay
      for (const slider of visible) {
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
        let mediaURL = getImageURLfromNode(currentImage);
        if (debug && (imageConsoleLogMod % 50 === 0)) console.log('currentImage', mediaURL, (await this.getImageInfo(mediaURL)));
        imageConsoleLogMod++;
        if (!mediaURL) {
          const videoURL = getVideoURLfromNode(currentImage);

          if (!videoURL) {
            if (debug) {
              console.log('getImageURLfromNode + getVideoURLfromNode returned undefined, skipping this image');
            }
            break;
          } else {
            mediaURL = videoURL;
          }
        }

        this.getImageInfo(mediaURL).then((info) => {
          if (!info) {
            if (debug) console.log('No info for', mediaURL);
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
            this.createOverlayNode(info, sliderParent);
            consoleOut('Added overlay');
          } else // check to see if the overlay 'aria-url' matches the current image
            if (existingOverlay.getAttribute('aria-url') !== info.original) {
              // if not, update the overlay
              existingOverlay.parentNode.removeChild(existingOverlay);
              this.createOverlayNode(info, sliderParent);
              consoleOut('Updated overlay');
            }
        });
      }
    }
  }

  handleLikesYouCardItem() {
    const visible = [...document.querySelectorAll('.likesYouCardItem')].reduce((acc, topLevel) => {
      const stretchedBox = [...topLevel.querySelectorAll('div.StretchedBox')] as HTMLDivElement[];

      return [...acc, ...stretchedBox.filter((x) => {
        if (!x || x.style.backgroundImage === '') return acc;

        if (!x.checkVisibility({ checkOpacity: true, visibilityProperty: true, contentVisibilityAuto: true }) || x.getAttribute('aria-has-overlay') === 'true') return false;

        return true;
      })];
    }, [] as HTMLDivElement[]);
    if (debug) console.log('visible', visible.length);
    visible.forEach(async (el) => {
      el.setAttribute('aria-has-overlay', 'true');

      const mediaURL = getImageURLfromNode(el);
      if (!mediaURL) {
        if (debug) console.log('getImageURLfromNode returned undefined (likes-you-card), skipping this image');
        return;
      }

      const data = await this.getImageInfo(mediaURL);

      const date = new Date(data.accountCreated);
      const xOld = getTimeOld(date.getTime());

      const overlayNode = document.createElement('p');
      overlayNode.style.zIndex = '1000';
      overlayNode.classList.add('overlayBox');
      overlayNode.classList.add('noTopBox');
      overlayNode.innerHTML = `${xOld} Ago`;

      el.appendChild(overlayNode);
    });
  }

  startMonitorInterval() {
    setInterval(async () => {
      await Promise.all([
        this.handleConventionalSliderImages(),
        this.handleLikesYouCardItem(),
      ]);
    }, 50);
  }

  /* ************************************************ */

  /**
   * Creates the overlay element for the photo
   *
   * @param data The data for the image (using the last modified date and url for reverse lookup)
    * @returns The element with an onPlaced method
   */
  createOverlayNode(data: photoInfo, parentElement: ParentNode) {
    const overlayNode = document.createElement('p');
    const date = new Date(data.accountCreated);
    const xOld = getTimeOld(date.getTime());
    overlayNode.innerHTML = `${text.overlay.createdAt}: ${date.getHours()}:${date.getMinutes()} ${date.toLocaleDateString()} ${xOld} Ago`;
    if (!data.hqUrl) {
      console.log('no hqUrl', data);
    }

    overlayNode.appendChild(createButton(data.hqUrl, data.type !== 'rec'));
    overlayNode.setAttribute('aria-url', data.original);
    const onPlaced = () => {
      const bounds = overlayNode.getBoundingClientRect();
      // * whenever there's 100px above, we have room to place the box above
      if (bounds.top > 120) {
        overlayNode.classList.add('topBox');
        parentNode(overlayNode, 2).style.overflow = 'visible';
        parentNode(overlayNode, 5).style.top = '50px';
        // this.handleTopBoxPlace(overlayNode);
      } else {
        overlayNode.classList.add('overlayBox');
      }
    };

    parentElement.appendChild(overlayNode);

    onPlaced();

    return overlayNode;
  }

  // handleTopBoxPlace(topBox: HTMLDivElement) {
  //   // eslint-disable-next-line no-param-reassign
  //   topBox.parentElement.parentElement.style.overflow = 'visible';
  // }

  handleWindowResize() {
    const overlays = [...document.querySelectorAll('p.overlayBox, p.topBox')]
      .filter((el) => !el.classList.contains('noTopBox'));
    Promise.all(overlays.map(async (overlay: HTMLDivElement) => {
      const bounds = overlay.getBoundingClientRect();
      if (bounds.top >= 120 && overlay.classList.contains('overlayBox')) {
        overlay.classList.remove('overlayBox');
        overlay.classList.add('topBox');
        parentNode(overlay, 2).style.overflow = 'visible';
        parentNode(overlay, 5).style.top = '50px';
        // this.handleTopBoxPlace(overlay);
      } else if (bounds.top < 120 && overlay.classList.contains('topBox')) {
        overlay.classList.add('overlayBox');
        overlay.classList.remove('topBox');
      } else {
        // just default to the overlayBox
        overlay.classList.add('overlayBox');
      }
    })).catch((e) => {
      console.error('Error in handleWindowResize', e);
    });
  }

  beginPingPongLoop() {
    setInterval(() => {
      if (Date.now() - this.lastPingTime > 950 * 60 * 4) {
        this.ping();
      }
    }, 1000 * 60);
  }

  async ping() {
    await sendToBackground({
      name: 'pong',
    });
    this.lastPingTime = Date.now();
  }
}

export default LighterFuel;
