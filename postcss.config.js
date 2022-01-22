module.exports = {
  plugins: {
    'postcss-preset-env': {
      features: {
        'nesting-rules': true,
        'focus-within-pseudo-class': false,
      },
    },
  },
};
