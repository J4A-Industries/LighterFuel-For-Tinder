import styleText from 'data-text:~src/contentsHelpers/style.css';
import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo';
import * as Sentry from '@sentry/browser';
import { CaptureConsole } from '@sentry/integrations';
import { debug } from '@/misc/config';
import MambaJamba from '@/contentsHelpers/MambaJamba';
import { SENTRY_DSN } from '@/background/Misc';

/**
 * Execute the script on the tinder website,
 * Running in 'main' world, which means it has access to the DOM
 */
export const config: PlasmoCSConfig = {
  matches: ['*://www.mamba.ru/*'],
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
    new CaptureConsole({
      levels: ['error'],
    }),
  ],
  // Session Replay
  replaysSessionSampleRate: 1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 0.5, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

try {
  const MJ = new MambaJamba();
  if (debug) console.log(MJ);
} catch (err) {
  console.error(err);
  Sentry.captureException(err);
}
