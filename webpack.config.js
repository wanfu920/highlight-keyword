const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

let config = {
    mode: "development",
    entry: {
        'background/index': './src/background/index.js',
        'popup/index': './src/popup/index.jsx',
        'content/index': './src/content/index.js',
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
    },
    devtool: 'source-map',
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(['./dist/**/*']),
        // new webpack.NamedModulesPlugin(),
        new CopyWebpackPlugin([
            { from: 'src/manifest.json', to: './', },
            { from: 'src/popup/index.html', to: './popup/', },
            { from: 'src/content/index.css', to: './content/', },
            { from: 'src/assets/', to: './assets', },
        ])
    ],
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ["@babel/react", "@babel/env"],
                            "plugins": ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-proposal-class-properties"]
                        }
                    }
                ],
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                        },
                    }
                ]
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "src"),
            "node_modules"
        ],
        extensions: [".jsx", ".js", ".json", ".css"],
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "popup/vendors",
                    chunks: "all",
                }
            }
        }
    }
}

if (process.env.NODE_ENV === 'production') {
    config.mode = 'production';
    delete config.devtool;
    delete config.devServer;
}

module.exports = config;