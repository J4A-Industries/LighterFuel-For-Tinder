import type { PlasmoMessaging } from '@plasmohq/messaging';
import { tinderRequestCap, mambaRequestCap } from '@/background/index';
import { type ImageType, Sites } from '@/misc/types';

export type getImagesRequest = {
	site: Sites;
  complete?: boolean;
};

export type getImagesResponse = {
	images: ImageType[];
};

/**
 * This handles the getImages request from the CS
 * It returns all the images for the given site
 */
const handler: PlasmoMessaging.MessageHandler<getImagesRequest, getImagesResponse> = async (req, res) => {
  // get the images from the main thread
  const { complete } = req.body;
  let images = [];

  switch (req.body.site) {
    case Sites.TINDER:
      images = complete ? tinderRequestCap.getAllImages() : await tinderRequestCap.getNewImages();
      break;
    case Sites.MAMBA:
      images = complete ? mambaRequestCap.getAllImages() : await mambaRequestCap.getNewImages();
      break;
    default:
      break;
  }
  res.send({
    images,
  });
};

export default handler;
