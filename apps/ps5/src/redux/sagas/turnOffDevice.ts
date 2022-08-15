import { createLogger } from "@ha/logger"
import { merge } from "lodash"
import { put } from "redux-saga/effects"
import sh from "shelljs"
import { throwIfError } from '@ha/shell-utils'
import type { ApplyToDeviceAction } from "../types"
import { setTransitioning, updateHomeAssistant } from "../actionCreators"

const logger = createLogger()

function* turnOffDevice(action: ApplyToDeviceAction) {
  if (
    action.payload.device.status !== "STANDBY"
  ) {
    return
  }

  logger.info('Turning off device', action.payload)
  yield put(
    setTransitioning(merge({}, action.payload.device, { transitioning: true })),
  )
  try {
    logger.info(sh.exec(
      `playactor standby --ip ${action.payload.device.address.address} --timeout 5000 --connect-timeout 5000 --no-open-urls --no-auth;`,
      { timeout: 5000 }
    ))

    yield put(
      updateHomeAssistant(
        merge({}, action.payload.device, { status: "STANDBY", available: false })
      )
    )
  } catch (e) {
    logger.error(e)
  }

}

export { turnOffDevice }
