/* eslint-disable no-param-reassign */
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
import { parentNode } from '~src/contentsHelpers/Misc';
import { debug } from '~src/misc/config';
import type {
  LikeResponse,
  UnsuccessfulLikeResponse,
} from '~src/misc/tinderTypes';
import { getImageDivsFromIDs } from '~src/misc/utils';

const LIKE_PASS_REGEX =
  /https:\/\/api\.gotinder\.com\/(like|pass)\/([A-Za-z0-9]+)\?/g;

export class MainWorldProfileInjector {
  profileFlag: ProfileFeatureFlag | undefined;

  private keySwapEnabled = false; // Internal flag to enable/disable key swap

  private swipeReversalEnabled = false; // Internal flag to enable/disable swipe reversal

  private swapButtonsEnabled = false;

  private keySwapHandler: ((event: KeyboardEvent) => void) | null = null; // Internal handler for key swap

  private targetProfileDiv: HTMLElement | null = null;

  private profileAlreadyTagged: boolean = false;

  private checkProfileInterval: NodeJS.Timeout | null = null;

  private originalDislikeHandler: (() => void) | null = null; // Save original dislike handler for restoration

  private swipeAlertShown = false; // Flag to track whether alert has been shown during the current swipe

  private originalDislikeButton: HTMLButtonElement | null = null;

  private clonedDislikeButton: HTMLButtonElement | null = null;

  private HIDDEN_BUTTON_CLASS = 'hidden-original-dislike';

  constructor(fetchInterceptor: FetchInterceptor) {
    this.initializeHandlers(fetchInterceptor);
    this.prepSwipeReversal();
  }

  private initializeHandlers(fetchInterceptor: FetchInterceptor) {
    fetchInterceptor.addHandler(
      LIKE_PASS_REGEX,
      this.handleLikePass.bind(this),
    );
  }

  private originalAddEventListener:
    | typeof EventTarget.prototype.addEventListener
    | null = null;

  async init() {
    console.log('Getting profile to show');
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
    if (this.originalAddEventListener) return;

    console.log('Preparing swipe reversal environment');

    this.originalAddEventListener = EventTarget.prototype.addEventListener;

    const { originalAddEventListener } = this;

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

  // First method
  toggleSwipeReversal(enable: boolean) {
    console.log(`toggleSwipeReversal called with enable=${enable}`);
    if (enable && !this.swipeReversalEnabled) {
      console.log('Enabling swipe reversal');
      this.swipeReversalEnabled = true;
      window.__swipeReversalEnabled = true;
      this.swapButtonsForProfile(false); // Changed to false to fix initial order
    } else if (!enable && this.swipeReversalEnabled) {
      console.log('Disabling swipe reversal');
      this.swipeReversalEnabled = false;
      window.__swipeReversalEnabled = false;
      this.swapButtonsForProfile(true); // Changed to true to restore desired order
    }
  }

  // Second method
  swapButtonsForProfile(swapButtonsEnabled: boolean) {
    console.log(
      `swapButtonsForProfile called with swapButtonsEnabled=${swapButtonsEnabled}`,
    );
    console.log('Current swapButtonsEnabled state:', this.swapButtonsEnabled);

    if (this.swapButtonsEnabled === swapButtonsEnabled) {
      console.log('Buttons already in desired state, returning');
      return;
    }

    this.swapButtonsEnabled = swapButtonsEnabled;

    const buttons = document.querySelectorAll('.gamepad-button-wrapper');
    console.log('Found buttons:', buttons.length);

    if (buttons.length < 4) {
      console.warn('Gamepad buttons not found or incomplete button set.');
      return;
    }

    const dislikeButton = buttons[1];
    const likeButton = buttons[3];
    const superlikeButton = buttons[2];
    const parent = dislikeButton.parentElement;

    if (!parent) {
      console.error('Parent element not found for buttons.');
      return;
    }

    // Fix initial order when swapButtonsEnabled is false
    if (!swapButtonsEnabled) {
      // Move buttons to [like, superlike, dislike] order
      parent.insertBefore(likeButton, buttons[1]); // Move like to first position
      parent.insertBefore(superlikeButton, buttons[2]); // Move superlike second
      parent.insertBefore(dislikeButton, buttons[3]); // Move dislike third
    } else {
      // Restore to original [dislike, superlike, like] order
      parent.insertBefore(dislikeButton, buttons[1]); // Move dislike first
      parent.insertBefore(superlikeButton, buttons[2]); // Keep superlike second
      parent.insertBefore(likeButton, buttons[3]); // Move like third
    }
  }

  // Third method
  cleanup() {
    console.log('Cleanup called');
    if (this.checkProfileInterval) {
      clearInterval(this.checkProfileInterval);
      this.checkProfileInterval = null;
    }

    if (this.cleanupSwipeGesture) {
      this.cleanupSwipeGesture();
      this.cleanupSwipeGesture = null;
    }

    this.restoreOriginalDislikeButton();

    console.log('Disabling swipe reversal during cleanup');
    this.toggleSwipeReversal(false);

    console.log('Cleaned up all listeners and intervals');
  }

  interceptDislikeButton() {
    if (!this.profileFlag || !this.profileFlag.rejectionOptions) {
      console.warn('No rejection options available for this profile');
      return;
    }

    const svgPathSelector =
      'path[d="m16.526 12 6.896-6.895a1.99 1.99 0 0 0-.005-2.809L21.706.585a1.986 1.986 0 0 0-2.81-.005L12 7.474 5.104.58a1.986 1.986 0 0 0-2.81.005L.583 2.296a1.99 1.99 0 0 0-.005 2.81L7.474 12 .578 18.895a1.99 1.99 0 0 0 .005 2.809l1.711 1.711c.778.778 2.036.78 2.81.006L12 16.526l6.896 6.895a1.986 1.986 0 0 0 2.81-.006l1.711-1.711a1.99 1.99 0 0 0 .005-2.81z"]';
    const dislikeButtonSVG = document.querySelector(svgPathSelector);

    if (!dislikeButtonSVG) {
      console.error('Dislike button SVG not found');
      return;
    }

    const dislikeButton = dislikeButtonSVG.closest('button');

    if (!dislikeButton) {
      console.error('Dislike button not found');
      return;
    }

    // Store the original button and hide it
    this.originalDislikeButton = dislikeButton;
    this.originalDislikeButton.style.display = 'none';
    this.originalDislikeButton.classList.add(this.HIDDEN_BUTTON_CLASS);

    // Create and insert clone
    this.clonedDislikeButton = document.createElement('button');
    this.clonedDislikeButton.innerHTML = this.originalDislikeButton.innerHTML;
    this.clonedDislikeButton.className = this.originalDislikeButton.className;

    this.clonedDislikeButton.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const { rejectionOptions } = this.profileFlag!;

      if ('rejectionBlockerAttempts' in rejectionOptions) {
        alert(rejectionOptions.suggestionOnRejection);

        rejectionOptions.rejectionBlockerAttempts -= 1;

        if (rejectionOptions.rejectionBlockerAttempts <= 0) {
          this.restoreOriginalDislikeButton();
        }
      } else if (
        'forceLike' in rejectionOptions &&
        rejectionOptions.forceLike
      ) {
        alert('You cannot dislike this profile. Forced like enabled.');
      }
    };

    // Insert clone after original
    this.originalDislikeButton.parentElement?.insertBefore(
      this.clonedDislikeButton,
      this.originalDislikeButton.nextSibling,
    );
  }

  restoreOriginalDislikeButton() {
    if (this.originalDislikeButton && this.clonedDislikeButton) {
      // Show original button
      this.originalDislikeButton.style.display = '';
      this.originalDislikeButton.classList.remove(this.HIDDEN_BUTTON_CLASS);

      // Remove clone
      this.clonedDislikeButton.remove();

      // Clear references
      this.clonedDislikeButton = null;
    }
  }

  private async handleLikePass(jsonOut: any, url?: string) {
    const urlExec = LIKE_PASS_REGEX.exec(url!);
    const id = urlExec[2];
    const likeOrPass = urlExec[1] as 'like' | 'pass';

    if (id !== this.profileFlag?.webProfile.user._id) return;
    if (
      typeof (jsonOut as UnsuccessfulLikeResponse)?.rate_limited_until ===
        'number' &&
      likeOrPass === 'like'
    )
      return;
    console.log('Got result for flag profile', likeOrPass);

    // Restore original button before cleanup
    this.restoreOriginalDislikeButton();

    // Continue with regular cleanup
    this.cleanup();
    await this.handleResult(likeOrPass);
  }

  handleProfileShown() {
    const photoIds: string[] = this.profileFlag.webProfile.user.photos.map(
      (x) => x.id,
    );
    this.checkProfileInterval = setInterval(() => {
      const divs = getImageDivsFromIDs(photoIds).getElements();

      if (divs.length === 0) {
        if (this.targetProfileDiv) {
          console.log('Profile is no longer on the page, clearing interval');
          this.cleanup(); // Cleanup when profile is no longer visible
        }
      } else if (!this.targetProfileDiv) {
        const firstDiv = divs[0];
        this.targetProfileDiv =
          firstDiv.parentElement.parentElement.parentElement.parentElement.parentElement;

        if (this.profileFlag.changeDirections) {
          this.toggleSwipeReversal(true);
        }

        this.interceptDislikeButton();
        this.interceptSwipeGesture();
      }
    }, 50);
  }

  interceptSwipeGesture() {
    const swipeThreshold = 100; // Adjust this value for swipe distance threshold
    let startX: number | null = null;

    const handlePointerDown = (event: PointerEvent) => {
      startX = event.clientX;
      this.swipeAlertShown = false; // Reset alert flag for new swipe
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (startX !== null && !this.swipeAlertShown) {
        const currentX = event.clientX;
        const swipeDistance = currentX - startX;
        const isReversed = this.swipeReversalEnabled;
        const isRejectSwipe =
          (!isReversed && swipeDistance < -swipeThreshold) ||
          (isReversed && swipeDistance > swipeThreshold);

        if (isRejectSwipe && this.profileFlag) {
          const { rejectionOptions } = this.profileFlag;

          if (
            rejectionOptions &&
            'rejectionBlockerAttempts' in rejectionOptions
          ) {
            if (rejectionOptions.rejectionBlockerAttempts > 0) {
              alert(rejectionOptions.suggestionOnRejection);
              rejectionOptions.rejectionBlockerAttempts -= 1;
              this.swipeAlertShown = true;

              if (rejectionOptions.rejectionBlockerAttempts <= 0) {
                console.log('No more rejection attempts allowed for swipes');
              }
            }
          } else if (
            rejectionOptions &&
            'forceLike' in rejectionOptions &&
            rejectionOptions.forceLike
          ) {
            alert('You cannot reject this profile. Forced like enabled.');
            this.swipeAlertShown = true;
          }
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);

    // Cleanup swipe gesture listeners
    this.cleanupSwipeGesture = () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }

  private cleanupSwipeGesture: (() => void) | null = null;
}
