declare namespace NodeJS {
  interface ProcessEnv {
    PLASMO_PUBLIC_GTAG_ID?: string;
  }
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png';
declare module '*.jpg';

interface Window {
  __data: any; // Holds the data object that might be set dynamically
  __customData: any; // A custom object to hold data alongside __data
  __swipeReversalStartX?: number | null; // Tracks the starting X position for swipe reversal
  __swipeReversalLastX?: number | null; // Tracks the last X position for swipe reversal
  __swipeReversalEnabled?: boolean; // Indicates whether swipe reversal is currently enabled
}
