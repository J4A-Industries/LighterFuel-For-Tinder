import { Storage } from '@plasmohq/storage';

import { featureFlagUrl } from '~src/misc/config';

type ShowProfilesFeatureFlag = {
  // TODO: include profile info here
  profiles: {
    webProfile: object;
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

export class FeatureFlagManager {
  data: FeatureFlagsWithLastFetched | undefined = undefined;

  private storage: Storage = new Storage({
    area: 'local',
  });

  constructor(storage?: Storage) {
    if (storage) this.storage = storage;
  }

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
