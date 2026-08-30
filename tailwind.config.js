/* eslint-disable global-require */
const plugin = require('tailwindcss/plugin');

/**
 * The extension only ever renders dark, so the shadcn tokens are defined once
 * on :root rather than behind a .dark class.
 */
const tokens = plugin(({ addBase }) => {
  addBase({
    ':root': {
      '--background': '198 24% 8%',
      '--foreground': '180 13% 92%',
      '--card': '196 19% 11%',
      '--card-foreground': '180 13% 92%',
      '--popover': '196 19% 11%',
      '--popover-foreground': '180 13% 92%',
      '--primary': '178 81% 31%',
      '--primary-foreground': '180 13% 96%',
      '--secondary': '197 21% 13%',
      '--secondary-foreground': '180 13% 92%',
      '--muted': '197 21% 13%',
      '--muted-foreground': '195 8% 60%',
      '--accent': '197 21% 16%',
      '--accent-foreground': '180 13% 92%',
      '--destructive': '358 65% 52%',
      '--destructive-foreground': '180 13% 96%',
      '--border': '196 17% 17%',
      '--input': '196 17% 22%',
      '--ring': '176 60% 46%',
      '--radius': '0.5rem',
    },
    '*': { borderColor: 'hsl(var(--border))' },
    body: {
      backgroundColor: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
    },
  });
});

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [tokens, require('tailwindcss-animate')],
};
