console.log('ESLint config loaded');
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier',
    'react-app'
  ],
  rules: {
    "prettier/prettier": "error", // This enables Prettier within ESLint
  }
}
