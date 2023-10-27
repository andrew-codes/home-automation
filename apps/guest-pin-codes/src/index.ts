import { createHeartbeat } from "@ha/http-heartbeat"
import { createMqtt } from "@ha/mqtt-client"
import createDebugger from "debug"
import { setGuestWifiNetworkInformation } from "./actionCreators"
import createApp from "./app"

const debug = createDebugger("@ha/guest-pin-codes/index")

const run = async () => {
  debug("Started")

  const {
    GUEST_PIN_CODES_CALENDAR_ID,
    GUEST_PIN_CODES_DOOR_LOCKS,
    GUEST_PIN_CODES_GUEST_CODE_INDEX_OFFSET,
    GUEST_PIN_CODES_NUMBER_OF_GUEST_CODES,
  } = process.env

  if (!GUEST_PIN_CODES_CALENDAR_ID) {
    debug("No Calendar ID; exiting")

    return
  }

  await createHeartbeat()

  const app = await createApp(
    GUEST_PIN_CODES_DOOR_LOCKS ?? "",
    Number(GUEST_PIN_CODES_GUEST_CODE_INDEX_OFFSET),
    Number(GUEST_PIN_CODES_NUMBER_OF_GUEST_CODES),
    GUEST_PIN_CODES_CALENDAR_ID,
  )

  const mqtt = await createMqtt()
  mqtt.subscribe("homeassistant/sensor/+/set", { qos: 1 })
  mqtt.subscribe("homeassistant/guest/slot/+/remove", { qos: 1 })

  const matchesSetGuestWifiTopic = (topic) =>
    /^homeassistant\/sensor\/guest_wifi_(.*)\/set$/.test(topic)
  const matchesSlotRemoval = (topic) =>
    /^homeassistant\/guest\/slot\/(\d+)\/remove$/.test(topic)

  mqtt.on("message", (topic, message) => {
    if (matchesSetGuestWifiTopic(topic)) {
      const { ssid, passPhrase } = JSON.parse(message.toString())
      app.store.dispatch(setGuestWifiNetworkInformation(ssid, passPhrase))
    }

    if (matchesSlotRemoval(topic)) {
      app.store.dispatch({
        type: "SLOT/REMOVE",
        payload: {
          slotId: message.toString(),
        },
      })
    }
  })

  app.start()
}

if (require.main === module) {
  run()
}

export default run
