import type { PlasmoCSConfig } from 'plasmo';
import { debug } from '@/misc/config';
import MambaJamba from '@/contentsHelpers/MambaJamba';

/**
 * Execute the script on the tinder website,
 * Running in 'main' world, which means it has access to the DOM
 */
export const config: PlasmoCSConfig = {
  matches: ['*://www.mamba.ru/*'],
  run_at: 'document_start',
  css: ['../contentsHelpers/style.css'],
};

try {
  const MJ = new MambaJamba();
  if (debug) console.log(MJ);
} catch (err) {
  console.error(err);
}
