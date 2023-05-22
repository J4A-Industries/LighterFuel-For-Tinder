import styleText from 'data-text:~src/contentsHelpers/style.css';
import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo';
import { debug } from '@/misc/config';
import MambaJamba from '@/contentsHelpers/MambaJamba';

/**
 * Execute the script on the tinder website,
 * Running in 'main' world, which means it has access to the DOM
 */
export const config: PlasmoCSConfig = {
  matches: ['*://www.mamba.ru/*'],
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
  const MJ = new MambaJamba();
  if (debug) console.log(MJ);
} catch (err) {
  console.error(err);
}
