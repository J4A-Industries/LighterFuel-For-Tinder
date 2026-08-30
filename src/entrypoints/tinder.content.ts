import { defineContentScript } from '#imports';

import '@/contentsHelpers/style.css';

import LighterFuel from '@/contentsHelpers/LighterFuel';
import { debug } from '@/misc/config';
import { sendToBackground } from '@/misc/messaging';

import type { sendAnalyticsEventRequest } from '@/background/messages/sendAnalyticsEvent';

/**
 * Execute the script on the tinder website,
 * Running in the isolated world, which means it has access to the DOM
 */
export default defineContentScript({
  matches: ['*://tinder.com/*'],
  runAt: 'document_start',
  main() {
    try {
      const lf = new LighterFuel();
      if (debug) console.log(lf);
    } catch (err) {
      console.error(err);
      sendToBackground<sendAnalyticsEventRequest>({
        name: 'sendAnalyticsEvent',
        body: {
          name: 'Error',
          params: {
            event_title: 'error',
            value: `Error thrown in tinder.content.ts, ${err}`,
          },
        },
      }).then((res) => {
        if (debug) console.log(res);
      });
    }
  },
});
