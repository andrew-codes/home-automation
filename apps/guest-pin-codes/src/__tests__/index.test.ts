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

test("sets up a heartbeat health check", async () => {
  await run()

  expect(createHeartbeat).toBeCalled()
})

test("subscribes to topic to initialize store with existing guest slots", async () => {
  await run()

  expect(mqttClient.subscribe).toBeCalledWith("guest/slot/all/state/set", {
    qos: 1,
  })
})

test("Slots are set and the app is then started upon receiving the guest/slot/all/state/set message", async () => {
  await run()
  const messageHandler = mqttClient.on.mock.calls[0][1]
  messageHandler(
    "guest/slot/all/state/set",
    JSON.stringify({
      slots: [
        {
          slotId: 4,
          eventId: "event1",
          pin: "123",
          start: "2023-07-06 00:00:00",
          end: "2023-07-06 01:00:00",
        },
      ],
      guestWifi: { ssid: "ssid", passPhrase: "pass" },
    }),
  )

  expect(store.dispatch).toBeCalledWith({
    type: "SET_GUEST_SLOTS",
    payload: [
      {
        slotId: 4,
        eventId: "event1",
        pin: "123",
        start: new Date("2023-07-06T00:00:00"),
        end: new Date("2023-07-06T01:00:00"),
        guestNetwork: { ssid: "ssid", passPhrase: "pass" },
      },
    ],
  })
  expect(start).toBeCalled()
})

test("publishes mqtt message that the application has started", async () => {
  await run()

  expect(mqttClient.publish).toBeCalledWith("guest/started", "", { qos: 1 })
})

test("Subsequent guest/slot/all/state/set messages will not start the app", async () => {
  await run()
  const messageHandler = mqttClient.on.mock.calls[0][1]
  messageHandler(
    "guest/slot/all/state/set",
    JSON.stringify({
      slots: [{ slotId: 4, eventId: "event1", pin: "123" }],
      guestWifi: { ssid: "ssid", passPhrase: "pass" },
    }),
  )
  messageHandler(
    "guest/slot/all/state/set",
    JSON.stringify({
      slots: [{ slotId: 4, eventId: "event1", pin: "123" }],
      guestWifi: { ssid: "ssid", passPhrase: "pass" },
    }),
  )

  expect(start).toBeCalledTimes(1)
})
