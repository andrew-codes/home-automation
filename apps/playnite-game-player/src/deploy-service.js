const path = require("path")
const Service = require("node-windows").Service

const {
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
  USERNAME,
} = process.env

const svc = new Service({
  name: "Playnite Game Player v2",
  description:
    "Node service listening to MQTT bus for /playnite actions to be performed on PC.",
  script: path.join(__dirname, "index.js"),
  maxRetries: 5,
  env: [
    {
      name: "MQTT_HOST",
      value: MQTT_HOST,
    },
    {
      name: "MQTT_PASSWORD",
      value: MQTT_PASSWORD,
    },
    {
      name: "MQTT_PORT",
      value: MQTT_PORT,
    },
    {
      name: "MQTT_USERNAME",
      value: MQTT_USERNAME,
    },
    {
      name: "USERNAME",
      value: USERNAME,
    },
  ],
})

svc.on("install", () => {
  svc.start()
})

svc.install()
