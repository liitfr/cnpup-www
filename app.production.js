const htmlStandards = require('reshape-standard');
const cssStandards = require('spike-css-standards');
const pageId = require('spike-page-id');
const { UglifyJsPlugin, ModuleConcatenationPlugin } = require('webpack').optimize; // eslint-disable-line
const { ProvidePlugin } = require('webpack'); // eslint-disable-line
const sugarml = require('sugarml');
const sugarss = require('sugarss');

module.exports = {
  devtool: false,
  reshape: htmlStandards({
    parser: sugarml,
    locals: ctx => ({ pageId: pageId(ctx) }),
    minify: { minifySvg: false },
  }),
  postcss: cssStandards({
    parser: sugarss,
    minify: true,
    warnForDuplicates: true,
  }),
  plugins: [
    new ProvidePlugin({
      THREE: 'three/build/three',
    }),
    new UglifyJsPlugin(),
    new ModuleConcatenationPlugin(),
  ],
};
