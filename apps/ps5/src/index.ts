import createDebugger from "debug"
import sh from "shelljs"
import { connectAsync } from "async-mqtt"
import { isEmpty } from "lodash"

const debug = createDebugger("@ha/ps5-app/index")

const { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME, PS5_NAMES } =
  process.env

async function run() {
  debug("Starting application")
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })
  const checkState = createCheckState(mqtt)

  const ps5Names = (PS5_NAMES || "").split(",")
  if (isEmpty(ps5Names)) {
    debug("No PS Names provided.")
  }

  await Promise.all(
    ps5Names.map(async (name) => {
      await mqtt.publish(
        `homeassistant/switch/${name}/config`,
        JSON.stringify({
          name: "gaming_room_ps5",
          command_topic: `homeassistant/switch/${name}/set`,
          state_topic: `homeassistant/switch/${name}/state`,
        })
      )

      await mqtt.subscribe(`homeassistant/switch/${name}/set`)
      await mqtt.subscribe(`homeassistant/switch/${name}/state`)
    })
  )

  const extractName = new RegExp(
    "^homeassistant/switch/([a-zA-Z0-9_-]+)/([a-z]+){1}"
  )

  mqtt.on("message", async (topic, message) => {
    try {
      debug("topic", topic)
      const messagePayload = message.toString()
      const [_, entityName, command] = extractName.exec(topic) ?? []
      const ps5Name = entityName.replace("_", "-")
      debug(topic, ps5Name, entityName, command, messagePayload)

      if (command === "set") {
        if (messagePayload === "ON") {
          debug(sh.exec(`playactor wake --host-name ${ps5Name}`))
          checkState(ps5Name, entityName)
        } else if (messagePayload === "OFF") {
          debug(sh.exec(`playactor standby --host-name ${ps5Name}`))
          checkState(ps5Name, entityName)
        }
        return
      }

      if (command === "state" && isEmpty(messagePayload)) {
        debug("Request for state")
        checkState(ps5Name, entityName)
      }
    } catch (e) {
      debug(e)
    }
  })
}

run()

function createCheckState(mqtt) {
  return async (ps5Name, entityName) => {
    const checkOutput = sh.exec(`playactor check --host-name ${ps5Name}`)
    debug(checkOutput)
    const status = JSON.parse(checkOutput).status
    const state =
      status === "Awake" ? "ON" : status === "Standby" ? "OFF" : "OFF"
    await mqtt.publish(`homeassistant/switch/${entityName}/state`, state)
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), ms)
  })
}