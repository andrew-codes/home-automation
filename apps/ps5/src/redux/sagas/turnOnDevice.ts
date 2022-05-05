import type { AsyncMqttClient } from "@ha/mqtt-client"
import createDebugger from "debug"
import { call, put } from "redux-saga/effects"
import sh from "shelljs"
import { createMqtt } from "@ha/mqtt-client"
import type { ApplyToDeviceAction } from "../types"
import { updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5-app/turnOnDevice")

function* turnOnDevice(action: ApplyToDeviceAction) {
  if (action.payload.on === "ON") {
    return
  }

  debug(sh.exec(`playactor wake --ip ${action.payload.device.address.address}`))

  yield put(updateHomeAssistant(action.payload.device, action.payload.on))
}

export { turnOnDevice }
