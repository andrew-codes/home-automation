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
  await mqtt.subscribe("/ps5/state/request")

  mqtt.on("message", async (topic, message) => {
    debug("topic", topic)
    try {
      if (topic === "/ps5/wake") {
        await sh.exec(`/ps5-wake -vjW ${PS5_USER_CREDENTIALS} -B`, {
          async: true,
        })
        await mqtt.publish("/ps5/state/request", "")
      }
      if (topic === "/ps5/state/request") {
        const requestOutput = sh.exec(`/ps5-wake -vjP -B`)
        debug(requestOutput)
        await mqtt.publish("/ps5/state", requestOutput)
      }
    } catch (e) {
      debug(e)
    }
  })
}

run()
