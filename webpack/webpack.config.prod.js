const webpack = require("webpack");
const path = require("path");

const HtmlWebpackPlugin  = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeJsPlugin = require("optimize-js-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const WebpackCleanupPlugin = require("webpack-cleanup-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const srcDir = "public_src";
const outputDir = "../public";

module.exports = {
    devtool: "source-map",
    entry: {
        app: path.resolve(srcDir, "bootstrap.ts")
    },
    output: {
        path: path.resolve(__dirname, outputDir),
        filename: "[name].[hash].bundle.js",
        sourceMapFilename: "[name].[hash].map",
        chunkFilename: "[id].[hash].chunk.js"
    },
    resolve: {
        extensions: [".ts", ".component.ts", ".service.ts", ".js", ".component.html", ".component.less", ".less", ".css"]
    },
    module: {
        rules: [
            { test: /\.ts$/, enforce: "pre", loader: "tslint-loader" },
            { test: /(\.component|\.service|)\.ts$/, use: ["ts-loader"] },
            { test: /\.component\.html$/, use: [{ loader: "html-loader", options: { minimize: false } }] },
            { test: /(\.component|)\.less$/, use: ["to-string-loader", "css-loader", "less-loader"] },
            { test: /\.css$/, use: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" })},
            { test: /\.(png|gif|jpg|ico|svg)$/, use:[{ loader: "file-loader", options: { name: "images/[name].[ext]"} } ]},
            { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use:[{ loader: "file-loader", options: { name: "fonts/[name].[ext]"} } ]},
            { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use:[{ loader: "file-loader", options: { name: "fonts/[name].[ext]"} } ]},
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use:[{ loader: "file-loader", options: { name: "fonts/[name].[ext]"} } ]},
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use:[{ loader: "file-loader", options: { name: "fonts/[name].[ext]"} } ]},
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use:[{ loader: "file-loader", options: { name: "fonts/[name].[ext]"} } ]}
        ],
        noParse: [ path.join(__dirname, "node_modules", "angular2", "bundles") ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        // new UglifyJsPlugin({
        //     comments: false,
        //     ecma: 5,
        //     ie8: false,
        //     mangle: false,
        //     sourceMap: true
        // }),
        new ExtractTextPlugin("[name].[contenthash].css"),
        new HtmlWebpackPlugin({
            template: path.resolve(srcDir, "index.html"),
            inject: true
        }),
        new ScriptExtHtmlWebpackPlugin({
          defaultAttribute: "defer"
        }),
        new WebpackCleanupPlugin({
          exclude: ["index.html", "data/airports.geojson"]
        }),
        new OptimizeJsPlugin(),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require("cssnano"),
            cssProcessorOptions: { discardComments: { removeAll: true } },
            canPrint: true
        }),
        new CopyWebpackPlugin([{
            from: "public_src/images",
            to: "images"
        }, {
            from: "public_src/land.html",
            to: ""
        }, {
            from: "public_src/land_single.html",
            to: ""
        }, {
            from: "public_src/manifest.json",
            to: ""
        }])
    ]
};
