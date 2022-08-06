import createDebugger from "debug"
import { merge } from "lodash"
import { put } from "redux-saga/effects"
import sh from "shelljs"
import { throwIfError } from "@ha/shell-utils"
import type { ApplyToDeviceAction } from "../types"
import { setTransitioning, updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5/turnOnDevice")

function* turnOnDevice(action: ApplyToDeviceAction) {
  if (
    action.payload.device.status !== "AWAKE"
  ) {
    return
  }

  yield put(
    setTransitioning(merge({}, action.payload.device, { transitioning: true })),
  )

  try {
    throwIfError(sh.exec(
      `playactor wake --ip ${action.payload.device.address.address} --timeout 5000 --connect-timeout 5000 --no-open-urls --no-auth;`,
      { silent: true, timeout: 5000 }
    ))
    yield put(
      updateHomeAssistant(
        merge({}, action.payload.device, { status: "AWAKE", available: true })
      )
    )
  } catch (e) {
    debug(e)
  }
}

export { turnOnDevice }
