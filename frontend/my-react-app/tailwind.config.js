/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0A192F',
        'brand-orange': '#FF8C00',
        'brand-light': '#64FFDA',
        'glass': 'rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}