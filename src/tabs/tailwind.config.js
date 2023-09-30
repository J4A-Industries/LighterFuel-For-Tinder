module.exports = {
  content: [
    './src/tabs/*.{vue,js,ts,jsx,tsx}',
  ],
  compilerOptions: {
    baseUrl: 'src/',
  },
  theme: {
    theme: {
      extend: {
        colors: {
          primary: '#d66b08',
          secondary: '#7ae27a',
          accent: '#fc4b8f',
          neutral: '#1a1b28',
          'base-100': '#1f272e',
          info: '#356282',
          success: '#0f853e',
          warning: '#f6d013',
          error: '#ed2662',
        },
      },
    },
  },
  mode: 'jit',
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
  include: [
    'src',
    'types',
  ],
};
