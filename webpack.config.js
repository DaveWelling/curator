const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');
const WorkboxPlugin = require('workbox-webpack-plugin');

// eslint-disable-next-line
console.log('NODE_ENV =', process.env.NODE_ENV);
module.exports = {
    devtool: 'source-map',
    mode: process.env.NODE_ENV,
    entry: {
        main: ['./src/index']
    },
    output: {
        filename: '[name].[hash].js',
        globalObject: 'this',
        chunkFilename: '[name].[hash].js'
    },
    // // You must get the absolute path here because of this issue: https://github.com/webpack/webpack/issues/1866
    // resolve: {
    //     modules: ['../../node_modules/', 'node_modules'].map(moduleRelativePath =>
    //         path.resolve(__dirname, moduleRelativePath)
    //     )
    // },
    stats: {
        excludeModules: 'mini-css-extract-plugin'
    },
    devServer: {
        contentBase: './src',
        historyApiFallback: {
            index: '/index.html'
        },
        port: 80,
        host: '0.0.0.0',
        allowedHosts: ['localhost', 'novel.davewelling.com'],
        inline: true,
        hot: true
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: {
                    loader: 'worker-loader'
                }
            },
            {
                test: /(\.worker)?\.js$/,
                exclude: [/node_modules/],
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            // This is a feature of `babel-loader` for Webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true,
                            // You must get the absolute path here because of this issue: https://github.com/webpack/webpack/issues/1866
                            plugins: ['react-hot-loader/babel']
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader'
                ]
            },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader' },
            { test: /\.(woff|woff2)$/, loader: 'url-loader?prefix=font/&limit=5000' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml' },
            { test: /\.(png|jpg|gif)$/, use: [{ loader: 'url-loader', options: { limit: 8192 } }] }
        ]
    },
    plugins: [
        new WorkboxPlugin.GenerateSW(),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // dropping locales makes moment WAY smaller.
        new webpack.DefinePlugin({
            __PRODUCTION__: process.env.NODE_ENV === 'production'
        }),
        new HtmlWebPackPlugin({
            template: './src/index.html',
            filename: './index.html',
            favicon: 'src/favicon.png',
            chunks: ['main']
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].css'
        })
    ]
};
