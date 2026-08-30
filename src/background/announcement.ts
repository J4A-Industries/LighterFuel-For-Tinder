/**
 * Whether to open the what's new page.
 *
 * Kept separate from the listener so the decision can be tested directly -
 * chrome only fires onInstalled for a real version change, which can't be
 * simulated against an unpacked build.
 *
 * @param reason Why onInstalled fired
 * @param seen The announcement version this user has already been shown
 * @param current The announcement version we'd show them now
 * @returns Whether the page should open
 */
export const shouldOpenAnnouncement = (
  reason: string,
  seen: string | undefined,
  current: string,
): boolean => {
  // * a fresh install gets the consent page, not a changelog
  if (reason !== 'update') return false;

  return seen !== current;
};
