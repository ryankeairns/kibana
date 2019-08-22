/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

const path = require('path');
const webpack = require('webpack');

const { KIBANA_ROOT, RUNTIME_OUTPUT, LIBRARY_NAME, RUNTIME_NAME } = require('./constants');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  context: KIBANA_ROOT,
  entry: {
    [RUNTIME_NAME]: require.resolve('./index.ts'),
  },
  mode: isProd ? 'production' : 'development',
  plugins: isProd ? [new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })] : [],
  output: {
    path: RUNTIME_OUTPUT,
    filename: '[name].js',
    library: LIBRARY_NAME,
  },
  // Include a require alias for legacy UI code and styles
  resolve: {
    alias: {
      ui: path.resolve(KIBANA_ROOT, 'src/legacy/ui/public'),
      'data/interpreter': path.resolve(
        KIBANA_ROOT,
        'src/plugins/data/public/expressions/interpreter'
      ),
      'kbn/interpreter': path.resolve(KIBANA_ROOT, 'packages/kbn-interpreter/target/common'),
      'types/interpreter': path.resolve(
        KIBANA_ROOT,
        'src/legacy/core_plugins/interpreter/public/types'
      ),
    },
    extensions: ['.js', '.json', '.ts', '.tsx', '.scss'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: 'babel-loader',
        options: {
          presets: [require.resolve('@kbn/babel-preset/webpack_preset')],
        },
        sideEffects: false,
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [require.resolve('@kbn/babel-preset/webpack_preset')],
            },
          },
        ],
        sideEffects: false,
      },
      {
        test: /\.css$/,
        exclude: /components/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: require.resolve('./postcss.config.js'),
              },
            },
          },
          {
            loader: 'string-replace-loader',
            options: {
              search: '__REPLACE_WITH_PUBLIC_PATH__',
              replace: '/',
              flags: 'g',
            },
          },
        ],
        sideEffects: true,
      },
      {
        test: /\.module\.s(a|c)ss$/,
        loader: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              camelCase: true,
              sourceMap: !isProd,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              path: path.resolve(KIBANA_ROOT, 'src/optimize/postcss.config.js'),
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !isProd,
            },
          },
        ],
        sideEffects: true,
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { importLoaders: 2 } },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: require.resolve('./postcss.config.js'),
              },
            },
          },
          { loader: 'less-loader' },
        ],
        sideEffects: true,
      },
      {
        test: /\.scss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { importLoaders: 2 } },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: require.resolve('./postcss.config.js'),
              },
            },
          },
          { loader: 'sass-loader' },
        ],
        sideEffects: true,
      },
      {
        test: require.resolve('jquery'),
        loader: 'expose-loader?jQuery!expose-loader?$',
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg|ico)(\?|$)/,
        loader: 'file-loader',
        sideEffects: false,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
        sideEffects: true,
      },
      {
        test: [
          require.resolve('@elastic/eui/es/components/code_editor'),
          require.resolve('@elastic/eui/es/components/drag_and_drop'),
          require.resolve('@elastic/eui/packages/react-datepicker'),
          require.resolve('highlight.js'),
          /canvas_plugin_src\/renderers\/advanced_filter/,
          /canvas_plugin_src\/renderers\/dropdown_filter/,
          /canvas_plugin_src\/renderers\/embeddable.tsx/,
          /canvas_plugin_src\/renderers\/time_filter/,
        ],
        use: 'null-loader',
      },
    ],
  },
  node: {
    fs: 'empty',
    child_process: 'empty',
  },
};
