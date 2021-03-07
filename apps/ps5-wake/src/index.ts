import createDebugger from "debug"
import { connectAsync } from "async-mqtt"
import sh from "shelljs"

const debug = createDebugger("@ha/ps5-wake-app/index")

const {
  MQTT_HOST,
  MQTT_PORT,
  MQTT_PASSWORD,
  MQTT_USERNAME,
  PS5_USER_CREDENTIALS,
} = process.env

async function run() {
  debug("Starting application")
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })

  await mqtt.subscribe("/ps5/wake")

  mqtt.on("message", async (topic, message) => {
    debug("topic", topic)
    if (topic === "/ps5/wake") {
      sh.exec(`/ps5-wake -vW ${PS5_USER_CREDENTIALS} -B`)
    }
  })
}

run()
