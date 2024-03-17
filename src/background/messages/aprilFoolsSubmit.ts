import type { PlasmoMessaging } from '@plasmohq/messaging';
import { AnalyticsEvent } from '../../misc/GA';

export type AprilFoolsRequest = {
	event: 'swiped';
	direction: 'right' | 'left';
} | {
	event: 'attemptedRejection';
};

export type AprilFoolsResponse = {
	success: true;
};

const handler: PlasmoMessaging.MessageHandler<AprilFoolsRequest, AprilFoolsResponse> = async (req, res) => {
  const { event } = req.body;

  switch (event) {
    case 'swiped':
      await AnalyticsEvent([{
        name: 'aprilFoolsSwipe',
        params: {
          direction: req.body.direction,
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
