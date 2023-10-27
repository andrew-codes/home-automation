jest.mock("@ha/http-heartbeat")
jest.mock("@ha/mqtt-client")
jest.mock("../app")
import { createHeartbeat } from "@ha/http-heartbeat"
import { createMqtt } from "@ha/mqtt-client"
import createApp from "../app"
import run from "../index"

let store
let mqttClient
const start = jest.fn()
beforeEach(() => {
  jest.resetAllMocks()
  store = { dispatch: jest.fn(), subscribe: jest.fn(), getState: jest.fn() }
  mqttClient = {
    on: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(),
  }
  ;(createMqtt as jest.Mock).mockResolvedValue(mqttClient)
  ;(createApp as jest.Mock).mockResolvedValue({ store, start })
})

beforeEach(() => {
  process.env.GUEST_PIN_CODES_CALENDAR_ID = "cal_id"
})

test("Exits early if no Calendar ID is provided.", async () => {
  delete process.env.GUEST_PIN_CODES_CALENDAR_ID
  await run()

  expect(createHeartbeat).not.toBeCalled()
})

test("Starts app.", async () => {
  await run()
  expect(start).toHaveBeenCalled()
})

test("sets up a heartbeat health check", async () => {
  await run()

  expect(createHeartbeat).toBeCalled()
})

test("Guest Wifi change MQTT messages dispatch action to update the guest wifi.", async () => {
  await run()
  const messageHandler = mqttClient.on.mock.calls[0][1]
  messageHandler(
    "homeassistant/sensor/guest_wifi_ssid/set",
    JSON.stringify({
      ssid: "ssid",
      passPhrase: "pass",
    }),
  )

  expect(store.dispatch).toBeCalledWith({
    type: "SET_GUEST_WIFI_NETWORK_INFORMATION",
    payload: {
      ssid: "ssid",
      passPhrase: "pass",
    },
  })
})

test("Slot removal MQTT messages dispatch action to remove the slot.", async () => {
  await run()
  const messageHandler = mqttClient.on.mock.calls[0][1]
  messageHandler("homeassistant/guest/slot/2/remove", "2")

  expect(store.dispatch).toBeCalledWith({
    type: "SLOT/REMOVE",
    payload: {
      slotId: "2",
    },
  })
})
