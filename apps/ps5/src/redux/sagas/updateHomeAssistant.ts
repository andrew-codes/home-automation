import { createLogger } from "@ha/logger"
import type { AsyncMqttClient, IPublishPacket } from "@ha/mqtt-client"
import { call } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import type { UpdateHomeAssistantAction } from "../types"

const logger = createLogger()

function* updateHomeAssistant(action: UpdateHomeAssistantAction) {
  logger.info("Updating HA")
  logger.debug(JSON.stringify(action.payload, null, 2))
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos }: { qos: number },
    ) => Promise<IPublishPacket>
  >(
    mqtt.publish.bind(mqtt),
    `playstation/${action.payload.device.id}/available`,
    action.payload.device.available ? "online" : "offline",
    { qos: 1 },
  )
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos }: { qos: number },
    ) => Promise<IPublishPacket>
  >(
    mqtt.publish.bind(mqtt),
    `playstation/${action.payload.device.id}/state`,
    action.payload.device.status,
    { qos: 1 },
  )
}

export { updateHomeAssistant }
