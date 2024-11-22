import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';

import { getProfileShower } from '~src/background';
import type { ShowProfilesFeatureFlag } from '~src/background/classes/FeatureFlagManager';

export type GetProfileToShowRequest = {};

export type GetProfileToShowResponse =
  ShowProfilesFeatureFlag['profiles'][number];

const handler: PlasmoMessaging.MessageHandler<
  GetProfileToShowRequest,
  GetProfileToShowResponse
> = async (req, res) => {
  const profileShower = await getProfileShower();
  const flagData = profileShower.getProfile();

  res.send(flagData);
};

export default handler;
