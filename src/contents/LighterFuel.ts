/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import browser from 'webextension-polyfill';
import { Storage } from '@plasmohq/storage';
import { createRoot } from 'react-dom/client';
import {
  createButton,
  getTimeOld,
  parentNode,
  consoleOut,
  getShownImages,
  getImageURLfromNode,
  getDomsWithBGImages,
  getProfileImages,
} from '@/contents/Misc';

import { debug, text } from '@/misc/config';

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

    this.mainMutationObserver = new MutationObserver(() => this.profileMutationCallback);
    this.storage = new Storage();

    if (debug) this.setCustomFetch();
    this.initialiseMessageListner();
    this.getInitialData();
    this.startMonitorInterval();
  }

  startMonitorInterval() {
    setInterval(() => {
      const keenSlider = [...document.querySelectorAll('div.keen-slider')];
      if (keenSlider.length > 0) {
        // For every slider, make sure there's the overlay
        for (const slider of keenSlider) {
          const existingOverlay = slider.parentNode.querySelector('p.overlayBox, p.topBox');
          const sliderParent = slider.parentNode;
          if (!existingOverlay) {
            // Find the image that's currently shown
            const currentImage = slider.querySelector('div.StretchedBox');
            const imageURL = getImageURLfromNode(currentImage);
            const imageRecord = this.images.find((image) => image.url === imageURL);
            if (!imageRecord) return consoleOut(`imageRecord not found in startMonitorInterval ${imageURL} ${JSON.stringify(this.images)}`);
            const overlay = this.createOverlayNode(imageRecord);
            sliderParent.appendChild(overlay.overlayNode);
            overlay.onPlaced();
            consoleOut('Added overlay');
          } else {
            // check to see if the overlay 'aria-url' matches the current image
            const currentImage = slider.querySelector('div.StretchedBox');
            const imageURL = getImageURLfromNode(currentImage);
            const imageRecord = this.images.find((image) => image.url === imageURL);
            if (!imageRecord) return consoleOut(`imageRecord not found in startMonitorInterval ${imageURL} ${JSON.stringify(this.images)}`);
            // check to see if the overlay 'aria-url' matches the current image
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
      }
      const profileSlideContainer = [...document.querySelectorAll('div.profileCard__slider')];
      if (profileSlideContainer.length > 0) {
        // this.monitorContainer(profileSlideContainer[0]);
      }
    }, 50);
  }

  /**
   * A method to monitor the container of the profile images DIV
   *
   * @param {HTMLElement} container The profile images DIV
   * @returns {MutationObserver} The MutationObserver that has been created
   */
  monitorContainer(container: Element): MutationObserver | undefined {
    const config = { attributes: true, subtree: true, childList: true };

    const observer = new MutationObserver((mutationsList) => {
      this.profileMutationCallback(mutationsList, container);
    });
    observer.observe(container, config);
    if (!document.body.contains(container)) {
      // TODO: find why this is needed and sort it out
      consoleOut('observer disconnected in monitorContainer, not sure why this is needed yet');
      observer.disconnect();
      return;
    }
    return observer;
  }

  /**
   * The mutation observer callback which is put on the profile image container
   *
   * @param {MutationRecord} mutationsList The mutation list that has occurred
   * @param {HTMLElement} container The container on which the observer was observing
   *
   */
  profileMutationCallback(mutationsList: MutationRecord[], container: Element) {
    for (const mutation of mutationsList) {
      // if "hidden" has changed (the pic displayed has changed)
      if (mutation.type === 'attributes') {
        // for every image span (div inside span is image)
        for (const node of container.children) {
          // check whether or not the image is shown
          if (node.getAttribute('aria-hidden') === 'false' || node.parentNode.children.length === 1) { // ! broken, it doesn't always have aria-hidden,
            // ! sometimes there's only 1 child
            const internalImage = getDomsWithBGImages(node as HTMLElement);
            if (internalImage.length > 0) {
              const imageURL = getImageURLfromNode(internalImage[0]);
              consoleOut(`Now displaying: ${imageURL}`);
              const containerRecord = this.profileSliderContainers.find((x) => x.containerDOM === container);

              if (!containerRecord) return consoleOut('containerRecord not found in profileMutationCallback');
              // ! somewhere here, there's an error
              // ! not sure, the image is downloaded and the console outputs the image URL
              const requestRecord = this.images.find((y) => y.url === imageURL);
              if (!requestRecord) {
                consoleOut('request record invalid in monitor container :( running findNodes again, container record:');
                consoleOut(containerRecord);
                consoleOut(requestRecord);
                this.findNodes();
                return;
              }
              const overlay = this.createOverlayNode(requestRecord);
              const newOverlayBox = overlay.overlayNode;
              parentNode(containerRecord.overlayBox, 1).replaceChild(newOverlayBox, containerRecord.overlayBox);
              containerRecord.overlayBox = newOverlayBox;
              overlay.onPlaced();
            }
          }
        }
      }
    }
  }

  /**
   * Set's the profile slider up and adds a new record to the "profileSliderContainers"
   *
   * @param {HTMLElement} imgDom The profile element
   */
  setupProfileSlider(imgDom: HTMLElement) {
    const profileImages = getProfileImages(imgDom, this.images);
    if (profileImages.length > 0) {
      // this might break, not sure of a better way to do it though! This is most likely to break first
      let profileImagesContainer = parentNode(profileImages[0].domNode, 2);

      if (profileImagesContainer.nodeName === 'SPAN') profileImagesContainer = parentNode(profileImagesContainer, 1);
      let overlayBoxDom = parentNode(profileImagesContainer, 1).querySelector('.overlayBox');
      const containerRecord = this.profileSliderContainers.find((x) => x.containerDOM === profileImagesContainer);
      // if container record not already in profileSliderContainers array, add it
      if (!containerRecord) {
        // TODO: might not always be profileImages[0]
        const overlay = this.createOverlayNode(profileImages[0].data);
        overlayBoxDom = overlay.overlayNode;
        parentNode(profileImagesContainer, 1).appendChild(overlayBoxDom);
        const observer = this.monitorContainer(profileImagesContainer);
        if (!observer) return consoleOut('observer not created in setupProfileSlider, monitorContainer returned undefined');
        overlay.onPlaced();
        const newRecord = {
          containerDOM: profileImagesContainer as HTMLElement,
          observer,
          overlayBox: overlayBoxDom as HTMLElement,
        };
        this.profileSliderContainers.push(newRecord);

        consoleOut('New container found! Record: ');
        consoleOut(newRecord);
      }
    }
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
    /* window.requestIdleCallback(() => {
      const pImages = getProfileImages(document, this.images);
      pImages.forEach((node) => {
        if (!node.domNode.parentNode) throw new Error('node.domNode.parentNode is null in addNewImage');
        this.setupProfileSlider(node.domNode.parentNode as HTMLElement);
      });
    }); */ // * To remove maybe
  }

  /**
   * Sets the mutation observer after the profile images have been identified to exist
   */
  findNodes() {
    this.lookForProfileImages().then((profileImages) => {
      const config = { attributes: false, childList: true, subtree: true };
      consoleOut(profileImages);
      profileImages.forEach((node) => this.setupProfileSlider(node.domNode.parentNode as HTMLElement));
      this.mainMutationObserver.observe(document.getElementsByClassName('App')[0], config);
    });
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
   * @param {String} lastModified The last modified time from the image
   * @returns {HTMLElement}
   */
  createOverlayNode(data: ImageType) {
    const { lastModified } = data;
    const overlayNode = document.createElement('p');
    const date = new Date(lastModified);
    const xOld = getTimeOld(date.getTime());
    const outFormat = `${date.getHours()}:${date.getMinutes()} ${date.toLocaleDateString()} <br>${xOld} Old`;
    overlayNode.innerHTML = `${text.overlay.uploadedAt}: ${outFormat}`;
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
.buttonLF .search { ${this.showSettings.searchButton ? '' : 'display: none'} }`;
    consoleOut(this.showSettings);
  }
}

export default LighterFuel;
