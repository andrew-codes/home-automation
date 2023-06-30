jest.mock("@ha/mqtt-client")
import { createMqtt } from "@ha/mqtt-client"
import { when } from "jest-when"
import { expectSaga } from "redux-saga-test-plan"
import { throwError } from "redux-saga-test-plan/providers"
import * as matchers from "redux-saga-test-plan/matchers"
import sagas from "../sagas"

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

test("Event title, slot ID, start, and end are published via mqtt", () => {
  const payload = {
    title: "Title 1",
    slotId: "1",
    start: "2020-01-01T00:00:00.000Z",
    end: "2020-01-01T00:00:00.000Z",
  }
  return expectSaga(sagas)
    .provide([[matchers.call(createMqtt), mqtt]])
    .call(
      [mqtt, mqtt.publish],
      "guests/assigned-slot",
      JSON.stringify({
        title: payload.title,
        slotId: 1,
        start: "2020-01-01T00:00:00.000Z",
        end: "2020-01-01T00:00:00.000Z",
      }),
      {
        qos: 1,
      },
    )
    .dispatch({ type: "ASSIGN_GUEST_SLOT", payload })
    .run()
})
