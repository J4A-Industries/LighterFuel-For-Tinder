import { debug } from '@/misc/config';
import type { ImageType, ProfileImage } from '@/misc/types';

/**
   * Used to genereate the buttons
   *
   * @returns The buttons
   */
export const createButtons = (data: {url: string}): HTMLElement => {
  const parent = document.createElement('div');
  parent.classList.add('buttonParent');
  // * URLs that start with ... are private (their URL can't be passed to any other service)
  // * They are seemingly the profile pictures when swiping
  // * Let's just only allow this on matches for now
  if (!data.url.startsWith('https://images-ssl.gotinder.com/u/')) {
    const searchButton = document.createElement('div');
    const reverseImageUrl = `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIIDP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(data.url)}&exph=800&expw=640&vt=2&sim=15`;
    searchButton.classList.add('buttonLF');
    searchButton.classList.add('search');
    searchButton.innerText = 'Search';
    searchButton.onclick = () => {
      if (debug) console.log('Searching for', reverseImageUrl);
      const newTab = window.open(reverseImageUrl, '_blank');
      if (newTab) newTab.focus();
    };
    parent.appendChild(searchButton);
  }
  return parent;
};

/**
 * Used to get the relative time from the current time
 *
 * @param time The timestamp to get the relative time from
 * @returns How many days/weeks/years ago, eg "20 Days"
 */
export const getTimeOld = (time: number): string => {
  // get days old
  const days = Math.round((Date.now() - time) / 24 / 60 / 60 / 1000);
  if (days / 365 > 1) {
    return `${Math.round((days / 365) * 100) / 100} Years`;
  }
  if (days / 7 > 1) {
    return `${Math.round((days / 7) * 10) / 10} Weeks`;
  }
  return `${days} Days`;
};

/**
 * Gets the images from the profile
 *
 * @param {HTMLElement | Document | Element} doc The parent of the images to search for
 * @param {Array} urlArray The array of URLs that the method searches for
 * @returns An array of images found with the node and the data entry
 */
export const getProfileImages = (doc: HTMLElement | Document | Element, urlArray: any[]): ProfileImage[] => {
  if (!doc) return [];
  // The regex to check for the background to match `url(...)`
  const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
  const outArr = Array.from(
    Array.from(doc.querySelectorAll('div'))
      .reduce((collection, node) => {
        // looking for: <div aria-label="Profile slider" class="profileCard__slider__img Z(-1)" style="background-image: url(&quot;https://images-ssl.gotinder.com/541b6caf953a993e14736e0f/640x640_f95e8fc1-fb18-40a1-8a41-53a409a238a3.jpg&quot;); background-position: 50% 50%; background-size: auto 100%;"></div>
        const prop = window.getComputedStyle(node, null).getPropertyValue('background-image');
        // match `url(...)`
        const match = srcChecker.exec(prop);
        if (match) {
          // look for the found URL in the URL list
          const urlEntry = urlArray.find((x: ImageType) => x.url === match[1]);
          // if the URL is in the list and the node has the classes 'StretchedBox' or 'profileCard__slider__img'
          if (urlEntry && (node.classList.contains('StretchedBox') || node.classList.contains('profileCard__slider__img'))) {
            // add tothe collection
            const entry: ProfileImage = { domNode: node, data: urlEntry };
            collection.add(entry);
          }
        }
        return collection;
      }, new Set()),
  );
  return outArr as ProfileImage[];
};

/**
 * This gets all the images shown on the page
 *
 * @returns The array of nodes with a background image
 */
export const getProfileImagesShown = () => [...document.querySelectorAll('div')]
  .filter((x) => window.getComputedStyle(x, null)
    .getPropertyValue('background-image').includes('url("'));

export const getBackgroundImageFromNode = (node: Element): string => {
  const style = window.getComputedStyle(node, null).getPropertyValue('background-image');
  const regex = /background-image:\s*url\("?(.*?)"?\);/;
  const match = regex.exec(style);

  return match ? match[1] : '';
};

/**
 * ! Highly likely to break if tinder makes changes, this is the best I can do to keep it going
 * Probably could be obsolete and replaced with getProfileImages, will remove in the future
 *
 * @param doc The document to search though
 * @returns The array of nodes
 */
export const getDomsWithBGImages = (doc: HTMLElement): Element[] => {
  if (!doc) return [];
  const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
  const arr: Array<Element> = Array.from(doc.querySelectorAll('*'));
  const imageArray = arr.reduce((collection: Set<Element>, node: Element) => {
    const prop = window.getComputedStyle(node, null).getPropertyValue('background-image');
    const match = srcChecker.exec(prop);
    if (match) {
      if ((node.classList.contains('StretchedBox') || node.classList.contains('profileCard__slider__img'))) {
        collection.add(node);
      }
    }
    return collection;
  }, new Set());

  return Array.from(imageArray);
};

/**
 * ! Highly likely to break if tinder makes changes, this is the best I can do to keep it going
 * Gets the URL from the node (tinder uses CSS background images)
 *
 * @param {HTMLElement} node
 * @returns the URL from the node
 */
export const getImageURLfromNode = (node: Element): string => {
  const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
  // get background image from node
  const prop = window.getComputedStyle(node, null).getPropertyValue('background-image');
  const match = srcChecker.exec(prop);
  return match ? match[1] : '';
};

/**
 * Returns the parent node, "count" times up the DOM tree
 */
export const parentNode = (node: HTMLElement, count: number): HTMLElement => {
  if (count === 0) return node;
  if (!node.parentElement) {
    console.error(new Error('No parent node found :('));
    return node;
  }
  return parentNode(node.parentElement, count - 1);
};

/**
 * ! Highly likely to break if tinder makes changes, this is the best I can do to keep it going
 * It gets the container for the buttons so they can be added
 * @returns {HTMLElement} The parent node for the buttons
 */
export const getTextButtonParent = (): HTMLElement | null => {
  const svgArr = [...document.querySelectorAll('svg')];
  const svg24px = svgArr.filter((n) => n.getAttribute('height') === '24px');
  const hasLastChild = svg24px.filter((n) => n.firstChild?.lastChild);

  const musicIcon = hasLastChild.find((n) => {
    const firstChild = n.children[0];
    if (firstChild) {
      const secondChild = firstChild.children[firstChild.children.length - 1];
      if (secondChild) {
        return secondChild.getAttribute('fill') === '#17af70';
      }
    }
    return false;
  });
  if (musicIcon) {
    if (!musicIcon.parentNode?.parentNode?.parentNode) return null;
    return musicIcon.parentNode?.parentNode?.parentNode as HTMLElement;
  }
  const spanArr = [...document.querySelectorAll('span')];
  const hiddenSpans = spanArr.filter((n) => n.classList.contains('Hidden'));
  for (const n of hiddenSpans) {
    if (n.innerText === 'Vinyl' || n.innerText === 'Sticker' || n.innerText === 'GIF') {
      return parentNode(n, 3);
    }
  }
  return null;
};

/**
* a console log facade for the debug bool
*/

export const consoleOut = (message: string | any[] | any) => {
  if (debug) console.log(message);
};
