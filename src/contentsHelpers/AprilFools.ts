/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
import { FB } from 'featbit-js-client-sdk';
import { Storage } from '@plasmohq/storage';
import { FEATBIT_CLIENT_KEY, chromeStore } from '../misc/config';

export const getFbClient = async () => {
  const fbClient = new FB();

  const storage = new Storage({
    area: 'sync',
  });

  const clientId = await storage.get('clientId');

  await fbClient.init({
    secret: FEATBIT_CLIENT_KEY,
    api: 'https://featbit-tio-eu-eval.azurewebsites.net',
    user: {
      name: 'user',
      keyId: clientId,
      customizedProperties: [
        {
          name: 'group',
          value: chromeStore ? 'chrome' : 'package_release',
        },
      ],
    },
  });

  return fbClient;
};

/* eslint-disable class-methods-use-this */
const checkDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  if (year === 2024 && month === 3 && day === 1) {
    return true;
  }
  return false;
};

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

class AprilFools {
  enabled = false;

  observers = [];

  alertedForCurrentSwipe = false;

  constructor() {
    // document.addEventListener('', () => {
    //   this.injectOwnProfile();
    // });
    this.handleEnabled();
    document.addEventListener('DOMContentLoaded', () => {
      setInterval(() => {
        this.reRouteDislikeButton();
        this.monitorLeftSwipe();
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
    this.alertedForCurrentSwipe = true;
    alert('Sorry this person is too sexy to dislike today, please try again with someone else.\nFor More information, Please Open LighterFuel and see the April update notes.');
  }

  handleEnabled() {
    getFbClient().then((fbClient) => {
      const runAprilFools = fbClient.variation('aprilfools', false);
      this.enabled = runAprilFools;
    });
  }
}

export { AprilFools };
