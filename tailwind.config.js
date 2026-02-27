/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0d1f3c',
        'brand-navy-dark': '#060e1a',
        'brand-gold': '#c9a227',
        'brand-gold-hover': '#a8841e',
        'brand-light': '#e8d5a3',
        'brand-bg': '#f5f5f0',
      },
    },
  },
  plugins: [],
};
