const debug = require("debug")("@ha/game-player/index")
const express = require("express")
const path = require("path")

const {
  GRAPHQL_API_HOST,
  GRAPHQL_API_TOKEN,
  GRAPHQL_SUB_API_HOST,
  NODE_ENV,
  PORT,
} = process.env
const app = express()

app.get("/apiUrl", async (req, resp) => {
  resp.send(
    JSON.stringify({
      url: `${GRAPHQL_API_HOST}/graphql`,
      subUrl: GRAPHQL_SUB_API_HOST,
      token: GRAPHQL_API_TOKEN,
    })
  )
})

if (NODE_ENV !== "production") {
  const webpackMiddleware = require("webpack-dev-middleware")
  const webpack = require("webpack")
  const webpackConfig = require("./webpack.config")
  const webpackMerge = require("webpack-merge")
  const compiler = webpack(
    webpackMerge.merge(webpackConfig, {
      entry: [
        path.join(__dirname, "client", "index.tsx"),
        "webpack-hot-middleware/client",
      ],
      devtool: "inline-source-map",
      mode: "development",
      plugins: [
        new webpack.HotModuleReplacementPlugin({}),
        new webpack.NoEmitOnErrorsPlugin(),
      ],
      devServer: {
        hot: true,
      },
    })
  )
  app.use(webpackMiddleware(compiler, {}))
  app.use(require("webpack-hot-middleware")(compiler))
} else {
  app.get(/.*\.js$/, (req, resp) => {
    resp.sendFile(path.join(__dirname, req.path))
  })
  app.get("*", async (req, resp) => {
    resp.sendFile(path.join(__dirname, "index.html"))
  })
}
app.listen(PORT, () => debug(`Listening on port ${PORT}`))
