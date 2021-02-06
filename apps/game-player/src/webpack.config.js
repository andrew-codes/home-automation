const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const webpack = require("webpack")

const { GRAPHQL_API_HOST } = process.env

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
    new HtmlWebpackPlugin({
      appMountId: "app",
      inject: false,
      mobile: true,
      template: require("html-webpack-template"),
      title: "Game Player",
      window: {
        env: {
          imagesUrl: GRAPHQL_API_HOST,
        },
      },
    }),
    new webpack.HotModuleReplacementPlugin({}),
  ],
}
