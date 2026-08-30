/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */

import {
  Events,
  consoleOut,
  createButton,
  getImageURLfromNode,
  getTimeOld,
  getVideoURLfromNode,
  parentNode,
} from '@/contentsHelpers/Misc';
import { debug, defaultSettings, text } from '@/misc/config';
import {
  type ShowSettings,
  Sites,
  type profileSliderContainer,
} from '@/misc/types';
import EventEmitter from 'events';

import { sendToBackground } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';

import type { photoInfo } from '~src/background/PeopleHandler';
import type {
  getImageInfoRequest,
  getImageInfoResponse,
} from '~src/background/messages/getImageInfo';
import type { sendAnalyticsEventRequest } from '~src/background/messages/sendAnalyticsEvent';

let imageConsoleLogMod = 0;

/**
 * Returns visibility ratio of element within viewport.
 *
 * @param target - DOM element to observe
 * @return Promise that resolves with visibility ratio
 */
const getVisibility = (target: Element) =>
  new Promise<{ ratio: number; visibilityCheck: boolean }>((resolve) => {
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0, // get ratio, even if only 1px is in view
    };

    const visibilityCheck = target.checkVisibility({
      checkOpacity: true,
      visibilityProperty: true,
      contentVisibilityAuto: true,
    });

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
    this.startMonitorInterval();
    this.initializeEventListeners();
    this.getSettings();
    this.sendLoadedEvent();
    this.beginPingPongLoop();
    window.addEventListener('resize', () => {
      if (this.windowResizeTimeout) {
        clearTimeout(this.windowResizeTimeout);
      }
      this.windowResizeTimeout = setTimeout(
        this.handleWindowResize.bind(this),
        100,
      );
    });
  }

  async sendLoadedEvent() {
    await sendToBackground<sendAnalyticsEventRequest>({
      name: 'sendAnalyticsEvent',
      body: {
        name: 'Loaded_Tinder',
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
    const res = await sendToBackground<
      getImageInfoRequest,
      getImageInfoResponse
    >({
      name: 'getImageInfo',
      body: {
        url,
      },
    });

    return res.info;
  }

  /**
   * Works out which slide the user is actually looking at.
   *
   * `aria-hidden` on its own isn't enough - while the slider is moving (and
   * for a moment after a tap) more than one slide can be marked as visible,
   * so we take the aria-hidden candidates and pick whichever one is actually
   * sitting over the middle of the slider.
   *
   * @param slider The keen-slider/profileCard slider to look inside
   * @returns The node holding the image currently on screen
   */
  getCurrentSliderImage(slider: Element): Element | undefined {
    const profileImages = [
      ...slider.querySelectorAll(
        'div.StretchedBox, div.profileCard__slider__img',
      ),
    ];
    if (profileImages.length === 0) return undefined;

    const sliderBounds = slider.getBoundingClientRect();
    const sliderCentre = sliderBounds.left + sliderBounds.width / 2;

    const scored = profileImages.map((image) => {
      const bounds = image.getBoundingClientRect();
      const onScreen =
        bounds.width > 0 &&
        bounds.height > 0 &&
        image.checkVisibility({
          checkOpacity: true,
          visibilityProperty: true,
          contentVisibilityAuto: true,
        });
      const ariaVisible = [
        image,
        image.parentElement,
        image.parentElement?.parentElement,
      ].some((node) => node?.getAttribute('aria-hidden') === 'false');

      return {
        image,
        onScreen,
        ariaVisible,
        distance: Math.abs(bounds.left + bounds.width / 2 - sliderCentre),
      };
    });

    const ariaCandidates = scored.filter((x) => x.onScreen && x.ariaVisible);
    const onScreenCandidates = scored.filter((x) => x.onScreen);
    const pool =
      ariaCandidates.length > 0
        ? ariaCandidates
        : onScreenCandidates.length > 0
          ? onScreenCandidates
          : scored;

    return pool.reduce((acc, curr) => (curr.distance < acc.distance ? curr : acc))
      .image;
  }

  /**
   * @param slider The slider to get the currently shown media URL for
   * @returns The image (or video) URL currently on screen for that slider
   */
  getCurrentMediaURL(slider: Element): string | undefined {
    const currentImage = this.getCurrentSliderImage(slider);
    if (!currentImage) return undefined;
    return (
      getImageURLfromNode(currentImage) ?? getVideoURLfromNode(currentImage)
    );
  }

  async handleConventionalSliderImages() {
    const keenSlider = [
      ...document.querySelectorAll('div.keen-slider, div.profileCard__slider'),
    ].reverse();

    const visible = keenSlider.filter((x) =>
      x.checkVisibility({
        checkOpacity: true,
        visibilityProperty: true,
        contentVisibilityAuto: true,
      }),
    );

    if (visible.length > 0) {
      // For every slider, make sure there's the overlay
      for (const slider of visible) {
        const mediaURL = this.getCurrentMediaURL(slider);

        if (!mediaURL) {
          if (debug) {
            console.log(
              'getImageURLfromNode + getVideoURLfromNode returned undefined, skipping this image',
            );
          }
          continue;
        }

        if (debug && imageConsoleLogMod % 50 === 0)
          console.log(
            'currentImage',
            mediaURL,
            await this.getImageInfo(mediaURL),
          );
        imageConsoleLogMod++;

        this.getImageInfo(mediaURL).then((info) => {
          // * the slider can move on while we're waiting for the response, and
          // * applying a stale one leaves the buttons pointing at the last image
          if (this.getCurrentMediaURL(slider) !== mediaURL) return;

          let existingOverlay = slider.parentNode.querySelector(
            'p.overlayBox, p.topBox',
          );
          const sliderParent = slider.parentNode;

          if (existingOverlay) {
            if (existingOverlay.parentNode) {
              const existingOverlayInCorrectPlace =
                (existingOverlay.parentNode as HTMLElement).classList.contains(
                  'keen-slider',
                ) ||
                (existingOverlay.parentNode as HTMLElement).classList.contains(
                  'tappable-view',
                );

              if (!existingOverlayInCorrectPlace) {
                existingOverlay.parentNode.removeChild(existingOverlay);
                existingOverlay = undefined;
                if (debug) {
                  console.log(
                    'Existing overlay not in correct place, removing it',
                  );
                }
              }
            }
          }

          if (!info) {
            // * we know nothing about the image on screen, so anything still
            // * on the slider belongs to a previous image - bin it rather than
            // * leaving buttons that open the wrong photo
            if (existingOverlay?.parentNode) {
              existingOverlay.parentNode.removeChild(existingOverlay);
              consoleOut('Removed stale overlay');
            }
            return;
          }

          if (!existingOverlay) {
            this.createOverlayNode(info, sliderParent);
            consoleOut('Added overlay');
          } // check to see if the overlay 'aria-url' matches the current image
          else if (existingOverlay.getAttribute('aria-url') !== info.original) {
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
    const visible = [...document.querySelectorAll('.likesYouCardItem')].reduce(
      (acc, topLevel) => {
        const stretchedBox = [
          ...topLevel.querySelectorAll('div.StretchedBox'),
        ] as HTMLDivElement[];

        return [
          ...acc,
          ...stretchedBox.filter((x) => {
            if (!x || x.style.backgroundImage === '') return acc;

            if (
              !x.checkVisibility({
                checkOpacity: true,
                visibilityProperty: true,
                contentVisibilityAuto: true,
              }) ||
              x.getAttribute('aria-has-overlay') === 'true'
            )
              return false;

            return true;
          }),
        ];
      },
      [] as HTMLDivElement[],
    );
    if (debug) console.log('visible', visible.length);
    visible.forEach(async (el) => {
      el.setAttribute('aria-has-overlay', 'true');

      const mediaURL = getImageURLfromNode(el);
      if (!mediaURL) {
        if (debug)
          console.log(
            'getImageURLfromNode returned undefined (likes-you-card), skipping this image',
          );
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
    overlayNode.innerHTML = `${
      text.overlay.createdAt
    }: ${date.getHours()}:${date.getMinutes()} ${date.toLocaleDateString()} ${xOld} Ago`;
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
        this.handleTopBoxPlace(overlayNode);
      } else {
        overlayNode.classList.add('overlayBox');
      }
    };

    parentElement.appendChild(overlayNode);

    onPlaced();

    return overlayNode;
  }

  handleTopBoxPlace(topBox: HTMLDivElement) {
    if (!topBox?.parentElement?.parentElement?.parentElement) return;
    // eslint-disable-next-line no-param-reassign
    topBox.parentElement.parentElement.parentElement.style.overflow = 'visible';
  }

  handleWindowResize() {
    const overlays = [
      ...document.querySelectorAll('p.overlayBox, p.topBox'),
    ].filter((el) => !el.classList.contains('noTopBox'));
    Promise.all(
      overlays.map(async (overlay: HTMLDivElement) => {
        const bounds = overlay.getBoundingClientRect();
        if (bounds.top >= 120 && overlay.classList.contains('overlayBox')) {
          overlay.classList.remove('overlayBox');
          overlay.classList.add('topBox');
          parentNode(overlay, 2).style.overflow = 'visible';
          parentNode(overlay, 5).style.top = '50px';
          this.handleTopBoxPlace(overlay);
        } else if (bounds.top < 120 && overlay.classList.contains('topBox')) {
          overlay.classList.add('overlayBox');
          overlay.classList.remove('topBox');
        } else {
          // just default to the overlayBox
          overlay.classList.add('overlayBox');
        }
      }),
    ).catch((e) => {
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
