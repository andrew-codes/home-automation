import { createMqtt } from "@ha/mqtt-client"
import { call } from "redux-saga/effects"
import { UpdateHomeAssistantAction } from "../actions.types"
import createDebugger from "debug"

const debug = createDebugger("@ha/mqtt-heartbeat/updateHomeAssistantSaga")

function* updateHomeAssistant(action: UpdateHomeAssistantAction) {
  const mqtt = yield call(createMqtt)
  debug("Updating HA via MQTT")
  yield call(
    [mqtt, mqtt.publish],
    `homeassistant/binary_sensor/${action.payload}_status/state`,
    "on",
  )
}

export default updateHomeAssistant
