import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/mqtt-heartbeat"

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
