import type { AsyncMqttClient, IPublishPacket } from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, select } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import type { UpdateHomeAssistantAction } from "../types"
import { getStateMappings } from "../selectors"

const debug = createDebugger("@ha/ps5-app/updateHomeAssistant")

function* updateHomeAssistant(action: UpdateHomeAssistantAction) {
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  const stateMappings = yield select(getStateMappings)
  yield call<
    (topic: string, message: string | Buffer) => Promise<IPublishPacket>
  >(
    mqtt.publish,
    `homeassistant/switch/${action.payload.device.homeAssistantId}/state`,
    stateMappings[action.payload.device.status]
  )
}

export { updateHomeAssistant }
