import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo';
import styleText from 'data-text:~src/contentsHelpers/style.css';
import LighterFuel from '@/contentsHelpers/LighterFuel';
import { debug } from '@/misc/config';

/**
 * Execute the script on the tinder website,
 * Running in 'main' world, which means it has access to the DOM
 */
export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_start',
  css: ['./../contentsHelpers/style.css'],
};

/**
 * Executing styling on the site, letting me use tailwind
 */
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styleText;
  return style;
};

try {
  const lf = new LighterFuel();
  // prints the lf instance to the console for debugging!
  if (debug) console.log(lf);
} catch (err) {
  console.error(err);
}
