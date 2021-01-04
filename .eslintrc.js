module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    "jest": true
  },
  extends: ['airbnb'],
  rules: {
    'indent': 'off',
    'max-len': 'off',
    'no-tabs': 'off',
    'no-useless-escape': 'off'
  },
};
