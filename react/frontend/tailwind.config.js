/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        grey: {
          650: '#425563',
        },
        blue: {
          450: '#007398',
        },
        white: {
          1: '#ffffff',
          50: '#F5F1E6',
        },
        teal: {
          400: '#21ad9f',
          500: '#1D998C'
        }
      }
    },
  },
  plugins: [],
}
