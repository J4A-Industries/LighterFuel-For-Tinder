import type { PlasmoMessaging } from '@plasmohq/messaging';
import { rubiksEventTarget } from '..';

export type activateRubiksCubeRequest = {
	// empty
	activate?: boolean;
};

export type activateRubiksCubeResponse = {
	active: boolean;
};

const handler: PlasmoMessaging.MessageHandler<activateRubiksCubeRequest, activateRubiksCubeResponse> = async (req, res) => {
  if (req.body.activate) {
    rubiksEventTarget.dispatchEvent(new Event('activateRubiksCube'));
    res.send({
      active: true,
    });
  }
  return new Promise((resolve) => {
    const callback = () => {
      console.log('sending response to listener');
      res.send({
        active: true,
      });
      rubiksEventTarget.removeEventListener('activateRubiksCube', callback);
      resolve();
    };

    rubiksEventTarget.addEventListener('activateRubiksCube', callback);
  });
};

export default handler;
