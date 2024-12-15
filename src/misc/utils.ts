export const openTab = (link: string) => {
  const tab = window.open(link, '_blank');
  if (tab) tab.focus();
};

export const getImageDivsFromIDs = (uuids = []) => {
  if (!Array.isArray(uuids) || !uuids.length) {
    throw new Error('Please provide an array of UUIDs');
  }

  const selector = uuids
    .map((uuid) => `[style*="background-image: url"][style*="${uuid}"]`)
    .join(', ');

  return {
    selector,
    getElements: () => document.querySelectorAll(selector),
    getElementsArray: () => [...document.querySelectorAll(selector)],
  };
};
