import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import handlers from './handlers'

const logger = createLogger()

async function run() {
  logger.info("Started")
  await createHeartbeat("game-library-updater")
  const mqtt = await createMqtt()
  await mqtt.subscribe('playnite/library/#')

  try {
    let messageCount = 0;
    mqtt.on("message", async (topic, payload) => {
      try {
        console.log(messageCount++, topic)
        await Promise.all(handlers
          .filter(handler => handler.shouldHandle(topic))
          .map(handler => handler.handle(topic, payload)))
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
