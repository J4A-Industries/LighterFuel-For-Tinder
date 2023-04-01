import React, { useState } from 'react';
import Collapsible from 'react-collapsible';
import Flag from 'react-world-flags';
import '@/style.css';
import logo from 'data-base64:~assets/LighterFuel512.png';
import Switch from '@mui/material/Switch';
import { gpt, links, text } from '@/misc/config';
import { openTab } from '@/misc/utils';

const IndexPopup = () => {
  const [data, setData] = useState('');
  const [overlayButton, setOverlayButton] = useState(true);
  const [searchButton, setSearchButton] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.id);
  };

  return (
    <div className="App text-center w-[280px] font['Roboto', sans-serif] text-2xl font-light bg-slate-700 text-white p-5 select-none">
      <header className="App-header">
        <div className="grid justify-center m-3">
          <img src={logo} className="h-32 w-32 select-none" alt="logo" />
        </div>

        <Collapsible
          trigger={(
            <div className="content-center">
              {text.donate.title}
              <Flag
                code="UA"
                className="h-6 inline-block mx-3 my-1 flex-auto"
              />
            </div>
          )}
          className=""
          easing="ease-in"
          transitionTime={200}
        >
          <p className="text-lg">{text.donate.location}</p>
          <div
            className="w-[80%] mx-auto my-2 p-1 content-center text-xl border-white border-2 rounded-2xl align-middle cursor-pointer"
            onClick={() => openTab(links.ukraineAppeal)}
          >
            {text.donate.buttonText}
            {' '}
            <Flag code="UA" className="h-6 inline-block mx-3 my-1 flex-auto" />
          </div>
        </Collapsible>
        <Switch
          checked={overlayButton}
          onChange={() => setOverlayButton(!overlayButton)}
          inputProps={{ 'aria-label': 'controlled' }}
          aria-label="Enable Overlay Button"
        />
        {/* <ToggleSwitch
          text={text.enableOverlay}
          id="overlay"
          state={overlayButton}
          onChange={handleChange}
        />
        <ToggleSwitch
          text={text.enableSearchButton}
          id="search"
          state={searchButton}
          onChange={handleChange}
          /> */}
        <Collapsible
          trigger={text.info.title}
          easing="ease-in"
          transitionTime={200}
        >
          <p className="text-base">{text.info.text}</p>
        </Collapsible>
        <Collapsible
          trigger={text.reverseImageSearch.title}
          easing="ease-in"
          transitionTime={200}
        >
          <p className="text-base">{text.reverseImageSearch.text}</p>
        </Collapsible>
        <Collapsible
          trigger={text.testimonials.title}
          easing="ease-in"
          transitionTime={200}
        >
          <p className="text-base">{text.testimonials.text}</p>
          <div
            className="text-base"
            onClick={() => openTab(links.review)}
          >
            Leave a Review!
          </div>
        </Collapsible>
      </header>
    </div>
  );
};

export default IndexPopup;
