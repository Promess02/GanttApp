const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        stream: require.resolve('stream-browserify'),
        fs: require.resolve("browserify-fs"),
        zlib: require.resolve("browserify-zlib"),
        util: require.resolve('util/'),
        process: require.resolve('process/browser'),
        assert: require.resolve('assert/'),
        path: require.resolve('path-browserify'),
        buffer: require.resolve('buffer/'),
    };
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
          }),
    ]);
    config.module.rules.unshift({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, 
        },
      });
    return config;
};