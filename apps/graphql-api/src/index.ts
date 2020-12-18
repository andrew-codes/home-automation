import { config } from "dotenv"
config()
import cors from "cors"
import createDebug from "debug"
import express from "express"
import HomeAssistant from "homeassistant"
import { graphqlHTTP } from "express-graphql"
import * as bodyParser from "body-parser-graphql"
import { createDataContext } from "./dataContext"
import { schema } from "./schema/index"
import { authorize } from "./middleware/authorize"
import * as types from "./generated/nexusTypes.gen"
import { resetCounts } from "./dataProvider/dataSourceBatchPerformance"
import { cache } from "./cache"
const debug = createDebug("@ha/graphql-api")

const { GRAPHQL_API_TOKEN, HA_HOST, HA_PORT, HA_TOKEN, PORT } = process.env
const ha = new HomeAssistant({
  host: HA_HOST,
  port: HA_PORT,
  token: HA_TOKEN,
  ignoreCert: true,
})

const app = express()
app.use("/", bodyParser.graphql())
app.use(cors())
const options = {
  schema: schema,
  graphiql: true,
  context: createDataContext(ha),
}

app.use(
  "/",
  authorize(GRAPHQL_API_TOKEN as string),
  async (req, resp, next) => {
    await graphqlHTTP(options)(req, resp)
    next()
  },
  (req, resp, next) => {
    console.log("Flushing Cache")
    resetCounts()
    cache.flushAll()
    cache.flushStats()
    next()
  }
)

app.listen(PORT, () => debug("listening on port", PORT))

process.on("SIGINT", () => {
  process.exit(0)
})
