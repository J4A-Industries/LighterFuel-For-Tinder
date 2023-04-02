import React, { useEffect, useState } from 'react';
import Collapsible from 'react-collapsible';
import Flag from 'react-world-flags';
import '@/style.css';
import logo from 'data-base64:~assets/LighterFuel512.png';
import Switch from '@mui/material/Switch';
import { AiOutlineSetting, AiOutlineInfoCircle, AiOutlineGithub } from 'react-icons/ai';
import { Storage } from '@plasmohq/storage';
import { useStorage } from '@plasmohq/storage/hook';
import { gpt, links, text } from '@/misc/config';
import { openTab } from '@/misc/utils';

enum menuOptions {
  settings,
  info,
}

const IndexPopup = () => {
  const [data, setData] = useState('');
  const [menuTab, setMenuTab] = useState<menuOptions>(menuOptions.settings);
  const [overlayButton, setOverlayButton] = useStorage('overlayButton', (x) => (x === undefined ? true : x));
  const [searchButton, setSearchButton] = useStorage('searchButton', (x) => (x === undefined ? true : x));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.id);
  };

  useEffect(() => {
    console.log('Overlay Button: ', overlayButton);
  }, [overlayButton]);
  
  useEffect(() => {
    const storage = new Storage();
    storage.get('overlayButton').then((x) => {
      console.log('Overlay Button in storage: ', x);
    });
  }, []);

  return (
    <div className="App text-center w-[280px] font['Roboto', sans-serif] text-2xl font-light bg-slate-900 text-white p-5 select-none gap-2 flex flex-col">
      <div className="grid justify-center cursor-pointer" onClick={() => openTab(links.reviews)}>
        <img src={logo} className="h-32 w-32 select-none" alt="logo" />
      </div>

      <div className="flex justify-center align-middle">
        <div className="grid grid-cols-2 w-44 gap-4 m-auto">
          <div className="flex align-middle justify-center">
            <AiOutlineSetting className={`m-auto w-20 h-20 bg-slate-600 p-2 cursor-pointer ${(menuTab === menuOptions.settings) ? 'bg-slate-500' : 'bg-slate-600'} hover:outline-offset-2 outline-white outline`} onClick={() => setMenuTab(menuOptions.settings)} />
          </div>
          <div className="flex align-middle justify-center">
            <AiOutlineInfoCircle className={`m-auto w-20 h-20 bg-slate-600 p-2 cursor-pointer ${(menuTab === menuOptions.info) ? 'bg-slate-500' : 'bg-slate-600'} hover:outline-offset-2 outline-white outline`} onClick={() => setMenuTab(menuOptions.info)} />
          </div>
          <div className="flex align-middle justify-center">
            <AiOutlineGithub className="m-auto w-20 h-20 bg-slate-600 p-2 cursor-pointer hover:outline-offset-2 outline-white outline" onClick={() => openTab(links.github)} />
          </div>
          <div className="flex align-middle justify-center">
            <Flag
              code="UA"
              className="m-auto w-20 h-20 bg-slate-600 p-2 cursor-pointer hover:outline-offset-2 outline-white outline"
              onClick={() => openTab(links.ukraineAppeal)}
            />
          </div>
        </div>
      </div>

      {menuTab === menuOptions.settings && (
        <div className="flex justify-center align-middle m-2 flex-col gap-2">
          <div className="flex flex-col justify-center m-auto bg-slate-800 w-44 hover:outline-offset-2 outline-white outline">
            <div>
              {text.enableOverlay}
            </div>

            <Switch
              checked={overlayButton}
              onChange={() => setOverlayButton(!overlayButton)}
              inputProps={{ 'aria-label': 'controlled' }}
              aria-label={text.enableOverlay}
              className="m-auto"
            />
          </div>
          <div className="flex flex-col justify-center m-auto bg-slate-800 w-44 hover:outline-offset-2 outline-white outline">
            <div>
              {text.enableSearchButton}
            </div>

            <Switch
              checked={searchButton}
              onChange={() => setSearchButton(!searchButton)}
              inputProps={{ 'aria-label': 'controlled' }}
              aria-label={text.enableSearchButton}
              className="m-auto"
            />
          </div>
        </div>
      )}

      {menuTab === menuOptions.info && (
        <div className="text-base m-2 p-2 bg-slate-800">
          {text.info.text}
        </div>
      )}
    </div>
  );
};

export default IndexPopup;
