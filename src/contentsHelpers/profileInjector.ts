/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
import { sendToBackgroundViaRelay } from '@plasmohq/messaging';

import type { ProfileFeatureFlag } from '~src/background/classes/ProfileShower';
import type {
  GetProfileToShowRequest,
  GetProfileToShowResponse,
} from '~src/background/messages/getProfileToShow';
import type {
  SendProfileResultRequest,
  SendProfileResultResponse,
} from '~src/background/messages/sendProfileResult';
import { debug } from '~src/misc/config';

export class MainWorldProfileInjector {
  profileFlag: ProfileFeatureFlag | undefined;

  private keySwapEnabled = false; // Internal flag to enable/disable key swap

  private swipeReversalEnabled = false; // Internal flag to enable/disable swipe reversal

  private keySwapHandler: ((event: KeyboardEvent) => void) | null = null; // Internal handler for key swap

  private originalAddEventListener:
    | typeof EventTarget.prototype.addEventListener
    | null = null;

  async init() {
    console.log('getting profile to show');
    const getProfileToShowRes = await sendToBackgroundViaRelay<
      GetProfileToShowRequest,
      GetProfileToShowResponse
    >({
      name: 'getProfileToShow',
      body: {},
    });

    console.log('Got profile to show', getProfileToShowRes);

    this.profileFlag = getProfileToShowRes;
    if (this.profileFlag) {
      this.injectProfile();
    }

    this.enableSwipeReversal();
    this.enableKeySwap();
  }

  injectProfile() {
    if (!this.profileFlag) {
      console.error('No profile flag found');
      return;
    }

    const { webProfile } = this.profileFlag;

    // setting data initially
    window.__customData = {
      ...window.__data,
      webProfile,
    };

    // Making sure that if anyone tries to set __data, we update __customData
    Object.defineProperty(window, '__data', {
      get() {
        return window.__customData;
      },
      set(val) {
        window.__customData = {
          ...val,
          webProfile,
        };
        if (debug) console.warn('Someone tried to set __data to ', val);
      },
    });

    console.log('Injected profile data into window.__data!!');
  }

  handleWebRequest() {
    // TODO: intercept fetch requests and filter for any that include our profile
  }

  async handleResult(result: 'like' | 'pass') {
    // TODO: submit the result to the background script
    await sendToBackgroundViaRelay<
      SendProfileResultRequest,
      SendProfileResultResponse
    >({
      name: 'sendProfileResult',
      body: {
        event: 'swiped',
        result,
      },
    });
  }

  enableSwipeReversal() {
    if (this.swipeReversalEnabled) return;

    this.swipeReversalEnabled = true;

    let startX: number | null = null;
    let lastX: number | null = null;

    if (!this.originalAddEventListener) {
      this.originalAddEventListener = EventTarget.prototype.addEventListener;
    }

    // Cache `originalAddEventListener` in a closure to avoid context issues
    const { originalAddEventListener } = this;

    // Override `addEventListener`
    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (type === 'pointerdown') {
        const wrappedListener = function (event: PointerEvent) {
          startX = event.clientX;
          lastX = event.clientX;
          (listener as EventListener).call(this, event); // Pass the event to the original listener
        };
        return originalAddEventListener.call(
          this,
          type,
          wrappedListener,
          options,
        );
      }

      if (type === 'pointermove') {
        const wrappedListener = function (event: PointerEvent) {
          if (startX !== null && lastX !== null) {
            const currentClientX = event.clientX; // Capture the original clientX value
            const movementX = currentClientX - lastX; // Calculate real movement
            const reversedMovementX = -movementX; // Reverse the movement

            // Modify properties dynamically
            Object.defineProperty(event, 'movementX', {
              get() {
                return reversedMovementX;
              },
              configurable: true,
            });
            Object.defineProperty(event, 'clientX', {
              get() {
                return startX! - (currentClientX - startX!); // Reverse clientX based on offset
              },
              configurable: true,
            });

            lastX = currentClientX; // Update last position
          }
          (listener as EventListener).call(this, event); // Pass the event to the original listener
        };
        return originalAddEventListener.call(
          this,
          type,
          wrappedListener,
          options,
        );
      }

      // Default behavior for other event types
      return originalAddEventListener.call(this, type, listener, options);
    };

    // Reset state on pointerup
    window.addEventListener(
      'pointerup',
      () => {
        startX = null;
        lastX = null;
      },
      { capture: true },
    );
  }

  disableSwipeReversal() {
    if (!this.swipeReversalEnabled) return;

    this.swipeReversalEnabled = false;

    // Restore original `addEventListener`
    if (this.originalAddEventListener) {
      EventTarget.prototype.addEventListener = this.originalAddEventListener;
    }
  }

  enableKeySwap() {
    if (this.keySwapEnabled) return;

    this.keySwapEnabled = true;

    // Arrow key swap handler
    this.keySwapHandler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); // Prevent the original event

        // Determine the swapped key
        const swappedKey =
          event.key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
        const swappedKeyCode = swappedKey === 'ArrowRight' ? 39 : 37;

        // Create a new keyboard event with swapped key values
        const swappedEvent = new KeyboardEvent('keydown', {
          key: swappedKey,
          code: swappedKey,
          keyCode: swappedKeyCode,
          bubbles: true,
          cancelable: true,
          composed: true,
        });

        // Manually override the keyCode (needed for some platforms)
        Object.defineProperty(swappedEvent, 'keyCode', {
          get: () => swappedKeyCode,
        });

        event.target.dispatchEvent(swappedEvent); // Dispatch the swapped event
      }
    };

    // Add the keydown listener
    window.addEventListener('keydown', this.keySwapHandler, true);
  }

  disableKeySwap() {
    if (!this.keySwapEnabled) return;

    this.keySwapEnabled = false;

    // Remove the keydown listener
    if (this.keySwapHandler) {
      window.removeEventListener('keydown', this.keySwapHandler, true);
      this.keySwapHandler = null;
    }
  }
}
