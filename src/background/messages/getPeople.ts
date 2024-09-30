import type { PlasmoMessaging } from '@plasmohq/messaging';
import { peopleHandler } from '..';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  peopleHandler.handleNewPeople(req.body.people);
  res.send({
    received: true,
  });
};

export default handler;
