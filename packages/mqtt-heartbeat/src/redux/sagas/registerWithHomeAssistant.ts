import { createMqtt } from "@ha/mqtt-client"
import { call, put } from "redux-saga/effects"
import { toEntityId, toFriendlyName } from "@ha/ha-entity-utils"
import { RegisterDeviceWithHomeAssistantAction } from "../actions.types"
import { poll } from "../actionCreators"

function* registerWithHomeAssistant(
  action: RegisterDeviceWithHomeAssistantAction,
) {
  const entityId = toEntityId(action.payload)
  const friendlyName = toFriendlyName(action.payload)

  const mqtt = yield call(createMqtt)
  yield call(
    [mqtt, mqtt.publish],
    `homeassistant/binary_sensor/${entityId}_status/config`,
    JSON.stringify({
      name: `${friendlyName} Status`,
      command_topic: `homeassistant/binary_sensor/${entityId}_status/set`,
      state_topic: `homeassistant/binary_sensor/${entityId}_status/state`,
      optimistic: true,
      object_id: `${entityId}_status`,
      unique_id: `${entityId}_status`,
      device_class: "connectivity",
    }),
    { qos: 1 },
  )

  yield put(poll(entityId))
}

export default registerWithHomeAssistant
