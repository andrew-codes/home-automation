import createDebugger from "debug"
import { connectAsync } from "async-mqtt"
import sh from "shelljs"

const debug = createDebugger("@ha/ps5-wake-app/index")

const {
  MQTT_HOST,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_USERNAME,
  PS5_USER_CREDENTIALS,
} = process.env

const getPS5State = ({ code }) =>
  code === 200 ? "on" : code === 620 ? "standby" : "off"

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
    const messagePayload = message.toString()
    try {
      if (topic === "/ps5/wake") {
        const wakeOutput = sh.exec(
          `/ps5-wake -vW ${PS5_USER_CREDENTIALS} -H ${messagePayload}`
        )
        debug(wakeOutput)
        await mqtt.publish("/ps5/state/request", messagePayload)
      }
      if (topic === "/ps5/state/request") {
        const requestOutput = sh.exec(`/ps5-wake -vjP -H ${messagePayload}`)
          .stdout
        debug(requestOutput)
        const payload = JSON.parse(requestOutput)
        payload.state = getPS5State(payload)
        const message = JSON.stringify(payload)
        debug(message)
        await mqtt.publish("/ps5/state", message)
      }
    } catch (e) {
      debug(e)
    }
  })
}

run()
