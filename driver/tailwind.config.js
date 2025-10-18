/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        snabb: '#00B14F',
        snabbDark: '#009640',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
