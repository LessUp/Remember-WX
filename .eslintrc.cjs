module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    wx: 'readonly',
    App: 'readonly',
    Page: 'readonly',
    getApp: 'readonly',
    Component: 'readonly'
  },
  overrides: [
    {
      files: ['__tests__/**/*.spec.js'],
      env: {
        node: true
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly'
      }
    },
    {
      files: ['wx-memory-trainer/**/*.js'],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: true,
        commonjs: true
      }
    }
  ],
  rules: {
    'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
    'no-console': 'off'
  }
}
