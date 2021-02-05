// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'quotes': [2, 'single'],
    'curly': 'error',
    // note you must disable the base rule as it can report incorrect errors
    'brace-style': 'off',
    '@typescript-eslint/brace-style': ['error', '1tbs', { 'allowSingleLine': false }],
    // note you must disable the base rule as it can report incorrect errors
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': [
      'error'
    ]
  }
};
