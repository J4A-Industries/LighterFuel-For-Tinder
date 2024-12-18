export enum Sites {
  TINDER,
}

export type ImageType = {
  url: string;
  lastModified: string;
  timeAddedToArr: Date;
  site?: Sites;
}

export type ProfileImage = {
  domNode: HTMLElement;
  data: ImageType;
}

export type ShowSettings = {
  overlayButton: boolean;
  searchButton: boolean;
};

export type TabMessage = {
  action: string;
  data: ImageType | ShowSettings | ImageType[];
};

export type AISettings = {
	temperature: number;
	bestOf: number;
	APIkey: string;
};

export type profileSliderContainer = {
  containerDOM: HTMLElement,
  observer: MutationObserver,
  overlayBox: HTMLElement
};
