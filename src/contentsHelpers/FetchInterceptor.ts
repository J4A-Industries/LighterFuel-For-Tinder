import { sendToBackgroundViaRelay } from '@plasmohq/messaging';

import { debug } from '~src/misc/config';

type RegexHandler = {
  regex: RegExp;
  handler: (jsonOut: any, url?: string) => void | Promise<void>;
  calledCount?: number;
};

export class FetchInterceptor {
  private regexHandlers: RegexHandler[];

  private lastPingTime = Date.now();

  constructor() {
    this.setCustomFetch();
    this.beginPingPongLoop();
    this.regexHandlers = [];
  }

  private setCustomFetch() {
    if (debug) console.log('Setting custom fetch');

    const nativeFetch = window.fetch;
    window.fetch = (...args) =>
      new Promise((resolve, reject) => {
        nativeFetch(...args)
          .then(async (result) => {
            this.handleFetchResponse(result.clone(), args);
            resolve(result);
          })
          .catch((err) => reject(err));
      });
  }

  private async handleFetchResponse(result: Response, args: any[]) {
    try {
      const jsonOut = await result.json();
      const url = args[0];

      await Promise.all(
        this.regexHandlers.map(async ({ regex, handler }, index) => {
          if (url.match(regex)) {
            await handler(jsonOut, url);
            this.regexHandlers[index].calledCount++;
          }
        }),
      ).catch((e) => {
        if (debug) console.error('Error processing response handler', e);
      });
    } catch (e) {
      if (debug) console.error('Error decoding json:', e);
    }
  }

  private beginPingPongLoop() {
    setInterval(() => {
      if (Date.now() - this.lastPingTime > 1000 * 60 * 4) {
        this.ping();
      }
    }, 1000 * 60);
  }

  private ping() {
    sendToBackgroundViaRelay({ name: 'pong' });
    this.lastPingTime = Date.now();
  }

  // Public API to add a handler
  public addHandler(
    regex: RegExp,
    handler: (response: any, url?: string) => void,
  ) {
    this.regexHandlers.push({ regex, handler, calledCount: 0 });
  }

  // Public API to remove a handler
  public removeHandler(regex: RegExp) {
    this.regexHandlers = this.regexHandlers.filter((h) => h.regex !== regex);
  }
}
