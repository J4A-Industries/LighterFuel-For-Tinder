/* eslint-disable no-underscore-dangle */
/**
 * Injected via the src\background\handleAprilFools.ts
 */
export const injectOwnProfile = (overwriteObject: any) => {
  window.__customData = overwriteObject;

  Object.defineProperty(window, '__data', {
    get() {
      return window.__customData;
    },
    set(val) {
      window.__customData = {
        ...val,
        ...overwriteObject,
      };
      console.warn('Someone tried to set __data to ', val);
    },
  });
};
