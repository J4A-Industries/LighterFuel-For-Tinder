import type { PlasmoMessaging } from '@plasmohq/messaging';

import { getFunMode } from '~src/background/Misc';
import type { Flags } from '~src/background/classes/FeatureFlagManager';

import { featureFlagManager } from '..';

export type getFeatureFlagsRequest = {};

export type getFeatureFlagsResponse = {
  flags: Flags;
};

const handler: PlasmoMessaging.MessageHandler<
  getFeatureFlagsRequest,
  getFeatureFlagsResponse
> = async (req, res) => {
  const { flags } = await featureFlagManager.getLatestFeatureFlags({
    funMode: await getFunMode(),
  });

  res.send({
    flags,
  });
};

export default handler;
