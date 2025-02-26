import { createHeartbeat } from "@ha/http-heartbeat"
import { logger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createUnifi } from "@ha/unifi-client"

const run = async (): Promise<void> => {
  await createHeartbeat()

  const mqtt = await createMqtt()
  mqtt.subscribe("homeassistant/group/guests/renew")

  const unifi = await createUnifi()

  mqtt.on("message", async (topic, payload) => {
    try {
      logger.info("Message received")
      logger.info(topic)
      logger.info(payload)
      if (topic !== "homeassistant/group/guests/renew") return
      const macAddresses = payload.toString().replace(/ /g, "").split(",")
      for (const mac of macAddresses) {
        logger.info(mac)
        await unifi.authorizeGuest(mac, 4320)
      }
    } catch (error) {
      logger.error(error)
    }
  })
}

export default run
