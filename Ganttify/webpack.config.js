const path = require('path');
const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      "fs": require.resolve("browserify-fs"),
      "zlib": require.resolve("browserify-zlib"),
      assert: require.resolve('assert/'),
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer/')
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};