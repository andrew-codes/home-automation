import createDebug from "debug"
import { createMqtt } from "@ha/mqtt-client"
import { createMqttHeartbeat } from "@ha/mqtt-heartbeat"
import { createUnifi } from "@ha/unifi-client"

const debug = createDebug("@ha/guest-wifi-renewal")

const run = async (): Promise<void> => {
  await createMqttHeartbeat("guest-wifi-renewal-service")

  const mqtt = await createMqtt()
  mqtt.subscribe("home/guests/renew-devices")

  const unifi = await createUnifi()

  mqtt.on("message", async (topic, payload) => {
    try {
      if (topic !== "home/guests/renew-devices") return
      const macAddresses = payload.toString().replace(/ /g, "").split(",")
      for (const mac of macAddresses) {
        debug(mac)
        await unifi.authorizeGuest(mac, 4320)
      }
    } catch (error) {
      debug(error)
    }
  })
}

export default run
