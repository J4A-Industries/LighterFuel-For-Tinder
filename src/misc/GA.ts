import { Storage } from '@plasmohq/storage';
import { uuid } from 'uuidv4';
import { debug } from '~src/misc/config';

if (!process.env.PLASMO_PUBLIC_GTAG_ID) {
  throw new Error('PLASMO_PUBLIC_GTAG_ID environment variable not set.');
}

if (!process.env.PLASMO_PUBLIC_SECRET_API_KEY) {
  throw new Error('PLASMO_PUBLIC_SECRET_API_KEY environment variable not set.');
}

const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const gtagId = process.env.PLASMO_PUBLIC_GTAG_ID;
const secretApiKey = process.env.PLASMO_PUBLIC_SECRET_API_KEY;

// https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events
type CollectEventPayload = {
	name: string,
	params?: any,
};

/**
 * This function sends events to Google Analytics using the Measurement Protocol.
 * https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events
 *
 * @param events The events to send to Google Analytics.
 */
export const AnalyticsEvent = async (events: CollectEventPayload[]) => {
  const storage = new Storage({
    area: 'sync',
  });

  const analyticsConsent = await storage.get<boolean | string>('analyticsConsent');
  console.log('AnalyticsConsent', analyticsConsent);

  if (typeof analyticsConsent === 'string') {
    if (analyticsConsent.toLowerCase() !== 'true') {
      return;
    }
  }
  if (analyticsConsent !== true) {
    return;
  }

  let clientId = await storage.get('clientId');

  // Just incase the client ID was not set on install.
  if (!clientId) {
    clientId = uuid();
    await storage.set('clientId', clientId);
  }
  try {
    await fetch(
      `${GA_ENDPOINT}?measurement_id=${gtagId}&api_secret=${secretApiKey}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: clientId,
          events,
        }),
      },
    ).then((res) => {
      if (debug) console.log('GA response', res);
    });
  } catch (e) {
    throw new Error(`Failed to send analytics event.${e}`);
  }
};
