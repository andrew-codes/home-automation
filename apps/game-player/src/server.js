const debug = require("debug")("@ha/game-player/index")
const express = require("express")
const path = require("path")
const { createApolloFetch } = require("apollo-fetch")
const fetch = require("node-fetch")

const { GRAPHQL_API_HOST, GRAPHQL_API_TOKEN, NODE_ENV, PORT } = process.env
const app = express()
const gql = createApolloFetch({
  uri: `http://${GRAPHQL_API_HOST}`,
})
gql.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}
  }
  options.headers["Authorization"] = `Bearer ${GRAPHQL_API_TOKEN}`

  next()
})

app.post("/api", async (req, resp) => {
  const results = await gql(req.body)
  resp.send(results)
})
app.get("/image/:imageId", async (req, resp) => {
  const imageResp = await fetch(
    `${GRAPHQL_API_HOST}/image/${req.params.imageId}`
  )
  imageResp.body
    .on("data", (chunk) => {
      resp.send(chunk)
    })
    .on("end", () => {
      resp.end()
    })
})
if (NODE_ENV !== "production") {
  const webpackMiddleware = require("webpack-dev-middleware")
  const webpack = require("webpack")
  const webpackMerge = require("webpack-merge")
  const compiler = webpack(
    webpackMerge(webpackConfig, {
      devtool: "inline-source-map",
      mode: "development",
      plugins: [new webpack.HotModuleReplacementPlugin({})],
    })
  )
  const webpackConfig = require("./webpack.config")
  app.use(webpackMiddleware(compiler, {}))
} else {
  app.get(/.*\.js$/, (req, resp) => {
    resp.sendFile(path.join(__dirname, req.path))
  })
  app.get("*", async (req, resp) => {
    resp.sendFile(path.join(__dirname, "index.html"))
  })
}
app.listen(PORT, () => debug(`Listening on port ${PORT}`))
