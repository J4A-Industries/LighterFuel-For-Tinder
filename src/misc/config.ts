import languages from './languages.json';

export const debug = true;
export const gpt = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findLanguage = (): any => {
  const lang = navigator.language;
  if (lang.startsWith('en')) {
    return languages['en-GB'];
  }
  if (lang.startsWith('ru')) {
    return languages.ru;
  }
  if (lang.startsWith('uk')) {
    return languages.uk;
  }
  if (lang.startsWith('zh')) {
    return languages.zh;
  }
  if (lang.startsWith('de')) {
    return languages.de;
  }
  if (lang.startsWith('fr')) {
    return languages.fr;
  }
  if (lang.startsWith('nl')) {
    return languages.nl;
  }
  return languages['en-GB'];
};

export const text = findLanguage();

export const links = {
  github: 'https://github.com/Acorn221/LighterFuel-For-Tinder',
  ukraineAppeal: 'https://donation.dec.org.uk/ukraine-humanitarian-appeal',
  reviews:
    'https://chrome.google.com/webstore/detail/lighterfuel-for-tinder/bmcnbhnpmbkcpkhnmknmnkgdeodfljnc/reviews',
};
