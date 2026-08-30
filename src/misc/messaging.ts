import { browser } from 'wxt/browser';
import type { Browser } from 'wxt/browser';

/**
 * A small stand in for `@plasmohq/messaging`.
 *
 * `sendToBackground` talks to the background worker directly, and
 * `sendToBackgroundViaRelay` hops through the relay content script first, which
 * is how anything running in the page's MAIN world has to do it.
 */

export type MessageRequest<TBody = any> = {
  name: string;
  body?: TBody;
};

export type MessageHandlerRequest<TBody = any> = {
  name: string;
  body: TBody;
  sender?: Browser.runtime.MessageSender;
};

export type MessageHandlerResponse<TBody = any> = {
  send: (body: TBody) => void;
};

export type MessageHandler<TReq = any, TRes = any> = (
  req: MessageHandlerRequest<TReq>,
  res: MessageHandlerResponse<TRes>,
) => void | Promise<void>;

const RELAY_REQUEST = 'lighterfuel-relay-request';
const RELAY_RESPONSE = 'lighterfuel-relay-response';
// * a relay hop that never comes back shouldn't leak a listener forever
const RELAY_TIMEOUT_MS = 15_000;

type RelayRequest = {
  type: typeof RELAY_REQUEST;
  id: string;
  name: string;
  body?: any;
};

type RelayResponse = {
  type: typeof RELAY_RESPONSE;
  id: string;
  body?: any;
};

const newRelayId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/**
 * Sends a message to the background worker.
 *
 * @param message The message name and body
 * @returns Whatever the background handler sent back
 */
export const sendToBackground = async <TReq = any, TRes = any>(
  message: MessageRequest<TReq>,
): Promise<TRes> =>
  browser.runtime.sendMessage(message) as Promise<TRes>;

/**
 * Sends a message to the background worker via the relay content script, for
 * callers that have no extension APIs of their own (the MAIN world).
 *
 * @param message The message name and body
 * @returns Whatever the background handler sent back, or undefined on timeout
 */
export const sendToBackgroundViaRelay = <TReq = any, TRes = any>(
  message: MessageRequest<TReq>,
): Promise<TRes | undefined> =>
  new Promise((resolve) => {
    const id = newRelayId();
    let timeout: ReturnType<typeof setTimeout>;

    const listener = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data as RelayResponse;
      if (data?.type !== RELAY_RESPONSE || data.id !== id) return;

      window.removeEventListener('message', listener);
      clearTimeout(timeout);
      resolve(data.body);
    };

    timeout = setTimeout(() => {
      window.removeEventListener('message', listener);
      resolve(undefined);
    }, RELAY_TIMEOUT_MS);

    window.addEventListener('message', listener);
    window.postMessage(
      { type: RELAY_REQUEST, id, name: message.name, body: message.body },
      '*',
    );
  });

/**
 * Forwards one named message from the page to the background worker.
 * Called from the relay content script.
 *
 * @param name The message name to relay
 */
export const relayMessage = ({ name }: { name: string }) => {
  window.addEventListener('message', async (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data as RelayRequest;
    if (data?.type !== RELAY_REQUEST || data.name !== name) return;

    let response: any;
    try {
      response = await browser.runtime.sendMessage({
        name: data.name,
        body: data.body,
      });
    } catch (e) {
      console.error(`Error relaying message "${name}"`, e);
    }

    window.postMessage(
      { type: RELAY_RESPONSE, id: data.id, body: response } satisfies RelayResponse,
      '*',
    );
  });
};

/**
 * Wires the background message handlers up to runtime.onMessage.
 *
 * @param handlers The handlers, keyed by message name
 */
export const registerMessageHandlers = (
  handlers: Record<string, MessageHandler>,
) => {
  browser.runtime.onMessage.addListener(
    (message: any, sender: Browser.runtime.MessageSender, sendResponse: (body: any) => void) => {
      const handler = typeof message?.name === 'string' ? handlers[message.name] : undefined;
      if (!handler) return false;

      let responded = false;
      const send = (body: any) => {
        if (responded) return;
        responded = true;
        sendResponse(body);
      };

      Promise.resolve(handler({ name: message.name, body: message.body, sender }, { send }))
        .catch((e) => {
          console.error(`Error handling message "${message.name}"`, e);
        })
        // * handlers that return without sending still have to close the channel
        .finally(() => send(undefined));

      return true;
    },
  );
};
