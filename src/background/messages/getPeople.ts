import type { MessageHandler } from '@/misc/messaging';
import { peopleHandler } from '..';

const handler: MessageHandler = async (req, res) => {
  peopleHandler.handleNewPeople(req.body.people);
  res.send({
    received: true,
  });
};

export default handler;
