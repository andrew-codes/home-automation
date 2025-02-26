import { logger } from "@ha/logger"
import type { AsyncMqttClient } from "@ha/mqtt-client"
import { createMqtt } from "@ha/mqtt-client"
import { QoS } from "async-mqtt"
import { call, put, select } from "redux-saga/effects"
import { addGuestWifiNetwork } from "../actionCreators"
import { getNetworkDictionary } from "../selectors"
import type { RegisterWithHomeAssistantAction } from "../types"

function* registerWithHomeAssistant(action: RegisterWithHomeAssistantAction) {
  logger.info(action.payload)
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos }: { qos: QoS },
    ) => Promise<void>
  >(
    mqtt.publish.bind(mqtt),
    `homeassistant/sensor/${action.payload.homeAssistantId}/config`,
    JSON.stringify({
      name: `Guest Wifi ${action.payload.name}`,
      command_topic: `homeassistant/sensor/${action.payload.homeAssistantId}/set`,
      state_topic: `homeassistant/sensor/${action.payload.homeAssistantId}/state`,
      optimistic: true,
      object_id: action.payload.homeAssistantId,
      unique_id: action.payload.homeAssistantId,
      value_template: "{{ value_json.passPhrase }}",
    }),
    { qos: 1 },
  )

  const networks = yield select(getNetworkDictionary)
  if (!!networks[action.payload.id]) {
    logger.info("Network already found for ID")

    return
  }

  yield put(
    addGuestWifiNetwork(
      action.payload.id,
      action.payload.name,
      action.payload.homeAssistantId,
      action.payload.passPhrase,
    ),
  )
}

export default registerWithHomeAssistant
