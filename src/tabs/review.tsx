import type { ReactNode } from 'react';

import './style.css';

import { Button } from '@/components/ui/button';
import { links } from '@/misc/config';

import logo from '~assets/LighterFuel512.png';

type Release = {
  version: string;
  date: string;
  headline: string;
  body: ReactNode;
};

/** Newest first. The top entry is the one the page leads with. */
const releases: Release[] = [
  {
    version: '1.7.0',
    date: 'August 2026',
    headline: "We've updated LighterFuel!",
    body: (
      <>
        <p className="mb-3">
          <b>- &ldquo;Open High Quality&rdquo; opens the right photo now.</b>
        </p>
        <p className="mb-3">
          <b>- It keeps working after you leave Tinder alone.</b>
        </p>
        <p>
          In the mean time, check out what I&apos;ve been up to:{' '}
          <a
            href="https://www.amibeingpwned.com"
            target="_blank"
            className="text-blue-500 underline underline-offset-2"
            rel="noreferrer">
            Am I Being Pwned
          </a>{' '}
          - a free tool to let you know what your extensions are up to.
          <br />I spoke at DEF CON this year about how one of these enabled RCEs
          at most of the banks in Belgium{' '}
          <a
            href="https://amibeingpwned.com/blog/8-in-10-banks-in-belgium"
            target="_blank"
            className="text-blue-500 underline underline-offset-2"
            rel="noreferrer">
            here
          </a>
          .
        </p>
      </>
    ),
  },
  {
    version: '1.6.6',
    date: 'November 2025',
    headline: 'Fun mode',
    body: (
      <p>
        LighterFuel is still being maintained and here&apos;s an update to prove
        it. There&apos;s a &ldquo;fun mode&rdquo; toggle in the extension menu
        so you can opt out of LighterFuel themed pranks and April fools updates.
      </p>
    ),
  },
  {
    version: '1.6.0',
    date: 'April 2025',
    headline: 'April fools, and Bumble groundwork',
    body: (
      <p>
        The LighterFuel April fools update is out — you&apos;ll have to wait and
        see what it does. I&apos;ve also been working on Bumble compatibility,
        so keep an eye out for that soon&trade;.
      </p>
    ),
  },
  {
    version: '1.5.8',
    date: 'January 2025',
    headline: 'The “something’s broken” button',
    body: (
      <p>
        There&apos;s a &ldquo;broken&rdquo; button in the popup you can click to
        let me know if it&apos;s broken for you, which helps me fix it faster.
        It activates Microsoft Clarity — only if you&apos;ve turned that on in
        the consent page — and records your Tinder tab until you refresh or
        close it.
      </p>
    ),
  },
  {
    version: '1.5.6',
    date: 'October 2024',
    headline: 'Premium pages, and general reliability',
    body: (
      <p>
        LighterFuel now works for Tinder premium users on the extra pages, and
        should be more reliable in general.
      </p>
    ),
  },
  {
    version: '1.5.4',
    date: 'August 2024',
    headline: 'Less flickering',
    body: (
      <p>
        The overlay flickers less and always shows the age of the account.
        Before this it had been inconsistently flickering between different
        accounts.
      </p>
    ),
  },
  {
    version: '1.5.0',
    date: 'May 2024',
    headline: 'Fixed for non-English users',
    body: (
      <p>
        Fixed the bug that was causing the extension to not work for people
        whose Tinder wasn&apos;t in English.
      </p>
    ),
  },
];

const [latest, ...earlier] = releases;

const Review = () => (
  <div className="min-h-screen w-full bg-background px-6 py-14 text-foreground">
    <div className="mx-auto flex max-w-2xl flex-col gap-9">
      <header className="flex items-center gap-4">
        <img src={logo} className="h-14 w-14 rounded-xl" alt="" />
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            LighterFuel {latest.version} · {latest.date}
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {latest.headline}
          </h1>
        </div>
      </header>

      <div className="rounded-lg border bg-card p-6 text-[15px] leading-relaxed text-card-foreground/85">
        {latest.body}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="flex-1">
          <a href={links.reviews} target="_blank" rel="noreferrer">
            Leave a review
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1">
          <a href="https://tinder.com">Back to Tinder</a>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Found something broken? Hit the button in the popup, or email{' '}
        <a
          href="mailto:help@j4a.uk"
          className="text-primary underline underline-offset-2">
          help@j4a.uk
        </a>
        . LighterFuel is one person in his spare time, and reviews genuinely
        keep it alive.
      </p>

      <details className="border-t pt-6">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          Earlier versions
        </summary>
        <div className="mt-5 flex flex-col gap-6">
          {earlier.map((release) => (
            <article key={release.version}>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {release.version} · {release.date}
              </div>
              <h2 className="mb-1.5 mt-1 text-lg">{release.headline}</h2>
              <div className="text-sm leading-relaxed text-muted-foreground">
                {release.body}
              </div>
            </article>
          ))}
        </div>
      </details>
    </div>
  </div>
);

export default Review;
