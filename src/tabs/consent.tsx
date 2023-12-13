import { useStorage } from '@plasmohq/storage/hook';
import { Storage } from '@plasmohq/storage';
import './style.css';
import { Switch } from '@mui/material';
import { useEffect } from 'react';
import logo from '~assets/LighterFuel512.png';

const consentText = {
  analyticsConsent: 'Enable analytics',
  replayConsent: 'Enable error reporting',
};

const Consent = () => {
  const [analyticsConsent, setAnalyticsConsent] = useStorage({
    key: 'analyticsConsent',
    instance: new Storage({
      area: 'sync',
    }),
  });

  const [replayConsent, setReplayConsent] = useStorage({
    key: 'replayConsent',
    instance: new Storage({
      area: 'sync',
    }),
  });

  // sometimes analytics consent is undefined, so we set it to true
  useEffect(() => {
    if (analyticsConsent === undefined) setAnalyticsConsent(true);
    if (replayConsent === undefined) setReplayConsent(true);
  }, []);

  return (
    <div className="min-h-screen w-screen bg-base-100 flex justify-center align-middle">
      <div className="m-auto flex flex-col p-4 bg-neutral-focus gap-4">
        <div className="flex justify-center align-middle">
          <h1 className="text-4xl m-auto flex-1 text-center">Consent</h1>
          <div className="m-auto flex justify-center align-middle flex-1">
            <img src={logo} className="m-auto max-h-[10em] max-w-[10em]" alt="logo" />
          </div>
        </div>
        <p className="text-xl">
          By using LighterFuel, you agree to sending anonymous usage data back to us.
          {' '}
          <br />
          This data will be used to help improve the extension and will never be sold or shared with any third parties.
          {' '}
          <br />
          If you want to turn this off, you can do so here at any time.
          {' '}
          <br />
          Analytics are used to help us understand how many people are using the extension, and how they are using it.
          <br />
          This is done via Google Analytics.
          <br />
          Error reporting is used to help us understand what errors are happening, and how to fix them.
          <br />
          This is done via Microsoft Clarity
          <br />
          This will make lighterfuel work more reliably and consistently for everyone.
          <br />
          <a href="https://j4a.uk/privacy-policy">
            Click Here For The Privacy Policy
          </a>
        </p>
        <div className="flex gap-4">
          <div className="flex flex-col justify-center m-auto bg-slate-800 text-center text-2xl flex-1">
            <div>
              {consentText.analyticsConsent}
            </div>

            <Switch
              checked={analyticsConsent}
              onChange={() => setAnalyticsConsent(!analyticsConsent)}
              inputProps={{ 'aria-label': 'controlled' }}
              aria-label={consentText.analyticsConsent}
              className="m-auto"
            />
          </div>

          <div className="flex flex-col justify-center m-auto bg-slate-800 text-center text-2xl flex-1">
            <div>
              {consentText.replayConsent}
            </div>

            <Switch
              checked={replayConsent}
              onChange={() => setReplayConsent(!replayConsent)}
              inputProps={{ 'aria-label': 'controlled' }}
              aria-label={consentText.replayConsent}
              className="m-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consent;
