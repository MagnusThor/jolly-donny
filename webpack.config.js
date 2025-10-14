const webpack = require("webpack");
const path = require("path");


module.exports = {
  mode: "development",
  watch: false,
  entry: {
    "localstorage-example": "./dist/test/example-LocalStorageProvider.js",
    "filesystem-example": "./dist/test/example-filesystem.js",
  },
  output: {
    path: path.resolve(__dirname, "test/js/"),
    filename: "[name]-bundle.js",
    clean: true, // Optional: cleans output dir on build
  },
  resolve: {
    fallback: {

    },
  },
  module: {
    rules: [
      {
      },
    ],
  },
  plugins: [
   
  ],
 
};
