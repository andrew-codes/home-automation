const debug = require("debug")("@ha/game-player/index")
const express = require("express")
const webpackMiddleware = require("webpack-dev-middleware")
const webpack = require("webpack")
const { createApolloFetch } = require("apollo-fetch")
const webpackConfig = require("../webpack.config")

const { GRAPHQL_API_HOST, GRAPHQL_API_TOKEN, NODE_ENV, PORT } = process.env
const app = express()
if (NODE_ENV !== "production") {
  const compiler = webpack(webpackConfig)
  app.use(webpackMiddleware(compiler, {}))
} else {
  app.get("*", async (req, resp) => {
    resp.sendFile("client/index.html")
  })
}
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
app.listen(PORT, () => debug(`Listening on port ${PORT}`))
