import { createHeartbeat } from "@ha/http-heartbeat"
import { createMqtt } from "@ha/mqtt-client"
import createDebugger from "debug"
import createApp from "./app"
import { setWifi } from "./state/wifi.slice"

const debug = createDebugger("@ha/guest-pin-codes/index")
const debugStateChanges = createDebugger(
  "@ha/guest-pin-codes/index:state-changes",
)

const run = async () => {
  debug("Started")

  const { GUEST_PIN_CODES_CALENDAR_ID, GUEST_PIN_CODES_NUMBER_OF_GUEST_CODES } =
    process.env

  if (!GUEST_PIN_CODES_CALENDAR_ID) {
    debug("No Calendar ID; exiting")

    return
  }

  await createHeartbeat()

  const app = await createApp(
    Number(GUEST_PIN_CODES_NUMBER_OF_GUEST_CODES),
    GUEST_PIN_CODES_CALENDAR_ID,
  )

  const mqtt = await createMqtt()
  mqtt.subscribe("homeassistant/sensor/+/set", { qos: 1 })

  const matchesSetGuestWifiTopic = (topic) =>
    /^homeassistant\/sensor\/guest_wifi_(.*)\/set$/.test(topic)

  mqtt.on("message", (topic, message) => {
    if (matchesSetGuestWifiTopic(topic)) {
      const { ssid, passPhrase } = JSON.parse(message.toString())
      app.store.dispatch(setWifi({ ssid, passPhrase }))
    }
  })

  app.start()

  app.store.subscribe(() => {
    debugStateChanges("State changed to", app.store.getState())
  })
}

if (require.main === module) {
  run()
}

export default run
