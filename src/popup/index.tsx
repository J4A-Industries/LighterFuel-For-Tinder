import React, { useEffect, useState } from 'react';

import '@/popup/style.css';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AnalyticsEvent } from '@/misc/GA';
import { defaultSettings, links, text } from '@/misc/config';
import { sendToBackground } from '@/misc/messaging';
import { useStorage } from '@/misc/useStorage';
import { openTab } from '@/misc/utils';
import { browser } from 'wxt/browser';

import logo from '~assets/LighterFuel512.png';

import { MdHeartBroken } from './icons';
import ukraineFlag from './ua.svg';

type SettingRowProps = {
  title: string;
  /** Only worth setting when it says something the title doesn't */
  description?: string;
  checked: boolean;
  onChange: () => void;
};

const SettingRow = ({ title, description, checked, onChange }: SettingRowProps) => (
  <div className="flex items-center justify-between gap-3 px-4 py-2.5">
    <div className="min-w-0">
      <div className="text-[13px] leading-tight">{title}</div>
      {description && (
        <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
          {description}
        </div>
      )}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
  </div>
);

const IndexPopup = () => {
  const [showSettings, setShowSettings] = useStorage('showSettings', (x) =>
    x === undefined ? defaultSettings : x,
  );
  const [clickedBroken, setClickedBroken] = useState<boolean>(false);
  const [onTinder, setOnTinder] = useState<boolean>(false);

  useEffect(() => {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => setOnTinder(Boolean(tab?.url?.includes('tinder.com'))))
      .catch(() => setOnTinder(false));
  }, []);

  useEffect(() => {
    if (!clickedBroken) return;
    AnalyticsEvent([{ name: 'broken_report', params: {} }]);
    sendToBackground({ name: 'activateClarity' });
  }, [clickedBroken]);

  useEffect(() => {
    AnalyticsEvent([
      { name: 'page_view', params: { page_title: 'popup' } },
    ]);
  }, []);

  useEffect(() => {
    AnalyticsEvent([
      {
        name: 'event',
        params: {
          event_category: 'settings',
          event_label: 'settings-change',
          value: JSON.stringify(showSettings),
        },
      },
    ]);
  }, [showSettings]);

  return (
    <div className="w-[296px] select-none bg-background text-foreground">
      <header className="flex items-center gap-3 border-b px-4 py-3.5">
        <button
          type="button"
          onClick={() => openTab(links.reviews)}
          aria-label={text.popup.review}
          className="flex-none rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <img src={logo} alt="" className="h-8 w-8 rounded-lg" />
        </button>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold leading-tight">
              LighterFuel
            </span>
            <span className="text-[10px] leading-tight text-muted-foreground">
              {browser.runtime.getManifest().version}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-tight">
            <span
              className={`h-1.5 w-1.5 flex-none rounded-full ${
                onTinder ? 'bg-primary' : 'bg-muted-foreground'
              }`}
            />
            <span className={onTinder ? 'text-primary' : 'text-muted-foreground'}>
              {onTinder ? text.popup.statusActive : text.popup.statusIdle}
            </span>
          </div>
        </div>
      </header>

      <div className="pt-1.5" />
      <SettingRow
        title={text.enableOverlay}
        checked={showSettings.overlayButton}
        onChange={() =>
          setShowSettings({
            ...showSettings,
            overlayButton: !showSettings.overlayButton,
          })
        }
      />
      <SettingRow
        title={text.enableSearchButton}
        description={text.popup.enableSearchButtonDesc}
        checked={showSettings.searchButton}
        onChange={() =>
          setShowSettings({
            ...showSettings,
            searchButton: !showSettings.searchButton,
          })
        }
      />

      <details className="border-t px-4 py-2.5 [&[open]>summary]:mb-2">
        <summary className="cursor-pointer text-[12px] text-muted-foreground marker:text-muted-foreground hover:text-foreground">
          {text.popup.about}
        </summary>
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          {text.info.text}
        </p>
      </details>

      <div className="flex flex-col gap-2 border-t px-4 py-3">
        <Button
          variant="secondary"
          size="sm"
          className="h-9 w-full text-[11.5px]"
          onClick={() => !clickedBroken && setClickedBroken(true)}>
          <MdHeartBroken className="h-4 w-4 shrink-0" />
          {clickedBroken ? text.brokenButtonClicked : text.brokenButton}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-full text-[11.5px]"
          onClick={() => openTab(browser.runtime.getURL('/consent.html'))}>
          {text.popup.settings}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1 border-t px-2 py-1.5">
        <Button variant="link" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground no-underline hover:text-foreground" onClick={() => openTab(links.reviews)}>
          {text.popup.review}
        </Button>
        <Button variant="link" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground no-underline hover:text-foreground" onClick={() => openTab(links.discord)}>
          {text.popup.discord}
        </Button>
        <Button variant="link" size="sm" className="h-7 gap-1.5 px-2 text-[11px] text-muted-foreground no-underline hover:text-foreground" onClick={() => openTab(links.ukraineAppeal)}>
          <img src={ukraineFlag} alt="" className="h-3 w-4 rounded-[1px]" />
          {text.popup.ukraine}
        </Button>
      </div>
    </div>
  );
};

export default IndexPopup;
