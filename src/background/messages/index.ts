import type { MessageHandler } from '@/misc/messaging';

import activateClarity from './activateClarity';
import convertPersonType from './convertPersonType';
import getImageInfo from './getImageInfo';
import getPeople from './getPeople';
import getProfile from './getProfile';
import pong from './pong';
import sendAnalyticsEvent from './sendAnalyticsEvent';

/**
 * Every message the background worker answers, keyed by the name senders use.
 */
export const messageHandlers: Record<string, MessageHandler> = {
  activateClarity,
  convertPersonType,
  getImageInfo,
  getPeople,
  getProfile,
  pong,
  sendAnalyticsEvent,
};
