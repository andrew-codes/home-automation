import { ApolloServer } from "apollo-server-express"
import cors from "cors"
import createDebug from "debug"
import express from "express"
import HomeAssistant from "homeassistant"
import createUnifi from "node-unifiapi"
import { altairExpress } from "altair-express-middleware"
import { authorizeMiddleware } from "./middleware/authorize"
import { cache } from "./cache"
import { client } from "./mongo"
import { connectAsync } from "async-mqtt"
import { createServer } from "http"
import { GridFSBucket } from "mongodb"
import { SubscriptionServer } from "subscriptions-transport-ws"
import * as bodyParser from "body-parser-graphql"
import { createDataContext } from "./dataContext"
import { pubsub } from "./pubsub"
import { resetCounts } from "./dataProvider/dataSourceBatchPerformance"
import { schema } from "./schema/index"
// import * as types from "./generated/nexusTypes.gen"
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
  WS_PORT,
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
const http = createServer(app)
async function run() {
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })
  const options = {
    schema: schema,
    context: createDataContext(ha, mqtt, unifi),
  }
  const apollo = new ApolloServer(options)
  app.use(
    "/graphql",
    cors(),
    authorizeMiddleware(GRAPHQL_API_TOKEN as string),
    bodyParser.graphql()
  )
  apollo.applyMiddleware({ app })
  app.use("/graphql", (req, resp, next) => {
    debug("Flushing Cache")
    resetCounts()
    cache.flushAll()
    cache.flushStats()
    next()
  })
  apollo.installSubscriptionHandlers(http)
  app.listen({ port: PORT }, () => {
    debug("listening on port", PORT)
    debug(apollo.graphqlPath)
  })

  http.listen(WS_PORT, () => {
    debug("listening for subscriptions", WS_PORT, apollo.subscriptionsPath)
  })

  await mqtt.subscribe("/playnite/game/state/updated", { qos: 2 })
  await mqtt.subscribe("/playnite/game/list/updated", { qos: 2 })

  mqtt.on("message", (topic, message) => {
    debug(topic, message.toString())
    if (topic === "/playnite/game/state/updated") {
      pubsub.publish("/playnite/game/state/updated", { id: message.toString() })
    }
  })
}
run()

app.get("/image/:imageId", async (req, resp, next) => {
  const { imageId } = req.params
  debug("imageId", imageId)
  const db = await client.db("gameLibrary")
  resp.contentType("image/jpeg")
  const bucket = new GridFSBucket(db)
  bucket
    .openDownloadStreamByName(imageId)
    .on("data", (data) => {
      resp.write(data)
    })
    .on("error", (error) => {
      debug(error)
    })
    .on("end", () => {
      resp.end()
    })
})

if (NODE_ENV === "development") {
  app.use(
    "/altair",
    altairExpress({
      endpointURL: "/graphql",
    })
  )
}

process.once("SIGUSR2", () => {
  resetCounts()
  process.kill(process.pid, "SIGUSR2")
})
process.on("SIGINT", () => {
  client.close()
  process.exit(0)
})
