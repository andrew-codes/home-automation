import { Service } from "node-windows"

const {
  DEPLOYMENT_PATH,
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
  PLAYNITE_EXEC,
} = process.env

const svc = new Service({
  name: "Playnite Game Player",
  description:
    "Node service listening to MQTT bus for /playnite actions to be performed on PC.",
  script: DEPLOYMENT_PATH,
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
    { name: "PLAYNITE_EXEC", value: PLAYNITE_EXEC },
  ],
})

svc.on("install", () => {
  svc.start()
})

svc.install()
