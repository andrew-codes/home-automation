import { createLogger } from "@ha/logger"
import { merge } from "lodash"
import { put, select } from "redux-saga/effects"
import sh from "shelljs"
import type { Device } from "../types"
import { getDevices } from "../selectors"
import { updateHomeAssistant } from "../actionCreators"

const logger = createLogger()

function* checkDevicesState() {
  logger.info("Check device state.")
  const devices: Device[] = yield select(getDevices)
  for (const device of devices) {
    try {
      logger.info(`Checking device state for device ${device.name}`)
      logger.debug(JSON.stringify(device, null, 2))
      const { stdout, stderr, code } = sh.exec(
        `playactor check --host-name ${device.name} --machine-friendly --no-open-urls --no-auth;`,
      )
      if (stderr) {
        logger.error(`Exit code: ${code}; ${stderr}`)
      }

      const updatedDevice = JSON.parse(stdout)
      logger.debug(`Parsed device JSON:
${JSON.stringify(updatedDevice, null, 2)}`)
      const newDevice = merge({}, device, updatedDevice, {
        available: true,
      })
      yield put(updateHomeAssistant(newDevice))
    } catch (e) {
      logger.error(e)
      yield put(
        updateHomeAssistant(
          merge({}, device, {
            status: "UNKNOWN",
            available: false,
          }),
        ),
      )
    }
  }
}

export { checkDevicesState }
