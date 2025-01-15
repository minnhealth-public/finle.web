// tailwind.config.js
//import type { Config } from "tailwindcss";
// const tailWindConfig = require('./src/tailwind.config.js');
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        reveal: 'reveal 400ms linear',
        /* forwards keeps the display as none */
        hide: 'hide 400ms forwards',
      },
      fontFamily: {
        arial: ['Quicksand', 'Arial', 'sans-serif'],
        sans: ["Open Sans", "sans-serif"]
      },
      text: {
        // xl: ".375em"
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        hide: {
          '0%': { opacity: 'inherit' },
          '50%': {
            opacity: '0',
          },
          '100%': {
            opacity: '0',
            overflow: 'none',
            height: '0px',
            display: 'none',
          },
        }
      },
      transitionProperty: {
        'margin': 'margin',
        'max-height': 'max-height',
        'height': 'height'
      },
      colors: {
        black: '#333333',
        sky: {
          970: '#425563',
        },
        gray: {
          650: '#425563',
          350: '#B1B1B1'
        },

        white: {
          1: '#ffffff',
          50: '#F5F1E6',
        },
        tan: {
          100: '#FBF9F1'
        },

        // main colors to be changed for different themes
        primary: '#1D998C',
        primary_alt: '#198479',
        header: '#007398',
      }
    },
  },
  plugins: [],
};
