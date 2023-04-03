import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo';
import styleText from 'data-text:./injectedCss.css';
import LighterFuel from './LighterFuel';
import { debug } from '@/misc/config';

export const config: PlasmoCSConfig = {
  matches: ['https://tinder.com/*'],
  run_at: 'document_start',
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styleText;
  return style;
};

try {
  console.log('Working!');
  const lf = new LighterFuel();
  // prints the lf instance to the console for debugging!
  if (debug) console.log(lf);
} catch (err) {
  console.error(err);
}
