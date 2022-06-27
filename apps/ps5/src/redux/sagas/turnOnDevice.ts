import createDebugger from "debug"
import { merge } from "lodash"
import { put } from "redux-saga/effects"
import sh from "shelljs"
import type { ApplyToDeviceAction } from "../types"
import { setTransitioning, updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5/turnOnDevice")

function* turnOnDevice(action: ApplyToDeviceAction) {
  yield put(
    updateHomeAssistant(merge({}, action.payload.device, { status: "AWAKE" })),
  )

  if (
    action.payload.on !== "ON" ||
    action.payload.device.status !== "STANDBY"
  ) {
    return
  }

  yield put(
    setTransitioning(merge({}, action.payload.device, { transitioning: true })),
  )
  debug(
    sh.exec(`playactor wake --ip ${action.payload.device.address.address};`, {
      silent: true,
    }),
  )
}

export { turnOnDevice }
