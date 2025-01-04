import './style.css';

import logo from '~assets/LighterFuel512.png';

const Review = () => (
  <div className="w-screen min-h-screen flex justify-center align-middle text-white bg-gray-900">
    <div className="m-auto bg-gray-800 p-4 flex gap-4 max-w-4xl">
      <img src={logo} className="m-auto max-h-[20em] max-w-[20em]" alt="logo" />
      <div className="flex-1 flex justify-center align-middle flex-col gap-4">
        <div className="underline text-3xl text-center">
          Lighterfuel Updates
        </div>
        <div className="text-xl overflow-auto max-h-96">
          <b>v1.6.6</b>
          <br />
          <br />
          Lighterfuel is still being maintained and here&apos;s an update to
          prove it! I&apos;ve added a &quot;fun mode&quot; toggle in the
          extension menu so you can opt out of LighterFuel themed pranks and
          april fools updates. Email me at{' '}
          <a href="mailto:help@j4a.uk">help@j4a.uk</a> if you have any feedback
          or suggestions.
          <b>v1.6.0</b>
          <br />
          <br />
          The LighterFuel April fools update is out! You&apos;ll have to wait
          and see what it does ;) I&apos;ve also been working on an update for
          bumble compatibility, so keep an eye out for that soon™.
          <br />
          <br />
          <b>v1.5.8</b>
          <br />
          <br />
          LighterFuel now has a &quot;broken&quot; button in the popup you can
          click to let me know if it&apos;s broken for you, this will help me
          fix it faster. This will activate Microsoft Clarity (if it&apos;s
          turned on in the consent page) and will send me a recording of tinder,
          until you refresh the page or close the tab.
          <br />
          <br />
          <b>v1.5.6</b>
          <br />
          <br />
          LighterFuel now works for tinder premium users on the extra pages, it
          should also be more reliable in general.
          <br />
          If this has fixed lighterfuel for you, please leave positive review!
          <br />
          <br />
          <b>v1.5.4</b>
          <br />
          <br />
          The overlay should now flicker less and always show the age of the
          account, before it had been inconsistently flickering between
          different accounts.
          <br />
          If this has fixed lighterfuel for you, please leave positive review!
          Otherwise, if you&apos;re still having issues, please email me at{' '}
          <a href="mailto:help@j4a.uk">help@j4a.uk</a>
          <br />
          <br />
          <b>v1.5.0:</b>
          <br />
          <br />
          I&apos;ve fixed the bug that was causing the extension to not work for
          non english speaking users.
          <br />
          <br />
          If Lighterfuel was broken for you and now works, please leave a
          positive review!
          <br />
          <br />
          If you are still encountering errors, tell me via the feedback button
          in the extension, or emailing{' '}
          <a href="mailto:help@j4a.uk">help@j4a.uk</a>
          .
          <br />
          <br />
          <b>v1.4.9:</b>
          <br />
          Hi Everyone, Tinder has stopped sending the dates of when the photos
          were uploaded, however the account creation date is still being sent,
          so the age of the account is still accurate.
          <br />
          <br />
          I&apos;m working on fixing the bugs that have been reported as soon as
          possible.
          <br />
          <br />
          I am also the only developer working on this project, and I&apos;m
          doing it in my spare time, so if you want to support me and help keep
          this project alive, please leave a review!
          <br />
          - James
          <br />
          <br />
        </div>
        <a
          href="https://chromewebstore.google.com/detail/lighterfuel-for-tinder/bmcnbhnpmbkcpkhnmknmnkgdeodfljnc/reviews"
          target="_blank"
          rel="noreferrer"
          className="btn btn-lg btn-wide btn-success m-auto hover:scale-105 flex justify-center align-middle flex-col gap-4">
          <div className="m-auto">Leave a review</div>
        </a>
      </div>
    </div>
  </div>
);

export default Review;
