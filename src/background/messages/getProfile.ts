import type { MessageHandler } from '@/misc/messaging';
import { peopleHandler } from '..';

const handler: MessageHandler = async (req, res) => {
  await peopleHandler.handleProfile(req.body.profile);
  res.send({
    recieved: true,
  });
};

export default handler;
