import { PlasmoCSConfig } from 'plasmo';

import { relayMessage } from '@plasmohq/messaging';

export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_start',
  all_frames: true,
};

relayMessage({
  name: 'pong',
});

relayMessage({
  name: 'getImageInfo',
});

relayMessage({
  name: 'sendAnalyticsEvent',
});

relayMessage({
  name: 'getProfile',
});

relayMessage({
  name: 'getPeople',
});

relayMessage({
  name: 'bumbleID',
});

relayMessage({
  name: 'getFeatureFlags',
});

relayMessage({
  name: 'getProfileToShow',
});

relayMessage({
  name: 'sendProfileResult',
});
