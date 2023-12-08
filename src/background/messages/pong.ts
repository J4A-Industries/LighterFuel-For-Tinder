import type { PlasmoMessaging } from '@plasmohq/messaging';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  res.send({
    msg: 'pong',
  });
};

export default handler;
