import createDebugger from "debug"
import { delay, put } from "redux-saga/effects"
import sh from "shelljs"
import type { ApplyToDeviceAction } from "../types"
import { pollDevices, updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5-app/turnOffDevice")

function* turnOffDevice(action: ApplyToDeviceAction) {
  debug(
    sh.exec(`playactor standby --ip ${action.payload.device.address.address}`)
  )
  yield delay(7000)
  yield put(pollDevices())
}

export { turnOffDevice }
