import { expectSaga } from "redux-saga-test-plan"
import { createMqtt } from "@ha/mqtt-client"
import saga from ".."
import { updateHomeAssistant } from "../../actionCreators"
import { call } from "redux-saga/effects"

describe("update home assistant saga", () => {
  const publish = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test("publishes MQTT topic to update sensor in Home Assistant", () => {
    return expectSaga(saga)
      .provide([[call(createMqtt), { publish }]])
      .dispatch(updateHomeAssistant("service_name"))
      .call.like({
        fn: publish,
        args: ["homeassistant/binary_sensor/service_name_status/state", "ON"],
      })
      .run()
  })
})
