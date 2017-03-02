const express = require("express")
const debug = require("debug")("app:server")
const config = require("../config/project.config")
const webpack = require("webpack")
const webpackConfig = require("../config/webpack.config")
const history = require("connect-history-api-fallback")

// create an app instance
const app = express()

const paths = config.utils_paths

// rewrite all routes requests to the root /index.html
app.use(history())

if (config.env === "development") {
    const compiler = webpack(webpackConfig)
    debug("Enable webpack dev and HMR middleware")
    app.use(require("webpack-dev-middleware")(compiler, {
        publicPath: webpackConfig.output.publicPath,
        contentBase: paths.client(),
        hot: true,
        quiet: config.compiler_quiet,
        noInfo: config.compiler_quiet,
        lazy: false,
        stats: config.compiler_stats
    }))
    app.use(require("webpack-hot-middleware")(compiler))

    // server the static files
    app.use(express.static(paths.public()))
} else {
    debug(
        `Server is being run outside of live development mode, meaning it
        will only serve the compiled application bundle in ~/dist.`
    )
    app.use(express.static(paths.dist()))
}


module.exports = app
