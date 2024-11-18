import { Storage } from '@plasmohq/storage';

import { featureFlagUrl } from '~src/misc/config';

type ShowProfilesFeatureFlag = {
  profiles: {
    // the "webProfile" to add to the `__data` window object
    webProfile: object;
    rejectionOptions?:
      | {
          // The message in the alert to tell the user about what is going on
          suggestionOnRejection: string;
          // whether or not to force a like from the user of the given profile
          forceLike: true;
        }
      | {
          // The message in the alert to tell the user about what is going on
          suggestionOnRejection: string;
          // The number of times to block the rejection and get the user
          rejectionBlockerAttempts: number;
        };
    analytics?: boolean;
  }[];
};

type Flags = {
  showProfiles: ShowProfilesFeatureFlag;
};

type FlagNames = keyof Flags;

type FeatureFlags = {
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
    if (Date.now() - this.data.lastFetched > this.data.fetchInterval) {
      await this.fetchFlags();
    }
  }

  async getFlagsFromStorage() {
    this.data = await this.storage.getItem<FeatureFlagsWithLastFetched>(
      'featureFlags',
    );
  }

  async fetchFlags() {
    const result = await fetch(featureFlagUrl);

    if (result.status === 200) {
      const data = (await result.json()) as FeatureFlags;

      this.storage.setItem('featureFlags', {
        ...data,
        lastFetched: new Date().getTime(),
      } satisfies FeatureFlagsWithLastFetched);
    }
  }
}
