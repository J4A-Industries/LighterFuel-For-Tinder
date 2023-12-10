import languages from './languages.json';

export const debug = process.env.PLASMO_PUBLIC_DEBUG === 'true';
export const gpt = false;

export const chromeStore = process.env.PLASMO_PUBLIC_PKG_ID !== chrome.runtime.id;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findLanguage = (): any => {
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
    'https://chrome.google.com/webstore/detail/lighterfuel-for-tinder/bmcnbhnpmbkcpkhnmknmnkgdeodfljnc/reviews',
  discord: 'https://discord.gg/nHcDMkqYgP',
};

export const defaultSettings = {
  overlayButton: true,
  searchButton: true,
  debuggingTelemetry: true,
  streamerMode: false,
};
