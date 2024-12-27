/* eslint-disable no-underscore-dangle */
import { Storage } from '@plasmohq/storage';

import type { ShowProfilesFeatureFlag } from '~src/background/classes/FeatureFlagManager';
import { AnalyticsEvent } from '~src/misc/GA';

export type ProfileFeatureFlag = ShowProfilesFeatureFlag['profiles'][number];

// TODO: we should have the window request to this class instead
// of the feature flags so we can handle the logic for who to show
// on this class instead of on the client.
export class ProfileShower {
  private storage: Storage = new Storage({
    area: 'local',
  });

  // The "flagId"s of the profiles that have been shown
  // not using Tinder's internal ID incase the user gets banned
  private shownProfileFlagIds: string[] | null = null;

  constructor(private profiles: ProfileFeatureFlag[], storage?: Storage) {
    if (storage) this.storage = storage;
  }

  async init() {
    await this.getShownProfiles();
  }

  getProfile(): ProfileFeatureFlag | undefined {
    if (this.shownProfileFlagIds === null) {
      throw new Error('Shown profile flag IDs not loaded');
    }
    if (this.profiles.length === 0) {
      return undefined;
    }

    const unshownProfile = this.profiles.find(
      (profile) => !this.shownProfileFlagIds?.includes(profile.flagId),
    );

    return unshownProfile;
  }

  async handleSwipe(profileId: String, direction: 'left' | 'right') {
    const flag = this.profiles.find(
      (profile) => profile.webProfile.user._id === profileId,
    );

    if (!flag) {
      throw new Error('Profile not found');
    }

    await AnalyticsEvent([
      {
        name: 'swipe',
        params: {
          direction,
          profileId,
          flagId: flag.flagId,
        },
      },
    ]);
    await this.markAsShown(flag.flagId);
  }

  async handleAttemptedRejection(profileId: string) {
    // TODO: analytics call
    // TODO: add to rejection count locally
    const flag = this.profiles.find(
      (profile) => profile.webProfile.user._id === profileId,
    );

    await AnalyticsEvent([
      {
        name: 'attemptedRejection',
        params: {
          profileId,
          flagId: flag?.flagId,
        },
      },
    ]);
  }

  async getShownProfiles() {
    const shownProfiles = await this.storage.get<string[]>(
      'shownProfileFlagIds',
    );
    if (shownProfiles) {
      this.shownProfileFlagIds = shownProfiles;
    }
  }

  async markAsShown(profileFlagId: string) {
    if (!this.shownProfileFlagIds) {
      this.shownProfileFlagIds = [];
    }

    this.shownProfileFlagIds.push(profileFlagId);
    await this.storage.set('shownProfileFlagIds', this.shownProfileFlagIds);
  }
}
