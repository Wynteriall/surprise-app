// eslint.config.js
const expoConfig = require('eslint-config-expo/flat');
const { defineConfig } = require('eslint/config');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([expoConfig, prettierConfig]);
