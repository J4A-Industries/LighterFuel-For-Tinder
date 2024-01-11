/* eslint-disable class-methods-use-this */
import ImageHandler from '@/contentsHelpers/ImageHandler';
import { createMambaOverlayNode } from './Misc';
import { Sites, type ImageType } from '@/misc/types';

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
        const imageSrc = (image as HTMLImageElement).src;
        const record = this.images.find((x) => x.url === imageSrc);
        if (!record) {
          console.log(`record not found in createOverlayNode ${imageSrc}`);
        } else {
          this.createOverlay(image, record);
        }
      } else {
        // check to see if the overlay 'aria-url' matches the current image
        const overlayURL = existingOverlay.getAttribute('aria-label');
        const record = this.images.find((x) => x.url === image.getAttribute('src'));
        if (overlayURL !== record?.url && record) {
          // if it doesn't, then remove the overlay and create a new one
          existingOverlay.remove();
          this.createOverlay(image, record);
        }
      }
    }
  }

  async createOverlay(image: Element, record: ImageType): Promise<Element | null> {
    const overlayNode = createMambaOverlayNode(image, record);
    // append the overlay to the parent of the image
    image.parentElement.appendChild(overlayNode);

    return overlayNode;
  }
}

export default MambaJamba;
