import { createLogger } from "@ha/logger"
import type { AsyncMqttClient } from "@ha/mqtt-client"
import { createMqtt } from "@ha/mqtt-client"
import { QoS } from "async-mqtt"
import { call } from "redux-saga/effects"
import type { UpdateHomeAssistantAction } from "../types"

const logger = createLogger()

function* updateHomeAssistant(action: UpdateHomeAssistantAction) {
  logger.info(action.payload)
  if (!action.payload.passPhrase || !action.payload.ssid) {
    return
  }
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos }: { qos: QoS },
    ) => Promise<void>
  >(
    mqtt.publish.bind(mqtt),
    `homeassistant/sensor/${action.payload.homeAssistantId}/state`,
    JSON.stringify({
      passPhrase: action.payload.passPhrase,
      ssid: action.payload.ssid,
    }),
    { qos: 1 },
  )
}

export default updateHomeAssistant
