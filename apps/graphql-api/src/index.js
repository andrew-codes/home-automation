import cors from "cors"
import createDebug from "debug"
import express from "express"
import { graphqlHTTP } from "express-graphql"
import * as bodyParser from "body-parser-graphql"
import { createDataContext } from "./dataContext.js"
import { schema } from "./schema/index.js"
const debug = createDebug("@ha/graphql-api")

const { API_TOKEN, HA_HOST, HA_TOKEN, PORT } = process.env

const app = express()
app.use("/", bodyParser.graphql())
app.use(cors())

app.use(
  "/",
  (request, response, next) => {
    if (!request.headers || !request.headers.authorization) {
      return next(new Error("Unauthorized"))
    }
    let token
    const parts = request.headers.authorization.split(" ")
    if (parts.length == 2) {
      const scheme = parts[0]
      const credentials = parts[1]

      if (/^Bearer$/i.test(scheme)) {
        token = credentials
      }
    }
    if (!!token && token === API_TOKEN) {
      return next()
    }
    return next(new Error("Unauthorized"))
  },
  graphqlHTTP({
    schema: schema,
    graphiql: true,
    context: createDataContext({ host: HA_HOST, token: HA_TOKEN }),
  })
)

app.listen(PORT, () => debug("listening on port", PORT))

process.on("SIGINT", () => {
  process.exit(0)
})
