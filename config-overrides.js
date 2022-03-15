/* eslint-disable react-hooks/rules-of-hooks */
/* config-overrides.js */

const { useBabelRc, override, useEslintRc } = require('customize-cra')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const useBundleAnalyser = config => {
  config.plugins.push(new BundleAnalyzerPlugin())
  return config
}

module.exports = override(
  useBabelRc(),
  // eslint-disable-next-line no-path-concat
  useEslintRc(__dirname + '/.eslintrc'),
  useBundleAnalyser
)
