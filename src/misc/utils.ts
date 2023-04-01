export const openTab = (link: string) => {
  const tab = window.open(link, '_blank');
  if (tab) tab.focus();
};
