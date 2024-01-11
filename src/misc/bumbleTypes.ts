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
	photos: PhotoElement[];
	album_type: number;
	game_mode: number;
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
