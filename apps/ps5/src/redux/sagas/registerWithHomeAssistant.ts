import type {
  AsyncMqttClient,
  IPublishPacket,
} from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, put, select } from "redux-saga/effects"
import { createMqtt } from "@ha/mqtt-client"
import type { RegisterDeviceWithHomeAssistantAction } from "../types"
import { addDevice, updateHomeAssistant } from "../actionCreators"
import { getDevices } from "../selectors"

const debug = createDebugger("@ha/ps5/addDevice")

function* registerWithHomeAssistant(
  action: RegisterDeviceWithHomeAssistantAction
) {
  debug(`Registering with HA ${action.payload.name}`)
  const mqtt: AsyncMqttClient = yield call(createMqtt)
  yield call<
    (
      topic: string,
      message: string | Buffer,
      { qos: number }
    ) => Promise<IPublishPacket>
  >(
    mqtt.publish.bind(mqtt),
    `homeassistant/switch/${action.payload.id}/power/config`,
    JSON.stringify({
      availability: [
        {
          topic: `playstation/${action.payload.id}`,
          value_template: "{{ value_json.device_status }}"
        }
      ],
      name: `${action.payload.name} Power`,
      command_topic: `playstation/${action.payload.id}/set/power`,
      state_topic: `playstation/${action.payload.id}`,
      optimistic: false,
      icon: "mdi:sony-playstation",
      state_on: "AWAKE",
      state_off: "STANDBY",
      payload_on: "AWAKE",
      payload_off: "STANDBY",
      unique_id: `${action.payload.normalizedName}_switch_power`,
      device: {
        manufacturer: "Sony",
        model: `Playstation ${action.payload.type === 'PS5' ? '5' : '4'}`,
        name: action.payload.name,
        identifiers: [action.payload.id],
        sw_version: action.payload.systemVersion
      }
    }),
    { qos: 1 }
  )

  const devices = yield select(getDevices)
  if (!!devices[action.payload.id]) {
    return
  }

  yield put(addDevice(action.payload))
  yield put(updateHomeAssistant(action.payload))
}

export { registerWithHomeAssistant }
