import './style.css';

import { Button } from '@/components/ui/button';
import { links } from '@/misc/config';

import logo from '~assets/LighterFuel512.png';

const NotCWS = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-background px-6 py-14 text-foreground">
    <div className="flex max-w-xl flex-col gap-6">
      <img src={logo} className="h-16 w-16 rounded-xl" alt="" />
      <h1 className="text-3xl font-semibold tracking-tight">
        Install LighterFuel from the Chrome Web Store
      </h1>
      <p className="leading-relaxed text-muted-foreground">
        You&apos;re running a copy that didn&apos;t come from the Chrome Web
        Store. Installing from the store means you get updates and fixes
        automatically, and it keeps you safe from malicious copies of
        LighterFuel.
      </p>
      <Button asChild size="lg" className="w-fit">
        <a
          href={links.reviews.replace('/reviews', '')}
          target="_blank"
          rel="noreferrer">
          Get LighterFuel
        </a>
      </Button>
    </div>
  </div>
);

export default NotCWS;
