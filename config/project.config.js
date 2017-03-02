const path = require("path")
const debug = require("debug")("app:config")
const ip = require("ip")

debug("Creating default configuration.")

const config = {
    // project structure
    env: process.env.NODE_ENV || "development",
    path_base: path.resolve(__dirname, ".."),
    dir_client: "src",
    dir_public: "public",
    dir_dist: "dist",
    dir_server: "server",
    dir_test: "tests",

    // server configuration
    server_host: ip.address(),
    server_port: process.env.PORT || 3000,

    // compiler configuration
    compiler_babel: {
        cacheDirectory: true,
        plugins: ["transform-runtime", "transform-class-properties"],
        presets: [
            ["es2015", { modules: false }], // webpack2 default es5
            "stage-0"
        ]
    },
    compiler_devtool: "source-map",
    compiler_hash_type: "hash",
    compiler_quiet: false,
    compiler_fail_on_warning: false,
    compiler_public_path: "/",
    compiler_stats: {
        chunks: false,
        chunkModules: false,
        colors: true
    },
    compiler_vendors: [
        "jquery"
    ]
}

// globals
config.globals = {
    "__DEV__": config.env === "development",
    "__PROD__": config.env === "production",
    "__BASENAME__": JSON.stringify(process.env.BASENAME || "")
}

// utils
function base () {
    const args = [config.path_base].concat([].slice.call(arguments))
    return path.resolve.apply(path, args)
}
config.utils_paths = {
    base: base,
    client: base.bind(null, config.dir_client),
    public: base.bind(null, config.dir_public),
    dist: base.bind(null, config.dir_dist),
}

module.exports = config
