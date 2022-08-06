import createDebugger from "debug"
import { merge } from "lodash"
import { put, select } from "redux-saga/effects"
import sh from "shelljs"
import { throwIfError } from '@ha/shell-utils'
import type { Device } from "../types"
import { getDevices } from "../selectors"
import { updateHomeAssistant } from "../actionCreators"

const debug = createDebugger("@ha/ps5/checkDevicesState")

function* checkDevicesState() {
  const devices: Device[] = yield select(getDevices)
  for (const device of devices) {
    try {
      debug(`Checking device state for device ${device.id}`)
      const stdout = throwIfError(sh.exec(`playactor check --host-name ${device.name} --machine-friendly --no-open-urls --no-auth;`, { silent: true }))
      const updatedDevice = JSON.parse(stdout)

      if (device.transitioning) {
        debug(
          "Device is transitioning",
          device.transitioning,
          updatedDevice.status,
        )
        break
      }
      debug(`Device status (old, new) - availability: (${device.status}, ${updatedDevice.status}) - ${device.available}`)
      if (device.status !== updatedDevice.status || !device.available) {
        debug("Update HA")
        yield put(
          updateHomeAssistant(
            merge({}, device, { status: updatedDevice.status, available: true }),
          ),
        )
      }
    } catch (e) {
      debug(e)
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
