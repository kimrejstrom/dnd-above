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
      'primary-dark': '#252020',
      'secondary-dark': '#393232',
      'tertiary-dark': '#1b1616',
      'primary-light': '#f9f3eb',
      'secondary-light': '#f3e7dc',
      'tertiary-light': '#efeee9',
    }),
    textColor: theme => ({
      ...theme('colors'),
      'primary-dark': '#252020',
      'secondary-dark': '#393232',
      'tertiary-dark': '#1b1616',
      'primary-light': '#f9f3eb',
      'secondary-light': '#f3e7dc',
      'tertiary-light': '#efeee9',
    }),
    borderColor: theme => ({
      ...theme('colors'),
      'primary-dark': '#252020',
      'secondary-dark': '#393232',
      'tertiary-dark': '#1b1616',
      'primary-light': '#f8f8ba',
      'secondary-light': '#f3e7dc',
      'tertiary-light': '#efeee9',
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
