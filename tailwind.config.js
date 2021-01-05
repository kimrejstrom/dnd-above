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
    }),
    textColor: theme => ({
      ...theme('colors'),
      'dark-100': '#252020',
      'dark-200': '#393232',
      'dark-300': '#1b1616',
      'light-100': '#f9f3eb',
      'light-200': '#f3e7dc',
      'light-300': '#efeee9',
    }),
    borderColor: theme => ({
      ...theme('colors'),
      'dark-100': '#252020',
      'dark-200': '#393232',
      'dark-300': '#1b1616',
      'light-100': '#f8f8ba',
      'light-200': '#f3e7dc',
      'light-300': '#efeee9',
    }),
  },
  variants: {
    extend: {
      typography: ['dark'],
    },
    backgroundColor: ['odd', 'responsive', 'hover', 'focus', 'dark'],
    borderColor: ['responsive', 'hover', 'focus', 'dark'],
    textColor: ['responsive', 'hover', 'focus', 'dark'],
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
