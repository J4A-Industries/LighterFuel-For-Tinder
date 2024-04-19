import logo from '~assets/LighterFuel512.png';

import './style.css';

const NotCWS = () => (
  <div className="min-h-screen w-screen bg-gray-900 flex justify-center align-middle text-white">
    <div className="m-auto flex flex-col p-4 bg-neutral-focus gap-4">
      <div className="flex justify-center align-middle">
        <h1 className="text-4xl m-auto flex-1 text-center">
          Go to the Chrome Web Store to install LighterFuel
        </h1>
        <div className="m-auto flex justify-center align-middle flex-1">
          <img
            src={logo}
            className="m-auto max-h-[10em] max-w-[10em]"
            alt="logo"
          />
        </div>
      </div>
      <p className="text-xl">
        You must install LighterFuel via the Chrome Web Store to use it, as you
        are not currently using the Chrome Web Store version.
        {' '}
        <br />
        Installing LighterFuel from the Chrome Web Store ensures that you
        receive updates and bug fixes automatically, and it also helps keep you
        safe from malicious copies of LighterFuel.
        {' '}
        <br />
        <div className="flex justify-center align-middle">
          <div
            className="btn btn-lg btn-secondary"
            onClick={() => {
              window.open(
                'https://chromewebstore.google.com/detail/lighterfuel-for-tinder/bmcnbhnpmbkcpkhnmknmnkgdeodfljnc',
                '_blank',
              );
            }}
          >
            Go To LighterFuel
          </div>
        </div>
      </p>
    </div>
  </div>
);

export default NotCWS;
