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
  type ImageType,
  type ProfileImage,
  type ShowSettings,
  Sites,
  type profileSliderContainer,
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

    this.initialiseMessageListner = this.initialiseMessageListner.bind(this);

    this.getData = this.getData.bind(this);

    this.startMonitorInterval();
  }

  startMonitorInterval() {
    setInterval(() => {
      const keenSlider = [...document.querySelectorAll('div.keen-slider, div.profileCard__slider')];
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
          const imageRecord = this.images.find((image) => imageURL.includes(image.url));

          // this doesn't seem to be problematic, it sometimes just doesn't find the image
          if (!imageRecord) {
            break;
          }

          const existingOverlay = slider.parentNode.querySelector('p.overlayBox, p.topBox');
          const sliderParent = slider.parentNode;

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
}

export default LighterFuel;
