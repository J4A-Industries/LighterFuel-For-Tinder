export type ImageType = {
  url: string;
  lastModified: string;
  timeAddedToArr: Date;
}

export type ProfileImage = {
  domNode: HTMLElement;
  data: ImageType;
}

export type ShowSettings = {
  overlayButton: boolean;
  searchButton: boolean;
  enlargeButton: boolean;
};

export type TabMessage = {
  action: string;
  data: ImageType | ShowSettings;
};

export type AISettings = {
	temperature: number;
	bestOf: number;
	APIkey: string;
};