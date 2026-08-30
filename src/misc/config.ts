import { browser } from 'wxt/browser';

import languages from './languages.json';

// * set WXT_DEBUG=true in .env (or the shell) to turn the debug logging on
export const debug = import.meta.env.WXT_DEBUG === 'true';
export const gpt = false;
export const chromeWebStoreId = 'bmcnbhnpmbkcpkhnmknmnkgdeodfljnc';
export const chromeStore = browser.runtime.id === chromeWebStoreId;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findLanguage = (): (typeof languages)['en-GB'] => {
  const lang = navigator.language;
  if (lang.startsWith('en')) {
    return languages['en-GB'];
  }
  return languages['en-GB'];
};

export const text = findLanguage();

export const links = {
  github: 'https://github.com/Acorn221/LighterFuel-For-Tinder',
  ukraineAppeal: 'https://donation.dec.org.uk/ukraine-humanitarian-appeal',
  reviews:
    'https://chromewebstore.google.com/detail/lighterfuel-for-tinder/bmcnbhnpmbkcpkhnmknmnkgdeodfljnc/reviews',
  discord: 'https://discord.gg/nHcDMkqYgP',
};

export const defaultSettings = {
  overlayButton: true,
  searchButton: true,
  debuggingTelemetry: true,
};
