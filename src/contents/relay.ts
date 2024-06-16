import { relayMessage } from '@plasmohq/messaging';
import { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
};

relayMessage(
  {
    name: 'pong',
  },
);

relayMessage(
  {
    name: 'getImageInfo',
  },
);

relayMessage(
  {
    name: 'sendAnalyticsEvent',
  },
);

relayMessage(
  {
    name: 'getProfile',
  },
);

relayMessage(
  {
    name: 'getPeople',
  },
);

relayMessage({
  name: 'bumbleID',
});
