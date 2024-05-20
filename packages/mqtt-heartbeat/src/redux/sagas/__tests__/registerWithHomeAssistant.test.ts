jest.mock("@ha/ha-entity-utils")
import { createMqtt } from "@ha/mqtt-client"
import { expectSaga } from "redux-saga-test-plan"
import { call } from "redux-saga/effects"
import { when } from "jest-when"
import saga from "../"
import { poll, registerWithHomeAssistant } from "../../actionCreators"
import { toEntityId, toFriendlyName } from "@ha/ha-entity-utils"

describe("registerWithHomeAssistant saga", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test("publishes MQTT topic to register sensor with Home Assistant", () => {
    const publish = jest.fn()
    when(toEntityId).calledWith("serviceName").mockReturnValue("service_name")
    when(toFriendlyName)
      .calledWith("serviceName")
      .mockReturnValue("Service Name")

    return expectSaga(saga)
      .provide([[call(createMqtt), { publish }]])
      .dispatch(registerWithHomeAssistant("serviceName"))
      .call.like({
        fn: publish,
        args: [
          "homeassistant/binary_sensor/service_name_status/config",
          JSON.stringify({
            name: `Service Name Status`,
            command_topic: `homeassistant/binary_sensor/service_name_status/set`,
            state_topic: `homeassistant/binary_sensor/service_name_status/state`,
            optimistic: true,
            object_id: "service_name_status",
            unique_id: "service_name_status",
            device_class: "connectivity",
          }),
          { qos: 1 },
        ],
      })
      .put(poll("service_name"))
      .run()
  })
})
