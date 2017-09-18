const htmlStandards = require('reshape-standard');
const cssStandards = require('spike-css-standards');
const jsStandards = require('spike-js-standards');
const pageId = require('spike-page-id');
const sugarml = require('sugarml');
const sugarss = require('sugarss');
const { ProvidePlugin } = require('webpack'); // eslint-disable-line
const path = require('path');

const env = process.env.SPIKE_ENV;

module.exports = {
  devtool: 'source-map',
  matchers: { html: '*(**/)*.sgr', css: '*(**/)*.sss' },
  ignore: ['**/layout.sgr', '**/_*', '**/.*', 'readme.md', 'yarn.lock', 'package-lock.json', 'LICENSE.md', 'install-eslint-config-airbnb'],
  dumpDirs: ['www', 'assets', 'views', 'favicons'],
  reshape: htmlStandards({
    parser: sugarml,
    locals: ctx => ({ pageId: pageId(ctx) }),
    minify: env === 'production',
  }),
  plugins: [
    new ProvidePlugin({
      THREE: 'three/build/three',
    }),
  ],
  resolve: {
    alias: {
      OBJLoader: path.resolve(__dirname, 'node_modules/three/examples/js/loaders/OBJLoader.js'),
      TweenLite: path.resolve(__dirname, 'node_modules/gsap/src/uncompressed/TweenLite.js'),
      AttrPlugin: path.resolve(__dirname, 'node_modules/gsap/src/uncompressed/plugins/AttrPlugin.js'),
    },
  },
  postcss: cssStandards({
    parser: sugarss,
    minify: env === 'production',
    warnForDuplicates: env !== 'production',
  }),
  babel: jsStandards(),
};
