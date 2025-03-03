import { logger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import wol from "wakeonlan"

logger.info("Starting wake-on-lan app")

async function run() {
  logger.info("Started")
  try {
    await createHeartbeat("wake-on-lan")

    const mqtt = await createMqtt()
    await mqtt.subscribe("homeassistant/wake-on-lan")

    const topicRegEx = /^homeassistant\/wake-on-lan/
    mqtt.on("message", async (topic, payload) => {
      logger.info(`Message received for ${topic}.`)
      logger.debug(payload.toString())
      if (topicRegEx.test(topic)) {
        const matches = topicRegEx.exec(topic)
        if (!matches) {
          return
        }

        logger.info("Topic matched. Sending wake on lan.")
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
