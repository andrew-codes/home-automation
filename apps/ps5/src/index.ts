import createDebugger from "debug"
import sh from "shelljs"
import { connectAsync } from "async-mqtt"
import { get } from "lodash/fp"
import { isEmpty } from "lodash"

const debug = createDebugger("@ha/ps5-app/index")

const { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USERNAME } = process.env

const getPS5State = ({ code }: { code: number }) =>
  code === 200 ? "on" : code === 620 ? "standby" : "off"

async function run() {
  debug("Starting application")
  const mqtt = await connectAsync(`tcp://${MQTT_HOST}`, {
    password: MQTT_PASSWORD,
    port: parseInt(MQTT_PORT || "1883", 10),
    username: MQTT_USERNAME,
  })

  const browseOutput = sh.exec(`playactor browse`).stdout
  const parsedOutput = JSON.parse(browseOutput)
  let foundDevices = parsedOutput
  if (!Array.isArray(parsedOutput)) {
    foundDevices.push(parsedOutput)
  }
  const ps5Names = foundDevices.map(get("name"))

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
    "^homeassistant/switch/([a-zA-Z0-9_-]+/((set)|(state)){1}"
  )

  mqtt.on("message", async (topic, message) => {
    try {
      debug("topic", topic)
      const messagePayload = message.toString()
      const [name, command] = extractName.exec(topic) ?? []
      debug(topic, name, command, messagePayload)

      if (command === "set") {
        if (messagePayload === "ON") {
          debug(sh.exec(`playactor wake --host-name ${name}`))
          await mqtt.publish(`homeassistant/switch/${name}/state`, "ON")
        } else if (messagePayload === "OFF") {
          debug(sh.exec(`playactor standby --host-name ${name}`))
          await mqtt.publish(`homeassistant/switch/${name}/state`, "OFF")
        }
        return
      }

      if (command === "state" && isEmpty(messagePayload)) {
        const checkOutput = sh.exec(`playactor check --host-name ${name}`)
        debug(checkOutput)
        const status = JSON.parse(checkOutput).status
        const state =
          status === "Awake" ? "ON" : status === "Standby" ? "OFF" : "OFF"
        await mqtt.publish(`homeassistant/switch/${name}/state`, state)
      }
    } catch (e) {
      debug(e)
    }
  })
}

run()
