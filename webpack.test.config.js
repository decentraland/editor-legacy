const path = require('path')
const WebpackTapeRun = require('webpack-tape-run')

// var childProcess = require('child_process');
// var webpack = require('webpack');

var entry = [
  path.join(__dirname, 'test', 'index.js')
]

// dist/
// var filename = 'aframe-inspector.js';
// var outPath = 'dist';
// if (process.env.AFRAME_DIST) {
//   outPath = 'dist';
//   if (process.env.NODE_ENV === 'production') {
//     filename = 'aframe-inspector.min.js';
//   }
// }

// const PATH = (process.env.CI && process.env.CIRCLE_BRANCH !== 'master')
//   ? '/branch/' + process.env.CIRCLE_BRANCH + '/dist/'
//   : '/dist/'

module.exports = {
  entry: entry,
  output: {
    filename: 'test-bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'es2015', 'react'],
            plugins: ['transform-object-rest-spread', 'transform-class-properties']
          }
        }
      }
    ]
  },
  node: {
    fs: 'empty'
  },
  plugins: [
    new WebpackTapeRun({
      tapeRun: {
        browser: 'electron'
      }
      // reporter: 'tap-spec'
    })
  ]

}
