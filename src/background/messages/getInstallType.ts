import type { PlasmoMessaging } from '@plasmohq/messaging';

export type getInstallTypeRequest = {

};

export type getInstallTypeResponse = {
	installType: string;
};

/**
 * This handles the getImages request from the CS
 * It returns all the images for the given site
 */
const handler: PlasmoMessaging.MessageHandler<getInstallTypeRequest, getInstallTypeResponse> = async (req, res) => {
  // get the images from the main thread
  const { installType } = await chrome.management.getSelf();

  res.send({
    installType,
  });
};

export default handler;
