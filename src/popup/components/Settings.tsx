/* global chrome */
import TextField from '@mui/material/TextField';
import Collapsible from 'react-collapsible';
import { styled } from '@mui/material/styles';
import React from 'react';
import Slider from '@mui/material/Slider';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import './Settings.css';
import { Link } from 'react-router-dom';

const TextFieldStyled = styled(TextField)({
  '& label': {
    color: 'white',
  },
  '& label.Mui-focused': {
    color: 'white',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'white',
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: 'white',
      color: 'white',
    },
    '& fieldset': {
      borderColor: 'white',
    },
  },
  input: {
    color: 'white',
  },
});

const HelpIconStyled = styled(HelpCenterIcon)({
  align: 'right',
});

const SliderStyled = styled(Slider)({
  width: '80%',
});

interface InfoTooltipType {
  className?: string;
  title: TooltipProps["title"];
  children: React.ReactElement;
  placement?: TooltipProps["placement"];
}

const InfoTooltip = styled(({ className, title, children, ...props }: InfoTooltipType) => (
  <Tooltip title={title} classes={{ popper: className }} {...props} >
    {children}
  </Tooltip>
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    width: '100%',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

class Settings extends React.Component {
  state: {
    temperature: number,
    bestOf: number,
    APIkey: string,
  };

  port: chrome.runtime.Port;

  constructor(props: any) { // todo: fix type
    super(props);
    this.state = {
      temperature: 95,
      bestOf: 3,
      APIkey: '',
    };
    // TODO: we shouldn't be connecting to runtime again, the connection should be passed from the parent
    if (!chrome.runtime) throw new Error('chrome.runtime is not defined, are you using the chrome browser?');
    this.port = chrome.runtime.connect();
    this.getSettings();
  }

  APIkeyChange = (event: React.SyntheticEvent) => {
    const target = event.target as HTMLTextAreaElement;
    const val = target.value;
    console.log(val);
    this.setState({ APIkey: val }, () => this.setNewSettings());
  };

  /**
   * A callback for when the temperature has changed
   *
   * @param {SyntheticBaseEvent} event
   * @param {Integer} newVal
   */
  tempChange = (_event: Event, newVal: number | number[]) => {
    if (Array.isArray(newVal)) {
      newVal = newVal[0];
    }
    this.setState({ temperature: newVal });
  };

  /**
   * The callback for the best of slider when it changes
   *
   * @param {SyntheticBaseEvent} event
   * @param {Integer} newVal
   */
  bestChange = (_event: Event, newVal: number | number[]) => {
    if (Array.isArray(newVal)) {
      newVal = newVal[0];
    }
    this.setState({ bestOf: newVal });
  };

  /**
   * gets the settings from the background.js
   */
  getSettings = () => {
    this.port.onMessage.addListener((msg) => {
      if ('ai_settings' in msg) {
        this.setState(msg.ai_settings);
      }
    });
    this.port.postMessage({ 'get ai settings': true });
  };

  /**
   * runs on "onChangeCommitted"
   */
  setNewSettings = () => {
    this.port.postMessage({
      'set ai settings': this.state,
    });
  };

  render() {
    const { APIkey, temperature, bestOf } = this.state;
    return (
      <Collapsible trigger="Suggestion Settings" easing="ease-in-out" transitionTime={200} open>
        <div className="setting">
          <div className="settingLabel">
            <div>API key:</div>
            <div>
              <InfoTooltip
                placement="top"
                title={(
                  <>
                    Enter your API key here!
                    <br />
                    <Link to="/api">Click here to get setup</Link>
                  </>
                )}
              >
                <HelpIconStyled />
              </InfoTooltip>
            </div>
          </div>
          <TextFieldStyled
            id="outlined-password-input"
            label="API Key"
            variant="outlined"
            type="password"
            onChange={this.APIkeyChange}
            value={APIkey}
          />
        </div>
        <div className="setting">
        <div className="settingLabel">
            <div>Temperature:</div>
            <div>
              <InfoTooltip
                placement="top"
                title={`The temperature sets how random the generated message will be, 
                play around with it to see what feels right for you!`}
              >
                <HelpIconStyled />
              </InfoTooltip>
            </div>
          </div>
          <SliderStyled
            id="temp-slider"
            onChangeCommitted={this.setNewSettings}
            onChange={this.tempChange}
            value={temperature}
            min={50}
            max={100}
            valueLabelDisplay="auto"
          />
        </div>
        <div className="setting">
          <div className="settingLabel">
            <div>Best Of</div>
            <div><HelpIconStyled /></div>
          </div>
          <SliderStyled
            id="best-of-slider"
            aria-label="Temperature"
            value={bestOf}
            onChange={this.bestChange}
            onChangeCommitted={this.setNewSettings}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={8}
          />
        </div>
      </Collapsible>
    );
  }
}

export default Settings;
