import { defineContentScript } from '#imports';

import { FetchInterceptor } from '@/contentsHelpers/FetchInterceptor';
import { ProfileGetter } from '@/contentsHelpers/ProfileGetter';
import { debug } from '@/misc/config';

/**
 * Runs in the page's MAIN world so it can intercept tinder's own fetch calls
 */
export default defineContentScript({
  matches: ['*://tinder.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    try {
      const fetchInterceptor = new FetchInterceptor();
      const getter = new ProfileGetter(fetchInterceptor);

      if (debug)
        console.log('Main world classes setup!', fetchInterceptor, getter);
    } catch (e) {
      console.error(`Error in profile getter: ${e}`);
    }
  },
});
