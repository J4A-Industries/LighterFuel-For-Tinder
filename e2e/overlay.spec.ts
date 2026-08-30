import type { Page } from '@playwright/test';

import {
  type CardState,
  getCardState,
  getCurrentPersonName,
  goToNextPhoto,
  photoIdFromUrl,
} from './tinder';
import { expect, test } from './fixtures';

/**
 * Waits for the extension to put its overlay on the card on screen.
 *
 * @param recsPage The tinder swipe page
 * @returns The card state once the overlay is up
 */
const waitForOverlay = async (recsPage: Page): Promise<CardState> => {
  await expect
    .poll(async () => (await getCardState(recsPage)).href, {
      message: 'the extension never put an overlay on the card',
      timeout: 45_000,
    })
    .toMatch(/^https:/);

  return getCardState(recsPage);
};

test.describe('the overlay on the swipe page', () => {
  test('shows the account age on the current card', async ({ recsPage }) => {
    const card = await waitForOverlay(recsPage);
    expect(card.overlayText).toMatch(/Ago/);
  });

  test('the high quality link points at the photo on screen', async ({
    recsPage,
  }) => {
    const card = await waitForOverlay(recsPage);

    expect(photoIdFromUrl(card.displayed)).toBeDefined();
    expect(photoIdFromUrl(card.href)).toBe(photoIdFromUrl(card.displayed));
  });

  /**
   * The regression test for the bug where the button opened the previous photo:
   * the link has to keep up as you tap through someone's photos, and must never
   * be left pointing at one you've already moved past.
   */
  test('the link keeps up when you tap through the photos', async ({
    recsPage,
  }) => {
    await waitForOverlay(recsPage);

    const person = await getCurrentPersonName(recsPage);
    const seen: (string | undefined)[] = [];

    for (let i = 0; i < 3; i++) {
      // eslint-disable-next-line no-await-in-loop
      const displayed = photoIdFromUrl((await getCardState(recsPage)).displayed);

      // eslint-disable-next-line no-await-in-loop
      await expect
        .poll(async () => photoIdFromUrl((await getCardState(recsPage)).href), {
          message: `the link never caught up with photo ${i + 1}`,
          timeout: 15_000,
        })
        .toBe(displayed);

      // * it must never be pointing at a photo we've already moved past
      expect(seen).not.toContain(displayed);
      seen.push(displayed);

      // eslint-disable-next-line no-await-in-loop
      if (!(await goToNextPhoto(recsPage))) break;

      // * a card change would mean we swiped by accident, so fail rather than
      // * carry on asserting against somebody else
      // eslint-disable-next-line no-await-in-loop
      expect(await getCurrentPersonName(recsPage)).toBe(person);
    }

    expect(seen.length).toBeGreaterThan(1);
  });

  /**
   * The other half of that bug - when the extension has no data for the photo
   * on screen it used to leave the previous photo's overlay sitting there.
   */
  test('never shows an overlay for a photo it has no data for', async ({
    recsPage,
  }) => {
    await waitForOverlay(recsPage);

    for (let i = 0; i < 4; i++) {
      // eslint-disable-next-line no-await-in-loop
      const card = await getCardState(recsPage);

      // * either there's no overlay, or it's for the photo we're looking at
      if (card.href !== undefined) {
        expect(photoIdFromUrl(card.href)).toBe(photoIdFromUrl(card.displayed));
      }

      // eslint-disable-next-line no-await-in-loop
      if (!(await goToNextPhoto(recsPage))) break;
    }
  });
});
