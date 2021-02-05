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
    'curly': 'error',
    'quotes': [2, 'single'],
    // note you must disable the base rules as they can report incorrect errors
    'brace-style': 'off',
    '@typescript-eslint/brace-style': ['error', '1tbs', { 'allowSingleLine': false }],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'semi': 'off',
    '@typescript-eslint/semi': ['error']
  }
};
