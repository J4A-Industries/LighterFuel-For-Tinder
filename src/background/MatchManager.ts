import Background from './background';
import Match from './Match';

class MatchManager {

	bg: Background;
	matches: Array<Match>;

	constructor(background: Background) {
		this.bg = background;
		this.matches = [];
	}

	/**
	 *
	 * @param {Object} match
	 * @param {String} dataType whether or not it's user or match data
	 */
	newMatch(match, dataType) {
		let newMatch;
		if (dataType === 'user') {
			newMatch = new Match(this, null, match);
		} else if (dataType === 'match') {
			newMatch = new Match(this, match);
		}
		const foundMatch = this.getMatchByPersonID(newMatch.personID);
		if (foundMatch) {
			if (dataType === 'user') {
				if (!foundMatch.userData) {
					foundMatch.addUserData(match);
				}
			} else if (match.messages > 0) {
				console.log('New messages from a match!');
				this.newMessages(match.messages);
			}
		}

		if (!foundMatch) this.matches.push(newMatch);
	}

	/**
	 * Whenever new messages are caught
	 *
	 * @param {Array<message>} messages
	 */
	newMessages(messages) {
		messages.forEach(message => {
			this.newMessage(message);
		});
	}
	/**
	 *  Adds the new message
	 * @param {message} message
	 */
	newMessage(message) {
		// if the "to" id is the same as the self id, the match's ID will be "from" and vice versa
		const id = message.to === this.bg.selfProfile._id ? message.from : message.to;
		const match = this.getMatchByPersonID(id);
		if (!match) {
			if (this.bg.debug) console.log('No match found messages!');
			return;
		}
		match.addMessage(message);
	}
	/**
	 * Gets the match instance by the person ID
	 *
	 * @param {String} id
	 * @returns {Match}
	 */
	getMatchByPersonID(id) {
		return this.matches.find(match => match.personID === id);
	}
}

export default MatchManager;