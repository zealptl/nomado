import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5C7A5F',
        'primary-dark': '#4A6550',
        secondary: '#C67B5C',
        accent: '#D4C4A8',
        background: '#F5F0E1',
        text: '#2C1A0E',
        'text-muted': '#7C6A5A',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
