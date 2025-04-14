const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  watch: false,
  entry: {
    "localstorage-example": "./dist/test/example-LocalStorageProvider.js",
    "filesystem-example": "./dist/test/example-filesystem.js",
    "sqllite-example": "./dist/test/example-sqllite.js",
  },
  output: {
    path: path.resolve(__dirname, "test/js/"),
    filename: "[name]-bundle.js",
    clean: true, // Optional: cleans output dir on build
  },
  resolve: {
    fallback: {
      fs: false,
      path: require.resolve("path-browserify"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      util: require.resolve("util/"),
      vm: require.resolve("vm-browserify")
    },
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "asset/resource", // Ensures .wasm is emitted to output
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "node_modules/sql.js/dist/sql-wasm.wasm"),
          to: path.resolve(__dirname, "test/js/"), // Same as output
        },
      ],
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
};
