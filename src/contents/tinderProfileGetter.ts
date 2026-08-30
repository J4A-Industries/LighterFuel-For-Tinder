import type { PlasmoCSConfig } from 'plasmo';

import { FetchInterceptor } from '~src/contentsHelpers/FetchInterceptor';
import { ProfileGetter } from '~src/contentsHelpers/ProfileGetter';
import { debug } from '~src/misc/config';

export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_start',
  world: 'MAIN',
};

try {
  const fetchInterceptor = new FetchInterceptor();

  const getter = new ProfileGetter(fetchInterceptor);

  if (debug) console.log('Main world classes setup!', fetchInterceptor, getter);
} catch (e) {
  console.error(`Error in profile getter: ${e}`);
}
