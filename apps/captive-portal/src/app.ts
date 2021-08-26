const debug = require("debug")("@ha/captive-portal/server")
import createUnifi from "node-unifiapi"
import { connectAsync } from "async-mqtt"
import express from "express"
import configureRoutes from "./configureRoutes"

const run = async () => {
  const {
    MQTT_HOST,
    MQTT_PASSWORD,
    MQTT_PORT,
    MQTT_USERNAME,
    PASS_PHRASE,
    PORT,
    UNIFI_IP,
    UNIFI_PORT,
    UNIFI_USERNAME,
    UNIFI_PASSWORD,
  } = process.env
  const app = express()
  const mqttPort = !MQTT_PORT ? "1883" : MQTT_PORT
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(mqttPort, 10),
    username: MQTT_USERNAME,
  })
  const unifi = createUnifi({
    baseUrl: `https://${UNIFI_IP}:${UNIFI_PORT}`,
    username: UNIFI_USERNAME,
    password: UNIFI_PASSWORD,
  })
  configureRoutes(app, mqtt, unifi, PASS_PHRASE)
  app.listen(PORT, () => {
    debug(`listening on port ${PORT}`)
  })
}

export default run
