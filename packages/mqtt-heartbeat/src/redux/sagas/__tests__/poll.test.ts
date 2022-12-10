import { expectSaga } from "redux-saga-test-plan"
import { delay } from "@ha/side-effects"
import { createMqtt } from "@ha/mqtt-client"
import saga from ".."
import { poll, updateHomeAssistant } from "../../actionCreators"
import { call } from "redux-saga/effects"

describe("registerWithHomeAssistant saga", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test("publishes MQTT topic to register sensor with Home Assistant", () => {
    return expectSaga(saga)
      .provide([[call(createMqtt), { publish: jest.fn() }]])
      .dispatch(poll("service_name"))
      .put(updateHomeAssistant("service_name"))
      .call.like({ fn: delay, args: [60000] })
      .silentRun(2000)
  })
})
