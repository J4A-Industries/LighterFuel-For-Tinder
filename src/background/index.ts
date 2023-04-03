import { debug } from '@/misc/config';
import type { AISettings, ImageType, ShowSettings } from '@/misc/types';

class Background {
  selfProfile: any;

  aiSettings: {
    temperature: number;
    bestOf: number;
    APIkey: string;
  };

  images: ImageType[];

  showSettings: ShowSettings;

  constructor() {
    /**
     * Profiles not used right now, however it will be in the future
     * TODO: make profiles do something
     */

    this.selfProfile = null;

    // the array of image object which have been loaded
    this.images = [];

    this.showSettings = {
      overlayButton: true,
      searchButton: true,
    };

    this.aiSettings = {
      temperature: 95,
      bestOf: 1,
      APIkey: '',
    };

    this.getStoredSettings();
    this.initialiseImageListner();
    this.initialisePagelistener();
    this.initialisePopupListner();
  }

  /**
   * Used to set the showOverlays variable
   */
  setShowSettings(setting: ShowSettings, stored = false) {
    if (!setting) console.error('setting is undefined :(');
    if (!stored) chrome.storage.sync.set({ showSettings: setting });
    this.showSettings = setting;
    // bit hacky, should fix at some point, just to trigger the sending of the "show overlays" bool
    // TODO: change this to an event emitter
    this.sendInfoToTab({
      action: 'settings update',
      data: this.showSettings,
    }).catch((e) => {
      this.consoleOut(e);
    });
    this.consoleOut(`showOverlays set to ${setting}`);
  }

  setAiSettings(settings: AISettings, stored = false) {
    if (!stored) chrome.storage.sync.set({ aiSettings: settings });
    this.aiSettings = settings;
  }

  /**
   * Initialises the listner for the popup
   */
  initialisePopupListner() {
    chrome.runtime.onConnect.addListener((port) => {
      port.postMessage({ showSettings: this.showSettings });
      port.onMessage.addListener((msg) => {
        if ('showSettings' in msg) {
          this.setShowSettings(msg.showSettings);
          port.postMessage({ showSettings: this.showSettings });
        } else if ('get ai settings' in msg) {
          port.postMessage({ aiSettings: this.aiSettings });
        } else if ('set ai settings' in msg) {
          this.setAiSettings(msg['set ai settings']);
        }
      });
    });
  }

  /**
   * Initialises the page listener so the injected JS can communicate with this
   */
  initialisePagelistener() {
    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
      this.consoleOut(request);

      switch (request.action) {
        case 'get initial data':
          // images = images.filter(x => x.date > Date.now()-10000);// clears the old urls from the ram
          sendResponse({ imageArray: this.images, showSettings: this.showSettings });
          // sendResponse({"imageArray": images, "showOverlays": showOverlays});
          break;
        case 'send core':
          this.consoleOut(request.core);
          // not doing anything with this rn
          break;
        case 'send profile':
          this.selfProfile = request.profile.data.user;
          break;
        case 'send matches':
          if (!request.matches.data) {
            this.consoleOut('send matches that was invalid to loop through arr:');
            this.consoleOut(request.matches.data);
          }
          break;
        case 'send user data':
          this.consoleOut('Got user data!');
          this.consoleOut(request.data.results);
          break;
        case 'send messages':
          if (!Array.isArray(request.messages.data.messages)) {
            this.consoleOut('Error recieving messages :( they\'re not an array!');
          }
          break;
        case 'ping': // used for debugging
          sendResponse('pong');
          break;
        default:
          sendResponse('I was supposed to be sent something :(');
          break;
      }
    });
  }

  /**
   * Used to listen out for whenever there is a request to the "core"
   * which contains the profile information!
   */
  initialiseCoreListner() {
    chrome.webRequest.onCompleted.addListener(
      (details) => {
        console.log('core/profile:');
        console.log(details);
      },
      { urls: ['*://api.gotinder.com/v2/recs/core*', '*://api.gotinder.com/v2/profile*'] },
    );
  }

  /**
   * Initialised the image listner, for whenever tinder requests a new image,
   * add it to the images arr (through proxy)
   */
  initialiseImageListner() {
    chrome.webRequest.onCompleted.addListener(
      (details) => {
        // tinder has yet to discover cache and the images reload *every time they're viewed*
        const imageInArray = this.images.find((x) => details.url === x.url);
        if (!imageInArray) {
          if (!details.responseHeaders) return;
          this.sendInfoToTab({
            action: 'new image',
            data: {
              url: details.url,
              lastModified: details.responseHeaders.filter((x) => x.name === 'last-modified')[0].value,
              timeAddedToArr: Date.now(),
            },
          }).catch((e) => {
            if (debug) console.log(e);
          });
          console.log(details);
        }
      },
      { urls: ['*://*.gotinder.com/*/*.jpg*', '*://*.gotinder.com/*/*.webp*', '*://*.gotinder.com/*/*.mp4*'] },
      ['responseHeaders'],
    );
  }

  /**
   * Gets the stored settings from chrome
   */
  getStoredSettings() {
    chrome.storage.sync.get(['showSettings'], (result) => {
      if (!result.showSettings) {
        // set the default settings
        if (debug) console.log("No 'showSettings' Found, Setting To Default!");
        this.setShowSettings({ overlayButton: true, searchButton: true }, false);
      } else {
        // else set it to the default value
        if (debug) console.log(`'showSettings' Found: ${JSON.stringify(result.showSettings)}`);
        this.setShowSettings(result.showSettings, true);
      }
    });
    chrome.storage.sync.get(['aiSettings'], (result) => {
      if (result.aiSettings) {
        this.aiSettings = result.aiSettings;
      }
    });
  }

  /**
   * This filters through all the tabs and sends the info to them
   *
   */
  sendInfoToTab(obj: { action: string; data: ShowSettings | { url: string; lastModified: string | undefined; timeAddedToArr: number; }; }) {
    // format {action: String. data: Object}
    return new Promise<void>((resolve) => {
      chrome.tabs.query({})// query all tabs
        .then((x) => x.filter((y) => y.url))// filter to only ones we have permission to look at (all tinder tabs)
        .then((tabs) => {
          for (const tab of tabs) {
            if (tab.id) chrome.tabs.sendMessage(tab.id, obj);
          }
          resolve();
        });
    });
  }

  /**
   * a console log facade for the debug bool
   */
  consoleOut(message: string | any, error = false) {
    if (debug) {
      if (error) {
        console.error(message);
      } else {
        console.log(message);
      }
    }
  }
}

try {
  const bg = new Background();
  // prints the bg instance to the console for debugging!
  console.log(bg);
} catch (err: any) {
  console.error(`Error caught in background.js: ${err.stack}`);
}

export default Background;
