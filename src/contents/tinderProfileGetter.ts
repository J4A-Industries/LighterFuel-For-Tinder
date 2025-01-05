import type { PlasmoCSConfig } from 'plasmo';

import { FetchInterceptor } from '~src/contentsHelpers/FetchInterceptor';
import { ProfileGetter } from '~src/contentsHelpers/ProfileGetter';
import { MainWorldProfileInjector } from '~src/contentsHelpers/profileInjector';
import { debug } from '~src/misc/config';

export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_start',
  world: 'MAIN',
};

try {
  const fetchInterceptor = new FetchInterceptor();

  const getter = new ProfileGetter(fetchInterceptor);
  const profileInjector = new MainWorldProfileInjector(fetchInterceptor);
  profileInjector.init().catch((e) => console.error(e));

  if (debug)
    console.log(
      'Main world classes setup!',
      fetchInterceptor,
      getter,
      profileInjector,
    );
} catch (e) {
  console.error(`Error in profile getter: ${e}`);
}
