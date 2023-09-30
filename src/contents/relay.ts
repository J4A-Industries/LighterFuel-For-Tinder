import { relay } from '@plasmohq/messaging/relay';
import { sendToBackground } from '@plasmohq/messaging';
import type { getImagesRequest, getImagesResponse } from '~src/background/messages/getImages';

relay<string, getImagesRequest, getImagesResponse>(
  {
    name: 'getImages',
  },
  (req) => sendToBackground({
    name: 'getImages',
    body: req.body,
  }),
);
