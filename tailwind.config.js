module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'dnd-body': ['Pangolin', 'sans-serif'],
      },
    },
    backgroundColor: theme => ({
      ...theme('colors'),
      'primary-dark': '#252020',
      'secondary-dark': '#393232',
      'tertiary-dark': '#1b1616',
      'primary-light': '#f8f8ba',
    }),
    textColor: theme => ({
      ...theme('colors'),
      'primary-dark': '#252020',
      'secondary-dark': '#393232',
      'tertiary-dark': '#1b1616',
      'primary-light': '#f8f8ba',
    }),
    borderColor: theme => ({
      ...theme('colors'),
      'primary-dark': '#252020',
      'secondary-dark': '#393232',
      'tertiary-dark': '#1b1616',
      'primary-light': '#f8f8ba',
    }),
  },
  variants: {
    backgroundColor: [
      'responsive',
      'hover',
      'focus',
      'dark',
      'dark-hover',
      'dark-focus',
    ],
    borderColor: [
      'responsive',
      'hover',
      'focus',
      'dark',
      'dark-hover',
      'dark-focus',
    ],
    textColor: [
      'responsive',
      'hover',
      'focus',
      'group-hover',
      'focus-within',
      'dark',
      'dark-hover',
      'dark-focus',
      'dark-group-hover',
      'dark-focus-within',
    ],
  },
  plugins: [require('tailwindcss-dark-mode')()],
};
