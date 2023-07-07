import { createHeartbeat } from "@ha/http-heartbeat"
import { createMqtt } from "@ha/mqtt-client"
import { isEmpty, merge } from "lodash"
import createDebugger from "debug"
import createApp from "./app"
import { setGuestWifiNetworkInformation } from "./actionCreators"

const {
  GUEST_PIN_CODES_DOOR_LOCKS,
  GUEST_PIN_CODES_GUEST_CODE_INDEX_OFFSET,
  GUEST_PIN_CODES_NUMBER_OF_GUEST_CODES,
} = process.env
const debug = createDebugger("@ha/guest-pin-codes/index")

const run = async () => {
  debug("Started")
  await createHeartbeat()

  const app = await createApp(
    GUEST_PIN_CODES_DOOR_LOCKS ?? "",
    Number(GUEST_PIN_CODES_GUEST_CODE_INDEX_OFFSET),
    Number(GUEST_PIN_CODES_NUMBER_OF_GUEST_CODES),
  )
  let appStarted = false

  const mqtt = await createMqtt()
  mqtt.subscribe("guest/slot/all/state/set", { qos: 1 })
  mqtt.subscribe("homeassistant/sensor/+/set")
  const topicRegEx = /^homeassistant\/sensor\/guest_wifi_(.*)\/state$/
  mqtt.on("message", (topic, message) => {
    if (topic === "guest/slot/all/state/set") {
      const { slots, guestWifi } = JSON.parse(message.toString())
      app.store.dispatch(
        setGuestWifiNetworkInformation(guestWifi.ssid, guestWifi.passPhrase),
      )
      app.store.dispatch({
        type: "SET_GUEST_SLOTS",
        payload: slots.map((slot: any) =>
          merge({}, slot, {
            guestNetwork: guestWifi,
            start: new Date(slot.start),
            end: new Date(slot.end),
          }),
        ),
      })

      if (appStarted) {
        return
      }

      app.start()
      appStarted = true
      return
    }

    if (!appStarted) {
      return
    }

    const matches = topicRegEx.exec(topic)
    if (!isEmpty(matches)) {
      const { ssid, passPhrase } = JSON.parse(message.toString())
      app.store.dispatch(setGuestWifiNetworkInformation(ssid, passPhrase))
    }
  })

  mqtt.publish("guest/started", "", { qos: 1 })
}

if (require.main === module) {
  run()
}

export default run
