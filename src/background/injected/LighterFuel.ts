/* global chrome,  */

// "this file is injected onto tinder.com so it can request all the files properly,
// content script is not worth messing around with apparently" - Acorn221 in 2020

class LighterFuel {
  /**
   * @param {Boolean} debug
   */
  constructor(debug = true) {
    this.debug = debug;
    // images: {url: String, lastModified: String, timeAddedToArr: Integer}[]
    this.images = [];
    // profileSliderContainers: {domNode: DomNode, data: Object}[]
    this.profileSliderContainers = [];
    this.showSettings = {};
    this.mainMutationObserver = new MutationObserver(this.profileMutationCallback);
    this.textContainerObserver = new MutationObserver(this.textButtonObserverCallback);
    if (this.debug) this.setCustomFetch();
    this.initialiseMessageListner();
    this.init();
  }

  /**
   * Ran to initialise the checking for profile images
   */
  init() {
    this.getInitialData().then(() => {
      if (this.debug) this.consoleOut(this.images);
    }).catch((err) => {
      this.consoleOut(err);
    });
  }

  /**
   * A method to monitor the container of the profile images DIV
   *
   * @param {HTMLElement} container The profile images DIV
   * @returns {MutationObserver} The MutationObserver that has been created
   */
  monitorContainer(container) {
    const config = { attributes: true, subtree: true };

    const observer = new MutationObserver((mutationsList) => {
      this.profileMutationCallback(mutationsList, container);
    });
    observer.observe(container, config);
    if (!document.body.contains(container)) {
      // TODO: find why this is needed and sort it out
      this.consoleOut('observer disconnected in monitorContainer, not sure why this is needed yet');
      return observer.disconnect();
    }
    return observer;
  }

  /**
   * The mutation observer callback which is put on the profile image container
   *
   * @param {MutationRecord} mutationsList The mutation list that has occurred
   * @param {HTMLElement} container The container on which the observer was observing
   */
  profileMutationCallback(mutationsList, container) {
    for (const mutation of mutationsList) {
      // if "hidden" has changed (the pic displayed has changed)
      if (mutation.type === 'attributes') {
        // for every image span (div inside span is image)
        for (const node of container.childNodes) {
          // check whether or not the image is shown
          if (node.getAttribute('aria-hidden') === 'false') {
            const internalImage = this.getDomsWithBGImages(node);
            if (internalImage.length > 0) {
              const imageURL = this.getImageURLfromNode(internalImage[0]);
              this.consoleOut(`Now displaying: ${imageURL}`);
              const containerRecord = this.profileSliderContainers.find((x) => x.containerDOM === container);
              // ! somewhere here, there's an error 
              // ! not sure, the image is downloaded and the console outputs the image URL
              const requestRecord = this.images.find((y) => y.url === imageURL);
              if (!requestRecord) {
                this.consoleOut('request record invalid in monitor container :( running findNodes again, container record:');
                this.consoleOut(containerRecord);
                this.consoleOut(requestRecord);
                this.findNodes();
                return;
              }
              const overlay = this.createOverlayNode(requestRecord);
              const newOverlayBox = overlay.overlayNode;
              containerRecord.overlayBox.parentNode.replaceChild(newOverlayBox, containerRecord.overlayBox);
              containerRecord.overlayBox = newOverlayBox;
              overlay.onPlaced();
            }
          }
        }
      }
    }
  }

  /**
   * Set's the profile slider up and adds a new record to the "profileSliderContainers"
   *
   * @param {HTMLElement} imgDom The profile element
   */
  setupProfileSlider(imgDom) {
    const profileImages = this.getProfileImages(imgDom, this.images);
    if (profileImages.length > 0) {
      // this might break, not sure of a better way to do it though! This is most likely to break first
      let profileImagesContainer = profileImages[0].domNode.parentNode.parentNode;

      if (profileImagesContainer.nodeName === 'SPAN') profileImagesContainer = profileImagesContainer.parentNode;
      let overlayBoxDom = profileImagesContainer.parentNode.querySelector('.overlayBox');
      let containerRecord = this.profileSliderContainers.find((x) => x.containerDOM === profileImagesContainer);
      // if container record not already in profileSliderContainers array, add it
      if (!containerRecord) {
        // TODO: might not always be profileImages[0]
        const overlay = this.createOverlayNode(profileImages[0].data);
        overlayBoxDom = overlay.overlayNode;
        profileImagesContainer.parentNode.appendChild(overlayBoxDom);
        overlay.onPlaced();
        const newRecord = { containerDOM: profileImagesContainer, observer: this.monitorContainer(profileImagesContainer, overlayBoxDom), overlayBox: overlayBoxDom };
        containerRecord = this.profileSliderContainers.push(newRecord);
        this.consoleOut('New container found! Record: ');
        this.consoleOut(newRecord);
      }
    }
  }

  initialiseMessageListner() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'settings update':
          this.showSettings = request.showSettings;
          this.setDisplayStatus();
          break;
        case 'new image':
          this.addNewImage(request.data);
          break;
        default:
          throw new Error('Recieved an action which was not in the switch case :(');
      }
      sendResponse();
    });
  }

  /**
   * Used to get the initial images/settings from the background.js file
   */
  getInitialData() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'get initial data' }, (response) => {
        if (!response) return reject();
        this.addNewImage(response.imageArray);
        this.showSettings = response.showSettings;
        this.setDisplayStatus();
        return resolve();
      });
    });
  }

  /**
   * Adds the images to the images array, then it prunes the old ones off (if the array gets to big)
   *
   * @param {Array<Object> || Object} image
   */
  addNewImage(image) {
    if (!image) return;
    if (Array.isArray(image)) {
      this.images.push(...image);
    } else {
      this.images.push(image);
    }
    // prune off the old images
    if (this.images.length > 50) this.images.splice(0, this.images.length - 50);
    window.requestIdleCallback(() => {
      const pImages = this.getProfileImages(document, this.images);
      pImages.forEach((node) => this.setupProfileSlider(node.domNode.parentNode));
    });
  }

  /**
   * Sets the mutation observer after the profile images have been identified to exist
   */
  findNodes() {
    this.lookForProfileImages().then((profileImages) => {
      const config = { attributes: false, childList: true, subtree: true };
      this.consoleOut(profileImages);
      profileImages.forEach((node) => this.setupProfileSlider(node.domNode.parentNode));
      this.mainMutationObserver.observe(document.getElementsByClassName('App')[0], config);
    });
  }

  /**
   * Looks for the profile images, if they're not there, sets the windowOnload to it
   *
   * @returns {Promise<Array>}
   */
  lookForProfileImages() {
    return new Promise((resolve) => {
      const profileImages = this.getProfileImages(document, this.images);
      if (profileImages.length < 1) {
        resolve(profileImages);
      } else {
        window.onload = () => {
          resolve(this.lookForProfileImages());
          if (this.debug) this.consoleOut('No nodes found, setting window onload event');
        };
      }
    });
  }

  /* ************************************************* */

  /**
   * Sets a passthrough for the fetch so we can monitor requests
   * TODO: make this look nicer
   */
  setCustomFetch() {
    if (this.debug) {
      // save default fetch
      const nativeFetch = window.fetch;
      window.fetch = (...args) => new Promise((resolve, reject) => {
        nativeFetch(...args).then((result) => {
          resolve(result);
          this.handleFetchResponse(result.clone(), args);
        }).catch((err) => reject(err));
      });
    }
  }

  /**
   * TODO: move this to an external helper file
   * This method is to handle the response from the custom fetch when one appears
   * @param {Response} result The result from the fetch
   * @param {Array} args The arguments sent back
   */
  handleFetchResponse(result, args) {
    const regexChecks = {
      matches: /https:\/\/api.gotinder.com\/v2\/matches\?/g,
      core: /https:\/\/api.gotinder.com\/v2\/recs\/core\/*/g,
      profile: /https:\/\/api.gotinder.com\/v2\/profile\/*/g,
      user: /https:\/\/api.gotinder.com\/user\/([A-z0-9]+)/g,
      messages: /https:*:\/\/api.gotinder.com\/v2\/matches\/([A-z0-9]+)\/messages\?/g,
    };
    // check for JSON here
    result.json().then((jsonOut) => {
      if (args[0].match(regexChecks.matches)) {
        chrome.runtime.sendMessage({ action: 'send matches', matches: jsonOut });
      } else if (args[0].match(regexChecks.core)) {
        chrome.runtime.sendMessage({ action: 'send core', core: jsonOut });
      } else if (args[0].match(regexChecks.profile)) {
        chrome.runtime.sendMessage({ action: 'send profile', profile: jsonOut });
      } else if (args[0].match(regexChecks.user)) {
        chrome.runtime.sendMessage({ action: 'send user data', data: jsonOut });
      } else if (args[0].match(regexChecks.messages)) {
        chrome.runtime.sendMessage({ action: 'send messages', messages: jsonOut });
      }
    });
  }

  /* ************************************************ */

  // TODO: Utility methods should be moved to a different class imo ⬇⬇⬇
  /**
   * Gets the images from the profile
   * TODO: find out what this does
   * @param {HTMLElement} doc The parent of the images to search for
   * @param {Array} urlArray The array of URLs that the method searches for
   * @returns {{domNode: DomNode, data: Object}[]} An array of images found with the node and the data entry
   */
  getProfileImages(doc, urlArray = this.images) {
    if (!doc) return [];
    // The regex to check for the background to match `url(...)`
    const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
    return Array.from(
      Array.from(doc.querySelectorAll('div'))
        .reduce((collection, node) => {
          // looking for: <div aria-label="Profile slider" class="profileCard__slider__img Z(-1)" style="background-image: url(&quot;https://images-ssl.gotinder.com/541b6caf953a993e14736e0f/640x640_f95e8fc1-fb18-40a1-8a41-53a409a238a3.jpg&quot;); background-position: 50% 50%; background-size: auto 100%;"></div>
          const prop = window.getComputedStyle(node, null).getPropertyValue('background-image');
          // match `url(...)`
          const match = srcChecker.exec(prop);
          if (match) {
            // look for the found URL in the URL list
            const urlEntry = urlArray.find((x) => x.url === match[1]);
            // if the URL is in the list and the node has the classes 'StretchedBox' or 'profileCard__slider__img'
            if (urlEntry && (node.classList.contains('StretchedBox') || node.classList.contains('profileCard__slider__img'))) {
              // add tothe collection
              collection.add({ domNode: node, data: urlEntry });
            }
          }
          return collection;
        }, new Set()),
    );
  }

  /**
   * Probably could be obsolete and replaced with getProfileImages, will remove in the future
   * TODO: move this to an external helper file
   *
   * @param {HTMLElement} doc The document to search though
   * @returns {{HTMLElement}[]} The array of nodes
   */
  getDomsWithBGImages(doc) {
    if (!doc) return [];
    const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
    return Array.from(
      Array.from(doc.querySelectorAll('*'))
        .reduce((collection, node) => {
          const prop = window.getComputedStyle(node, null).getPropertyValue('background-image');
          const match = srcChecker.exec(prop);
          if (match) {
            // if(urlArray.find(x => x.url === match.slice(4, -1).replace(/"/g, ""))){
            // match[1] is url
            // var urlEntry = urlArray.find(x => x.url === match[1]);
            if ((node.classList.contains('StretchedBox') || node.classList.contains('profileCard__slider__img'))) {
              collection.add(node);
            }
          }
          return collection;
        }, new Set()),
    );
  }

  /**
   * TODO: move this to an external helper file
   * Gets the URL from the node (tinder uses CSS background images)
   *
   * @param {HTMLElement} node
   * @returns {String} the URL from the node
   */
  getImageURLfromNode(node) {
    const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
    // get background image from node
    const prop = window.getComputedStyle(node, null).getPropertyValue('background-image');
    const match = srcChecker.exec(prop);
    return match ? match[1] : '';
  }

  /**
   * Creates the overlay element for the photo
   *
   * @param {String} lastModified The last modified time from the image
   * @returns {HTMLElement}
   */
  createOverlayNode(data) {
    const { lastModified } = data;
    const overlayNode = document.createElement('p');
    const date = new Date(lastModified);
    const xOld = this.getTimeOld(date.getTime());
    const outFormat = `${date.getHours()}:${date.getMinutes()} ${date.toLocaleDateString()} <br>${xOld} Old`;
    overlayNode.innerHTML = `Image Uploaded At: ${outFormat}`;
    overlayNode.appendChild(this.createButtons(data));
    console.log(overlayNode);
    const onPlaced = () => {
      const bounds = overlayNode.getBoundingClientRect();
      // * whenever there's 100px above, we have room to place the box above
      console.log(data);
      if (bounds.top > 100) {
        overlayNode.classList.add('topBox');
        // TODO: fix jank
        overlayNode.parentElement.parentElement.style.overflow = 'visible';
        overlayNode.parentElement.parentElement.parentElement.parentElement.parentElement.style.top = '50px';
      } else {
        overlayNode.classList.add('overlayBox');
      }
    };

    return { overlayNode, onPlaced };
  }

  /**
   * TODO: move this to an external helper file
   * Used to genereate the buttons
   *
   * @returns {HTMLElement} The buttons
   */
  createButtons(data) {
    const parent = document.createElement('div');
    parent.classList.add('buttonParent');
    // * URLs that start with ... are private (their URL can't be passed to any other service)
    // * They are seemingly the profile pictures when swiping
    // * Let's just only allow this on matches for now
    if (!data.url.startsWith('https://images-ssl.gotinder.com/u/')) {
      const searchButton = document.createElement('div');
      searchButton.classList.add('buttonLF');
      searchButton.classList.add('search');
      searchButton.innerText = 'Search';
      searchButton.onclick = () => {
        console.log(`https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIIDP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(data.url)}&exph=800&expw=640&vt=2&sim=15`);
        window.open(`https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIIDP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(data.url)}&exph=800&expw=640&vt=2&sim=15`, '_blank').focus();
      };
      parent.appendChild(searchButton);

      const enlargeButton = document.createElement('div');
      enlargeButton.classList.add('buttonLF');
      enlargeButton.classList.add('enlarge');
      enlargeButton.innerText = 'Enlarge';
      enlargeButton.onclick = () => {
        window.open(this.getFullQualityImage(data.url), '_blank').focus();
      };
      parent.appendChild(enlargeButton);
    }
    return parent;
  }

  /**
   * TODO: move this to an external helper file
   * Transfers the input image to the "full quality" tinder ones
   * Highly likely to break soon
   *
   * @param {String} url
   * @returns {String}
   */
  getFullQualityImage(url) {
    return url.replace(url.split('/')[4].split('_')[0], 'original').replace('.jpg', '.jpeg');
  }

  /**
   * TODO: move this to an external helper file
   * Used to get the relative time from the current time
   *
   * @param {String} time The Date.toString() time, eg "Wed, 08 Apr 2020 22:14:00 GMT"
   * @returns {String} How many days/weeks/years ago, eg "20 Days"
   */
  getTimeOld(time) {
    // get days old
    const days = Math.round((Date.now() - time) / 24 / 60 / 60 / 1000);
    if (days / 365 > 1) {
      return `${Math.round((days / 365) * 100) / 100} Years`;
    } if (days / 7 > 1) {
      return `${Math.round((days / 7) * 10) / 10} Weeks`;
    }
    return `${days} Days`;
  }

  /**
   * Sets the overlay display status to shown/hidden
   *
   * @param {Boolean} status Whether or not to display the overlay
   */
  setDisplayStatus() {
    let styleElem = document.querySelector('#overlayDisplay');
    if (!styleElem) {
      styleElem = document.createElement('style');
      styleElem.setAttribute('id', 'overlayDisplay');
      document.head.append(styleElem);
    }
    styleElem.textContent = `
.overlayBox {  ${this.showSettings.overlayButton ? '' : 'display: none'} }
.topBox { ${this.showSettings.overlayButton ? '' : 'display: none'} }
.buttonLF .search { ${this.showSettings.searchButton ? '' : 'display: none'} }
.buttonLF .enlarge { ${this.showSettings.enlargeButton ? '' : 'display: none'} }`;
    this.consoleOut(this.showSettings);
  }

  /**
   * TODO: move this to an external helper file
   * Highly likely to break if tinder makes changes, this is the best I can do to keep it going
   * It gets the container for the buttons so they can be added
   * @returns {HTMLElement} The parent node for the buttons
   */
  getTextButtonParent() {
    const svgArr = [...document.querySelectorAll('svg')];
    const svg24px = svgArr.filter((n) => n.getAttribute('height') === '24px');
    const hasLastChild = svg24px.filter((n) => n.firstChild.lastChild);
    const musicIcon = hasLastChild.find((n) => n.firstChild.lastChild.getAttribute('fill') === '#17af70');
    if (musicIcon) return musicIcon.parentNode.parentNode.parentNode;
    const spanArr = [...document.querySelectorAll('span')];
    const hiddenSpans = spanArr.filter((n) => n.classList.contains('Hidden'));
    for (const n of hiddenSpans) {
      if (n.innerText === 'Vinyl' || n.innerText === 'Sticker' || n.innerText === 'GIF') {
        return n.parentNode.parentNode.parentNode;
      }
    }
    return null;
  }

  // TODO: complete these (GPT Integration)
  setTextButtonObserver() {
    if (this.getTextButtonParent()) {

    }
  }

  textButtonObserverCallback(mutations, observer) {
    if (this.getTextButtonParent()) {

    }
  }

  /**
   * a console log facade for the debug bool
   */
  consoleOut(message) {
    if (this.debug) console.log(message);
  }
}

try {
  const lf = new LighterFuel(true);
  // prints the lf instance to the console for debugging!
  console.log(lf);
} catch (err) {
  console.error(err);
}
