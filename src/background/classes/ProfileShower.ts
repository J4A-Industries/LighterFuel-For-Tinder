import { Storage } from '@plasmohq/storage';

import type { ShowProfilesFeatureFlag } from '~src/background/classes/FeatureFlagManager';

export type ProfileFeatureFlag = ShowProfilesFeatureFlag['profiles'][number];

// TODO: we should have the window request to this class instead
// of the feature flags so we can handle the logic for who to show
// on this class instead of on the client.
export class ProfileShower {
  private storage: Storage = new Storage({
    area: 'local',
  });

  constructor(private profiles: ProfileFeatureFlag[], storage?: Storage) {
    if (storage) this.storage = storage;
  }

  getProfile(): ProfileFeatureFlag | undefined {
    if (this.profiles.length === 0) {
      return undefined;
    }

    return this.profiles.slice(0)[0];
  }

  handleSwipe(profileId: String, direction: 'left' | 'right') {
    // TODO: analytics call
    // TODO: marked as swiped - to not show the profile again
  }

  handleAttemptedRejection() {
    // TODO: analytics call
    // TODO: add to rejection count locally
  }
}
