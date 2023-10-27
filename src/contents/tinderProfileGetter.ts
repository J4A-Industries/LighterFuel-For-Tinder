import type { PlasmoCSConfig } from 'plasmo';
import ProfileGetter from '~src/contentsHelpers/ProfileGetter';

export const config: PlasmoCSConfig = {
  matches: ['*://tinder.com/*'],
  run_at: 'document_start',
  world: 'MAIN',
};

try {
  const getter = new ProfileGetter();

  console.log('Getter created!');
} catch (e) {
  console.error(`Error in profile getter: ${e}`);
}
