/* eslint-disable no-use-before-define */
export interface BumbleProfile {
	$gpb: string;
	message_type: number;
	version: number;
	message_id: number;
	body: Body[];
	responses_count: number;
}

export interface Body {
	$gpb: BodyGpb;
	client_upload_photo?: ClientUploadPhoto;
	message_type: number;
	application_feature?: ApplicationFeature;
	client_user_list?: ClientUserList;
	client_encounters?: ClientEncounters;
	user?: GetUser;
}

export enum BodyGpb {
	BadooBmaMessageBody = 'badoo.bma.MessageBody',
}

export interface ApplicationFeature {
	$gpb: ApplicationFeatureGpb;
	feature: number;
	enabled: boolean;
	required_action?: number;
	display_message?: string;
	display_title?: string;
	display_action?: string;
	goal_progress?: GoalProgress;
	product_type?: number;
	payment_amount?: number;
}

export enum ApplicationFeatureGpb {
	BadooBmaApplicationFeature = 'badoo.bma.ApplicationFeature',
}

export interface GoalProgress {
	$gpb: string;
	goal: number;
	progress: number;
}

export interface Album {
	$gpb: string;
	uid: string;
	name: string;
	owner_id: string;
	access_type: number;
	accessable: boolean;
	adult: boolean;
	requires_moderation: boolean;
	count_of_photos: number;
	instruction: string;
	is_upload_forbidden: boolean;
	photos?: PhotoElement[];
	album_type: number;
	game_mode?: number;
	caption?: string;
	album_blocker?: AlbumBlocker;
	external_provider?: number;
}

export interface ClientUploadPhotoPhoto {
	$gpb: string;
	id: string;
	preview_url: string;
	large_url: string;
	large_photo_size: LargePhotoSize;
}

export interface ClientUploadPhoto {
	$gpb: string;
	short_id: number;
	album: Album;
	guid: string;
	photo: ClientUploadPhotoPhoto;
}

export interface PhotoElement {
	$gpb: string;
	id: string;
	preview_url: string;
	large_url: string;
	large_photo_size: LargePhotoSize;
	face_top_left?: Face;
	face_bottom_right?: Face;
	can_set_as_profile_photo: boolean;
	is_pending_moderation: boolean;
	preview_url_expiration_ts: number;
	large_url_expiration_ts: number;
}

export interface Face {
	$gpb: string;
	x: number;
	y: number;
}

export interface LargePhotoSize {
	$gpb: string;
	width: number;
	height: number;
}

export interface GetUserList {
	$gpb: string;
	message_type: number;
	version: number;
	message_id: number;
	object_type: number;
	body: Body[];
	responses_count: number;
	is_background: boolean;
	vhost: string;
}

export interface ClientUserList {
	$gpb: string;
	section: Section[];
	total_sections: number;
	total_count: number;
	promo_banners: PromoBanner[];
	delay_sec: number;
}

export interface PromoBanner {
	$gpb: string;
	mssg: string;
	action: string;
	header: string;
	other_text: string;
	pictures: Picture[];
	promo_block_type: number;
	promo_block_position: number;
	credits_cost: string;
	unique_id: string;
	buttons: Button[];
	context: number;
}

export interface Button {
	$gpb: string;
	text: string;
	action: number;
	type: number;
}

export interface Picture {
	$gpb: string;
	display_images: string;
}

export interface Section {
	$gpb: string;
	section_id: string;
	name: string;
	total_count: number;
	last_block: boolean;
	allowed_actions: number[];
	section_type?: number;
	users?: User[];
}

export interface User {
	$gpb: string;
	user_id: string;
	projection: number[];
	access_level: number;
	name: string;
	age: number;
	gender: number;
	is_deleted: boolean;
	is_extended_match: boolean;
	online_status: number;
	profile_photo: ProfilePhoto;
	is_match: boolean;
	match_mode: number;
	is_crush: boolean;
	unread_messages_count: number;
	display_message: string;
	is_inapp_promo_partner: boolean;
	is_locked: boolean;
	type: number;
	connection_status_indicator: number;
}

export interface ProfilePhoto {
	$gpb: string;
	id: string;
	preview_url: string;
	large_url: string;
	large_photo_size: LargePhotoSize;
	preview_url_expiration_ts: number;
	large_url_expiration_ts: number;
}

export interface GetEncounters {
	$gpb: string;
	message_type: number;
	version: number;
	message_id: number;
	object_type: number;
	body: Body[];
	responses_count: number;
	is_background: boolean;
	vhost: string;
}

export interface ClientEncounters {
	$gpb: string;
	results: Result[];
	search_context: number;
	offset: number;
	quota: Quota;
}

export interface Quota {
	$gpb: string;
	yes_votes_quota: number;
}

export interface Result {
	$gpb: ResultGpb;
	has_user_voted: boolean;
	user: EncounterUser;
}

export enum ResultGpb {
	BadooBmaSearchResult = 'badoo.bma.SearchResult',
}

export interface EncounterUser {
	$gpb: string;
	user_id: string;
	projection: number[];
	client_source: number;
	access_level: number;
	name: string;
	age: number;
	gender: number;
	verification_status: number;
	albums: Album[];
	profile_fields: ProfileField[];
	profile_summary: ProfileSummary;
	distance_long: string;
	distance_short: string;
	their_vote?: number;
	match_message?: string;
	allow_chat_from_match_screen?: boolean;
	allow_crush?: boolean;
	game_mode: number;
	type?: number;
	hometown: Hometown;
	residence: Hometown;
	jobs?: Education[];
	educations?: Education[];
	music_services?: MusicService[];
}

export enum AlbumGpb {
	BadooBmaAlbum = 'badoo.bma.Album',
}

export interface AlbumBlocker {
	$gpb: AlbumBlockerGpb;
	promo_block_type: number;
	promo_block_position: number;
	buttons: Button[];
	context: number;
}

export enum AlbumBlockerGpb {
	BadooBmaPromoBlock = 'badoo.bma.PromoBlock',
}

export enum ButtonGpb {
	BadooBmaCallToAction = 'badoo.bma.CallToAction',
}

export enum Text {
	ConnectYourInstagram = 'Connect your Instagram',
}

export interface Photo {
	$gpb: PhotoGpb;
	id: string;
	preview_url: string;
	large_url: string;
	large_photo_size: LargePhotoSize;
	face_top_left?: Face;
	face_bottom_right?: Face;
	preview_url_expiration_ts: number;
	large_url_expiration_ts: number;
	is_pending_moderation?: boolean;
	created_ts?: number;
}

export enum PhotoGpb {
	BadooBmaPhoto = 'badoo.bma.Photo',
}

export enum FaceBottomRightGpb {
	BadooBmaPoint = 'badoo.bma.Point',
}

export enum LargePhotoSizeGpb {
	BadooBmaPhotoSize = 'badoo.bma.PhotoSize',
}

export interface Education {
	$gpb: string;
	id: string;
	type: number;
	name: string;
	organization_name: string;
	selected: boolean;
	source: number;
	moderation_failed: boolean;
	period_description?: string;
	date_to?: DateTo;
}

export interface DateTo {
	$gpb: string;
	year: number;
	month: number;
	day: number;
}

export interface Hometown {
	$gpb: HometownGpb;
	type?: number;
	country?: Country;
	region?: City;
	city?: City;
	context_info?: string;
}

export enum HometownGpb {
	BadooBmaLocation = 'badoo.bma.Location',
}

export interface City {
	$gpb: CityGpb;
	id: number;
	name: string;
	context_info?: string;
	abbreviation?: Abbreviation;
}

export enum CityGpb {
	BadooBmaCity = 'badoo.bma.City',
	BadooBmaRegion = 'badoo.bma.Region',
}

export enum Abbreviation {
	DL = 'DL',
	Empty = '',
}

export interface Country {
	$gpb: string;
	id: number;
	name: string;
	phone_prefix: string;
	iso_code: string;
	flag_symbol: string;
	phone_length: PhoneLength;
}

export interface PhoneLength {
	$gpb: string;
	min_value: number;
	max_value: number;
}

export interface MusicService {
	$gpb: string;
	status: number;
	external_provider: ExternalProvider;
	top_artists: TopArtist[];
	status_comment: string;
}

export interface ExternalProvider {
	$gpb: string;
	id: string;
	display_name: string;
	logo_url: string;
	type: number;
}

export interface TopArtist {
	$gpb: string;
	id: string;
	name: string;
	preview_image_url: string;
	large_image_url: string;
	streaming_url: string;
}

export interface ProfileField {
	$gpb: ProfileFieldGpb;
	id: string;
	type: number;
	name: string;
	display_value: string;
	required_action?: number;
	icon_url?: string;
	hp_element?: number;
	other_display_value?: string;
	is_featured?: boolean;
	is_weekly_question?: boolean;
}

export enum ProfileFieldGpb {
	BadooBmaProfileField = 'badoo.bma.ProfileField',
}

export interface ProfileSummary {
	$gpb: ProfileSummaryGpb;
	primary_text?: string;
	secondary_text?: string;
}

export enum ProfileSummaryGpb {
	BadooBmaProfileSummary = 'badoo.bma.ProfileSummary',
}

export interface GetUserQuery {
	$gpb: string;
	message_type: number;
	version: number;
	message_id: number;
	object_type: number;
	body: Body[];
	responses_count: number;
	is_background: boolean;
	vhost: string;
}

export interface GetUser {
	$gpb: string;
	user_id: string;
	projection: number[];
	client_source: number;
	access_level: number;
	name: string;
	age: number;
	gender: number;
	verification_status: number;
	photo_count?: number;
	profile_photo?: ProfilePhoto;
	albums: Album[];
	music_services: MusicService[];
	profile_fields: ProfileField[];
	profile_summary: ProfileSummary;
	distance_long: string;
	distance_short: string;
	is_inapp_promo_partner?: boolean;
	game_mode: number;
	hometown: Hometown;
	residence: Hometown;
}

export type MergedUser = EncounterUser & GetUser;
