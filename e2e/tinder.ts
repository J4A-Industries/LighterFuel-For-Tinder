import type { Page } from '@playwright/test';

const photoSelector = 'div.StretchedBox, div.profileCard__slider__img';
const sliderSelector = 'div.keen-slider, div.profileCard__slider';

export type CardState = {
  /** The photo the browser is actually painting on the top card */
  displayed?: string;
  /** The extension's "Open High Quality" href, from that same card */
  href?: string;
  /** The extension's overlay text, from that same card */
  overlayText?: string;
  /** The top card's box, for tapping through photos */
  box?: { x: number; y: number; width: number; height: number };
};

/**
 * Reduces a tinder photo URL down to the photo's identity, so the webp on
 * screen and the full size jpg behind the button compare equal.
 *
 * @param url Any tinder image URL
 * @returns The id shared by every rendition of that photo
 */
export const photoIdFromUrl = (
  url: string | undefined | null,
): string | undefined => {
  if (!url) return undefined;

  const recMatch = url.match(/\/u\/([^/?]+)/);
  if (recMatch) return recMatch[1];

  const uuidMatch = url.match(
    /([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/,
  );
  return uuidMatch ? uuidMatch[1] : undefined;
};

/**
 * Reads the card the user is looking at.
 *
 * Tinder stacks the next rec's card directly behind the current one, and both
 * count as visible, so the card is found by asking the browser what it actually
 * painted in the middle of the deck. The overlay is then read from that same
 * card, rather than whichever one happens to come first in the DOM.
 *
 * Everything is read in one go so the photo and the link can't be captured
 * either side of the user tapping through.
 *
 * @param page The tinder page
 * @returns What's on screen and what the extension put on it
 */
export const getCardState = (page: Page): Promise<CardState> =>
  page.evaluate(
    ({ sliders, photos }) => {
      const urlFromStyle = (style: string) =>
        (/url\(\s*['"]?(.*?)['"]?\s*\)/.exec(style) ?? [])[1];

      const visible = [...document.querySelectorAll(sliders)].filter((slider) =>
        slider.checkVisibility({
          checkOpacity: true,
          visibilityProperty: true,
        }),
      );

      if (visible.length === 0) return {};

      const deck = visible
        .map((slider) => slider.getBoundingClientRect())
        .sort((a, b) => b.width * b.height - a.width * a.height)[0];

      const painted = document
        .elementsFromPoint(
          deck.left + deck.width / 2,
          deck.top + deck.height / 2,
        )
        .find(
          (el) =>
            el.matches(photos) &&
            el.checkVisibility({
              checkOpacity: true,
              visibilityProperty: true,
            }) &&
            window
              .getComputedStyle(el)
              .getPropertyValue('background-image')
              .includes('gotinder'),
        );

      const box = {
        x: deck.x,
        y: deck.y,
        width: deck.width,
        height: deck.height,
      };

      if (!painted) return { box };

      const card = painted.closest(sliders);
      const overlay = card?.parentElement?.querySelector(
        'p.overlayBox, p.topBox',
      );

      return {
        displayed: urlFromStyle(
          window.getComputedStyle(painted).getPropertyValue('background-image'),
        ),
        href: overlay?.querySelector('a')?.getAttribute('href') ?? undefined,
        overlayText: overlay ? (overlay as HTMLElement).innerText : undefined,
        box,
      };
    },
    { sliders: sliderSelector, photos: photoSelector },
  );

/**
 * @param page The tinder page
 * @returns The name on the current card, so a test can tell if it has
 * accidentally moved on to somebody else
 */
export const getCurrentPersonName = (page: Page): Promise<string | undefined> =>
  page.evaluate(() => {
    const heading = document.querySelector<HTMLElement>(
      '[itemprop="name"], span[itemprop="name"], h1',
    );
    return heading?.innerText?.trim() || undefined;
  });

/**
 * Taps the right hand side of the photo to move to the next one.
 *
 * Only ever clicks inside the photo itself - the like and nope controls are
 * elsewhere, so this can't swipe on anyone.
 *
 * @param page The tinder page
 * @returns Whether the photo on screen actually changed
 */
export const goToNextPhoto = async (page: Page): Promise<boolean> => {
  const before = await getCardState(page);
  if (!before.box) return false;

  await page.mouse.click(
    before.box.x + before.box.width * 0.85,
    before.box.y + before.box.height * 0.5,
  );

  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    const now = await getCardState(page);
    if (now.displayed && now.displayed !== before.displayed) return true;
    // eslint-disable-next-line no-await-in-loop
    await page.waitForTimeout(200);
  }

  return false;
};
