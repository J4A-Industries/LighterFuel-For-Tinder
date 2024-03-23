import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import { AnalyticsEvent } from '../../misc/GA';

export type AprilFoolsRequest = {
	event: 'swiped';
	result: 'like' | 'pass';
} | {
	event: 'attemptedRejection';
};

export type AprilFoolsResponse = {
	success: true;
};

const handler: PlasmoMessaging.MessageHandler<AprilFoolsRequest, AprilFoolsResponse> = async (req, res) => {
  const { event } = req.body;

  const storage = new Storage({
    area: 'sync',
  });

  await storage.setItem('aprilFools2024Displayed', true);

  switch (event) {
    case 'swiped':
      await AnalyticsEvent([{
        name: 'aprilFoolsSwipe',
        params: {
          result: req.body.result,
        },
      }]);
      break;
    case 'attemptedRejection':
      await AnalyticsEvent([{
        name: 'aprilFoolsAttemptedRejection',
      }]);
      break;
    default:
      break;
  }

  res.send({
    success: true,
  });
};

export default handler;
