import type { PlasmoMessaging } from '@plasmohq/messaging';
import { tinderRequestCap, mambaRequestCap } from '@/background/index';
import { ImageType, Sites } from '@/misc/types';

export type getImagesRequest = {
	site: Sites;
};

export type getImagesResponse = {
	images: ImageType[];
};

/**
 * This handles the getImages request from the CS
 * It returns all the images for the given site
 */
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // get the images from the main thread
  let images = [];
  switch (req.body.site) {
    case Sites.TINDER:
      images = tinderRequestCap.images;
      break;
    case Sites.MAMBA:
      images = mambaRequestCap.images;
      break;
    default:
      break;
  }
  res.send({
    images,
  });
};

export default handler;
