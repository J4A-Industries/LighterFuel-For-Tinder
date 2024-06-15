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
  let installType = 'unknown';
  try {
    const self = await chrome.management.getSelf();
    installType = self.installType;
  } catch (e) {
    console.error('Error getting install type', e);
  } finally {
    res.send({ installType });
  }
};

export default handler;
