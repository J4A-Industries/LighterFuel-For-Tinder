export const debug = true;
export const gpt = false;

const languageTexts = {
	'en-GB': {
		donate: {
			title: "Donate",
			location: "Donations go to the Ukraine Humanitarian Appeal, Slava Ukraini!",
			buttonText: "Donate Here",
		},
		enableOverlay: "Enable overlay",
		enableSearchButton: "Enable search button",
		enableEnlargeButton: "Enable enlarge button",
		info: {
			title: "Info",
			text: "Lighterfuel allows you to see when profile images were uploaded to get an idea of when they made their account, reverse image search your matches photos and get the maximum resolution photos!",
		},
		reverseImageSearch: {
			title: "Reverse image search",
			text: "Enable the search button and click on it (only for matches) and see if that image is publicly available online (if it is, they&#39;re probably a catfish)",
		},
		testimonials: {
			title: "Testimonials",
			text: "Testimonials are welcomed, please leave it in a review if LighterFuel helped you out 😉"
		}
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findLanguage = (): any => {
	const lang = navigator.language;
	if (lang.startsWith("en")) {
		return text["en-GB"];
	}
	return languageTexts["en-GB"];
}

export const text = languageTexts["en-GB"]; //findLanguage();

export const links = {
	donate3: "https://buy.stripe.com/00gfZVfUnbMZ8so5kl",
	donate5: "https://buy.stripe.com/4gwcNJ37B8AN6kgcMM",
	review: "https://chrome.google.com/webstore/detail/cock-blocker-for-omegle/bmcnbhnpmbkcpkhnmknmnkgdeodfljnc/reviews",
	ukraineAppeal: "https://donation.dec.org.uk/ukraine-humanitarian-appeal"
};