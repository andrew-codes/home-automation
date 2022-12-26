import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/http-heartbeat"
import handlers from "./handlers"

const logger = createLogger()

async function run() {
  logger.info("Started")
  await createHeartbeat()
  const mqtt = await createMqtt()
  await mqtt.subscribe("homeassistant/game_media_player/state")
  await mqtt.subscribe("playnite/library/game/state")

  try {
    mqtt.on("message", async (topic, payload) => {
      try {
        if (/playnite\/library\/.*/.test(topic)) {
          logger.info(`Topic: ${topic} received.`)
          await Promise.all(
            handlers
              .filter((handler) => handler.shouldHandle(topic))
              .map((handler) => handler.handle(topic, payload)),
          )
        }
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
