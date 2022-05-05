import createDebugger from "debug"
import { merge } from "lodash"
import { delay, put } from "redux-saga/effects"
import sh from "shelljs"
import type { ApplyToDeviceAction } from "../types"
import { pollDevices, updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5-app/turnOffDevice")

function* turnOffDevice(action: ApplyToDeviceAction) {
  if (action.payload.on !== "OFF") {
    return
  }

  yield put(
    updateHomeAssistant(merge({}, action.payload.device, { status: "STANDBY" }))
  )
  debug(
    sh.exec(`playactor standby --ip ${action.payload.device.address.address}`)
  )
  yield delay(7000)
  yield put(pollDevices())
}

export { turnOffDevice }
