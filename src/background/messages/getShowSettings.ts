import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
// import type { ShowSettings } from '../../misc/types';

type ShowSettings = any;

export type getShowSettingsResponse = ShowSettings;

const handler: PlasmoMessaging.MessageHandler<undefined, getShowSettingsResponse> = async (req, res) => {
  const storage = new Storage();

  const showSettings = await storage.get<ShowSettings | undefined>('showSettings');

  if (showSettings.disableSuperLikeUpsell === undefined) {
    showSettings.disableSuperLikeUpsell = true;

    await storage.set('showSettings', showSettings);
  }

  console.log('Show settings requested!');

  res.send(showSettings);
};

export default handler;
