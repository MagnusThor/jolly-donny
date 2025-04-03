const webpack = require('webpack');

module.exports = {
    mode: "development",
    watch: false,
    entry: {
        "test-client": "./dist/test/test-app.js"
        
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