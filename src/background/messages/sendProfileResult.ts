import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';

import { getProfileShower } from '~src/background';

export type SendProfileResultRequest = {
  profileFlagId: string;
} & (
  | {
      event: 'swiped';
      result: 'like' | 'pass';
    }
  | {
      event: 'attemptedRejection';
    }
);

export type SendProfileResultResponse = {
  success: true;
};

const handler: PlasmoMessaging.MessageHandler<
  SendProfileResultRequest,
  SendProfileResultResponse
> = async (req, res) => {
  const { event, profileFlagId } = req.body;

  const profileShower = await getProfileShower();

  switch (event) {
    case 'swiped':
      await profileShower.handleSwipe(profileFlagId, req.body.result);
      break;
    case 'attemptedRejection':
      await profileShower.handleAttemptedRejection(profileFlagId);
      break;
    default:
      throw new Error(`Unknown event: ${event}`);
  }

  res.send({
    success: true,
  });
};

export default handler;
