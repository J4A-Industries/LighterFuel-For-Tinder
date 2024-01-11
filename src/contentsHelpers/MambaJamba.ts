import ImageHandler from '@/contentsHelpers/ImageHandler';
import { createMambaOverlayNode } from './Misc';
import { Sites } from '@/misc/types';

/**
 * This class handles the image overlay for mamba.ru
 */
class MambaJamba extends ImageHandler {
  imagesOnPage: Element[];

  constructor() {
    super(Sites.MAMBA);
    this.imagesOnPage = [];
    this.initialiseInterval();
  }

  /**
   * This function is called every x ms, to check if the images on the page have changed
   * If they have, then it will update the images.
   * TODO: maybe use intersection observer instead?
   */
  initialiseInterval() {
    // every 50ms check to see if the images on the image get query selector has changed
    // if it has, then update the images
    setInterval(() => {
      const imagesOnPage = [...document.querySelectorAll('img')].filter((x) => {
        const src = x.getAttribute('src');
        return src.includes('square_large.jpg') || src.includes('huge.jpg');
      });
      this.imagesOnPage = imagesOnPage;
      this.handleImageOverlay();
    }, 50);
  }

  handleImageOverlay() {
    for (let i = 0; i < this.imagesOnPage.length; i++) {
      const image = this.imagesOnPage[i];
      const existingOverlay = image.parentElement.querySelector('div.overlayBox, div.topBox');
      if (!existingOverlay) {
        this.createOverlay(image);
      } else {
        // check to see if the overlay 'aria-url' matches the current image
        const overlayURL = existingOverlay.getAttribute('aria-label');
        const imageURL = this.images.find((x) => x.url === image.getAttribute('src'))?.url;
        if (overlayURL !== imageURL) {
          // if it doesn't, then remove the overlay and create a new one
          existingOverlay.remove();
          this.createOverlay(image);
        }
      }
    }
  }

  async createOverlay(image: Element): Promise<Element | null> {
    const imageSrc = image.getAttribute('src');
    const imageRecord = this.images.find((x) => x.url === imageSrc);
    if (!imageRecord) {
      console.log(`imageRecord not found in createOverlayNode ${imageSrc}`);
      return null;
    }
    const overlayNode = createMambaOverlayNode(image, imageRecord);
    // append the overlay to the parent of the image
    image.parentElement.appendChild(overlayNode);

    return overlayNode;
  }
}

export default MambaJamba;
