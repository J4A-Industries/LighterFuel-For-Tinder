import type { PlasmoMessaging } from '@plasmohq/messaging';
import { peopleHandler } from '..';
import type { photoInfo } from '../PeopleHandler';

export type getImageInfoRequest = {
	url: string;
};

export type getImageInfoResponse = {
	info: photoInfo;
};

const handler: PlasmoMessaging.MessageHandler<getImageInfoRequest, getImageInfoResponse> = async (req, res) => {
  const info = peopleHandler.getInfoFromPhoto(req.body.url);
  res.send({
    info,
  });
};

export default handler;
