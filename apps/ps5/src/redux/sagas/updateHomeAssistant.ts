import { createLogger } from "@ha/logger"
import type { AsyncMqttClient, IPublishPacket } from "@ha/mqtt-client"
import { call } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import type { UpdateHomeAssistantAction } from "../types"

const logger = createLogger()

function* updateHomeAssistant(action: UpdateHomeAssistantAction) {
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  logger.info(action.payload)
  logger.info(action.payload)
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos: number },
    ) => Promise<IPublishPacket>
  >(
    mqtt.publish.bind(mqtt),
    `playstation/${action.payload.device.id}`,
    JSON.stringify({
      power: action.payload.device.status,
      device_status: action.payload.device.available ? "online" : "offline",
    }),
    { qos: 1 },
  )
}

export { updateHomeAssistant }
