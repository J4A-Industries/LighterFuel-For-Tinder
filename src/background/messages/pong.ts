import type { MessageHandler } from '@/misc/messaging';

const handler: MessageHandler = async (req, res) => {
  res.send({
    msg: 'pong',
  });
};

export default handler;
