import { createLogger } from "@ha/logger"
import { merge } from "lodash"
import { put } from "redux-saga/effects"
import sh from "shelljs"
import type { ApplyToDeviceAction } from "../types"
import { updateHomeAssistant } from "../actionCreators"

const logger = createLogger()

function* turnOffDevice(action: ApplyToDeviceAction) {
  if (action.payload.on !== "STANDBY") {
    return
  }

  logger.info("Turning off device")
  logger.info(JSON.stringify(action.payload, null, 2))
  const { stdout, stderr, code } = sh.exec(
    `playactor standby --ip ${action.payload.device.address.address} --timeout 5000 --connect-timeout 5000 --no-open-urls --no-auth;`,
    { timeout: 5000 },
  )
  logger.info(stdout.toString())
  if (code !== 0) {
    logger.error(stderr.toString())
  }

  yield put(
    updateHomeAssistant(
      merge({}, action.payload.device, { status: "STANDBY", available: false }),
    ),
  )
}

export { turnOffDevice }
