/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      animation: {
        'fade-down': 'fadeDown 0.5s ease-out both',
      },
      keyframes: {
        fadeDown: {
          '0%': {
            opacity: 0,
            transform: 'translateY(-20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};
