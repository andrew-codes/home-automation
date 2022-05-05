import createDebugger from "debug"
import { merge } from "lodash"
import { put } from "redux-saga/effects"
import sh from "shelljs"
import type { ApplyToDeviceAction } from "../types"
import { setTransitioning, updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5-app/turnOnDevice")

function* turnOnDevice(action: ApplyToDeviceAction) {
  if (action.payload.on !== "ON") {
    return
  }

  yield put(
    setTransitioning(merge({}, action.payload.device, { transitioning: true }))
  )
  yield put(
    updateHomeAssistant(merge({}, action.payload.device, { status: "AWAKE" }))
  )
  debug(sh.exec(`playactor wake --ip ${action.payload.device.address.address}`))
}

export { turnOnDevice }
