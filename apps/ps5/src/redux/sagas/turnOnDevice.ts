import createDebugger from "debug"
import { merge } from "lodash"
import { delay, put } from "redux-saga/effects"
import sh from "shelljs"
import type { ApplyToDeviceAction } from "../types"
import { pollDevices, updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5-app/turnOnDevice")

function* turnOnDevice(action: ApplyToDeviceAction) {
  if (action.payload.on !== "ON") {
    return
  }

  yield put(
    updateHomeAssistant(merge({}, action.payload.device, { status: "AWAKE" }))
  )
  debug(sh.exec(`playactor wake --ip ${action.payload.device.address.address}`))
  yield delay(7000)
  yield put(pollDevices())
}

export { turnOnDevice }
