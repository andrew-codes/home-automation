import type { AsyncMqttClient, IPublishPacket } from "@ha/mqtt-client"
import createDebugger from "debug"
import { call } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import type { UpdateHomeAssistantAction } from "../types"

const debug = createDebugger("@ha/ps5/registerWithHomeAssistant")

function* updateHomeAssistant(action: UpdateHomeAssistantAction) {
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos: number }
    ) => Promise<IPublishPacket>
  >(
    mqtt.publish.bind(mqtt),
    `homeassistant/sensor/${action.payload.homeAssistantId}/state`,
    action.payload.passPhrase,
    { qos: 1 }
  )
}

export default updateHomeAssistant
