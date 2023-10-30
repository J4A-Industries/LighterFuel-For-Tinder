import './style.css';
import logo from '~assets/LighterFuel512.png';

const Review = () => (
  <div className="w-screen min-h-screen flex justify-center align-middle">
    <div className="m-auto bg-base-200 p-4 flex gap-4 max-w-4xl">
      <img src={logo} className="m-auto max-h-[20em] max-w-[20em]" alt="logo" />
      <div className="flex-1 flex justify-center align-middle flex-col gap-4">
        <div className="underline text-3xl text-center">Lighterfuel Updates</div>
        <div className="text-xl">
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
        <a href="https://chrome.google.com/webstore/detail/lighterfuel-for-tinder/bmcnbhnpmbkcpkhnmknmnkgdeodfljnc/reviews" target="_blank" rel="noreferrer" className="btn btn-lg btn-wide btn-success m-auto hover:scale-105">
          Leave a review
        </a>
      </div>

    </div>
  </div>
);

export default Review;
