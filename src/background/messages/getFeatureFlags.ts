import type { PlasmoMessaging } from '@plasmohq/messaging';

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
  const { flags } = await featureFlagManager.getLatestFeatureFlags();

  res.send({
    flags,
  });
};

export default handler;
