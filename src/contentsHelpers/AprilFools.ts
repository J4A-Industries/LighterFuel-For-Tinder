const checkDate = () => {
  const date = new Date();
  const month = date.getMonth();
  const day = date.getDate();
  if (month === 3 && day === 1) {
    return true;
  }
  return false;
};

const dislikeButtonPath = 'm15.44 12 4.768 4.708c1.056.977 1.056 2.441 0 3.499-.813 1.057-2.438 1.057-3.413 0L12 15.52l-4.713 4.605c-.975 1.058-2.438 1.058-3.495 0-1.056-.813-1.056-2.44 0-3.417L8.47 12 3.874 7.271c-1.138-.976-1.138-2.44 0-3.417a1.973 1.973 0 0 1 3.25 0L12 8.421l4.713-4.567c.975-1.139 2.438-1.139 3.413 0 1.057.814 1.057 2.44 0 3.417L15.44 12Z';

const getParentElement = (root: Element, parentType: string) => {
  const parent = root.parentElement;
  if (parent) {
    if (parent.tagName.toLowerCase() === parentType) {
      return parent;
    }
    return getParentElement(parent, parentType);
  }
  return null;
};

class AprilFools {
  constructor() {
    // if (checkDate()) {

    // }
    setInterval(() => {
      this.reRouteDislikeButton();
    }, 50);
  }

  reRouteDislikeButton() {
    const innerSVG = [...document.querySelectorAll('path')].find((x) => x.getAttribute('d') === dislikeButtonPath);
    if (!innerSVG) return;
    const button = getParentElement(innerSVG, 'button');
    if (!button) return;
    if (button.getAttribute('aria-listen')) return;
    // console.log(button);
    button.setAttribute('aria-listen', 'true');
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Dislike button clicked');
    });
  }
}

export { AprilFools };
