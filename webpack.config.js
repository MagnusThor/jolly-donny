const webpack = require('webpack');

module.exports = {
    mode: "development",
    watch: false,
    entry: {
        "localstorage-example": "./dist/test/example-LocalStorageProvider.js",
        "filesystem-example": "./dist/test/example-filesystem.js"
    },
    output: {
        path: __dirname + "/test/js/",
        filename: "[name]-bundle.js"
    },
    plugins: [
    ],
    module: {
    },
    externals: {
    }
}