import { Storage } from '@plasmohq/storage';

import { debug, featureFlagUrl } from '~src/misc/config';
import type { Person } from '~src/misc/tinderTypes';

export type ShowProfilesFeatureFlag = {
  profiles: {
    // the "webProfile" to add to the `__data` window object
    webProfile: {
      user: Person;
    };
    rejectionOptions?:
      | {
          // FIXME: not implemented
          // The message in the alert to tell the user about what is going on
          suggestionOnRejection: string;
          // whether or not to force a like from the user of the given profile
          forceLike: true;
        }
      | {
          // FIXME: not implemented
          // The message in the alert to tell the user about what is going on
          suggestionOnRejection: string;
          // The number of times to block the rejection and get the user
          rejectionBlockerAttempts: number;
        };
    analytics?: boolean; // FIXME: not implemented
    onlyFunMode?: boolean; // FIXME: not implemented
    changeDirections?: boolean;
    flagId: string;
  }[];
};

export type Flags = {
  showProfiles: ShowProfilesFeatureFlag;
};

type FlagNames = keyof Flags;

export type FeatureFlags = {
  flags: Flags;
  fetchInterval: number;
};

type FeatureFlagsWithLastFetched = FeatureFlags & {
  lastFetched: number;
};

/**
 * The feature flag manager handles all the FeatureFlag state management
 * and handling for LighterFuel
 */
export class FeatureFlagManager {
  data: FeatureFlagsWithLastFetched | undefined = undefined;

  private storage: Storage = new Storage({
    area: 'local',
  });

  constructor(storage?: Storage) {
    if (storage) this.storage = storage;
  }

  /**
   * Fetches the feature flag data and sets to data
   */
  async init() {
    await this.getFlagsFromStorage();
    await this.getLatestFeatureFlags();
    console.log('Feature flags:', this.data);
  }

  async getLatestFeatureFlags() {
    if (this.data === undefined || debug === true) {
      await this.fetchFlags();
    } else if (Date.now() - this.data.lastFetched > this.data.fetchInterval) {
      await this.fetchFlags();
    }

    return this.data;
  }

  async getFlagsFromStorage() {
    this.data = await this.storage.getItem<
      FeatureFlagsWithLastFetched | undefined
    >('featureFlags');
  }

  async fetchFlags() {
    const result = await fetch(featureFlagUrl);

    if (result.status === 200) {
      const data = (await result.json()) as FeatureFlags;
      this.data = {
        ...data,
        lastFetched: new Date().getTime(),
      };
      this.storage.setItem('featureFlags', this.data);
    }
  }
}
