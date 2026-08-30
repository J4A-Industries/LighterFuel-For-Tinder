import type { MessageHandler } from '@/misc/messaging';
import { peopleHandler } from '..';

const handler: MessageHandler = async (req, res) => {
  // * merging before the cache is back would let hydration skip these people
  await peopleHandler.ready();

  peopleHandler.handleNewPeople(req.body.people);
  res.send({
    received: true,
  });
};

export default handler;
