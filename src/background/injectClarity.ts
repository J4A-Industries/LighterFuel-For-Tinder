/* eslint-disable consistent-return */
type InjectClarityType = {
  url: string;
  config: {
    projectId: string;
    upload: string;
    expire: number;
    cookies: string[];
    track: boolean;
    lean: boolean;
    content: boolean;
    dob: number;
  };
  clarityKey: string;
};

export const injectClarity = (data: InjectClarityType) => {
  const confirmation = confirm(
    'You are about to start recording your current tab to highlight any issues you may be experiencing. Are you sure you want to continue?',
  );

  if (!confirmation) return;

  const { url, config, clarityKey } = data;

  // this code serves the purpose of the original tracking code
  window[clarityKey] = function () {
    (window[clarityKey].q = window[clarityKey].q || []).push([
      window,
      document,
      clarityKey,
      'script',
      config.projectId,
    ]);
  };

  // Add a red border to the entire screen
  const addRedBorder = () => {
    const borderDiv = document.createElement('div');
    borderDiv.setAttribute('id', 'session-border');
    borderDiv.style.position = 'fixed';
    borderDiv.style.top = '0';
    borderDiv.style.left = '0';
    borderDiv.style.width = '100vw';
    borderDiv.style.height = '100vh';
    borderDiv.style.border = '5px solid red';
    borderDiv.style.pointerEvents = 'none';
    borderDiv.style.zIndex = '9998'; // Ensure it appears on top
    document.body.appendChild(borderDiv);
  };

  // Add a button to end session recording
  const addEndSessionButton = () => {
    const button = document.createElement('button');
    button.textContent = 'End Session Recording';
    button.setAttribute('id', 'end-session-button');
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.padding = '10px 20px';
    button.style.fontSize = '16px';
    button.style.backgroundColor = 'red';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9999'; // Ensure it appears on top
    button.addEventListener('click', () => {
      location.reload(); // Refresh the page to end the session
    });
    document.body.appendChild(button);
  };

  // Call functions to add UI elements
  addRedBorder();
  addEndSessionButton();

  // this section then serves the purpose of the js file that the tracking code requests
  // e.g. https://www.clarity.ms/tag/examplethisisnotreal
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

  // this creates a script tag and injects it into the page, with the local clarity.js file
  const scriptElement = document.createElement('script');
  scriptElement.setAttribute('type', 'text/javascript');
  scriptElement.setAttribute('async', 'true');
  scriptElement.setAttribute('src', url);
  scriptElement.setAttribute('id', 'ms_clarity');
  const firstScript = document.head;
  firstScript.parentNode.insertBefore(scriptElement, firstScript);

  // this callback gets the ball rolling with clarity
  scriptElement.onload = (): void => {
    window[clarityKey]('start', config);
    window[clarityKey].q.unshift(window[clarityKey].q.pop());
    window[clarityKey]('set', 'C_IS', '0');
  };

  return undefined;
};
