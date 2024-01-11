import { relayMessage } from '@plasmohq/messaging';

relayMessage(
  {
    name: 'pong',
  },
);

relayMessage(
  {
    name: 'getImages',
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
