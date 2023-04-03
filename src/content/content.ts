import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo';
import styleText from 'data-text:./injectedCss.css';
import LighterFuel from './LighterFuel';
import { debug } from '@/misc/config';

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styleText;
  return style;
};

export const config: PlasmoCSConfig = {
  matches: ['https://www.tinder.com/*'],
};

window.addEventListener('load', () => {
  try {
    const lf = new LighterFuel();
    // prints the lf instance to the console for debugging!
    if (debug) console.log(lf);
  } catch (err) {
    console.error(err);
  }
});
