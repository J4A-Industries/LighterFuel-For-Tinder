/* eslint-disable import/no-mutable-exports */
import { Storage } from '@plasmohq/storage';
import * as Sentry from '@sentry/browser';
import { debug, defaultSettings } from '@/misc/config';
import { Sites } from '@/misc/types';
import ImageRequestCapturer from './imageRequestCapturer';
import { SENTRY_DSN } from './Misc';

const setDefaultSettings = async () => {
  const storage = new Storage();
  const settings = await storage.get('showSettings');
  if (settings === undefined) {
    await storage.set('showSettings', defaultSettings);
  }
};

let tinderRequestCap: ImageRequestCapturer;
let mambaRequestCap: ImageRequestCapturer;

try {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      new Sentry.Replay(),
    ],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });

  setDefaultSettings();

  tinderRequestCap = new ImageRequestCapturer(['*://*.gotinder.com/*/*.jpg*', '*://*.gotinder.com/*/*.webp*', '*://*.gotinder.com/*/*.mp4*'], Sites.TINDER);
  mambaRequestCap = new ImageRequestCapturer(['*://*.wmbcdn.com/*'], Sites.MAMBA, 1000);

  // prints the bg instance to the console for debugging!
  if (debug) console.log(tinderRequestCap, mambaRequestCap);
} catch (err: any) {
  console.error(`Error caught in background.js: ${err.stack}`);
}

// exporting so the message handlers can access the images
export {
  tinderRequestCap,
  mambaRequestCap,
};
