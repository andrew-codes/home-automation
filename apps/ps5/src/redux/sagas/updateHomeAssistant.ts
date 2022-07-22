import createDebugger from "debug"
import type { AsyncMqttClient, IPublishPacket } from "@ha/mqtt-client"
import { call, select } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import type { UpdateHomeAssistantAction } from "../types"
import { getStateMappings } from "../selectors"

const debug = createDebugger("@ha/ps5/updateHomeAssistant")

function* updateHomeAssistant(action: UpdateHomeAssistantAction) {
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  const stateMappings = yield select(getStateMappings)
  debug("Update PS state in HA")
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos: number },
    ) => Promise<IPublishPacket>
  >(
    mqtt.publish.bind(mqtt),
    `homeassistant/switch/${action.payload.device.homeAssistantId}/state`,
    stateMappings[action.payload.device.status],
    { qos: 1 },
  )
}

export { updateHomeAssistant }
