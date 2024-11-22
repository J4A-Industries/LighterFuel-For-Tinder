import type { PlasmoCSConfig } from 'plasmo';

import { MainWorldProfileInjector } from '~src/contentsHelpers/profileInjector';
import { debug } from '~src/misc/config';

export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_start',
  world: 'MAIN',
};

try {
  // get the profile
  const mainWorldProfileInjector = new MainWorldProfileInjector();
  if (debug) console.log('mainWorldProfileInjector', mainWorldProfileInjector);

  mainWorldProfileInjector.init().catch((e) => console.error(e));
} catch (e) {
  console.error(`Error in profile injector: ${e}`);
}
