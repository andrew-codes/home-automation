const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: path.join(__dirname, "client", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "..", "dist", "client"),
    filename: "index.js",
  },
  devtool: "inline-source-map",
  module: {
    rules: [{ test: /\.tsx?$/, use: "ts-loader", exclude: "/node_modules/" }],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new webpack.HotModuleReplacementPlugin({}),
  ],
}
