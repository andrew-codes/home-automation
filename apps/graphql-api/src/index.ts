import cors from "cors"
import createDebug from "debug"
import express from "express"
import HomeAssistant from "homeassistant"
import createUnifi from "node-unifiapi"
import { connectAsync } from "async-mqtt"
import { altairExpress } from "altair-express-middleware"
import { graphqlHTTP } from "express-graphql"
import * as bodyParser from "body-parser-graphql"
import { authorize } from "./middleware/authorize"
import { cache } from "./cache"
import { client } from "./mongo"
import { closeMongo } from "./middleware/closeMongo"
import { createDataContext } from "./dataContext"
import { resetCounts } from "./dataProvider/dataSourceBatchPerformance"
import { schema } from "./schema/index"
import * as types from "./generated/nexusTypes.gen"
const debug = createDebug("@ha/graphql-api/index")

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
  UNIFI_IP,
  UNIFI_PORT,
  UNIFI_USERNAME,
  UNIFI_PASSWORD,
} = process.env
const ha = new HomeAssistant({
  host: HA_HOST,
  port: HA_PORT,
  token: HA_TOKEN,
  ignoreCert: true,
})
const unifi = createUnifi({
  baseUrl: `https://${UNIFI_IP}:${UNIFI_PORT}`,
  username: UNIFI_USERNAME,
  password: UNIFI_PASSWORD,
})

const app = express()
app.use("/graphql", bodyParser.graphql())

app.use(
  "/graphql",
  cors(),
  authorize(GRAPHQL_API_TOKEN as string),
  async (req, resp, next) => {
    const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
      password: MQTT_PASSWORD,
      port: parseInt(MQTT_PORT || "1883", 10),
      username: MQTT_USERNAME,
    })
    const options = {
      schema: schema,
      graphiql: false,
      context: createDataContext(ha, mqtt, unifi),
    }
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

app.listen(PORT, () => {
  debug("listening on port", PORT)
})

process.on("SIGINT", () => {
  client.close()
  process.exit(0)
})
