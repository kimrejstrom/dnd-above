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
    backgroundColor: theme => ({
      ...theme('colors'),
      'primary-dark': '#252020',
      'secondary-dark': '#393232',
      'tertiary-dark': '#1b1616',
      'primary-light': '#f8f8ba',
      'secondary-light': '#efefe6',
      'tertiary-light': '#efeee9',
    }),
    textColor: theme => ({
      ...theme('colors'),
      'primary-dark': '#252020',
      'secondary-dark': '#393232',
      'tertiary-dark': '#1b1616',
      'primary-light': '#f8f8ba',
      'secondary-light': '#efefe6',
      'tertiary-light': '#efeee9',
    }),
    borderColor: theme => ({
      ...theme('colors'),
      'primary-dark': '#252020',
      'secondary-dark': '#393232',
      'tertiary-dark': '#1b1616',
      'primary-light': '#f8f8ba',
      'secondary-light': '#efefe6',
      'tertiary-light': '#efeee9',
    }),
  },
  variants: {
    backgroundColor: ['odd', 'responsive', 'hover', 'focus', 'dark'],
    borderColor: ['responsive', 'hover', 'focus', 'dark'],
    textColor: ['responsive', 'hover', 'focus', 'dark'],
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
