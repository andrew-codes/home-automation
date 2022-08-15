import { createLogger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import { createUnifi } from "@ha/unifi-client"

const logger = createLogger()

const run = async (): Promise<void> => {
  await createHeartbeat("guest-wifi-renewal-service")

  const mqtt = await createMqtt()
  mqtt.subscribe("homeassistant/group/guest/renew")

  const unifi = await createUnifi()

  mqtt.on("message", async (topic, payload) => {
    try {
      logger.info('Mmessage received', topic, payload)
      if (topic !== "homeassistant/group/guest/renew") return
      const macAddresses = payload.toString().replace(/ /g, "").split(",")
      for (const mac of macAddresses) {
        logger.info('Authorizing MAC', mac)
        await unifi.authorizeGuest(mac, 4320)
      }
    } catch (error) {
      logger.error(error)
    }
  })
}

export default run
