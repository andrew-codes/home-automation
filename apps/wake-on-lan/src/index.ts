import createDebugger from "debug"
import sh from "shelljs"
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import { createMqtt } from "@ha/mqtt-client"
import { throwIfError } from "@ha/shell-utils"

const debug = createDebugger("@ha/wake-on-lan/index")

async function run() {
  debug("Started")
  try {
    await createHeartbeat("wake-on-lan")

    const mqtt = await createMqtt()

    const topicRegEx = /^homeassistant\/wake-on-lan/
    mqtt.on("message", (topic, payload) => {
      if (topicRegEx.test(topic)) {
        const matches = topicRegEx.exec(topic)
        if (!matches) {
          return
        }
        const data = payload.toString()
        throwIfError(sh.exec(`wakeonlan ${data}`))
      }
    })
  } catch (e) {
    debug(e)
  }
}

if (require.main === module) {
  run()
}

export default run
