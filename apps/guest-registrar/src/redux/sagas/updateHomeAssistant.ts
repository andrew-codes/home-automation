import type { AsyncMqttClient, IPublishPacket } from "@ha/mqtt-client"
import { createLogger } from "@ha/logger"
import { call } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import type { UpdateHomeAssistantAction } from "../types"

const logger = createLogger()

function* updateHomeAssistant(action: UpdateHomeAssistantAction) {
  logger.info(action.payload)
  logger.info(action.payload)
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos }: { qos: number },
    ) => Promise<IPublishPacket>
  >(
    mqtt.publish.bind(mqtt),
    `homeassistant/sensor/${action.payload.homeAssistantId}/state`,
    action.payload.passPhrase,
    { qos: 1 },
  )
}

export default updateHomeAssistant
