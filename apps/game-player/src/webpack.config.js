const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")
const webpack = require("webpack")

const { GRAPHQL_API_HOST, NODE_ENV } = process.env

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
  optimization: {
    runtimeChunk: {
      name: "webpackManifest",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      appMountId: "app",
      inject: false,
      inlineManifestWebpackName: "webpackManifest",
      links: [
        "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap",
      ],
      mobile: true,
      scripts: ["/client/index.js"],
      template: require("html-webpack-template"),
      title: "Game Player",
      window: {
        env: {
          imagesUrl: GRAPHQL_API_HOST,
        },
      },
    }),
  ].concat(
    NODE_ENV !== "production"
      ? [new webpack.HotModuleReplacementPlugin({})]
      : []
  ),
}
