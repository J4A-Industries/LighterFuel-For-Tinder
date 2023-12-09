import type { PlasmoMessaging } from '@plasmohq/messaging';
import { peopleHandler } from '..';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  await peopleHandler.handleProfile(req.body.profile);
  res.send({
    recieved: true,
  });
};

export default handler;
