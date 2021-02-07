const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")

module.exports = {
  mode: "production",
  entry: path.join(__dirname, "client", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "..", "dist"),
    filename: "index.js",
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: "ts-loader", exclude: "/node_modules/" }],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  optimization: {},
  plugins: [
    new HtmlWebpackPlugin({
      appMountId: "app",
      inject: true,
      links: [
        "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap",
      ],
      mobile: true,
      template: require("html-webpack-template"),
      title: "Game Player",
    }),
  ],
}
