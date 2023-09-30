/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./src/contents/*.tsx', './src/contentsHelpers/*.tsx'],
  plugins: [],
  compilerOptions: {
    baseUrl: 'src/',
  },
};
