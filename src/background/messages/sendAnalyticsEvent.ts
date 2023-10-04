import type { PlasmoMessaging } from '@plasmohq/messaging';
import { AnalyticsEvent } from '~src/misc/GA';

export type sendAnalyticsEventRequest = {
	event: string;
	params?: any;
};

export type sendAnalyticsEventResponse = {
	success: boolean;
};

const handler: PlasmoMessaging.MessageHandler<sendAnalyticsEventRequest, sendAnalyticsEventResponse> = async (req, res) => {
  try {
    AnalyticsEvent([{
      name: req.body.event,
      params: req.body.params,
    }]);
    res.send({
      success: true,
    });
  } catch (err: any) {
    res.send({
      success: false,
    });
  }
};

export default handler;
