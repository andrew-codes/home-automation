import { createLogger } from "@ha/logger"
import wol from "wakeonlan"
import { createHeartbeat } from "@ha/http-heartbeat"
import { createMqtt } from "@ha/mqtt-client"

const logger = createLogger()

async function run() {
  logger.info("Started")
  try {
    await createHeartbeat(null, null, 8081)

    const mqtt = await createMqtt()
    await mqtt.subscribe("homeassistant/wake-on-lan")

    const topicRegEx = /^homeassistant\/wake-on-lan/
    mqtt.on("message", async (topic, payload) => {
      logger.info("Message received", topic, payload)
      if (topicRegEx.test(topic)) {
        const matches = topicRegEx.exec(topic)
        if (!matches) {
          return
        }
        logger.info("Topic matched, sending wake on lan")
        const data = payload.toString()
        await wol(data)
      }
    })
  } catch (e) {
    logger.error(e)
  }
}

if (require.main === module) {
  run()
}

export default run
