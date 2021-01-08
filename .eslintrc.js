module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    "jest": true,
  },
  extends: ['airbnb'],
  rules: {
    'import/extensions': 'off',
    'indent': 'off',
    'lines-between-class-members': [
        'error',
        'always',
        {'exceptAfterSingleLine': true},
    ],
    'max-len': 'off',
    'no-console': 'off',
    'no-plusplus': 'off',
    'no-tabs': 'off',
    'no-useless-escape': 'off'
  },
  settings: {
    'import/resolver': {
        'node': {
            'extensions': ['.js', '.jsx', '.ts', '.tsx'],
        },
    },
  },
};
