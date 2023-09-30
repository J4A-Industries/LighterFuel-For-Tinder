declare namespace NodeJS {
  interface ProcessEnv {
    PLASMO_PUBLIC_GTAG_ID?: string
  }
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png';
declare module '*.jpg';
