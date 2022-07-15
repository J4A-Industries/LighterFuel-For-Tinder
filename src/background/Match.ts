import MatchManager from "./MatchManager";

class Match {

	manager = MatchManager;
	userData = null;
	messages = [];
	
	/**
	 * @param {Object} data
	 */
	constructor(manager: MatchManager, matchData = null, userData = null) {
		this.manager = manager;
		this.userData = userData;
		this.messages = [];
		if (userData) {
			this.personID = userData._id;
		} else if (matchData) {
			this.personID = matchData.person._id;
			if (matchData.messages.length > 0) {
				matchData.messages.forEach(message => {
					this.addMessage(message);
				});
			}
		}
	}

	/**
	 * Pushes a message to the message list
	 *
	 * @param {Object} message
	 */
	addMessage(message) {
		const messageExists = this.messages.find(msg => message._id === msg._id);
		if (!messageExists) {
			this.messages.push(message);
		}
	}

	/**
	 * Sorts the messages by the timestamp (they're not gaurenteed to be in order)
	 */
	sortMessages() {
		this.messages = this.messages.sort((a, b) => {
			if (a.timestamp > b.timestamp) return 1;
			if (b.timestamp > a.timestamp) return -1;
			return 0;
		});
	}

	/**
	 * Returns the string for the AI prompt
	 *
	 * @returns {String}
	 */
	getPrompt() {

		if(!this.userData){
			throw new Error('No user data present');
		}
		
		const chat = this.getChat();
		const userData = this.manager.bg.selfProfile;

		let outString = `The following is a flirty conversation between ${userData.name} and ${this.userData.name} on tinder (${userData.pos_info.country.cc})\n`;

		if (userData.schools.length > 0) {
			outString += `${userData.name} is a student at ${userData.schools[0].name}\n`;
		}
		if (this.userData.schools.length > 0) {
			outString += `${this.userData.name} is a student at ${this.userData.schools[0].name}\n`;
		}

		if (userData.jobs.length > 0) {
			outString += `${userData.name} works as a ${userData.jobs[0].title.name}\n`;
		}
		if (this.userData.jobs.length > 0) {
			if (this.userData.user.jobs[0].title) {
				outString += `${this.userData.name} works as a ${this.userData.jobs[0].title.name}\n`;
			}
		}

		// I don't want to be careful using the "experiment_info" object incase tinder change it, so we're check it all
		try {
			if (this.userData.experiment_info) {
				if (this.userData.experiment_info.user_interests) {
					const interests = this.userData.experiment_info.user_interests.selected_interests;
					if (interests.length > 0) {
						outString += `${this.userData.name} is interested in: `;
						for (let i = 0; interests.length > i; i++) {
							const interest = interests[i];
							outString += interest.name + `${i === interests.length - 1 ? '' : ', '}`;
						}
						outString += '.\n';
					}
				}
			}
		} catch (err) {
			console.log(`Error with this.userData.experimentInfo usage: ${err}`);
		}
		const matchSpotifyArtists = this.userData.spotify_top_artists;
		if (matchSpotifyArtists) {
			if (matchSpotifyArtists.length > 0) {
				outString += `${this.userData.name} listens to `;
				const artistLength = matchSpotifyArtists.length > 5 ? 5 : matchSpotifyArtists.length;
				for (let i = 0; i < artistLength; i++) {
					const artist = matchSpotifyArtists[i];
					outString += `${artist.name}${i === artistLength - 1 ? '' : ', '}`;
				}
				outString += '.\n';
			}
		}

		if (outString.length + chat.length < 200) {
			outString += `${this.userData.name}'s bio says: ${this.userData.bio}\n `;
		}

		if(this.messages.length > 0) outString += 'Their chat so far is:\n';
		outString += chat;

		return outString;
	}

	/**
	 * This is used to get the suggested maximum token length from the AI.
	 * 
	 * @returns {Integer}
	 * TODO: finish this
	 */
	getTokenLength() {

		
	}

	/**
	 * For getting the chat as a string
	 *
	 * @returns {String}
	 */
	getChat(limit = 5) {
		let chat = '\n';
		this.sortMessages();
		this.messages.slice(this.messages.length - limit, this.messages.length).forEach(message => {
			const sentByMatch = this.personID === message.from;
			const sender = sentByMatch ? this.userData.name : this.manager.bg.selfProfile.name;
			chat += `${sender}: ${message.message}\n`;
		});

		return chat;
	}
	/**
	 * Used for setting the user data for when the match has been created but no user data is present
	 * @param {Object} data
	 */
	addUserData(data) {
		this.userData = data;
	}
}


export default Match;