/* eslint-disable react-hooks/rules-of-hooks */
/* config-overrides.js */

const { useBabelRc, override, useEslintRc } = require('customize-cra')

module.exports = override(
  useBabelRc(),
  // eslint-disable-next-line no-path-concat
  useEslintRc(__dirname + '/.eslintrc')
)
