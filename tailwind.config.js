/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-dark': '#0A192F', // Dark Blue Background
                'brand-orange': '#FF8C00', // Primary Action
                'brand-light': '#64FFDA', // Header/Text Light Blue
                'glass': 'rgba(255, 255, 255, 0.05)',
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}