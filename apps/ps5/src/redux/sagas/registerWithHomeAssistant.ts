import type {
  AsyncMqttClient,
  IPublishPacket,
  ISubscriptionGrant,
} from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, put, select } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import { merge } from "lodash"
import type { RegisterDeviceWithHomeAssistantAction } from "../types"
import { addDevice, updateHomeAssistant } from "../actionCreators"
import { getDevices } from "../selectors"

const debug = createDebugger("@ha/ps5-app/addDevice")

function* registerWithHomeAssistant(
  action: RegisterDeviceWithHomeAssistantAction
) {
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos: number }
    ) => Promise<IPublishPacket>
  >(
    mqtt.publish.bind(mqtt),
    `homeassistant/switch/${action.payload.homeAssistantId}/config`,
    JSON.stringify({
      name: action.payload.name,
      command_topic: `homeassistant/switch/${action.payload.homeAssistantId}/set`,
      state_topic: `homeassistant/switch/${action.payload.homeAssistantId}/state`,
      optimistic: true,
      device_class: "switch",
      unique_id: action.payload.homeAssistantId,
    }),
    { qos: 1 }
  )

  const devices = yield select(getDevices)
  if (!!devices[action.payload.id]) {
    return
  }

  yield put(addDevice(action.payload))
  yield put(updateHomeAssistant(action.payload))
  yield call<(topic: string) => Promise<ISubscriptionGrant[]>>(
    mqtt.subscribe.bind(mqtt),
    `homeassistant/switch/${action.payload.homeAssistantId}/set`
  )
}

export { registerWithHomeAssistant }
