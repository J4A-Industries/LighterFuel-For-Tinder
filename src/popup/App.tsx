import './App.css';
import React from 'react';
import Flag from 'react-world-flags';
import Collapsible from 'react-collapsible';
import logo from '@/assets/LighterFuel512.png';
import Settings from '@/popup/components/Settings';
import ToggleSwitch from '@/popup/components/ToggleSwitch';
import {links, text} from '@/config';
import {openTab} from '@/popup/misc';
import { gpt } from '@/config';

class App extends React.Component {

  port: chrome.runtime.Port;

  state: {
    overlayButton: boolean,
    searchButton: boolean,
    enlargeButton: boolean,
  };

  constructor() {
    super({});
    this.state = { overlayButton: true, searchButton: true, enlargeButton: true };
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

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    switch (event.target.id) {
      case 'overlay':
        this.setState({ overlayButton: event.target.checked }, () => this.sendState());
        break;
      case 'search':
        this.setState({ searchButton: event.target.checked }, () => this.sendState());
        break;
      case 'enlarge':
        this.setState({ enlargeButton: event.target.checked }, () => this.sendState());
        break;
      default:
        console.error('no handle change ID given :(');
        break;
    }
    console.log(`Button ${event.target.id} Set To ${event.target.checked ? 'Checked' : 'Unchecked'}`);
  }

  sendState() {
    this.port.postMessage({ showSettings: this.state });
    console.log(this.state);
  }

  render() {
    const { overlayButton, searchButton, enlargeButton } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <Collapsible
            trigger={(
              <div>
                {text.donate.title}
                {' '}
                <Flag code="UA" height="16" />
              </div>
            )}
            easing="ease-in"
            transitionTime={200}
          >
            <p>{text.donate.location}</p>
            <div className="donateButtonContainer">
              <div className="donationButton" onClick={() => openTab(links.ukraineAppeal)}>
                {text.donate.buttonText}
                {' '}
                <Flag code="UA" height="16" />
              </div>
            </div>
          </Collapsible>
          <ToggleSwitch text={text.enableOverlay} id="overlay" state={overlayButton} onChange={this.handleChange} />
          <ToggleSwitch text={text.enableSearchButton} id="search" state={searchButton} onChange={this.handleChange} />
          <ToggleSwitch text={text.enableEnlargeButton} id="enlarge" state={enlargeButton} onChange={this.handleChange} />
          <Collapsible trigger={text.info.title} easing="ease-in" transitionTime={200}>
            <p>{text.info.text}</p>
          </Collapsible>
          <Collapsible trigger={text.reverseImageSearch.title} easing="ease-in" transitionTime={200}>
            <p>{text.reverseImageSearch.title}</p>
          </Collapsible>
          {gpt && <Settings />}
          <Collapsible trigger={text.testimonials.title} easing="ease-in" transitionTime={200}>
            <p>{text.testimonials.text}</p>
            <div className="donationButton" onClick={() => openTab(links.review)}>Leave a Review!</div>
          </Collapsible>
        </header>
      </div>
    );
  }
}

export default App;
