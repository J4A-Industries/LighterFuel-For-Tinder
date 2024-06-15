import type { PlasmoCSConfig } from 'plasmo';
import { sendToBackground } from '@plasmohq/messaging';
import LighterFuel from '@/contentsHelpers/LighterFuel';
import { debug } from '@/misc/config';
import type { sendAnalyticsEventRequest } from '~src/background/messages/sendAnalyticsEvent';
/**
 * Execute the script on the tinder website,
 * Running in 'main' world, which means it has access to the DOM
 */
export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_start',
  css: ['../contentsHelpers/style.css'],
};

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
        value: `Error thrown in tinder.ts, ${err}`,
      },
    },
  }).then((res) => {
    if (debug) console.log(res);
  });
}
