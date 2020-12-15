const debug = require("debug")("@ha/guest-wifi-renewal")
const path = require("path")
const { connectAsync } = require("async-mqtt")

const {
  API_HOST,
  API_PORT,
  API_TOKEN,
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
} = process.env

// A weekend (3 days) worth of time per authorization.
const getAuthorizationTime = () => 4320

const run = async () => {}

run()
