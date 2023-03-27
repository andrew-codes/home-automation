import type { AsyncMqttClient, ISubscriptionGrant } from "@ha/mqtt-client"
import { createLogger } from "@ha/logger"
import { call, put, select } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import type { RegisterWithHomeAssistantAction } from "../types"
import { addGuestWifiNetwork } from "../actionCreators"
import { getNetworkDictionary } from "../selectors"
import { QoS } from "async-mqtt"

const logger = createLogger()

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
    }),
    { qos: 1 },
  )

  const networks = yield select(getNetworkDictionary)
  if (!!networks[action.payload.id]) {
    logger.info("Network already found for ID")
    logger.info(networks)
    logger.info(action.payload.id)
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
  logger.info(
    `Subscribing to HA MQTT topic homeassistant/sensor/${action.payload.homeAssistantId}/set`,
  )
  yield call<(topic: string) => Promise<ISubscriptionGrant[]>>(
    mqtt.subscribe.bind(mqtt),
    `homeassistant/sensor/${action.payload.homeAssistantId}/set`,
  )
}

export default registerWithHomeAssistant
