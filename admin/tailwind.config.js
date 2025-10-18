/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        snabb: {
          DEFAULT: "#00B14F",
          dark: "#009640",
          light: "#00D45F"
        },
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))"
      },
      fontFamily: {
        sans: ['Vazir', 'Tahoma', 'sans-serif']
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
