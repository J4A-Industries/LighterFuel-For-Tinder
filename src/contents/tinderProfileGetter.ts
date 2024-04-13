import type { PlasmoCSConfig } from 'plasmo';
import ProfileGetter from '~src/contentsHelpers/ProfileGetter';
import { debug } from '~src/misc/config';

export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_start',
  world: 'MAIN',
};

try {
  const getter = new ProfileGetter();
  if (debug) console.log('Getter created!', getter);
} catch (e) {
  console.error(`Error in profile getter: ${e}`);
}
