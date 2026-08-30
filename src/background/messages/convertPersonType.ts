/* eslint-disable no-underscore-dangle */
import type { MessageHandler } from '@/misc/messaging';
import { peopleHandler } from '..';

export type ConvertPersonTypeRequest = {
	personId: string;
  type: 'rec' | 'profile' | 'match';
};

export type ConvertPersonTypeResponse = {
  received: true;
};

const handler: MessageHandler<ConvertPersonTypeRequest, ConvertPersonTypeResponse> = async (req, res) => {
  // * the worker may have just restarted, so wait for the cache to come back
  await peopleHandler.ready();

  const converted = peopleHandler.convertPersonType(req.body.personId, req.body.type);

  if (!converted) {
    console.error('Could not find person with id', req.body.personId);
    return;
  }

  res.send({
    received: true,
  });
};

export default handler;
