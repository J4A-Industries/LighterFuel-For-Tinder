import React from 'react';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';

const CustomSwitch = withStyles({
	switchBase: {
		color: '#ee7e57',
		'&$checked': {
			color: '#ff7559',
		},
		'&$checked + $track': {
			backgroundColor: '#fb458a',
		},
	},
	checked: {},
	track: {},
})(Switch);

type ToggleSwitchTypes = {
	text: string;
	state: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	id: string;
}

const ToggleSwitch = ({text, state, onChange, id}: ToggleSwitchTypes) => {
	return (
		<div>
			<p className="enableLabel">{text}</p>
			<CustomSwitch
				checked={state}
				onChange={onChange}
				name="buttonState"
				id={id}
				inputProps={{ 'aria-label': 'secondary checkbox' }}
			/>
		</div>
	);
};

export default ToggleSwitch;
