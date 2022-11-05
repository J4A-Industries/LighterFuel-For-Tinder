import './App.css';
import React from 'react';
import Flag from 'react-world-flags';
import Collapsible from 'react-collapsible';
import logo from '@/assets/LighterFuel512.png';
import Settings from '@/popup/components/Settings';
import ToggleSwitch from '@/popup/components/ToggleSwitch';
import {links, text, gpt} from '@/config';
import {openTab} from '@/popup/misc';
import {styles} from '@/popup/styles';
import { ShowSettings } from '@/types';

class App extends React.Component {

  port: chrome.runtime.Port;

  state: ShowSettings;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: any) {
    super(props);
    this.state = { overlayButton: true, searchButton: true };
    if (!chrome.runtime) throw new Error("This extension doesn't support the current browser");
    this.port = chrome.runtime.connect();
    this.port.onMessage.addListener((msg) => {
      console.log(`message recieved${msg}`);
      if ('showSettings' in msg) {
        this.setState(msg.showSettings);
      }
    });

    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * Handles whenver the user changes the state of the toggle switches
   */
  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    switch (event.target.id) {
      case 'overlay':
        this.setState({ overlayButton: event.target.checked }, () => this.sendState());
        break;
      case 'search':
        this.setState({ searchButton: event.target.checked }, () => this.sendState());
        break;
        break;
      default:
        console.error('no handle change ID given :(');
        break;
    }
    console.log(`Button ${event.target.id} Set To ${event.target.checked ? 'Checked' : 'Unchecked'}`);
  }

  /**
   * Sends the state of the toggle switches to the background script
   */
  sendState() {
    this.port.postMessage({ showSettings: this.state });
    console.log(this.state);
  }

  render() {
    const { overlayButton, searchButton } = this.state;
    return (
      <div className="App text-center w-[280px] font['Roboto', sans-serif] text-2xl font-light">
        <header className="App-header">
          <div className="grid justify-center m-5">
          <img src={logo} className="h-32 w-32 select-none" alt="logo" />
          </div>
          
          <Collapsible
            trigger={(
              <div className="content-center">
                {text.donate.title}
                <Flag code="UA" className={styles.ukraineFlag} />
              </div>
            )}
            className=""
            easing="ease-in"
            transitionTime={200}
          >
            <p className="text-lg">{text.donate.location}</p>
            <div className={styles.donateButton} onClick={() => openTab(links.ukraineAppeal)}>
              {text.donate.buttonText}
              {' '}
              <Flag code="UA" className={styles.ukraineFlag} />
            </div>
          </Collapsible>
          <ToggleSwitch text={text.enableOverlay} id="overlay" state={overlayButton} onChange={this.handleChange} />
          <ToggleSwitch text={text.enableSearchButton} id="search" state={searchButton} onChange={this.handleChange} />
          <Collapsible trigger={text.info.title} easing="ease-in" transitionTime={200}>
            <p className={styles.description}>{text.info.text}</p>
          </Collapsible>
          <Collapsible trigger={text.reverseImageSearch.title} easing="ease-in" transitionTime={200}>
            <p className={styles.description}>{text.reverseImageSearch.text}</p>
          </Collapsible>
          {gpt && <Settings />}
          <Collapsible trigger={text.testimonials.title} easing="ease-in" transitionTime={200}>
            <p className={styles.description}>{text.testimonials.text}</p>
            <div className={styles.donateButton} onClick={() => openTab(links.review)}>Leave a Review!</div>
          </Collapsible>
        </header>
      </div>
    );
  }
}

export default App;
