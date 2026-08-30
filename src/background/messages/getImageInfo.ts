import type { MessageHandler } from '@/misc/messaging';
import { peopleHandler } from '..';
import type { photoInfo } from '../PeopleHandler';

export type getImageInfoRequest = {
	url: string;
};

export type getImageInfoResponse = {
	info: photoInfo;
};

const handler: MessageHandler<getImageInfoRequest, getImageInfoResponse> = async (req, res) => {
  const info = peopleHandler.getInfoFromPhoto(req.body.url);
  res.send({
    info,
  });
};

export default handler;
