import type { PlasmoCSConfig } from 'plasmo';
import { relayMessage, sendToBackground } from '@plasmohq/messaging';
import LighterFuel from '@/contentsHelpers/LighterFuel';
import { debug } from '@/misc/config';
import type { sendAnalyticsEventRequest } from '~src/background/messages/sendAnalyticsEvent';
import { AprilFools } from '../contentsHelpers/AprilFools';

/**
 * Execute the script on the tinder website,
 * Running in 'main' world, which means it has access to the DOM
 */
export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_start',
  css: ['../contentsHelpers/style.css'],
};

relayMessage(
  {
    name: 'aprilFoolsSubmit',
  },
);

relayMessage(
  {
    name: 'aprilFoolsRequest',
  },
);

try {
  const lf = new LighterFuel();
  const aprilFools = new AprilFools();
  if (debug) console.log('April Fools:', aprilFools);
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
