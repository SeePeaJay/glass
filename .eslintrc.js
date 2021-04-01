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
	'no-restricted-syntax': 'off', //
	'no-shadow': 'off', // https://github.com/typescript-eslint/typescript-eslint/issues/2471#issuecomment-696609988
    '@typescript-eslint/no-shadow': 'error',
    'no-tabs': 'off',
    'no-useless-escape': 'off',
	'no-unused-vars': 'off',
	'@typescript-eslint/no-unused-vars': ['error'],

  },
  settings: {
    'import/resolver': {
        'node': {
            'extensions': ['.js', '.jsx', '.ts', '.tsx'],
        },
    },
  },
};
