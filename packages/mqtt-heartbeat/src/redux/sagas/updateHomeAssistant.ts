import { logger } from "@ha/logger"
import { createMqtt } from "@ha/mqtt-client"
import { call } from "redux-saga/effects"
import { UpdateHomeAssistantAction } from "../actions.types"

function* updateHomeAssistant(action: UpdateHomeAssistantAction) {
  const mqtt = yield call(createMqtt)
  logger.silly("MQTT hearbeat")
  yield call(
    [mqtt, mqtt.publish],
    `homeassistant/binary_sensor/${action.payload}_status/state`,
    "ON",
  )
}

export default updateHomeAssistant
