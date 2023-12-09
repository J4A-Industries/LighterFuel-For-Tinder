export type ProcessedFile = {
	url: string;
	height: number;
	width: number;
};

export interface Photos {
	id: string;
	url: string;
	processedFiles: ProcessedFile[];
	extention: string;
	rank: number;
	score?: number;
	win_count?: number;
	media_type: 'image' | 'video';
}

export type badge = {
	type: string;
}

export type job = {
	title: {
		name: string;
	}
}

export type school = {
	displayed: boolean;
	name: string;
}

export type album = {
	id: string;
	images: {
		height: number;
		width: number;
		url: string;
	}[];
	name: string;
	preview_url: string;
	uri: string;
};

export type spotify_artist = {
	id: string;
	images: {
		height: number;
		width: number;
		url: string;
	}[];
	name: string;
	top_track: {
		album: album;
		artists: {
			id: string;
			name: string;
		}[];
		id: string;
		name: string;
		preview_url: string;
		uri: string;
	};
}

export type spotify_theme_track = {
	id: string;
	name: string;
	album: album;
	artists: {
		id: string;
		name: string;
	}[];
	preview_url: string;
	uri: string;
}

export interface UserResults {
	badges: badge[],
	bio: string;
	city?: {
		name: string;
	};
	birth_date: string;
	common_connections: any[];
	common_interests: any[];
	common_likes: any[];
	common_friends: any[];
	connection_count: number;
	distance_mi: number;
	gender: number;
	is_traveling: boolean;
	jobs: job[];
	name: string;
	photos: Photos[];
	schools: school[];
	spotify_top_artists?: spotify_artist[];
	spotify_theme_track?: spotify_theme_track;
	teasers: {
		type: string;
		string: string;
	}[];
	user_interests?: {
		selected_interests: {
			id: string;
			name: string;
		}[];
	};
	relationship_intent?: {
		body_text: string;
		descriptor_choice_id: string;
		emoji: string;
		hidden_intent?: {
			body_text: string;
			emoji: string;
			image_url: string;
			title_text: string;
		};
		image_url: string;
		style: string;
		title_text: string;
	};
	sexual_orientations?: {
		id: string;
		name: string;
	}[];
	selected_descriptors?: {
		id: string;
		name: string;
		prompt: string;
		type: string;
		icon_url: string;
		choice_selections: {
			id: string;
			name: string;
		}[];
	}[];

	_id: string;
}

export type Message = {
	_id: string;
	match_id: string;
	sent_date: string;
	message: string;
	to: string;
	from: string;
	timestamp: number;
	matchId: string;
};

export interface Person {
	_id: string;
	bio?: string;
	birth_date: string;
	gender: number;
	name: string;
	photos: Photos[];
	userResults?: UserResults;
	type?: 'match' | 'rec' | 'profile';
}

export interface liked_content_child {
	user_id: string;
	type: string;
	is_swipe_note?: boolean;
	photo?: Photos;
}

export interface liked_content {
	by_opener?: liked_content_child,
	by_closer?: liked_content_child
}

export interface Match {
	seen: {
		match_seen: boolean;
		last_seen_msg_id: string;
	}
	_id: string;
	dead: boolean;
	last_activity_date: string;
	created_date: string;
	message_count: number;
	messages: Message[];
	person: Person;
	is_super_like: boolean;
	is_boost_match: boolean;
	is_super_boost_match: boolean;
	is_experiences_match: boolean;
	has_shown_initial_interest: boolean;
	readreceipt: {
		enabled: boolean;
	}
	has_harassing_feedback: boolean;
	harassing_message_id: string;
	liked_content: liked_content;
	is_archived: boolean;
}

export interface Country {
	name: string;
	cc: string;
	alpha3: string;
}

export interface PosInfo {
	country: Country;
	timezone: string;
}

export interface LanguagePreference {
	language: string;
	is_selected: boolean;
}

export interface GlobalMode {
	language_preferences: LanguagePreference[];
}

export interface AllInGender {
	id: string;
	name: string;
}

export interface ShowSameOrientationFirst {
	checked: boolean;
	should_show_option: boolean;
}

export interface User {
	_id: string;
	age_filter_max: number;
	age_filter_min: number;
	birth_date: string;
	create_date: string;
	crm_id: string;
	pos_info: PosInfo;
	discoverable: boolean;
	distance_filter: number;
	global_mode: GlobalMode;
	auto_expansion: any;
	gender: number;
	all_in_gender: AllInGender[];
	gender_filter: number;
	show_gender_on_profile: boolean;
	name: string;
	photos: Photos[];
	photos_processing: boolean;
	photo_optimizer_enabled: boolean;
	ping_time: string;
	schools: any[];
	badges: any[];
	phone_id: string;
	interested_in: number[];
	interested_in_genders: number[];
	pos: any;
	billing_info: any;
	autoplay_video: string;
	top_picks_discoverable: boolean;
	photo_tagging_enabled: boolean;
	show_orientation_on_profile: boolean;
	show_same_orientation_first: ShowSameOrientationFirst;
	sexual_orientations: AllInGender[];
	user_interests: any;
	recommended_sort_discoverable: boolean;
	selfie_verification: string;
	id_dob_verification: string;
	noonlight_protected: boolean;
	sync_swipe_enabled: boolean;
	sparks_quizzes: any[];
	selected_descriptors: any[];
	preference_filters: any;
	mm_enabled: boolean;
	user_prompts: any;
}

export interface Purchase {
	purchases: any[];
	subscription_expired: boolean;
	payment_state: number;
}

export interface ProfileResponseData {
	likes: any;
	offerings: any;
	paywalls: any[];
	plus_control: any;
	purchase: Purchase;
	user: User;
	misc_merchandising: any;
}

export interface UserStats {
	cc: string;
	premium: boolean;
	age: number;
	ageMax: number;
	ageMin: number;
	gender: string;
}
