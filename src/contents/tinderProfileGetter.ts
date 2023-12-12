import type { PlasmoCSConfig } from 'plasmo';
import ProfileGetter from '~src/contentsHelpers/ProfileGetter';
import runScript from '~src/contentsHelpers/msClarity';
import { debug } from '~src/misc/config';

export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_end',
  world: 'MAIN',
};

runScript(
  'clarity',
  {
    projectId: 'jri296qhbt',
    upload: 'https://t.clarity.ms/collect',
    expire: 365,
    cookies: ['_uetmsclkid', '_uetvid'],
    track: true,
    lean: false,
    content: true,
    dob: 1441,
  },
);

try {
  const getter = new ProfileGetter();

  if (debug) console.log('Getter created!', getter);
} catch (e) {
  console.error(`Error in profile getter: ${e}`);
}
