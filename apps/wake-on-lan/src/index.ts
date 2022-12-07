import { createLogger } from "@ha/logger"
import wol from "wakeonlan"
import { createHeartbeat } from "@ha/http-heartbeat"
import { createMqtt } from "@ha/mqtt-client"

const logger = createLogger()

async function run() {
  logger.info("Started")
  try {
    await createHeartbeat()

    const mqtt = await createMqtt()
    await mqtt.subscribe("homeassistant/wake-on-lan")

    const topicRegEx = /^homeassistant\/wake-on-lan/
    mqtt.on("message", async (topic, payload) => {
      logger.info("Message received")
      logger.info(topic)
      logger.info(payload)
      if (topicRegEx.test(topic)) {
        const matches = topicRegEx.exec(topic)
        if (!matches) {
          return
        }
        logger.info("Topic matched")
        logger.info("sending wake on lan")
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
