import browser from 'webextension-polyfill';
import { Storage } from '@plasmohq/storage';
import { debug, defaultSettings } from '@/misc/config';
import { Sites } from '@/misc/types';
import { sendImageDataToTab } from './Misc';
import ImageRequestCapturer from './imageRequestCapturer';

const setDefaultSettings = async () => {
  const storage = new Storage();
  const settings = await storage.get('showSettings');
  if (settings === undefined) {
    await storage.set('showSettings', defaultSettings);
  }
};

try {
  setDefaultSettings();
  const tinderRequestCap = new ImageRequestCapturer(['*://*.gotinder.com/*/*.jpg*', '*://*.gotinder.com/*/*.webp*', '*://*.gotinder.com/*/*.mp4*'], Sites.TINDER);
  const mambaRequestCap = new ImageRequestCapturer(['*://*.wmbcdn.com/*'], Sites.MAMBA, 1000);

  // prints the bg instance to the console for debugging!
  console.log(tinderRequestCap, mambaRequestCap);
} catch (err: any) {
  console.error(`Error caught in background.js: ${err.stack}`);
}
