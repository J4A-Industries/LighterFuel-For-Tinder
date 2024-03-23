/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
import { sendToBackground, sendToBackgroundViaRelay } from '@plasmohq/messaging';
import type { AprilFoolsReqRequest, AprilFoolsReqResponse } from '../background/messages/aprilFoolsRequest';
import type { AprilFoolsRequest, AprilFoolsResponse } from '../background/messages/aprilFoolsSubmit';

const dislikeButtonPath = 'm15.44 12 4.768 4.708c1.056.977 1.056 2.441 0 3.499-.813 1.057-2.438 1.057-3.413 0L12 15.52l-4.713 4.605c-.975 1.058-2.438 1.058-3.495 0-1.056-.813-1.056-2.44 0-3.417L8.47 12 3.874 7.271c-1.138-.976-1.138-2.44 0-3.417a1.973 1.973 0 0 1 3.25 0L12 8.421l4.713-4.567c.975-1.139 2.438-1.139 3.413 0 1.057.814 1.057 2.44 0 3.417L15.44 12Z';

const getParentElement = (root: Element, parentType: string) => {
  const parent = root.parentElement;
  if (parent) {
    if (parent.tagName.toLowerCase() === parentType) {
      return parent;
    }
    return getParentElement(parent, parentType);
  }
  return null;
};

const profileImageIds = ['b7df15f5-506e-4621-b84f-8f35e3e3893e', 'fb8a5567-b61e-489e-99d4-d31cfb7a529f', '0e840a98-1f43-4561-8a74-108fe7c16b96', '166b2853-6237-41aa-bece-7f0c1c3164d8', 'c3ff2819-a924-424e-90e7-ecc8632b04d8'];

class AprilFools {
  enabled = false;

  observers = [];

  alertedForCurrentSwipe = false;

  alreadyPassed = false;

  constructor() {
    this.checkToRun();
    document.addEventListener('DOMContentLoaded', () => {
      const runInterval = setInterval(() => {
        this.reRouteDislikeButton();
        this.monitorLeftSwipe();
        this.checkToRun();
        if (this.alreadyPassed) {
          clearInterval(runInterval);
        }
      }, 50);
    });
  }

  reRouteDislikeButton() {
    const innerSVG = [...document.querySelectorAll('path')].find((x) => x.getAttribute('d') === dislikeButtonPath);
    if (!innerSVG) return;
    const button = getParentElement(innerSVG, 'button');
    if (!button) return;
    if (button.getAttribute('aria-listen')) return;
    // console.log(button);
    button.setAttribute('aria-listen', 'true');
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Dislike button clicked');
      this.triggerPopup();
    });
  }

  monitorLeftSwipe() {
    const boxes = [...document.querySelectorAll('div.StretchedBox')].filter((x) => x.getAttribute('data-keyboard-gamepad'));
    if (boxes.length === 0) return;
    boxes.forEach((box) => {
      if (box.getAttribute('aria-monitored') === 'true') return;
      box.setAttribute('aria-monitored', 'true');
      // Find the div with the text "Nope"
      const nope = [...box.querySelectorAll('div')].find((x) => x.textContent === 'Nope');
      // monitor the nope opacity
      if (nope) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style') {
              // @ts-expect-error
              if (mutation.target.style) {
                const node = mutation.target as HTMLElement;
                const { opacity } = node.style;

                if (parseFloat(opacity) >= 0.2) {
                  this.triggerPopup();
                } else {
                  this.alertedForCurrentSwipe = false;
                }
              }
            }
          });
        });
        observer.observe(nope, { attributes: true, attributeFilter: ['style'], subtree: false });
        this.observers.push(observer);
      }
    });
  }

  triggerPopup() {
    if (!this.enabled) return;
    if (this.alertedForCurrentSwipe) return;
    if (!this.isJamesDisplayed()) return;
    this.alertedForCurrentSwipe = true;
    alert('Sorry this person is too hot to dislike today, please try again with someone else.\nFor More information, Please Open LighterFuel and see the April update notes.');
    sendToBackground<AprilFoolsRequest, AprilFoolsResponse>({
      name: 'aprilFoolsSubmit',
      body: {
        event: 'attemptedRejection',
      },
    });
  }

  async checkToRun() {
    console.log('Checking to run');
    const run = await sendToBackground<AprilFoolsReqRequest, AprilFoolsReqResponse>({
      name: 'aprilFoolsRequest',
    });
    console.log('April fools', run.runAprilFools);
    this.enabled = run.runAprilFools;
    this.alreadyPassed = run.alreadyPassed;
  }

  isJamesDisplayed() {
    if (this.alreadyPassed) return;
    // search for divs with the .StretchedBox class
    const cards = [...document.querySelectorAll('div.StretchedBox')].filter((x) => x.getAttribute('data-keyboard-gamepad'));

    console.log('cards', cards.length);
    // if no cards are found, return false
    if (cards.length === 0) return false;

    // loop through all the cards and search for any of the profile images

    const found = cards.some((card) => {
      const images = [...card.querySelectorAll('div')];
      return images.some((image) => {
        const style = image.getAttribute('style');
        if (!style) return false;
        return profileImageIds.some((id) => style.includes(id));
      });
    });

    console.log('found', found);

    return found;
  }
}

export { AprilFools };
