import createDebug from "debug"
import { createMqtt } from "@ha/mqtt-client"
import { createUnifi } from "@ha/unifi-client"

const debug = createDebug("@ha/guest-wifi-renewal")

const run = async (): Promise<void> => {
  const { UNIFI_IP, UNIFI_PASSWORD, UNIFI_PORT, UNIFI_USERNAME } = process.env
  const mqtt = await createMqtt()
  mqtt.subscribe("home/guests/renew-devices")

  const unifi = await createUnifi()
  await unifi.login(UNIFI_USERNAME, UNIFI_PASSWORD)

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
