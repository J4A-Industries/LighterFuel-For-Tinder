export enum Sites {
  TINDER,
  BUMBLE,
  HINGE,
  BADOO,
  OKCUPID,
  MAMBA,
  ZOOSK,
  MATCH,
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
  data: ImageType | ShowSettings;
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
