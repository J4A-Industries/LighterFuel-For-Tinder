import { defineContentScript } from '#imports';

import { relayMessage } from '@/misc/messaging';

/**
 * Relays messages from the page's MAIN world through to the background worker
 */
export default defineContentScript({
  matches: ['*://tinder.com/*'],
  runAt: 'document_start',
  allFrames: true,
  main() {
    relayMessage({ name: 'pong' });
    relayMessage({ name: 'getImageInfo' });
    relayMessage({ name: 'sendAnalyticsEvent' });
    relayMessage({ name: 'getProfile' });
    relayMessage({ name: 'getPeople' });
    relayMessage({ name: 'convertPersonType' });
  },
});
