import { config } from "dotenv"
config()
import cors from "cors"
import createDebug from "debug"
import express from "express"
import HomeAssistant from "homeassistant"
import createUnifi from "node-unifiapi"
import { connect } from "async-mqtt"
import { altairExpress } from "altair-express-middleware"
import { graphqlHTTP } from "express-graphql"
import * as bodyParser from "body-parser-graphql"
import { createDataContext } from "./dataContext"
import { schema } from "./schema/index"
import { authorize } from "./middleware/authorize"
import * as types from "./generated/nexusTypes.gen"
import { resetCounts } from "./dataProvider/dataSourceBatchPerformance"
import { cache } from "./cache"
const debug = createDebug("@ha/graphql-api")

const {
  GRAPHQL_API_TOKEN,
  HA_HOST,
  HA_PORT,
  HA_TOKEN,
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
  NODE_ENV,
  PORT,
  USG_IP,
  USG_PORT,
  USG_USERNAME,
  USG_PASSWORD,
} = process.env
const ha = new HomeAssistant({
  host: HA_HOST,
  port: HA_PORT,
  token: HA_TOKEN,
  ignoreCert: true,
})
const mqtt = connect(MQTT_HOST, {
  password: MQTT_PASSWORD,
  port: parseInt(MQTT_PORT || "1883", 10),
  username: MQTT_USERNAME,
})
const unifi = createUnifi({
  baseUrl: `https://${USG_IP}:${USG_PORT}`,
  username: USG_USERNAME,
  password: USG_PASSWORD,
})

const whitelist = [
  /http:\/\/192\.168\.[1-9]+[0-9]*\.[1-9]+[0-9]/,
  /http:\/\/localhost/,
]
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.find((originPattern) => originPattern.test(origin))) {
      callback(null, true)
      return
    }
    callback(new Error("Not allowed by CORS"))
  },
}

const app = express()
app.use("/graphql", bodyParser.graphql())
const options = {
  schema: schema,
  graphiql: false,
  context: createDataContext(ha, mqtt, unifi),
}

app.use(
  "/graphql",
  cors(corsOptions),
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

if (NODE_ENV === "development") {
  app.use(
    "/altair",
    altairExpress({
      endpointURL: "/graphql",
    })
  )
}

app.listen(PORT, () => debug("listening on port", PORT))

process.on("SIGINT", () => {
  process.exit(0)
})
