import createDebugger from "debug"
import wol from "wakeonlan"
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import { createMqtt } from "@ha/mqtt-client"

const debug = createDebugger("@ha/wake-on-lan/index")

async function run() {
  debug("Started")
  try {
    await createHeartbeat("wake-on-lan")

    const mqtt = await createMqtt()
    await mqtt.subscribe("homeassistant/wake-on-lan")

    const topicRegEx = /^homeassistant\/wake-on-lan/
    mqtt.on("message", async (topic, payload) => {
      debug(`Message received ${topic}`)
      if (topicRegEx.test(topic)) {
        const matches = topicRegEx.exec(topic)
        if (!matches) {
          return
        }
        debug("Topic matched, sending wake on lan")
        const data = payload.toString()
        await wol(data)
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
