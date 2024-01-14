import type { PlasmoMessaging } from '@plasmohq/messaging';
import { Storage } from '@plasmohq/storage';
import { v4 as uuid } from 'uuid';
import { BUMBLE_ID_REPORT_URL } from '~src/misc/config';

export type bumbleIdRequest = {
	id: string;
};

export type bumbleIdResponse = {
};

const handler: PlasmoMessaging.MessageHandler<bumbleIdRequest, bumbleIdResponse> = async (req, res) => {
  const storage = new Storage({
    area: 'sync',
  });

  let clientId = await storage.get('clientId');

  if (!clientId) {
    clientId = uuid();
    await storage.set('clientId', clientId);
    chrome.runtime.setUninstallURL(`https://j4a.uk/projects/lighterfuel/uninstall?clientId=${clientId}`);
  }

  const request = {
    bumble_id: req.body.id,
    client_id: clientId,
  };
  const serverRes = await fetch(BUMBLE_ID_REPORT_URL, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
  }); // server res should be null
  console.log(`bumbleID request received: ${req.body.id}`);
  res.send(serverRes);
};

export default handler;
