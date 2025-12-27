/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Logic will maximize manual control (or 'media' if preferred, but user requested specific dark mode app)
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Professional look
      },
      colors: {
        // Custom palette enhancements if needed
      }
    },
  },
  plugins: [],
}
