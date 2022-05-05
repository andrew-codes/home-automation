import createDebugger from "debug"
import { put } from "redux-saga/effects"
import sh from "shelljs"
import type { ApplyToDeviceAction } from "../types"
import { updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5-app/turnOffDevice")

function* turnOffDevice(action: ApplyToDeviceAction) {
  if (action.payload.on === "OFF") {
    return
  }

  debug(
    sh.exec(`playactor standby --ip ${action.payload.device.address.address}`)
  )

  yield put(updateHomeAssistant(action.payload.device, action.payload.on))
}

export { turnOffDevice }
