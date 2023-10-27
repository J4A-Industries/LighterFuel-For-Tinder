import { relay } from '@plasmohq/messaging/relay';
import { sendToBackground } from '@plasmohq/messaging';
import type { getImagesRequest, getImagesResponse } from '~src/background/messages/getImages';

relay<string, getImagesRequest, getImagesResponse>(
  {
    name: 'getImages',
  },
  async (req) => {
    let res: getImagesResponse = {
      images: [],
    };
    try {
      res = await sendToBackground({
        name: 'getImages',
        body: req.body,
      });
    } catch (e) {
      console.log(`Error thrown in getData, it's probably fine ${e}`);
    }
    return res;
  },
);

relay<string, any, any>(
  {
    name: 'getPeople',
  },
  async (req) => {
    let res: getImagesResponse = {
      images: [],
    };
    try {
      res = await sendToBackground({
        name: 'getPeople',
        body: req.body,
      });
    } catch (e) {
      console.log(`Error thrown in getPeople relay, ${e}`);
    }
    return res;
  },
);
