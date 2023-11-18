import './style.css';
import logo from '~assets/LighterFuel512.png';

const Review = () => (
  <div className="w-screen min-h-screen flex justify-center align-middle">
    <div className="m-auto bg-base-200 p-4 flex gap-4 max-w-4xl">
      <img src={logo} className="m-auto max-h-[20em] max-w-[20em]" alt="logo" />
      <div className="flex-1 flex justify-center align-middle flex-col gap-4">
        <div className="underline text-3xl text-center">Lighterfuel Updates</div>
        <div className="text-xl overflow-auto max-h-96">
          <b>v1.5.5</b>
          <br />
          <br />
          LighterFuel now works for tinder premium users on the &quot;your likes&quot; page!
          <br />
          If this has fixed lighterfuel for you, please leave positive review!
          <br />
          <br />
          <b>v1.5.4</b>
          <br />
          <br />
          The overlay should now flicker less and always show the age of the account, before it had been inconsistently flickering between different accounts.
          <br />
          If this has fixed lighterfuel for you, please leave positive review! Otherwise, if you&apos;re still having issues, please email me at
          {' '}
          <a href="mailto:help@j4a.uk">help@j4a.uk</a>
          <br />
          <br />
          <b>v1.5.0:</b>
          <br />
          <br />
          I&apos;ve fixed the bug that was causing the extension to not work for non english speaking users.
          <br />
          <br />
          If Lighterfuel was broken for you and now works, please leave a positive review!
          <br />
          <br />

          If you are still encountering errors, tell me via the feedback button in the extension, or emailing
          {' '}
          <a href="mailto:help@j4a.uk">help@j4a.uk</a>
          .
          <br />
          <br />
          <b>v1.4.9:</b>
          <br />
          Hi Everyone, Tinder has stopped sending the dates of when the photos were uploaded, however the account creation date is still being sent, so the age of the account is still accurate.
          <br />
          <br />
          I&apos;m working on fixing the bugs that have been reported as soon as possible.
          <br />
          <br />
          I am also the only developer working on this project, and I&apos;m doing it in my spare time, so if you want to support me and help keep this project alive, please leave a review!
          <br />
          - James
          <br />
          <br />
        </div>
        <a href="https://chrome.google.com/webstore/detail/lighterfuel-for-tinder/bmcnbhnpmbkcpkhnmknmnkgdeodfljnc/reviews" target="_blank" rel="noreferrer" className="btn btn-lg btn-wide btn-success m-auto hover:scale-105 flex justify-center align-middle flex-col gap-4">
          <div className="m-auto">Leave a review</div>
          <img className="m-auto" src="https://camo.githubusercontent.com/0b3c88f2d028d56528ad864625393d63fbadc239d643db76e789ed88fa11aaae/68747470733a2f2f696d672e736869656c64732e696f2f6368726f6d652d7765622d73746f72652f73746172732f626d636e62686e706d626b63706b686e6d6b6e6d6e6b6764656f64666c6a6e63" />
        </a>
      </div>

    </div>
  </div>
);

export default Review;
