jest.mock("@ha/mqtt-client")
import { createMqtt } from "@ha/mqtt-client"
import { expectSaga } from "redux-saga-test-plan"
import { throwError } from "redux-saga-test-plan/providers"
import * as matchers from "redux-saga-test-plan/matchers"
import sagas from "../sagas"
import parseUtcToLocalDate from "../parseUtcToLocalDate"

let mqtt

beforeEach(() => {
  jest.resetAllMocks()
  mqtt = {
    publish: jest.fn(),
  }
  ;(createMqtt as jest.Mock).mockReturnValue(mqtt)
})

test("Network errors do not crash saga", async () => {
  return expectSaga(sagas)
    .provide([[matchers.call(createMqtt), throwError(new Error("MQTT Error"))]])
    .call(createMqtt)
    .dispatch({ type: "ASSIGN_GUEST_SLOT", payload: {} })
    .run()
})

test("Event ID, PIN, title, slot ID, start, and end are published via mqtt", () => {
  const payload = {
    title: "Title 1",
    eventId: "event1",
    pin: "1234",
    slotId: "1",
    start: parseUtcToLocalDate(
      "2023-06-30T23:30:00.0000000",
      "Eastern Standard Time",
    ),
    end: parseUtcToLocalDate(
      "2023-06-30T23:35:00.0000000",
      "Eastern Standard Time",
    ),
  }
  return expectSaga(sagas)
    .provide([[matchers.call(createMqtt), mqtt]])
    .call(
      [mqtt, mqtt.publish],
      `guest/slot/${payload.slotId}/set`,
      JSON.stringify({
        eventId: payload.eventId,
        title: payload.title,
        slotId: 1,
        pin: "1234",
        start: "2023-06-30T19:30:00.000Z",
        end: "2023-06-30T19:35:00.000Z",
      }),
      {
        qos: 1,
      },
    )
    .dispatch({ type: "ASSIGN_GUEST_SLOT", payload })
    .run()
})
