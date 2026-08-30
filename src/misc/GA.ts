import { v4 as uuid } from 'uuid';

import { Storage } from '@/misc/storage';

import { chromeStore, debug } from '~src/misc/config';

import type { UserStats } from './tinderTypes';

// https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events
type CollectEventPayload = {
  name: string;
  params?: any;
};

/**
 * This function sends events to Google Analytics using the Measurement Protocol.
 * https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events
 *
 * @param events The events to send to Google Analytics.
 */
export const AnalyticsEvent = async (events: CollectEventPayload[]) => '123';
