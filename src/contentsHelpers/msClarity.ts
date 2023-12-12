/* eslint-disable prefer-rest-params */
// import clarityUrl from 'url:~resources/clarity.js';

/* eslint-disable consistent-return */
interface Config {
  projectId: string;
  upload: string;
  expire: number;
  cookies: string[];
  track: boolean;
  lean: boolean;
  content: boolean;
  dob: number;
}

const runScript = (
  clarityKey: string,
  config: Config,
): void => {
  window[clarityKey] = function () {
    (window[clarityKey].q = window[clarityKey].q || []).push([window, document, clarityKey, 'script', config.projectId]);
  };

  const sync = (): void => {
    const image = new Image();
    image.src = 'https://c.clarity.ms/c.gif';
  };

  if (document.readyState === 'complete') {
    sync();
  } else {
    window.addEventListener('load', sync);
  }
  if (window[clarityKey].v || window[clarityKey].t) {
    return window[clarityKey]('event', clarityKey, `dup.${config.projectId}`);
  }

  window[clarityKey].t = true;

  const scriptElement = document.createElement('script');
  scriptElement.setAttribute('type', 'text/javascript');
  // // scriptElement.setAttribute('async', 'true');
  // // scriptElement.setAttribute('src', clarityUrl);
  const url = 'chrome-extension://cpiohldhnbjmbfnbcpgmkigedlkhjgbo/resources/clarity.js';
  scriptElement.setAttribute('src', url);
  scriptElement.setAttribute('async', 'true');
  scriptElement.setAttribute('id', 'ms_clarity');

  const firstScript = document.head;
  firstScript.parentNode.insertBefore(scriptElement, firstScript);

  scriptElement.onload = (): void => {
    window[clarityKey]('start', config);
    window[clarityKey].q.unshift(window[clarityKey].q.pop());
    window[clarityKey]('set', 'C_IS', '0');
  };
};

export default runScript;
