import { create } from 'domain';
import ImageHandler, { Events } from '@/contentsHelpers/ImageHandler';
import { debug, text } from '@/misc/config';
import { createMambaOverlayNode, getImageLastModified, getTimeOld } from './Misc';
import { Sites } from '@/misc/types';

/**
 * This class handles the image overlay for mamba.ru
 */
class MambaJamba extends ImageHandler {
  imagesOnPage: Element[];

  constructor() {
    super();
    this.imagesOnPage = [];
    /* this.emitter.on(Events.imagesUpdate, (images) => {
      console.log(images);
    }); */
    this.initialiseInterval();
  }

  initialiseInterval() {
    // every 50ms check to see if the images on the image get query selector has changed
    // if it has, then update the images
    setInterval(() => {
      const imagesOnPage = [...document.querySelectorAll('img')].filter((x) => {
        const type = x.getAttribute('type');
        return type === 'squareLarge' || type === 'huge';
      });
      this.imagesOnPage = imagesOnPage;
      this.handleImageOverlay();
    }, 5000);
  }

  handleImageOverlay() {
    for (let i = 0; i < this.imagesOnPage.length; i++) {
      const image = this.imagesOnPage[i];
      const existingOverlay = image.parentElement.parentElement.querySelector('div.overlayBox, div.topBox');
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

  async createOverlay(image: Element) {
    const imageSrc = image.getAttribute('src');
    let imageRecord = this.images.find((x) => x.url === imageSrc);
    if (!imageRecord) {
      console.log(`imageRecord not found in createOverlayNode ${imageSrc}, creating new record`);
      try {
        const lastModified = await getImageLastModified(imageSrc);
        if (!lastModified) throw new Error(`Cannot get last modified for ${imageSrc}`);
        imageRecord = {
          url: imageSrc,
          lastModified: lastModified.toString(),
          timeAddedToArr: new Date(),
          site: Sites.MAMBA,
        };
        if (!imageRecord) throw new Error(`Cannot get last modified for ${imageSrc}`);
      } catch (e) {
        return console.log(e);
      }
    }
    const overlayNode = createMambaOverlayNode(image, imageRecord);
    // append the overlay to the parent of the image
    image.parentElement.appendChild(overlayNode);

    return overlayNode;
  }
}

export default MambaJamba;
