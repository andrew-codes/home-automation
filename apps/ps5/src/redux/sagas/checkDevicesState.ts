import { createLogger } from "@ha/logger"
import { merge } from "lodash"
import { put, select } from "redux-saga/effects"
import sh from "shelljs"
import { throwIfError } from '@ha/shell-utils'
import type { Device } from "../types"
import { getDevices } from "../selectors"
import { updateHomeAssistant } from "../actionCreators"

const logger = createLogger()

function* checkDevicesState() {
  const devices: Device[] = yield select(getDevices)
  for (const device of devices) {
    try {
      logger.info('Checking device state for device', device)
      const stdout = throwIfError(sh.exec(`playactor check --host-name ${device.name} --machine-friendly --no-open-urls --no-auth;`, { silent: true }))
      const updatedDevice = JSON.parse(stdout)

      if (device.transitioning) {
        logger.info(
          "Device is transitioning",
          updatedDevice,
        )
        break
      }
      logger.verbose('Device status (old, new), availability', device.status, updatedDevice.status, device.available)
      if (device.status !== updatedDevice.status || !device.available) {
        const newDevice = merge({}, device, { status: updatedDevice.status, available: true })
        logger.info("Update HA")
        yield put(
          updateHomeAssistant(
            newDevice,
          ),
        )
      }
    } catch (e) {
      logger.error(e)
      yield put(
        updateHomeAssistant(
          merge(
            {},
            device,
            {
              status: "UNKNOWN",
              available: false
            }
          )
        )
      )
    }
  }
}

export { checkDevicesState }
