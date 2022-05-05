import type { AsyncMqttClient, IPublishPacket } from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, select } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import type { Device, UpdateHomeAssistantAction } from "../types"
import { getDevices, getStateMappings } from "../selectors"

const debug = createDebugger("@ha/ps5-app/updateHomeAssistant")

function* updateHomeAssistant(action: UpdateHomeAssistantAction) {
  const devices: Device[] = yield select(getDevices)
  const oldDeviceState = devices.find(
    (device) => device.id === action.payload.device.id
  )
  debug(devices, action.payload.device.id)
  debug("Old device", oldDeviceState)
  // if (
  //   !!oldDeviceState &&
  //   oldDeviceState?.status === action.payload.device.status
  // ) {
  //   debug("No updates")

  //   return
  // }

  const mqtt: AsyncMqttClient = yield call(createMqtt)
  const stateMappings = yield select(getStateMappings)
  yield call<
    (topic: string, message: string | Buffer) => Promise<IPublishPacket>
  >(
    mqtt.publish.bind(mqtt),
    `homeassistant/switch/${action.payload.device.homeAssistantId}/state`,
    stateMappings[action.payload.device.status]
  )
}

export { updateHomeAssistant }
