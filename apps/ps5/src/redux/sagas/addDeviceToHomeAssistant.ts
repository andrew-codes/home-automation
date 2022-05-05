import type {
  AsyncMqttClient,
  IPublishPacket,
  ISubscriptionGrant,
} from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, put, select } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import type { AddDeviceAction } from "../types"
import { updateHomeAssistant } from "../actionCreators"
import { getStateMappings } from "../selectors"

const debug = createDebugger("@ha/ps5-app/addDevice")

function* addDeviceToHomeAssistant(action: AddDeviceAction) {
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  yield call<
    (topic: string, message: string | Buffer) => Promise<IPublishPacket>
  >(
    mqtt.publish.bind(mqtt),
    `homeassistant/switch/${action.payload.homeAssistantId}/config`,
    JSON.stringify({
      name: action.payload.name,
      command_topic: `homeassistant/switch/${action.payload.homeAssistantId}/set`,
      state_topic: `homeassistant/switch/${action.payload.homeAssistantId}/state`,
    })
  )

  const stateMappings = yield select(getStateMappings)
  yield put(
    updateHomeAssistant(action.payload, stateMappings[action.payload.status])
  )

  yield call<(topic: string) => Promise<ISubscriptionGrant[]>>(
    mqtt.subscribe.bind(mqtt),
    `homeassistant/switch/${action.payload.homeAssistantId}/set`
  )
}

export { addDeviceToHomeAssistant }
