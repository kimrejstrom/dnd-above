const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  purge: {
    content: [
      './src/**/*.html',
      './src/**/*.tsx',
      // etc.
    ],
    options: {
      safelist: ['dark'],
    },
  },
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'table table': {
              margin: 0,
            },
          },
        },
        dark: {
          css: {
            color: '#f9f3eb',
          },
        },
      },
    },

    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.warmGray,
      red: colors.rose,
      yellow: colors.amber,
      green: colors.lime,
      blue: colors.blue,
    },
    backgroundColor: theme => ({
      ...theme('colors'),
      'dark-100': '#252020',
      'dark-200': '#393232',
      'dark-300': '#1b1616',
      'light-100': '#f9f3eb',
      'light-200': '#f3e7dc',
      'light-300': '#efeee9',
      'light-400': '#d4ccc4',
      'highlight-100': '#c4b7b5',
      'highlight-200': '#b4a5a6',
      'highdark-100': '#4d3b3b',
      'highdark-200': '#3d2f2f',
    }),
    textColor: theme => ({
      ...theme('colors'),
      'dark-100': '#252020',
      'dark-200': '#393232',
      'dark-300': '#1b1616',
      'light-100': '#f9f3eb',
      'light-200': '#f3e7dc',
      'light-300': '#efeee9',
      'highlight-100': '#755469',
    }),
    borderColor: theme => ({
      ...theme('colors'),
      'dark-100': '#252020',
      'dark-200': '#393232',
      'dark-300': '#1b1616',
      'light-100': '#ebe2bc',
      'light-200': '#f3e7dc',
      'light-300': '#efeee9',
      'light-400': '#d4ccc4',
    }),
  },
  variants: {
    extend: {
      typography: ['dark'],
      ringColor: ['hover'],
      ringWidth: ['hover'],
      ringOpacity: ['hover'],
    },
    backgroundColor: ['odd', 'responsive', 'hover', 'focus', 'dark'],
    borderColor: ['responsive', 'hover', 'focus', 'dark'],
    textColor: ['responsive', 'hover', 'focus', 'dark'],
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
