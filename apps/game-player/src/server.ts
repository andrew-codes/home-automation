import createDebug from "debug"
import express from "express"
import webpackMiddleware from "webpack-dev-middleware"
import webpack from "webpack"
import { createApolloFetch } from "apollo-fetch"
import webpackConfig from "../webpack.config"

const { GRAPHQL_API_HOST, GRAPHQL_API_TOKEN, NODE_ENV, PORT } = process.env

const debug = createDebug("@ha/game-player/index")
const compiler = webpack(webpackConfig)
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

const app = express()

if (NODE_ENV !== "production") {
  app.use(webpackMiddleware(compiler, {}))
} else {
  app.get("*", async (req, resp) => {
    resp.sendFile("index.html")
  })
}
app.post("/api", async (req, resp) => {
  const results = await gql(req.body)
  resp.send(results)
})
app.listen(PORT, () => debug(`Listening on port ${PORT}`))
