import { useEffect } from 'react';

import './style.css';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Storage } from '@/misc/storage';
import { useStorage } from '@/misc/useStorage';

import logo from '~assets/LighterFuel512.png';

const consentText = {
  analyticsConsent: 'Usage analytics',
  analyticsDesc:
    'Anonymous counts of how many people use LighterFuel and which features they use. Sent to Google Analytics.',
  replayConsent: 'Error reporting',
  replayDesc:
    'Lets the "something’s broken" button record your Tinder tab so I can see what went wrong. Recording only ever starts when you press that button. Uses Microsoft Clarity.',
  funMode: 'Fun mode',
  funDesc:
    'LighterFuel-themed pranks, once a year, on the 1st of April.',
  goToTinder: 'Go to Tinder',
};

const syncStorage = new Storage({ area: 'sync' });

const Consent = () => {
  const [funMode, setFunMode] = useStorage('funMode', (x) =>
    x === undefined ? true : x,
  );

  const [analyticsConsent, setAnalyticsConsent] = useStorage({
    key: 'analyticsConsent',
    instance: syncStorage,
  });

  const [replayConsent, setReplayConsent] = useStorage({
    key: 'replayConsent',
    instance: syncStorage,
  });

  // sometimes consent comes back undefined, so default it to on
  useEffect(() => {
    if (analyticsConsent === undefined) setAnalyticsConsent(true);
    if (replayConsent === undefined) setReplayConsent(true);
  }, [analyticsConsent, replayConsent]);

  const rows = [
    {
      title: consentText.analyticsConsent,
      description: consentText.analyticsDesc,
      checked: Boolean(analyticsConsent),
      onChange: () => setAnalyticsConsent(!analyticsConsent),
    },
    {
      title: consentText.replayConsent,
      description: consentText.replayDesc,
      checked: Boolean(replayConsent),
      onChange: () => setReplayConsent(!replayConsent),
    },
    {
      title: consentText.funMode,
      description: consentText.funDesc,
      checked: Boolean(funMode),
      onChange: () => setFunMode(!funMode),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background px-6 py-14 text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex items-center gap-4">
          <img src={logo} className="h-14 w-14 rounded-xl" alt="" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Your data, your call
            </h1>
            <p className="mt-1 max-w-md text-muted-foreground">
              You can change these any time from the popup.
            </p>
          </div>
        </header>

        <div className="divide-y divide-border rounded-lg border bg-card">
          {rows.map((row) => (
            <div
              key={row.title}
              className="flex items-start justify-between gap-6 p-5">
              <div>
                <div className="text-lg">{row.title}</div>
                <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {row.description}
                </p>
              </div>
              <div className="pt-1.5">
                <Switch
                  checked={row.checked}
                  onCheckedChange={row.onChange}
                  aria-label={row.title}
                />
              </div>
            </div>
          ))}
        </div>

        <Button asChild size="lg" className="w-full">
          <a href="https://tinder.com">{consentText.goToTinder}</a>
        </Button>

        <div className="border-t pt-6 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base text-foreground">
            The longer version
          </h2>
          <p className="mb-3">
            LighterFuel is free, and none of this data is sold to anyone. Usage
            analytics tell me how many people are using the extension and
            roughly which parts, which is what keeps it worth maintaining. Error
            reporting only ever fires when you actively report something as
            broken, and it stops as soon as you refresh or close the tab.
          </p>
          <p>
            <a
              href="https://j4a.uk/privacy-policy"
              className="text-primary underline underline-offset-2">
              Read the privacy policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Consent;
