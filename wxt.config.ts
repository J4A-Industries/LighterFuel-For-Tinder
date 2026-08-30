import { fileURLToPath } from 'node:url';

import { defineConfig } from 'wxt';

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  srcDir: 'src',
  publicDir: resolve('src/public'),
  modules: ['@wxt-dev/module-react'],
  // * keeping the aliases the codebase already used, so imports didn't all have to move
  alias: {
    '@': resolve('src'),
    '~src': resolve('src'),
    '~assets': resolve('assets'),
  },
  // * a stable zip name so CI doesn't have to work out the version
  zip: {
    artifactTemplate: '{{name}}-{{browser}}.zip',
  },
  manifest: {
    name: 'LighterFuel for tinder',
    description:
      'LighterFuel helps you see when accounts were created, see enlarged photos and reverse image search photos!',
    host_permissions: ['*://*.tinder.com/*', '*://*.gotinder.com/*'],
    permissions: ['storage', 'scripting'],
    externally_connectable: {
      matches: ['*://tinder.com/*'],
    },
    web_accessible_resources: [
      {
        resources: ['resources/clarity.js'],
        matches: ['<all_urls>'],
      },
    ],
  },
});
