import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/http-heartbeat"
import handlers from "./handlers"

const logger = createLogger()

async function run() {
  logger.info("Started")
  await createHeartbeat()
  const mqtt = await createMqtt()
  await mqtt.subscribe("playnite/library/#")

  try {
    mqtt.on("message", async (topic, payload) => {
      try {
        logger.info(`Topic: ${topic} received.`)
        logger.info(`Start handling topic.`)
        await Promise.all(
          handlers
            .filter((handler) => handler.shouldHandle(topic))
            .map((handler) => handler.handle(topic, payload)),
        )
        logger.info("Ending topic handling.")
      } catch (error) {
        logger.error(error)
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
