import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';

export type SendProfileResultRequest =
  | {
      event: 'swiped';
      result: 'like' | 'pass';
    }
  | {
      event: 'attemptedRejection';
    };

export type SendProfileResultResponse = {
  success: true;
};

const handler: PlasmoMessaging.MessageHandler<
  SendProfileResultRequest,
  SendProfileResultResponse
> = async (req, res) => {
  const { event } = req.body;

  const storage = new Storage({
    area: 'sync',
  });

  switch (event) {
    case 'swiped':
      // TODO: call showProfile class - set swiped event
      // await storage.setItem('aprilFools2024Displayed', true);
      // await AnalyticsEvent([
      //   {
      //     name: 'aprilFoolsSwipe',
      //     params: {
      //       result: req.body.result,
      //     },
      //   },
      // ]);
      break;
    case 'attemptedRejection':
      // TODO: call showProfile class - set attempted rejection event

      // await AnalyticsEvent([
      //   {
      //     name: 'aprilFoolsAttemptedRejection',
      //   },
      // ]);
      break;
    default:
      break;
  }

  res.send({
    success: true,
  });
};

export default handler;
