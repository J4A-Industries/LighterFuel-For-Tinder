import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo';
import styleText from 'data-text:~src/contentsHelpers/style.css';
import * as Sentry from '@sentry/browser';
import { sendToBackground } from '@plasmohq/messaging';
import LighterFuel from '@/contentsHelpers/LighterFuel';
import { debug } from '@/misc/config';
import { SENTRY_DSN } from '@/background/Misc';

/**
 * Execute the script on the tinder website,
 * Running in 'main' world, which means it has access to the DOM
 */
export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_start',
  css: ['./../contentsHelpers/style.css'],
};

/**
 * Executing styling on the site, letting me use tailwind
 */
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styleText;
  return style;
};

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    new Sentry.Replay(),
  ],
  // Session Replay
  replaysSessionSampleRate: 0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 0.5, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

try {
  const lf = new LighterFuel();
  if (debug) console.log(lf);
} catch (err) {
  console.error(err);
  Sentry.captureException(err);
  sendToBackground({
    name: 'sendAnalyticsEvent',
    body: {
      name: 'Error',
      params: {
        action: 'error',
        description: `Error thrown in tinder.ts, ${err}`,
      },
    },
  });
}
