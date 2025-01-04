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
import { FetchInterceptor } from '~src/contentsHelpers/FetchInterceptor';
import { debug } from '~src/misc/config';
import { getImageDivsFromIDs } from '~src/misc/utils';

const LIKE_PASS_REGEX =
  /https:\/\/api\.gotinder\.com\/(like|pass)\/([A-Za-z0-9]+)\?/g;

// TODO: We need to check whether or not the given profile is currently being shown
// for the button swap and the swipe reversal mode
export class MainWorldProfileInjector {
  profileFlag: ProfileFeatureFlag | undefined;

  private keySwapEnabled = false; // Internal flag to enable/disable key swap

  private swipeReversalEnabled = false; // Internal flag to enable/disable swipe reversal

  private swapButtonsEnabled = false;

  private keySwapHandler: ((event: KeyboardEvent) => void) | null = null; // Internal handler for key swap

  private targetProfileDiv: HTMLElement | null = null;

  private profileAlreadyTagged: boolean = false;

  private checkProfileInterval: NodeJS.Timeout | null = null;

  constructor(fetchInterceptor: FetchInterceptor) {
    this.initializeHandlers(fetchInterceptor);
    this.prepSwipeReversal();
  }

  private initializeHandlers(fetchInterceptor: FetchInterceptor) {
    fetchInterceptor.addHandler(
      LIKE_PASS_REGEX,
      this.handleLikePass.bind(this),
    );
    // https://api.gotinder.com/pass/67502696a7bbc0010061140f?locale=en&s_number=8969268009655960
  }

  private async handleLikePass(jsonOut: any, url?: string) {
    // TODO: check to see if the like/pass is for our profile
    // TODO: mark the like/pass
    const urlExec = LIKE_PASS_REGEX.exec(url!);
    const id = urlExec[2];
    const likeOrPass = urlExec[1] as 'like' | 'pass';

    console.log('id', id);

    if (id !== this.profileFlag?.webProfile.user._id) return;
    console.log('Got result for flag profile', likeOrPass);
    this.toggleSwipeReversal(false);
    this.profileAlreadyTagged = true;

    await this.handleResult(likeOrPass);

    // TODO: handle changing the buttons + swipe reversal
  }

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
    // this.handleChangeDirections();
    this.handleProfileShown();
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

  async handleResult(result: 'like' | 'pass') {
    if (!this.profileFlag) {
      throw new Error('No profile flag found');
    }

    await sendToBackgroundViaRelay<
      SendProfileResultRequest,
      SendProfileResultResponse
    >({
      name: 'sendProfileResult',
      body: {
        event: 'swiped',
        result,
        profileFlagId: this.profileFlag.flagId,
      },
    });
  }

  prepSwipeReversal() {
    // Ensure this method can be safely called multiple times
    if (this.originalAddEventListener) return;

    console.log('Preparing swipe reversal environment');

    // Save the original `addEventListener` method
    this.originalAddEventListener = EventTarget.prototype.addEventListener;

    // Cache `originalAddEventListener` in a closure to avoid context issues
    const { originalAddEventListener } = this;

    // Override `addEventListener` to prepare swipe reversal mechanics
    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (type === 'pointerdown' || type === 'pointermove') {
        const wrappedListener = function (event: PointerEvent) {
          if (type === 'pointerdown') {
            window.__swipeReversalStartX = event.clientX;
            window.__swipeReversalLastX = event.clientX;
          } else if (type === 'pointermove' && window.__swipeReversalEnabled) {
            const currentClientX = event.clientX;
            const movementX = currentClientX - window.__swipeReversalLastX;
            const reversedMovementX = -movementX;

            // Dynamically modify properties
            Object.defineProperty(event, 'movementX', {
              get() {
                return reversedMovementX;
              },
              configurable: true,
            });
            Object.defineProperty(event, 'clientX', {
              get() {
                return (
                  window.__swipeReversalStartX -
                  (currentClientX - window.__swipeReversalStartX)
                );
              },
              configurable: true,
            });

            window.__swipeReversalLastX = currentClientX;
          }

          (listener as EventListener).call(this, event);
        };

        return originalAddEventListener.call(
          this,
          type,
          wrappedListener,
          options,
        );
      }

      return originalAddEventListener.call(this, type, listener, options);
    };

    // Reset state on pointerup
    window.addEventListener(
      'pointerup',
      () => {
        window.__swipeReversalStartX = null;
        window.__swipeReversalLastX = null;
      },
      { capture: true },
    );

    console.log('Swipe reversal environment prepared');
  }

  toggleSwipeReversal(enable: boolean) {
    console.log('Toggling swipe reversal:', enable);
    if (enable && !this.swipeReversalEnabled) {
      console.log('Enabling swipe reversal');
      this.swipeReversalEnabled = true;
      window.__swipeReversalEnabled = true;
    } else if (!enable && this.swipeReversalEnabled) {
      console.log('Disabling swipe reversal');
      this.swipeReversalEnabled = false;
      window.__swipeReversalEnabled = false;
    }
  }

  // TODO: find out if this works
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

  // TODO: find out if this works too
  disableKeySwap() {
    if (!this.keySwapEnabled) return;

    this.keySwapEnabled = false;

    // Remove the keydown listener
    if (this.keySwapHandler) {
      window.removeEventListener('keydown', this.keySwapHandler, true);
      this.keySwapHandler = null;
    }
  }

  swapButtonsForProfile(swapButtonsEnabled: boolean) {
    if (this.swapButtonsEnabled === swapButtonsEnabled) return;
    this.swapButtonsEnabled = swapButtonsEnabled;

    const photoIds: string[] = this.profileFlag.webProfile.user.photos.map(
      (x) => x.id,
    );

    // const divs = getImageDivsFromIDs(photoIds).getElements();

    // if (divs.length === 0) {
    //   if (debug) console.error('No divs found');
    //   return;
    // }

    // const firstDiv = divs[0];

    // firstDiv;

    // TODO: get one of the buttons via it's class name
    // TODO: go to the parent and swap around the like and dislike position
    // TODO: see if we need to use a mutation observer to make sure the buttons don't change position
  }

  handleProfileShown() {
    // TODO: if the profile is being shown, mark targetProfileDiv as the profile div
    // TODO: call a function to say the profile is being shown
    // TODO: cancel the interval if the profile is no longer on the page
    const photoIds: string[] = this.profileFlag.webProfile.user.photos.map(
      (x) => x.id,
    );
    this.checkProfileInterval = setInterval(() => {
      const divs = getImageDivsFromIDs(photoIds).getElements();

      if (divs.length === 0) {
        if (this.targetProfileDiv) {
          console.log('Profile is no longer on the page, clearing interval');
          clearInterval(this.checkProfileInterval);
          if (this.profileFlag.changeDirections) {
            this.toggleSwipeReversal(false);
          }
        }
      } else if (!this.targetProfileDiv) {
        const firstDiv = divs[0];
        this.targetProfileDiv =
          firstDiv.parentElement.parentElement.parentElement.parentElement.parentElement;

        if (this.profileFlag.changeDirections) {
          this.toggleSwipeReversal(true);
        }

        // TODO: check if the element is actually in the view of the user
        // TODO: Otherwise we're going to have to just wait until the pass or like request is sent
      }
    }, 1000);
  }
}
