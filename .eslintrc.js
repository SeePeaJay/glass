module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    "jest": true
  },
  extends: ['airbnb'],
  rules: {
    'indent': 'off',
    'lines-between-class-members': [
        'error',
        'always',
        {'exceptAfterSingleLine': true},
    ],
    'max-len': 'off',
    'no-plusplus': 'off',
    'no-tabs': 'off',
    'no-useless-escape': 'off'
  },
};
