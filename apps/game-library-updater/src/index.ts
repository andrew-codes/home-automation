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
  await mqtt.subscribe("homeassistant/button/GAMING-PC/#/action")

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
        } else if (
          topic ===
          "homeassistant/button/GAMING-PC/GAMING-PC_start-playnite/action"
        ) {
          logger.info("Starting a library refresh")
        } else if (
          topic === "homeassistant/button/GAMING-PC/GAMING-PC_run/action" &&
          payload.toString() ===
            "Get-WmiObject -Filter \"Name LIKE 'Playnite%'\" -Class Win32_Process | Select-Object -ExpandProperty ProcessId | ForEach { stop-process $_ }"
        ) {
          logger.info("Stopping a library refresh")
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
