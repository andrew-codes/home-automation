import { createHeartbeat } from "@ha/http-heartbeat"
import { createMqtt } from "@ha/mqtt-client"
import createDebugger from "debug"
import createApp from "./app"

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
  mqtt.on("message", (topic, message) => {
    app.store.dispatch({
      type: "SET_GUEST_SLOTS",
      payload: JSON.parse(message.toString()).slots,
    })

    if (appStarted) {
      return
    }

    app.start()
    appStarted = true
  })

  mqtt.publish("guest/started", "", { qos: 1 })
}

if (require.main === module) {
  run()
}

export default run
