import type { MessageHandler } from '@/misc/messaging';
import { peopleHandler } from '..';

const handler: MessageHandler = async (req, res) => {
  // * merging before the cache is back would let hydration skip this person
  await peopleHandler.ready();

  await peopleHandler.handleProfile(req.body.profile);
  res.send({
    recieved: true,
  });
};

export default handler;
