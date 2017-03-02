const webpack = require("webpack")
const config = require("./project.config")
const debug = require("debug")("app:webpack:config")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const cssnano = require("cssnano")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

const paths = config.utils_paths
const __DEV__ = config.globals.__DEV__
const __PROD__ = config.globals.__PROD__
const __TEST__ = config.globals.__TEST__

debug("Creating configuration")
const webpackConfig = {
    name: "client",
    target: "web",
    devtool: config.compiler_devtool,
    resolve: {
        modules: [paths.client(), "node_modules"],
        extensions: [".js", ".json"]
    },
    module: {}
}

// entry points
const APP_ENTRY = paths.client("main.js")

webpackConfig.entry = {
    app: __DEV__
        ? [APP_ENTRY].concat(`webpack-hot-middleware/client?path=${config.compiler_public_path}__webpack_hmr`)
        : [APP_ENTRY],
        vender: config.compiler_vendors
}

// bundle output
webpackConfig.output = {
    filename: `[name].[${config.compiler_hash_type}].js`,
    path: paths.dist(),
    publicPath: config.compiler_public_path
}

// plugings
webpackConfig.plugins = [
    new webpack.DefinePlugin(config.globals),
    new HtmlWebpackPlugin({
        template: paths.client("index.html"),
        hash: false,
        favicon: paths.public("favicon.ico"),
        filename: "index.html",
        inject: "body",
        minify: {
            collapseWhitespace: true,
            removeComments: true
        }
    })
]

if (__DEV__) {
    debug("Enable plugins for live development (HMR, NoErrors).")
    webpackConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
} else if (__PROD__) {
    debug("Enable plugin for production (OccurenceOrder, Dedupe & UglifyJS).")
    webpackConfig.plugins.push(
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                unused: true,
                dead_code: true,
                warnings: false
            }
        })
    )
}

if (!__TEST__) {
    webpackConfig.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
            name: ["vendor"]
        })
    )
}


// loaders
webpackConfig.module.rules = [{
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: [
        {
            loader: "babel-loader",
            options: config.compiler_babel
        }
    ],
}, {
    test: /\.json$/,
    use: [
        {
            loader: "json"
        }
    ]
}]

// style loaders
const BASE_CSS_LOADER = {
    loader: "css-loader",
    options: {
        sourceMap: true,
        minimize: true
    }
}

const postcss = [
    cssnano({
        autoprefixer: {
            add: true,
            remove: true,
            browsers: ["last 2 versions"]
        },
        discardComments: {
            removeAll: true
        },
        discardUnused: false,
        mergeIdents: false,
        reduceIdents: false,
        safe: true,
        sourcemap: true
    })
]

webpackConfig.module.rules.push({
    test: /\.(scss|sass)$/,
    exclude: [],
    use: [
        {
            loader: "style-loader"
        },
        BASE_CSS_LOADER,
        {
            loader: "postcss-loader",
            options: {
                plugins: postcss
            }
        },
        {
            loader: "sass-loader",
            options: {
                precision: 10,
                sourceMap: true,
                includePaths: [paths.client("styles")]
            }
        }
    ]
})

webpackConfig.module.rules.push({
    test: /\.css$/,
    exclude: [],
    use: [
        {
            loader: "style-loader"
        },
        BASE_CSS_LOADER,
        {
            loader: "postcss-loader",
            options: {
                plugins: postcss
            }
        },
    ]
})

// File loaders
webpackConfig.module.rules.push({
    test: /\.svg(\?.*)?$/,
    use: [
        {
            loader: "url-loader",
            options: {
                prefix: "fonts/&name=[path][name].[ext]",
                limit: 10000,
                mimetype: "image/svg+xml"
            }
        }
    ]
}, {
    test: /\.(png|jpg)$/,
    use: [
        {
            loader: "url-loader",
            options: {
                limit: 8192
            }
        }
    ]
})


if (!__DEV__) {
    debug("Apply ExtractTextPlugin to css loaders.")
    webpackConfig.module.rules.filter((rule) => (
        rule.use && rule.use.find(loader => (
            loader && loader.loader && loader.loader.split && /css/.test(loader.loader)))
    )).forEach(rule => {
        const first = rule.use[0]
        const rest = rule.use.slice(1)
        rule.use = ExtractTextPlugin.extract({
            fallback: first.loader,
            use: rest.map(loader => loader.loader)
        })
    })

    webpackConfig.plugins.push(
        new ExtractTextPlugin("[name].[contenthash].css", {
            allChunks: true
        })
    )
}

module.exports = webpackConfig
