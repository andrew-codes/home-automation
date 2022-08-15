import createDebugger from "debug"
import { merge } from "lodash"
import { put } from "redux-saga/effects"
import sh from "shelljs"
import { throwIfError } from '@ha/shell-utils'
import type { ApplyToDeviceAction } from "../types"
import { setTransitioning, updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5/turnOffDevice")

function* turnOffDevice(action: ApplyToDeviceAction) {
  if (
    action.payload.device.status !== "STANDBY"
  ) {
    return
  }

  yield put(
    setTransitioning(merge({}, action.payload.device, { transitioning: true })),
  )

  debug(`Turning off device ${action.payload.device.address.address}`)
  try {
    throwIfError(sh.exec(
      `playactor standby --ip ${action.payload.device.address.address} --timeout 5000 --connect-timeout 5000 --no-open-urls --no-auth;`,
      { timeout: 5000 }
    ))

    yield put(
      updateHomeAssistant(
        merge({}, action.payload.device, { status: "STANDBY", available: false })
      )
    )
  } catch (e) {
    debug(e)
  }

}

export { turnOffDevice }
